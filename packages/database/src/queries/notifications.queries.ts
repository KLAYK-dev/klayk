import { and, desc, eq, sql } from "drizzle-orm"; // <-- 1. Додано sql
import { db } from "../index.js";
import { notifications } from "../schema/notifications.schema.js";

// Отримати сповіщення користувача
export async function getUserNotifications(userId: string, limit: number = 20) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    limit,
    orderBy: desc(notifications.createdAt),
  });
}

// Отримати кількість непрочитаних
export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  // 2. Виправлено: безпечний доступ через ?. та значення за замовчуванням ?? 0
  return result[0]?.count ?? 0;
}

// Позначити як прочитане
export async function markAsRead(notificationId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

// Позначити всі як прочитані
export async function markAllAsRead(userId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// Створити сповіщення
export async function createNotification(data: typeof notifications.$inferInsert) {
  return db.insert(notifications).values(data).returning();
}
