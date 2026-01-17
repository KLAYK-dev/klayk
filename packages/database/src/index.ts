import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

/**
 * Глобальна змінна для зберігання підключення до БД
 * Це дозволяє переиспользовать підключення в whole-server контексті
 */
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

/**
 * Функція для отримання підключення до БД
 * Використовує переиспользовувальне підключення для оптимізації
 *
 * Параметри postgres.js:
 * - prepare: false - для краї совместимости
 * - max: 10 - максимально підключень в pool
 * - timeout: 30 - timeout для з'єднання
 * - idle_timeout: 30 - idle timeout
 * - max_lifetime: 3600 - максимальний час життя підключення
 * - backoff: exponential - exponential backoff для reconnect
 */
function getConnection() {
  if (!globalForDb.conn) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const isProd = process.env.NODE_ENV === "production";

    globalForDb.conn = postgres(dbUrl, {
      prepare: false,
      // Connection pool settings
      max: isProd ? 10 : 5,
      timeout: 30,
      idle_timeout: 30,
      max_lifetime: 3600,

      // Reconnect settings - exponential backoff function
      backoff: (attemptNum: number) => {
        const baseDelay = 100; // 100ms
        const maxDelay = 10000; // 10s
        return Math.min(baseDelay * 2 ** attemptNum, maxDelay);
      },

      // SSL конфіг для production
      ...(isProd
        ? {
            ssl: "require",
          }
        : {}),

      // Debug logging у development
      ...(process.env.DEBUG === "true"
        ? {
            debug: (_connection: unknown, query: string) => {
              console.log("📍 DB Query:", query);
            },
          }
        : {}),
    });
  }
  return globalForDb.conn;
}

/**
 * Drizzle ORM інстанс для роботи з базою даних
 */
export const db = drizzle(getConnection(), {
  schema,
  logger: process.env.DEBUG === "true",
});

export type Database = typeof db;

// Re-export queries
export * from "./queries/index.js";
// Re-export schema для використання в інших модулях
export * from "./schema/index.js";
