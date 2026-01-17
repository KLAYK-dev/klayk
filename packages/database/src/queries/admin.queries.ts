import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { auditLogs, moderationQueue, systemAlerts } from "../schema/admin.schema.js";

// Логування дій адміністратора
export async function logAuditAction(data: typeof auditLogs.$inferInsert) {
  return db.insert(auditLogs).values(data);
}

// Отримати чергу модерації
export async function getModerationQueue(status: "pending" | "escalated" = "pending") {
  return db.query.moderationQueue.findMany({
    where: eq(moderationQueue.status, status),
    orderBy: desc(moderationQueue.priority),
    with: {
      submittedByUser: { columns: { email: true } },
    },
  });
}

// Отримати активні системні алерти
export async function getActiveAlerts() {
  return db.query.systemAlerts.findMany({
    where: eq(systemAlerts.status, "open"),
    orderBy: desc(systemAlerts.severity),
  });
}
