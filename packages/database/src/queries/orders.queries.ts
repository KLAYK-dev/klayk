import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import type { orderStatusEnum } from "../schema/enums.js";
import { orders } from "../schema/orders.schema.js";

export type CreateOrder = typeof orders.$inferInsert;

export async function getOrderById(orderId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: {
        with: {
          // Нам потрібні дані товару, навіть якщо його видалили (тому зберігаємо snapshot в orderItems)
          // Але якщо він є, можна підтягнути актуальне фото
          product: {
            columns: {
              slug: true,
            },
          },
        },
      },
      deliveries: true,
      payments: true,
    },
  });
}

export async function getOrdersByUser(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: desc(orders.createdAt),
    with: {
      items: { limit: 3 }, // Показати перші 3 товари в історії замовлень
    },
  });
}

export async function createOrder(data: CreateOrder) {
  // Тут варто використовувати транзакцію, бо треба створити Order + OrderItems
  return await db.transaction(async (tx) => {
    const [newOrder] = await tx.insert(orders).values(data).returning();
    return newOrder;
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: (typeof orderStatusEnum.enumValues)[number], // Строга типізація статусу!
) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updatedOrder;
}
