import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm"; // <-- Додано sql
import { db } from "../index.js";
import { flashSales, promoCodes } from "../schema/promotions.schema.js";

// Знайти активний промокод
export async function getPromoCodeByCode(code: string) {
  const now = new Date();

  return db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.code, code),
      eq(promoCodes.isActive, true),
      // Перевірка дат: (start <= now) AND (end >= now OR end IS NULL)
      lte(promoCodes.startDate, now),
      or(gte(promoCodes.endDate, now), isNull(promoCodes.endDate)),
    ),
  });
}

// Збільшити лічильник використання промокоду
export async function incrementPromoUsage(id: string) {
  return db
    .update(promoCodes)
    .set({
      currentUsageCount: sql`${promoCodes.currentUsageCount} + 1`,
    })
    .where(eq(promoCodes.id, id));
}

// Отримати активні розпродажі (Flash Sales)
export async function getActiveFlashSales() {
  const now = new Date();
  return db.query.flashSales.findMany({
    where: and(
      eq(flashSales.isActive, true),
      // Виправлено: startTime -> startDate, endTime -> endDate (уніфікація назв)
      lte(flashSales.startDate, now),
      gte(flashSales.endDate, now),
    ),
    with: {
      products: {
        with: {
          product: {
            columns: { id: true }, // Тут можна додати поля товару (назва, слаг)
            with: { media: { limit: 1 } },
          },
        },
      },
    },
  });
}
