import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { productReviews } from "../schema/reviews.schema.js";

// Отримати затверджені відгуки для товару
export async function getProductReviews(productId: string, page: number = 1, limit: number = 10) {
  return db.query.productReviews.findMany({
    where: and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")),
    limit,
    offset: (page - 1) * limit,
    orderBy: desc(productReviews.createdAt),
    with: {
      user: {
        columns: { firstName: true, lastName: true, avatar: true },
      },
      media: true,
    },
  });
}

// Створити відгук
export async function createProductReview(data: typeof productReviews.$inferInsert) {
  const [review] = await db.insert(productReviews).values(data).returning();
  return review;
}

// Модерація відгуку
export async function updateReviewStatus(reviewId: string, status: "approved" | "rejected") {
  return db
    .update(productReviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(productReviews.id, reviewId))
    .returning();
}

// Статистика рейтингу товару
export async function getProductRatingStats(productId: string) {
  const result = await db
    .select({
      averageRating: sql<number>`avg(${productReviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")));

  return result[0];
}
