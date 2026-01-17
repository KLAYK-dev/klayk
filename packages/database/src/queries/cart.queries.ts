import { and, eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { cartItems, carts } from "../schema/cart.schema.js";

// Отримуємо кошик з усіма товарами та їх варіантами
export async function getCartByUserId(userId: string) {
  return db.query.carts.findFirst({
    where: and(eq(carts.userId, userId), eq(carts.isAbandoned, false)), // Активний кошик
    with: {
      items: {
        with: {
          product: {
            columns: {
              id: true,
              // translations: true, // Якщо використовуєте переклади
              // slug: true,
              // price: true
            },
            with: {
              media: { limit: 1 }, // Картинка товару
            },
          },
          variant: true, // Якщо обрано варіант (розмір/колір)
        },
      },
    },
  });
}

// Пошук по sessionId для незареєстрованих гостей
export async function getCartBySessionId(sessionId: string) {
  return db.query.carts.findFirst({
    where: and(eq(carts.sessionId, sessionId), eq(carts.isAbandoned, false)),
    with: {
      items: {
        with: {
          product: true,
          variant: true,
        },
      },
    },
  });
}

export async function createCart(userId?: string, sessionId?: string) {
  const [newCart] = await db
    .insert(carts)
    .values({
      userId,
      sessionId,
      // expiresAt: ... // Можна додати логіку експірації
    })
    .returning();
  return newCart;
}

export async function addItemToCart(cartId: string, data: typeof cartItems.$inferInsert) {
  // Upsert: якщо товар вже є в кошику, збільшуємо кількість, інакше додаємо
  return db
    .insert(cartItems)
    .values({ ...data, cartId })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId, cartItems.variantId],
      set: {
        quantity: sql`${cartItems.quantity} + ${data.quantity}`,
        updatedAt: new Date(),
      },
    })
    .returning();
}

export async function removeItemFromCart(itemId: string) {
  return db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(cartId: string) {
  return db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
