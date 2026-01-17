import { asc, eq, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { categories } from "../schema/categories.schema.js";

export async function getRootCategories() {
  return db.query.categories.findMany({
    where: isNull(categories.parentId), // Тільки кореневі категорії
    with: {
      children: true, // Завантажити перший рівень підкатегорій
    },
    // Виправлено: categories.name -> categories.slug
    // Оскільки 'name' немає в схемі (ймовірно, воно в translations), сортуємо по slug
    orderBy: asc(categories.slug),
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: {
      children: true,
      parent: true,
      attributes: true, // Характеристики для фільтрів (бренд, розмір...)
    },
  });
}

export async function getAllCategoriesFlat() {
  return db.query.categories.findMany();
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const [newCategory] = await db.insert(categories).values(data).returning();
  return newCategory;
}
