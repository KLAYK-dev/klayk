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
import { categories } from "./categories.schema.js";
import { discountTypeEnum } from "./enums.js";
import { orders } from "./orders.schema.js";
import { products } from "./products.schema.js";
import { users } from "./users.schema.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// PROMO CODES
// ============================================================================

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    code: varchar("code", { length: 50 }).notNull().unique(),

    // Discount settings
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 12, scale: 2 }).notNull(),
    maxDiscountAmount: decimal("max_discount_amount", { precision: 12, scale: 2 }),

    // Minimum requirements
    minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }),
    minItemsCount: integer("min_items_count"),

    // Applicable to
    applicableToCategories: jsonb("applicable_to_categories"), // array of category IDs
    applicableToProducts: jsonb("applicable_to_products"), // array of product IDs
    applicableToBrands: jsonb("applicable_to_brands"),
    applicableToVendors: jsonb("applicable_to_vendors"),

    // User restrictions
    applicableToSegments: jsonb("applicable_to_segments"),
    specificUserIds: jsonb("specific_user_ids"),

    isFirstOrderOnly: boolean("is_first_order_only").default(false),
    isNewCustomersOnly: boolean("is_new_customers_only").default(false),

    // Usage limits
    usageLimit: integer("usage_limit"),
    usageLimitPerUser: integer("usage_limit_per_user").default(1),
    currentUsageCount: integer("current_usage_count").default(0),

    // Stacking rules
    canStackWithOtherPromos: boolean("can_stack_with_other_promos").default(false),
    canStackWithSales: boolean("can_stack_with_sales").default(true),

    // Validity period
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    // Display
    description: jsonb("description"),
    terms: jsonb("terms"),

    isActive: boolean("is_active").default(true),
    isPublic: boolean("is_public").default(true),
    isFeatured: boolean("is_featured").default(false),

    autoApply: boolean("auto_apply").default(false),
    priority: integer("priority").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("promo_codes_code_idx").on(table.code),
    vendorIdx: index("promo_codes_vendor_idx").on(table.vendorId),
    activeIdx: index("promo_codes_active_idx").on(table.isActive),
    dateIdx: index("promo_codes_date_idx").on(table.startDate, table.endDate),
    publicIdx: index("promo_codes_public_idx").on(table.isPublic),
    featuredIdx: index("promo_codes_featured_idx").on(table.isFeatured),
  }),
);

// ============================================================================
// PROMO CODE USAGE
// ============================================================================

export const promoCodeUsage = pgTable(
  "promo_code_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    promoCodeId: uuid("promo_code_id")
      .notNull()
      .references(() => promoCodes.id, { onDelete: "restrict" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    orderId: uuid("order_id"), // FK can be added if orders table exists and circular deps handled

    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).notNull(),
    orderAmount: decimal("order_amount", { precision: 12, scale: 2 }).notNull(),

    ipAddress: varchar("ip_address", { length: 45 }),

    usedAt: timestamp("used_at").defaultNow().notNull(),
  },
  (table) => ({
    promoCodeIdx: index("usage_promo_code_idx").on(table.promoCodeId),
    userIdx: index("usage_user_idx").on(table.userId),
    orderIdx: index("usage_order_idx").on(table.orderId),
    dateIdx: index("usage_date_idx").on(table.usedAt),
  }),
);

// ============================================================================
// FLASH SALES
// ============================================================================

export const flashSales = pgTable(
  "flash_sales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: jsonb("name").notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: jsonb("description"),

    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 12, scale: 2 }).notNull(),
    maxDiscountAmount: decimal("max_discount_amount", { precision: 12, scale: 2 }),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),

    totalQuantityLimit: integer("total_quantity_limit"),
    quantityLimitPerUser: integer("quantity_limit_per_user"),
    currentSoldCount: integer("current_sold_count").default(0),

    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),

    bannerImage: text("banner_image"),
    backgroundColor: varchar("background_color", { length: 20 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("flash_sales_slug_idx").on(table.slug),
    vendorIdx: index("flash_sales_vendor_idx").on(table.vendorId),
    activeIdx: index("flash_sales_active_idx").on(table.isActive),
    dateIdx: index("flash_sales_date_idx").on(table.startDate, table.endDate),
  }),
);

export const flashSaleProducts = pgTable(
  "flash_sale_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flashSaleId: uuid("flash_sale_id")
      .notNull()
      .references(() => flashSales.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    discountValue: decimal("discount_value", { precision: 12, scale: 2 }),

    quantityLimit: integer("quantity_limit"),
    quantityLimitPerUser: integer("quantity_limit_per_user"),
    soldCount: integer("sold_count").default(0),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    saleProductIdx: uniqueIndex("flash_sale_products_unique_idx").on(
      table.flashSaleId,
      table.productId,
    ),
    saleIdx: index("flash_sale_products_sale_idx").on(table.flashSaleId),
    productIdx: index("flash_sale_products_product_idx").on(table.productId),
  }),
);

// ============================================================================
// CASHBACK RULES
// ============================================================================

export const cashbackRules = pgTable(
  "cashback_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: jsonb("name").notNull(),

    cashbackPercentage: decimal("cashback_percentage", { precision: 5, scale: 2 }).notNull(),
    maxCashbackAmount: decimal("max_cashback_amount", { precision: 12, scale: 2 }),

    minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }),

    applicableToCategories: jsonb("applicable_to_categories"),
    applicableToProducts: jsonb("applicable_to_products"),
    applicableToSegments: jsonb("applicable_to_segments"),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    isActive: boolean("is_active").default(true),
    priority: integer("priority").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("cashback_rules_vendor_idx").on(table.vendorId),
    activeIdx: index("cashback_rules_active_idx").on(table.isActive),
    dateIdx: index("cashback_rules_date_idx").on(table.startDate, table.endDate),
  }),
);

// ============================================================================
// LOYALTY PROGRAMS
// ============================================================================

export const loyaltyPrograms = pgTable(
  "loyalty_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: jsonb("name").notNull(),
    description: jsonb("description"),

    pointsPerCurrency: decimal("points_per_currency", { precision: 10, scale: 2 }).default("1.00"),
    currencyPerPoint: decimal("currency_per_point", { precision: 10, scale: 4 }).default("0.01"),
    minPointsForRedemption: integer("min_points_for_redemption").default(100),
    maxPointsPerOrder: integer("max_points_per_order"),
    maxPointsPercentage: decimal("max_points_percentage", { precision: 5, scale: 2 }),

    pointsExpirationDays: integer("points_expiration_days"),

    tiersEnabled: boolean("tiers_enabled").default(false),
    tiers: jsonb("tiers"),

    isActive: boolean("is_active").default(true),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("loyalty_programs_vendor_idx").on(table.vendorId),
    activeIdx: index("loyalty_programs_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// LOYALTY POINTS TRANSACTIONS
// ============================================================================

export const loyaltyPointsTransactions = pgTable(
  "loyalty_points_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programId: uuid("program_id").references(() => loyaltyPrograms.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),

    transactionType: varchar("transaction_type", { length: 50 }).notNull(),
    points: integer("points").notNull(),
    pointsBefore: integer("points_before").notNull(),
    pointsAfter: integer("points_after").notNull(),

    description: text("description"),
    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("loyalty_transactions_user_idx").on(table.userId),
    programIdx: index("loyalty_transactions_program_idx").on(table.programId),
    orderIdx: index("loyalty_transactions_order_idx").on(table.orderId),
    typeIdx: index("loyalty_transactions_type_idx").on(table.transactionType),
    dateIdx: index("loyalty_transactions_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// BULK DISCOUNTS
// ============================================================================

export const bulkDiscounts = pgTable(
  "bulk_discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: jsonb("name"),
    tiers: jsonb("tiers").notNull(),
    applicableToSegments: jsonb("applicable_to_segments"),

    isActive: boolean("is_active").default(true),

    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("bulk_discounts_product_idx").on(table.productId),
    categoryIdx: index("bulk_discounts_category_idx").on(table.categoryId),
    vendorIdx: index("bulk_discounts_vendor_idx").on(table.vendorId),
    activeIdx: index("bulk_discounts_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// BUNDLE DISCOUNTS
// ============================================================================

export const bundleDiscounts = pgTable(
  "bundle_discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: jsonb("name").notNull(),
    description: jsonb("description"),

    requiredProducts: jsonb("required_products").notNull(),

    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 12, scale: 2 }).notNull(),
    bundlePrice: decimal("bundle_price", { precision: 12, scale: 2 }),

    isActive: boolean("is_active").default(true),

    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("bundle_discounts_vendor_idx").on(table.vendorId),
    activeIdx: index("bundle_discounts_active_idx").on(table.isActive),
    dateIdx: index("bundle_discounts_date_idx").on(table.startDate, table.endDate),
  }),
);

// ============================================================================
// ABANDONED CART CAMPAIGNS
// ============================================================================

export const abandonedCartCampaigns = pgTable(
  "abandoned_cart_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),

    triggerAfterMinutes: integer("trigger_after_minutes").default(60),
    minCartValue: decimal("min_cart_value", { precision: 12, scale: 2 }),

    discountType: discountTypeEnum("discount_type"),
    discountValue: decimal("discount_value", { precision: 12, scale: 2 }),

    emailSubject: jsonb("email_subject"),
    emailTemplate: text("email_template"),

    maxUsesPerUser: integer("max_uses_per_user").default(3),
    validForHours: integer("valid_for_hours").default(24),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("abandoned_cart_campaigns_vendor_idx").on(table.vendorId),
    activeIdx: index("abandoned_cart_campaigns_active_idx").on(table.isActive),
  }),
);
