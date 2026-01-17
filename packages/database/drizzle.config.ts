// ВАЖЛИВО: Drizzle Kit запускається в окремому процесі,
// тому йому потрібно окремо підтягувати .env файл.
// Переконайтеся, що .env файл знаходиться в корені проекту.
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("❌ DATABASE_URL environment variable is not set");
}

export default defineConfig({
  // Шлях до вашої папки зі схемами
  // Вказуємо папку, а не index.ts, щоб Drizzle міг бачити всі файли
  schema: "./src/db/schema", // <-- Змінив на правильний шлях (у вас було ./src/schema/, але за логікою попередніх файлів - ./src/db/schema)

  // Куди складати SQL файли міграцій
  out: "./src/db/migrations", // <-- Також змінив шлях для чистоти структури

  dialect: "postgresql",

  dbCredentials: {
    url: dbUrl,
  },

  // Налаштування таблиці для відстеження міграцій
  migrations: {
    prefix: "timestamp", // Додає timestamp до назви файлу (20240101_init.sql)
    table: "_drizzle_migrations", // Таблиця в БД
    schema: "drizzle", // Схема в БД, де буде жити ця таблиця (щоб не смітити в public)
  },

  // Конвертація camelCase (TS) -> snake_case (DB)
  // Це дозволяє писати userId в коді, а в базі мати user_id
  casing: "snake_case",

  // Суворий режим перевірки типів
  strict: true,

  // Детальний вивід логів при генерації
  verbose: true,
});
