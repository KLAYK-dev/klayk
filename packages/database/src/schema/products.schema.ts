import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories.schema.js";
import { mediaTypeEnum, productStatusEnum } from "./enums.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// BRANDS
// ============================================================================

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logo: text("logo"),
    banner: text("banner"),

    // Multilingual
    description: jsonb("description"),

    isUkrainian: boolean("is_ukrainian").default(false),

    website: varchar("website", { length: 255 }),

    // SEO
    metaTitle: jsonb("meta_title"),
    metaDescription: jsonb("meta_description"),

    // Stats
    productCount: integer("product_count").default(0),

    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("brands_slug_idx").on(table.slug),
    ukrainianIdx: index("brands_ukrainian_idx").on(table.isUkrainian),
    activeIdx: index("brands_active_idx").on(table.isActive),
    featuredIdx: index("brands_featured_idx").on(table.isFeatured),
  }),
);

// ============================================================================
// PRODUCTS
// ============================================================================

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),

    sku: varchar("sku", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    barcode: varchar("barcode", { length: 100 }),

    // Multilingual content
    translations: jsonb("translations").notNull(),

    // Pricing - Base prices for B2C
    basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
    salePrice: decimal("sale_price", { precision: 12, scale: 2 }),
    costPrice: decimal("cost_price", { precision: 12, scale: 2 }), // Собівартість

    // B2B pricing
    wholesalePrice: decimal("wholesale_price", { precision: 12, scale: 2 }),
    minWholesaleQuantity: integer("min_wholesale_quantity").default(10),

    // Dynamic pricing settings
    enableDynamicPricing: boolean("enable_dynamic_pricing").default(false),
    dynamicPricingRules: jsonb("dynamic_pricing_rules"),

    // Inventory
    trackInventory: boolean("track_inventory").default(true),
    stockQuantity: integer("stock_quantity").default(0),
    lowStockThreshold: integer("low_stock_threshold").default(5),
    allowBackorder: boolean("allow_backorder").default(false),
    backorderLimit: integer("backorder_limit"),

    // Physical properties
    weight: decimal("weight", { precision: 8, scale: 2 }), // kg
    itemLength: decimal("item_length", { precision: 8, scale: 2 }), // cm
    width: decimal("width", { precision: 8, scale: 2 }),
    height: decimal("height", { precision: 8, scale: 2 }),
    volumetricWeight: decimal("volumetric_weight", { precision: 8, scale: 2 }),

    // Attributes
    attributes: jsonb("attributes"),
    technicalSpecs: jsonb("technical_specs"),

    // SEO
    metaTitle: jsonb("meta_title"),
    metaDescription: jsonb("meta_description"),
    metaKeywords: jsonb("meta_keywords"),
    canonicalUrl: text("canonical_url"),

    // Features
    isDigital: boolean("is_digital").default(false),
    digitalFiles: jsonb("digital_files"),
    digitalDownloadLimit: integer("digital_download_limit").default(3),

    allowPreorder: boolean("allow_preorder").default(false),
    preorderReleaseDate: date("preorder_release_date"),
    preorderLimit: integer("preorder_limit"),

    // Shipping
    freeShipping: boolean("free_shipping").default(false),
    shippingClass: varchar("shipping_class", { length: 50 }),
    requiresRefrigeration: boolean("requires_refrigeration").default(false),

    // Age restriction
    ageRestriction: smallint("age_restriction"),

    // Warranty & Returns
    warrantyMonths: integer("warranty_months"),
    returnable: boolean("returnable").default(true),
    returnDays: integer("return_days").default(14),

    // Content
    videoUrl: text("video_url"),
    videoEmbedCode: text("video_embed_code"),

    // Stats
    viewCount: integer("view_count").default(0),
    wishlistCount: integer("wishlist_count").default(0),
    compareCount: integer("compare_count").default(0),
    salesCount: integer("sales_count").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewCount: integer("review_count").default(0),
    questionCount: integer("question_count").default(0),

    // Status
    status: productStatusEnum("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false),
    isNewArrival: boolean("is_new_arrival").default(false),
    isBestseller: boolean("is_bestseller").default(false),
    isExclusive: boolean("is_exclusive").default(false),

    // Admin notes
    internalNotes: text("internal_notes"),

    // Search Vector (commented out as Drizzle handles this differently or needs raw SQL)
    // searchVector: sql`tsvector`,

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    vendorIdx: index("products_vendor_idx").on(table.vendorId),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    brandIdx: index("products_brand_idx").on(table.brandId),
    skuIdx: uniqueIndex("products_sku_idx")
      .on(table.vendorId, table.sku)
      .where(sql`deleted_at IS NULL`),
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug).where(sql`deleted_at IS NULL`),
    barcodeIdx: index("products_barcode_idx").on(table.barcode),
    statusIdx: index("products_status_idx").on(table.status),
    activeIdx: index("products_active_idx")
      .on(table.status, table.categoryId)
      .where(sql`status = 'active' AND deleted_at IS NULL`),
    // searchIdx: index("products_search_idx").using("gin", sql`search_vector`), // Uncomment when vector is set up
    priceIdx: index("products_price_idx").on(table.basePrice),
    salePriceIdx: index("products_sale_price_idx").on(table.salePrice),
    ratingIdx: index("products_rating_idx").on(table.rating),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    viewsIdx: index("products_views_idx").on(table.viewCount),
    salesIdx: index("products_sales_idx").on(table.salesCount),
    stockIdx: index("products_stock_idx").on(table.stockQuantity),
    attributesIdx: index("products_attributes_idx").using("gin", table.attributes),
  }),
);

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    sku: varchar("sku", { length: 100 }).notNull().unique(),
    barcode: varchar("barcode", { length: 100 }),

    attributes: jsonb("attributes").notNull(),

    priceModifier: decimal("price_modifier", { precision: 12, scale: 2 }).default("0.00"),
    wholesalePriceModifier: decimal("wholesale_price_modifier", {
      precision: 12,
      scale: 2,
    }).default("0.00"),

    price: decimal("price", { precision: 12, scale: 2 }),
    wholesalePrice: decimal("wholesale_price", { precision: 12, scale: 2 }),

    stockQuantity: integer("stock_quantity").default(0),
    weight: decimal("weight", { precision: 8, scale: 2 }),

    images: jsonb("images"),

    isActive: boolean("is_active").default(true),
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("variants_product_idx").on(table.productId),
    skuIdx: uniqueIndex("variants_sku_idx").on(table.sku),
    barcodeIdx: index("variants_barcode_idx").on(table.barcode),
    activeIdx: index("variants_active_idx").on(table.isActive),
    defaultIdx: index("variants_default_idx").on(table.productId, table.isDefault),
    stockIdx: index("variants_stock_idx").on(table.stockQuantity),
  }),
);

// ============================================================================
// PRODUCT MEDIA
// ============================================================================

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    cdnUrl: text("cdn_url"),
    thumbnailUrl: text("thumbnail_url"),

    altText: jsonb("alt_text"),
    title: jsonb("title"),

    mimeType: varchar("mime_type", { length: 100 }),
    fileSize: integer("file_size"),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),

    sortOrder: integer("sort_order").default(0),
    isPrimary: boolean("is_primary").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("media_product_idx").on(table.productId),
    variantIdx: index("media_variant_idx").on(table.variantId),
    typeIdx: index("media_type_idx").on(table.type),
    primaryIdx: index("media_primary_idx").on(table.productId, table.isPrimary),
  }),
);

// ============================================================================
// PRODUCT PRICE HISTORY
// ============================================================================

export const productPriceHistory = pgTable(
  "product_price_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
    salePrice: decimal("sale_price", { precision: 12, scale: 2 }),
    wholesalePrice: decimal("wholesale_price", { precision: 12, scale: 2 }),

    changedBy: uuid("changed_by"),
    changeReason: varchar("change_reason", { length: 100 }),

    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("price_history_product_idx").on(table.productId),
    variantIdx: index("price_history_variant_idx").on(table.variantId),
    dateIdx: index("price_history_date_idx").on(table.changedAt),
  }),
);

// ============================================================================
// PRODUCT RELATIONS
// ============================================================================

export const productRelations = pgTable(
  "product_relations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    relatedProductId: uuid("related_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    relationType: varchar("relation_type", { length: 50 }).notNull(),
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("relations_product_idx").on(table.productId),
    relatedIdx: index("relations_related_idx").on(table.relatedProductId),
    typeIdx: index("relations_type_idx").on(table.relationType),
    uniqueRelation: uniqueIndex("relations_unique_idx").on(
      table.productId,
      table.relatedProductId,
      table.relationType,
    ),
  }),
);

// ============================================================================
// PRODUCT VIEWED TOGETHER (ML)
// ============================================================================

export const productViewedTogether = pgTable(
  "product_viewed_together",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    viewedWithProductId: uuid("viewed_with_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    viewCount: integer("view_count").default(1),
    score: decimal("score", { precision: 5, scale: 4 }).default("0.0000"),

    lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("viewed_together_product_idx").on(table.productId),
    scoreIdx: index("viewed_together_score_idx").on(table.productId, table.score),
    uniquePair: uniqueIndex("viewed_together_unique_idx").on(
      table.productId,
      table.viewedWithProductId,
    ),
  }),
);

// ============================================================================
// PRODUCT BOUGHT TOGETHER (ML)
// ============================================================================

export const productBoughtTogether = pgTable(
  "product_bought_together",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    boughtWithProductId: uuid("bought_with_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    purchaseCount: integer("purchase_count").default(1),
    score: decimal("score", { precision: 5, scale: 4 }).default("0.0000"),

    lastPurchasedAt: timestamp("last_purchased_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("bought_together_product_idx").on(table.productId),
    scoreIdx: index("bought_together_score_idx").on(table.productId, table.score),
    uniquePair: uniqueIndex("bought_together_unique_idx").on(
      table.productId,
      table.boughtWithProductId,
    ),
  }),
);

// ============================================================================
// PRODUCT TAGS
// ============================================================================

export const productTags = pgTable(
  "product_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: jsonb("name").notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),

    color: varchar("color", { length: 20 }),
    icon: varchar("icon", { length: 50 }),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("tags_slug_idx").on(table.slug),
    activeIdx: index("tags_active_idx").on(table.isActive),
  }),
);

export const productTagAssignments = pgTable(
  "product_tag_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => productTags.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueProductTag: uniqueIndex("tag_assignments_unique_idx").on(table.productId, table.tagId),
    productIdx: index("tag_assignments_product_idx").on(table.productId),
    tagIdx: index("tag_assignments_tag_idx").on(table.tagId),
  }),
);

// ============================================================================
// PRODUCT BUNDLES
// ============================================================================

export const productBundles = pgTable(
  "product_bundles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bundleProductId: uuid("bundle_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    includedProductId: uuid("included_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    quantity: integer("quantity").default(1).notNull(),
    isOptional: boolean("is_optional").default(false),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),

    sortOrder: integer("sort_order").default(0),
  },
  (table) => ({
    bundleIdx: index("bundles_bundle_idx").on(table.bundleProductId),
    includedIdx: index("bundles_included_idx").on(table.includedProductId),
    uniqueBundleProduct: uniqueIndex("bundles_unique_idx").on(
      table.bundleProductId,
      table.includedProductId,
    ),
  }),
);
