// ============================================================================
// KLAYK DATABASE SCHEMA INDEX
// ============================================================================
// ============================================================================
// Головний файл експорту всіх схем бази даних маркетплейсу
//
// ⚠️ ВАЖЛИВО: Структура для уникнення circular dependencies
//
// 1. Файли схем (*.schema.ts) експортують ТІЛЬКИ таблиці (columns + foreign keys)
// 2. Файл relations.ts експортує ВСІ зв'язки між таблицями
// 3. Цей файл (index.ts) експортує ВСЕ разом
//
// Використання:
//   import { users, products, orders } from './schema';
//   import { usersRelations } from './schema/relations';
// ============================================================================

// ============================================================================
// ADMINISTRATION (Адміністрування)
// ============================================================================
export * from "./admin.schema.js";
// ============================================================================
// ANALYTICS & REPORTING (Аналітика та звіти)
// ============================================================================
export * from "./analytics.schema.js";
export * from "./cart.schema.js";
export * from "./categories.schema.js";
// ============================================================================
// CONTENT MANAGEMENT (Управління контентом)
// ============================================================================
export * from "./content.schema.js";
// ============================================================================
// ENUMS
// ============================================================================
export * from "./enums.js";
// ============================================================================
// INVENTORY & WAREHOUSE (Складський облік)
// ============================================================================
export * from "./inventory.schema.js";
// ============================================================================
// NOTIFICATIONS & MESSAGING (Нотифікації та розсилки)
// ============================================================================
export * from "./notifications.schema.js";
// ============================================================================
// ORDERS & TRANSACTIONS (Замовлення та транзакції)
// ============================================================================
export * from "./orders.schema.js";
export * from "./products.schema.js";
// ============================================================================
// PROMOTIONS & LOYALTY (Промо та лояльність)
// ============================================================================
export * from "./promotions.schema.js";
// ============================================================================
// RELATIONS (Всі зв'язки між таблицями)
// ⚠️ ВАЖЛИВО: Імпортувати relations окремо після імпорту таблиць!
// ============================================================================
export * from "./relations.js";
// ============================================================================
// REVIEWS & RATINGS (Відгуки та рейтинги)
// ============================================================================
export * from "./reviews.schema.js";
export * from "./settings.schema.js";
// ============================================================================
// CORE MODULES (Базові модулі)
// ============================================================================
export * from "./users.schema.js";
export * from "./vendors.schema.js";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

import type { categories } from "./categories.schema.js";
import type { orderItems, orders } from "./orders.schema.js";
import type { products, productVariants } from "./products.schema.js";
import type { productReviews } from "./reviews.schema.js";
import type { users } from "./users.schema.js";
import type { vendors } from "./vendors.schema.js";

// Helper types для TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;

// Повні типи для всіх таблиць можна генерувати автоматично через Drizzle
