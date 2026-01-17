import { desc, eq, ilike } from "drizzle-orm";
import { db } from "../index.js";
import { products } from "../schema/products.schema.js";

export type CreateProduct = typeof products.$inferInsert;

export async function getProductById(productId: string) {
  return db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      category: true,
      vendor: {
        columns: {
          id: true,
          businessName: true,
          logo: true,
          rating: true, // Важливо для UI
        },
      },
      variants: true, // Всі варіанти (розміри, кольори)
      media: true, // Фотографії
    },
  });
}

// Фільтрація по категорії з пагінацією
export async function getProductsByCategory(
  categoryId: string,
  page: number = 1,
  pageSize: number = 20,
) {
  return db.query.products.findMany({
    where: eq(products.categoryId, categoryId),
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: desc(products.createdAt),
    with: {
      media: { limit: 1 }, // Тільки головне фото для списку
    },
  });
}

// Простий пошук (ILIKE) - для початку ок, потім замінимо на Meilisearch
export async function searchProducts(query: string, limit: number = 20) {
  return db.query.products.findMany({
    where: ilike(products.translations, `%${query}%`), // Шукаємо в JSONB перекладах (повільно!)
    limit,
    with: {
      media: { limit: 1 },
    },
  });
}

export async function createProduct(data: CreateProduct) {
  const [newProduct] = await db.insert(products).values(data).returning();
  return newProduct;
}
