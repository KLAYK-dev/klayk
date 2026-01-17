import { and, desc, gte, lte } from "drizzle-orm";
import { db } from "../index.js";
import { analyticsEvents, dailyStatistics } from "../schema/analytics.schema.js";

// Логування події (Product View, Add to Cart)
export async function logAnalyticsEvent(data: typeof analyticsEvents.$inferInsert) {
  // Тут краще використовувати fire-and-forget або чергу, але для початку:
  return db.insert(analyticsEvents).values(data);
}

// Отримати статистику за період
export async function getDailyStats(startDate: string, endDate: string) {
  return db.query.dailyStatistics.findMany({
    where: and(gte(dailyStatistics.date, startDate), lte(dailyStatistics.date, endDate)),
    orderBy: desc(dailyStatistics.date),
  });
}
