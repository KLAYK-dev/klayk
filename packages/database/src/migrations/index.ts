import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../index.js";

/**
 * Запустити всі pending migrations
 * Це повинна бути одна з перших операцій при запуску додатку
 */
export async function runMigrations() {
  try {
    console.log("Running migrations...");
    await migrate(db, {
      migrationsFolder: "./src/migrations",
    });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
}

/**
 * Функція для перевірки стану БД
 */
export async function checkDatabaseHealth() {
  try {
    await db.execute("SELECT NOW()");
    console.log("✅ Database connection is healthy");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

/**
 * Функція для seed'а demo даних
 * Це використовується для локального розробки
 */
export async function seedDatabase() {
  try {
    console.log("Seeding database with demo data...");

    // Тут можна добавити seed код для demo даних
    // Приклад:
    // await db.insert(users).values([
    //   { email: "test@example.com", name: "Test User", role: "user" },
    // ]);

    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}
