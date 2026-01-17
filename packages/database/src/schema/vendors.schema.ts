import { sql } from "drizzle-orm";
import {
  boolean,
  check,
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
import {
  payoutStatusEnum,
  periodTypeEnum,
  transactionTypeEnum,
  vendorStaffRoleEnum,
  vendorVerificationLevelEnum,
} from "./enums.js";
import { users } from "./users.schema.js";

// ============================================================================
// VENDORS
// ============================================================================

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    // Business Info
    businessName: varchar("business_name", { length: 255 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logo: text("logo"),
    banner: text("banner"),

    // Legal documents
    edrpou: varchar("edrpou", { length: 8 }),
    iban: varchar("iban", { length: 29 }),
    taxNumber: varchar("tax_number", { length: 12 }),
    registrationCertificate: text("registration_certificate"),

    // Verification
    verificationLevel: vendorVerificationLevelEnum("verification_level").default("none").notNull(),
    verifiedAt: timestamp("verified_at"),
    verificationDocuments: jsonb("verification_documents"),

    // Contact
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    supportEmail: varchar("support_email", { length: 255 }),
    supportPhone: varchar("support_phone", { length: 20 }),

    // Social
    facebookUrl: varchar("facebook_url", { length: 255 }),
    instagramUrl: varchar("instagram_url", { length: 255 }),
    telegramUrl: varchar("telegram_url", { length: 255 }),
    tiktokUrl: varchar("tiktok_url", { length: 255 }),
    youtubeUrl: varchar("youtube_url", { length: 255 }),

    // Location
    country: varchar("country", { length: 2 }).default("UA"),
    city: varchar("city", { length: 100 }),
    address: text("address"),

    // Policies
    isUkrainianBrand: boolean("is_ukrainian_brand").default(false),
    returnPolicy: text("return_policy"),
    warrantyPolicy: text("warranty_policy"),
    shippingPolicy: text("shipping_policy"),
    privacyPolicy: text("privacy_policy"),

    // Commission settings (flexible model)
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("15.00"),
    commissionFixed: decimal("commission_fixed", { precision: 12, scale: 2 }).default("0.00"),
    commissionMinAmount: decimal("commission_min_amount", { precision: 12, scale: 2 }).default(
      "0.00",
    ),

    // Wallet & Finances
    walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 }).default("0.00"),
    pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).default("0.00"),
    totalEarnings: decimal("total_earnings", { precision: 14, scale: 2 }).default("0.00"),

    // Stats
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewCount: integer("review_count").default(0),
    totalSales: integer("total_sales").default(0),
    totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0.00"),
    responseTime: integer("response_time").default(0),
    fulfillmentRate: decimal("fulfillment_rate", { precision: 5, scale: 2 }).default("100.00"),

    // НОВЕ: Followers count для оптимізації
    followersCount: integer("followers_count").default(0),

    // Status
    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),
    isPremium: boolean("is_premium").default(false),

    // Settings
    autoApproveProducts: boolean("auto_approve_products").default(false),
    minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    slugIdx: uniqueIndex("vendors_slug_idx").on(table.slug).where(sql`deleted_at IS NULL`),
    userIdx: index("vendors_user_idx").on(table.userId),
    ukrainianIdx: index("vendors_ukrainian_idx").on(table.isUkrainianBrand),
    activeIdx: index("vendors_active_idx").on(table.isActive),
    ratingIdx: index("vendors_rating_idx").on(table.rating),
    featuredIdx: index("vendors_featured_idx").on(table.isFeatured),
    premiumIdx: index("vendors_premium_idx").on(table.isPremium),
    edrpouIdx: index("vendors_edrpou_idx").on(table.edrpou),
    // НОВЕ: Composite index для пошуку активних українських брендів
    activeUkrainianIdx: index("vendors_active_ukrainian_idx")
      .on(table.isActive, table.isUkrainianBrand)
      .where(sql`is_active = true AND is_ukrainian_brand = true AND deleted_at IS NULL`),

    // Constraints
    checkCommissionRate: check(
      "check_commission_rate",
      sql`commission_rate >= 0 AND commission_rate <= 100`,
    ),
    checkRating: check("check_rating", sql`rating >= 0 AND rating <= 5`),
    checkFulfillmentRate: check(
      "check_fulfillment_rate",
      sql`fulfillment_rate >= 0 AND fulfillment_rate <= 100`,
    ),
    checkBalances: check("check_balances", sql`wallet_balance >= 0 AND pending_balance >= 0`),
    checkEdrpou: check("check_edrpou_format", sql`edrpou IS NULL OR edrpou ~ '^\d{8}$'`),
    checkPhone: check("check_phone_format", sql`phone IS NULL OR phone ~ '^\+380\d{9}$'`),
  }),
);

// ============================================================================
// VENDOR WAREHOUSES
// ============================================================================

export const vendorWarehouses = pgTable(
  "vendor_warehouses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }),

    // Location
    country: varchar("country", { length: 2 }).default("UA"),
    city: varchar("city", { length: 100 }).notNull(),
    address: text("address").notNull(),
    postalCode: varchar("postal_code", { length: 10 }),
    phone: varchar("phone", { length: 20 }),

    // Working hours
    workingHours: jsonb("working_hours"),

    // НОВЕ: Кешований статус "відкрито зараз" (оновлюється кроном)
    isOpenNow: boolean("is_open_now").default(false),
    nextOpenTime: timestamp("next_open_time"),
    nextCloseTime: timestamp("next_close_time"),

    // Geolocation
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    // Settings
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    allowSelfPickup: boolean("allow_self_pickup").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("warehouses_vendor_idx").on(table.vendorId),
    cityIdx: index("warehouses_city_idx").on(table.city),
    activeIdx: index("warehouses_active_idx").on(table.isActive),
    defaultIdx: index("warehouses_default_idx").on(table.vendorId, table.isDefault),
    // НОВЕ: Один дефолтний склад на вендора
    oneDefaultPerVendor: uniqueIndex("one_default_warehouse_per_vendor_idx")
      .on(table.vendorId)
      .where(sql`is_default = true`),
    // НОВЕ: Індекс для пошуку відкритих зараз складів
    openNowIdx: index("warehouses_open_now_idx").on(table.isOpenNow, table.city),

    checkPhone: check("warehouse_check_phone", sql`phone IS NULL OR phone ~ '^\+380\d{9}$'`),
  }),
);

// ============================================================================
// VENDOR WALLET TRANSACTIONS
// ============================================================================

export const vendorTransactions = pgTable(
  "vendor_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    orderId: uuid("order_id"),

    type: transactionTypeEnum("type").notNull(),

    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
    balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),

    description: text("description"),
    metadata: jsonb("metadata"),

    // For withdrawals
    withdrawalMethod: varchar("withdrawal_method", { length: 50 }),
    withdrawalDetails: jsonb("withdrawal_details"),
    processedAt: timestamp("processed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("transactions_vendor_idx").on(table.vendorId),
    orderIdx: index("transactions_order_idx").on(table.orderId),
    typeIdx: index("transactions_type_idx").on(table.type),
    dateIdx: index("transactions_date_idx").on(table.createdAt),
    // НОВЕ: Composite index для звітів по вендору за період
    vendorDateIdx: index("transactions_vendor_date_idx").on(table.vendorId, table.createdAt),
  }),
);

// ============================================================================
// VENDOR PAYOUT REQUESTS
// ============================================================================

export const vendorPayoutRequests = pgTable(
  "vendor_payout_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id").references(() => vendorTransactions.id, {
      onDelete: "set null",
    }),

    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),

    payoutMethod: varchar("payout_method", { length: 50 }).notNull(),
    payoutDetails: jsonb("payout_details").notNull(),

    status: payoutStatusEnum("status").default("pending").notNull(),

    rejectionReason: text("rejection_reason"),

    // НОВЕ: Хто обробив запит
    processedBy: uuid("processed_by").references(() => users.id, { onDelete: "set null" }),

    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    vendorIdx: index("payout_requests_vendor_idx").on(table.vendorId),
    statusIdx: index("payout_requests_status_idx").on(table.status),
    dateIdx: index("payout_requests_date_idx").on(table.requestedAt),
    // НОВЕ: Для пошуку pending запитів
    pendingIdx: index("payout_requests_pending_idx")
      .on(table.requestedAt)
      .where(sql`status = 'pending'`),

    checkAmount: check("payout_check_amount", sql`amount > 0`),
  }),
);

// ============================================================================
// VENDOR STAFF
// ============================================================================

export const vendorStaff = pgTable(
  "vendor_staff",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // ПОКРАЩЕННЯ: Enum замість varchar
    role: vendorStaffRoleEnum("role").default("manager").notNull(),

    permissions: jsonb("permissions").notNull(),

    isActive: boolean("is_active").default(true),

    // НОВЕ: Хто додав цього працівника
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),

    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at"),

    // НОВЕ: Коли останній раз був активний
    lastActiveAt: timestamp("last_active_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorUserIdx: uniqueIndex("staff_vendor_user_idx").on(table.vendorId, table.userId),
    vendorIdx: index("staff_vendor_idx").on(table.vendorId),
    userIdx: index("staff_user_idx").on(table.userId),
    activeIdx: index("staff_active_idx").on(table.isActive),
    roleIdx: index("staff_role_idx").on(table.vendorId, table.role),
  }),
);

// ============================================================================
// VENDOR FOLLOWERS
// ============================================================================

export const vendorFollowers = pgTable(
  "vendor_followers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    notifyOnNewProducts: boolean("notify_on_new_products").default(true),
    notifyOnSales: boolean("notify_on_sales").default(true),

    followedAt: timestamp("followed_at").defaultNow().notNull(),

    // НОВЕ: Коли відписався (soft delete для статистики)
    unfollowedAt: timestamp("unfollowed_at"),
  },
  (table) => ({
    vendorUserIdx: uniqueIndex("followers_vendor_user_idx")
      .on(table.vendorId, table.userId)
      .where(sql`unfollowed_at IS NULL`),
    vendorIdx: index("followers_vendor_idx").on(table.vendorId),
    userIdx: index("followers_user_idx").on(table.userId),
    // НОВЕ: Для підрахунку активних фоловерів
    activeFollowersIdx: index("followers_active_idx")
      .on(table.vendorId)
      .where(sql`unfollowed_at IS NULL`),
  }),
);

// ============================================================================
// VENDOR STATISTICS SNAPSHOT
// ============================================================================

export const vendorStatistics = pgTable(
  "vendor_statistics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),

    periodDate: timestamp("period_date").notNull(),
    periodType: periodTypeEnum("period_type").notNull(),

    // Sales metrics
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
    totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0.00"),

    // НОВЕ: Деталізація по статусах замовлень
    completedOrders: integer("completed_orders").default(0),
    cancelledOrders: integer("cancelled_orders").default(0),
    returnedOrders: integer("returned_orders").default(0),

    // Product metrics
    totalProducts: integer("total_products").default(0),
    activeProducts: integer("active_products").default(0),
    outOfStockProducts: integer("out_of_stock_products").default(0),

    // НОВЕ: Нові товари за період
    newProducts: integer("new_products").default(0),

    // Customer metrics
    newCustomers: integer("new_customers").default(0),
    returningCustomers: integer("returning_customers").default(0),

    // НОВЕ: Унікальні відвідувачі
    uniqueVisitors: integer("unique_visitors").default(0),
    pageViews: integer("page_views").default(0),

    // Performance
    averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }),
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),

    // НОВЕ: Час обробки замовлення
    averageProcessingTime: integer("average_processing_time").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorPeriodIdx: uniqueIndex("statistics_vendor_period_idx").on(
      table.vendorId,
      table.periodDate,
      table.periodType,
    ),
    vendorIdx: index("statistics_vendor_idx").on(table.vendorId),
    dateIdx: index("statistics_date_idx").on(table.periodDate),
    // НОВЕ: Для швидкого отримання останніх даних
    vendorDateTypeIdx: index("statistics_vendor_date_type_idx").on(
      table.vendorId,
      table.periodType,
      table.periodDate,
    ),
  }),
);

// ============================================================================
// НОВА ТАБЛИЦЯ: VENDOR CATEGORY COMMISSIONS
// ============================================================================

export const vendorCategoryCommissions = pgTable(
  "vendor_category_commissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull(),

    // Індивідуальна комісія для категорії
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),

    // Пріоритет (вища комісія має пріоритет)
    priority: integer("priority").default(0),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorCategoryIdx: uniqueIndex("vendor_category_commission_idx").on(
      table.vendorId,
      table.categoryId,
    ),
    vendorIdx: index("category_commission_vendor_idx").on(table.vendorId),
    categoryIdx: index("category_commission_category_idx").on(table.categoryId),

    checkCommissionRate: check(
      "category_check_commission",
      sql`commission_rate >= 0 AND commission_rate <= 100`,
    ),
  }),
);
