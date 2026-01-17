import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// CATEGORIES
// ============================================================================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id"),

    slug: varchar("slug", { length: 255 }).notNull().unique(),
    icon: varchar("icon", { length: 100 }),
    image: text("image"),

    // Multilingual support
    translations: jsonb("translations").notNull(),
    // Structure: { uk: {name, description}, en: {name, description}, pl: {...}, ... }

    // SEO
    metaTitle: jsonb("meta_title"),
    metaDescription: jsonb("meta_description"),
    metaKeywords: jsonb("meta_keywords"),

    // Settings
    sortOrder: integer("sort_order").default(0),
    level: integer("level").default(0), // 0 = root, 1 = first level, etc
    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),
    showInMenu: boolean("show_in_menu").default(true),
    showInHomepage: boolean("show_in_homepage").default(false),

    // Commission override (optional per category)
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),

    // Template for product attributes in this category
    attributeSchema: jsonb("attribute_schema"),
    requiredAttributes: jsonb("required_attributes"), // ["color", "size"]

    // Filters configuration
    availableFilters: jsonb("available_filters"), // Which filters to show for this category

    // Stats
    productCount: integer("product_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug).where(sql`deleted_at IS NULL`),
    parentIdx: index("categories_parent_idx").on(table.parentId),
    activeIdx: index("categories_active_idx").on(table.isActive),
    featuredIdx: index("categories_featured_idx").on(table.isFeatured),
    sortIdx: index("categories_sort_idx").on(table.sortOrder),
    levelIdx: index("categories_level_idx").on(table.level),
    menuIdx: index("categories_menu_idx").on(table.showInMenu),
  }),
);

// ============================================================================
// CATEGORY ATTRIBUTES (визначення атрибутів/характеристик)
// ============================================================================

export const categoryAttributes = pgTable(
  "category_attributes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    key: varchar("key", { length: 100 }).notNull(), // 'color', 'size', 'material'

    // Multilingual labels
    labels: jsonb("labels").notNull(), // {uk: "Колір", en: "Color", ...}

    type: varchar("type", { length: 50 }).notNull(), // 'select', 'multiselect', 'text', 'number', 'boolean', 'range'

    // For select/multiselect types
    options: jsonb("options"), // [{value: "red", labels: {uk: "Червоний", en: "Red"}}, ...]

    // Validation rules
    isRequired: boolean("is_required").default(false),
    isFilterable: boolean("is_filterable").default(true),
    isSearchable: boolean("is_searchable").default(false),
    showInListing: boolean("show_in_listing").default(true),

    // Display settings
    sortOrder: integer("sort_order").default(0),
    unit: varchar("unit", { length: 50 }), // 'kg', 'cm', 'watts'

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryKeyIdx: uniqueIndex("category_attributes_category_key_idx").on(
      table.categoryId,
      table.key,
    ),
    categoryIdx: index("category_attributes_category_idx").on(table.categoryId),
    filterableIdx: index("category_attributes_filterable_idx").on(table.isFilterable),
  }),
);

// ============================================================================
// CATEGORY BANNERS
// ============================================================================

export const categoryBanners = pgTable(
  "category_banners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    title: jsonb("title"), // Multilingual
    subtitle: jsonb("subtitle"),

    imageDesktop: text("image_desktop").notNull(),
    imageMobile: text("image_mobile"),
    imageTablet: text("image_tablet"),

    linkUrl: text("link_url"),
    linkText: jsonb("link_text"),

    position: varchar("position", { length: 50 }).default("top"), // 'top', 'middle', 'bottom', 'sidebar'

    // Display settings
    backgroundColor: varchar("background_color", { length: 20 }),
    textColor: varchar("text_color", { length: 20 }),

    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),

    // Scheduling
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_banners_category_idx").on(table.categoryId),
    activeIdx: index("category_banners_active_idx").on(table.isActive),
    positionIdx: index("category_banners_position_idx").on(table.position),
    dateIdx: index("category_banners_date_idx").on(table.startDate, table.endDate),
  }),
);

// ============================================================================
// CATEGORY SEO CONTENT (додатковий контент для SEO)
// ============================================================================

export const categorySeoContent = pgTable(
  "category_seo_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    language: varchar("language", { length: 2 }).notNull(),

    topContent: text("top_content"), // HTML content above products
    bottomContent: text("bottom_content"), // HTML content below products

    faqItems: jsonb("faq_items"), // [{question: "...", answer: "..."}, ...]

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryLanguageIdx: uniqueIndex("seo_content_category_language_idx").on(
      table.categoryId,
      table.language,
    ),
    categoryIdx: index("seo_content_category_idx").on(table.categoryId),
  }),
);
