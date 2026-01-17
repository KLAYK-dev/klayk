import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
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
  genderEnum,
  languageEnum,
  userRoleEnum,
  userSegmentEnum,
  userStatusEnum,
} from "./enums.js";

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }), // Формат E.164: +380...
    passwordHash: varchar("password_hash", { length: 255 }),
    role: userRoleEnum("role").default("customer").notNull(),
    status: userStatusEnum("status").default("pending_verification").notNull(),

    // Виправлено: "b2c" -> "new" (або "active", залежно від логіки)
    segment: userSegmentEnum("segment").default("new").notNull(),

    // Profile
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    middleName: varchar("middle_name", { length: 100 }),
    avatar: text("avatar"),
    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender"),

    // Preferences
    preferredLanguage: languageEnum("preferred_language").default("uk"),
    emailVerified: boolean("email_verified").default(false),
    phoneVerified: boolean("phone_verified").default(false),
    marketingConsent: boolean("marketing_consent").default(false),

    // Diia Integration
    diiaVerified: boolean("diia_verified").default(false),
    diiaId: varchar("diia_id", { length: 255 }),
    rnokpp: varchar("rnokpp", { length: 10 }), // ІПН/РНОКПП

    // B2B specific
    companyName: varchar("company_name", { length: 255 }),
    companyEdrpou: varchar("company_edrpou", { length: 8 }),
    companyVat: varchar("company_vat", { length: 12 }),

    // Loyalty
    loyaltyPoints: integer("loyalty_points").default(0),
    cashbackBalance: decimal("cashback_balance", { precision: 12, scale: 2 }).default("0.00"),

    // Stats
    totalOrders: integer("total_orders").default(0),
    totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0.00"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email).where(sql`deleted_at IS NULL`),
    phoneIdx: uniqueIndex("users_phone_idx")
      .on(table.phone)
      .where(sql`phone IS NOT NULL AND deleted_at IS NULL`),
    statusIdx: index("users_status_idx").on(table.status),
    segmentIdx: index("users_segment_idx").on(table.segment),
    diiaIdx: index("users_diia_idx").on(table.diiaId),
    loyaltyIdx: index("users_loyalty_idx").on(table.loyaltyPoints),
    edrpouIdx: index("users_edrpou_idx").on(table.companyEdrpou),

    // Constraints
    loyaltyCheck: check("loyalty_points_check", sql`loyalty_points >= 0`),
    cashbackCheck: check("cashback_balance_check", sql`cashback_balance >= 0`),
  }),
);

// ============================================================================
// USER SESSIONS
// ============================================================================

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    refreshToken: varchar("refresh_token", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    deviceInfo: jsonb("device_info"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    tokenIdx: index("sessions_token_idx").on(table.token),
    expiresIdx: index("sessions_expires_idx").on(table.expiresAt),
  }),
);

// ============================================================================
// USER ADDRESSES
// ============================================================================

export const userAddresses = pgTable(
  "user_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Address details
    title: varchar("title", { length: 100 }), // "Дім", "Робота"
    recipientName: varchar("recipient_name", { length: 200 }),
    recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),

    // Location
    country: varchar("country", { length: 2 }).default("UA").notNull(),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 10 }),
    street: varchar("street", { length: 255 }),
    building: varchar("building", { length: 20 }),
    apartment: varchar("apartment", { length: 20 }),
    floor: varchar("floor", { length: 10 }),
    entranceCode: varchar("entrance_code", { length: 50 }),

    // Delivery service specific
    novaPoshtaWarehouse: varchar("nova_poshta_warehouse", { length: 100 }),
    novaPoshtaWarehouseRef: varchar("nova_poshta_warehouse_ref", { length: 100 }),
    ukrPoshtaDepartment: varchar("ukrposhta_department", { length: 100 }),
    meestPoint: varchar("meest_point", { length: 100 }),

    // Geolocation
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("addresses_user_idx").on(table.userId),
    cityIdx: index("addresses_city_idx").on(table.city),
    defaultIdx: index("addresses_default_idx").on(table.userId, table.isDefault),
    // Гарантія лише однієї дефолтної адреси
    oneDefaultAddressPerUser: uniqueIndex("one_default_address_per_user_idx")
      .on(table.userId)
      .where(sql`is_default = true AND deleted_at IS NULL`),
  }),
);

// ============================================================================
// USER ACTIVITY LOG
// ============================================================================

export const userActivityLog = pgTable(
  "user_activity_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Без references() - для HighLoad та безпечного видалення користувачів
    userId: uuid("user_id"),
    sessionId: uuid("session_id"),

    activityType: varchar("activity_type", { length: 50 }).notNull(),

    // Related entities
    productId: uuid("product_id"),
    categoryId: uuid("category_id"),
    vendorId: uuid("vendor_id"),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("activity_user_idx").on(table.userId),
    productIdx: index("activity_product_idx").on(table.productId),
    categoryIdx: index("activity_category_idx").on(table.categoryId),
    typeIdx: index("activity_type_idx").on(table.activityType),
    dateIdx: index("activity_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// USER SUBSCRIPTIONS
// ============================================================================

export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),

    subscriptionType: varchar("subscription_type", { length: 50 }).notNull(), // 'price_drop', 'back_in_stock'
    targetPrice: decimal("target_price", { precision: 12, scale: 2 }),

    isActive: boolean("is_active").default(true),
    notifiedAt: timestamp("notified_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("subscriptions_user_product_idx").on(
      table.userId,
      table.productId,
      table.subscriptionType,
    ),
    productIdx: index("subscriptions_product_idx").on(table.productId),
    activeIdx: index("subscriptions_active_idx").on(table.isActive, table.subscriptionType),
  }),
);

// ============================================================================
// USER WISHLIST
// ============================================================================

export const userWishlist = pgTable(
  "user_wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("wishlist_user_product_idx").on(
      table.userId,
      table.productId,
      table.variantId,
    ),
    userIdx: index("wishlist_user_idx").on(table.userId),
    productIdx: index("wishlist_product_idx").on(table.productId),
  }),
);

// ============================================================================
// USER COMPARE LIST
// ============================================================================

export const userCompareList = pgTable(
  "user_compare_list",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),
    categoryId: uuid("category_id").notNull(),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("compare_user_product_idx").on(table.userId, table.productId),
    userCategoryIdx: index("compare_user_category_idx").on(table.userId, table.categoryId),
  }),
);

// ============================================================================
// USER NOTIFICATIONS
// ============================================================================

export const userNotifications = pgTable(
  "user_notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),

    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    relatedEntityId: uuid("related_entity_id"),

    actionUrl: text("action_url"),

    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_notifications_user_idx").on(table.userId),
    unreadIdx: index("user_notifications_unread_idx")
      .on(table.userId, table.isRead)
      .where(sql`is_read = false`),
    typeIdx: index("user_notifications_type_idx").on(table.type),
    dateIdx: index("user_notifications_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// EMAIL SUBSCRIPTIONS
// ============================================================================

export const emailSubscriptions = pgTable(
  "email_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    subscribeToNewsletter: boolean("subscribe_to_newsletter").default(true),
    subscribeToPromotions: boolean("subscribe_to_promotions").default(true),
    subscribeToProductUpdates: boolean("subscribe_to_product_updates").default(false),

    interestedCategories: jsonb("interested_categories"),

    isActive: boolean("is_active").default(true),
    unsubscribedAt: timestamp("unsubscribed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_subscriptions_email_idx").on(table.email),
    userIdx: index("email_subscriptions_user_idx").on(table.userId),
    activeIdx: index("email_subscriptions_active_idx").on(table.isActive),
  }),
);
