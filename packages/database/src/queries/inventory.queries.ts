import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { inventory, inventoryMovements } from "../schema/inventory.schema.js";

// Отримати залишки товару на всіх складах
export async function getProductInventory(productId: string) {
  return db.query.inventory.findMany({
    where: eq(inventory.productId, productId),
    with: {
      warehouse: true,
      variant: true,
    },
  });
}

// Отримати залишок конкретного варіанту на конкретному складі
export async function getStockLevel(productId: string, variantId: string, warehouseId: string) {
  return db.query.inventory.findFirst({
    where: and(
      eq(inventory.productId, productId),
      eq(inventory.variantId, variantId),
      eq(inventory.warehouseId, warehouseId),
    ),
  });
}

// Оновлення залишку (наприклад, при інвентаризації)
export async function updateStockLevel(
  id: string,
  quantity: number,
  userId: string,
  reason: string,
) {
  return await db.transaction(async (tx) => {
    // 1. Отримуємо поточний стан
    const current = await tx.query.inventory.findFirst({
      where: eq(inventory.id, id),
    });

    if (!current) throw new Error("Inventory record not found");

    const diff = quantity - current.quantity;

    // 2. Оновлюємо залишок
    const [updated] = await tx
      .update(inventory)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, id))
      .returning();

    // 3. Логуємо рух
    await tx.insert(inventoryMovements).values({
      inventoryId: id,
      movementType: diff > 0 ? "correction_in" : "correction_out",
      quantity: Math.abs(diff),
      quantityBefore: current.quantity,
      quantityAfter: quantity,
      reason,
      userId: userId,
      referenceNumber: "manual_adjustment",
    });

    return updated;
  });
}

// Логування руху (системне)
export async function logInventoryMovement(data: typeof inventoryMovements.$inferInsert) {
  return db.insert(inventoryMovements).values(data).returning();
}
