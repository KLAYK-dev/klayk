import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { blogPosts, faqItems, pages } from "../schema/content.schema.js";

// Отримати сторінку за Slug
export async function getPageBySlug(slug: string) {
  return db.query.pages.findFirst({
    // pages використовує isPublished (boolean), а не status
    where: and(eq(pages.slug, slug), eq(pages.isPublished, true)),
  });
}

// Отримати список постів блогу
export async function getBlogPosts(page: number = 1, limit: number = 10) {
  return db.query.blogPosts.findMany({
    // Виправлено: isPublished -> status
    where: eq(blogPosts.status, "published"),
    limit,
    offset: (page - 1) * limit,
    // Сортуємо за датою публікації (найновіші зверху)
    orderBy: desc(blogPosts.publishedAt),
    with: {
      author: {
        columns: { firstName: true, lastName: true },
      },
    },
  });
}

// Отримати пост за Slug
export async function getBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({
    // Виправлено: isPublished -> status
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")),
    with: {
      author: true,
      comments: {
        limit: 20,
        // Якщо у comments немає createdAt, замініть на інше поле або приберіть orderBy
        orderBy: desc(blogPosts.publishedAt),
      },
    },
  });
}

// Отримати FAQ
export async function getFaqItems() {
  return db.query.faqItems.findMany({
    // Перевіряємо, чи активний запис (якщо поля isActive немає, приберіть цю умову)
    // where: eq(faqItems.isActive, true),

    with: {
      category: true,
    },
    // Виправлено: priority -> sortOrder (або id, якщо сортування не важливе)
    // Зазвичай для FAQ використовують asc (зростання: 1, 2, 3...)
    orderBy: asc(faqItems.sortOrder),
  });
}
