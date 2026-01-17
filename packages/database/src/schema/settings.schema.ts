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
  paymentGatewayEnum,
  settingTypeEnum,
  shippingMethodEnum,
  webhookStatusEnum,
} from "./enums.js";
import { users } from "./users.schema.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
    settingValue: jsonb("setting_value").notNull(),

    // Metadata
    settingType: settingTypeEnum("setting_type").notNull(),

    description: text("description"),

    // Validation
    validationRules: jsonb("validation_rules"),

    isPublic: boolean("is_public").default(false),
    isEditable: boolean("is_editable").default(true),

    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("system_settings_key_idx").on(table.settingKey),
    typeIdx: index("system_settings_type_idx").on(table.settingType),
    publicIdx: index("system_settings_public_idx").on(table.isPublic),
  }),
);

// ============================================================================
// PAYMENT GATEWAYS CONFIG
// ============================================================================

export const paymentGateways = pgTable(
  "payment_gateways",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    gateway: paymentGatewayEnum("gateway").notNull().unique(),

    displayName: jsonb("display_name").notNull(),
    description: jsonb("description"),
    logo: text("logo"),

    // Configuration (зашифровано на рівні аплікації)
    config: jsonb("config").notNull(),

    // Settings
    isActive: boolean("is_active").default(false),
    isTestMode: boolean("is_test_mode").default(true),

    // Fees
    fixedFee: decimal("fixed_fee", { precision: 12, scale: 2 }).default("0.00"),
    percentageFee: decimal("percentage_fee", { precision: 5, scale: 2 }).default("0.00"),

    // Supported features
    supportsInstallments: boolean("supports_installments").default(false),
    supportsRecurring: boolean("supports_recurring").default(false),
    supportsRefunds: boolean("supports_refunds").default(true),

    // Order
    sortOrder: integer("sort_order").default(0),

    // Availability
    minAmount: decimal("min_amount", { precision: 12, scale: 2 }),
    maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    gatewayIdx: uniqueIndex("payment_gateways_gateway_idx").on(table.gateway),
    activeIdx: index("payment_gateways_active_idx").on(table.isActive),
    sortIdx: index("payment_gateways_sort_idx").on(table.sortOrder),

    checkFees: check("payment_check_fees", sql`fixed_fee >= 0 AND percentage_fee >= 0`),
    checkPercentage: check("payment_check_percentage", sql`percentage_fee <= 100`),
  }),
);

// ============================================================================
// SHIPPING METHODS CONFIG
// ============================================================================

export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    method: shippingMethodEnum("method").notNull().unique(),

    displayName: jsonb("display_name").notNull(),
    description: jsonb("description"),
    logo: text("logo"),

    // API Configuration (зашифровано)
    apiConfig: jsonb("api_config"),

    // Pricing
    baseCost: decimal("base_cost", { precision: 12, scale: 2 }).default("0.00"),
    costPerKg: decimal("cost_per_kg", { precision: 12, scale: 2 }),
    freeShippingThreshold: decimal("free_shipping_threshold", { precision: 12, scale: 2 }),

    // Availability
    isActive: boolean("is_active").default(true),
    availableCountries: jsonb("available_countries").default('["UA"]'),

    // Delivery time
    estimatedDaysMin: integer("estimated_days_min"),
    estimatedDaysMax: integer("estimated_days_max"),

    // Restrictions
    maxWeight: decimal("max_weight", { precision: 8, scale: 2 }),
    maxDimensions: jsonb("max_dimensions"),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    methodIdx: uniqueIndex("shipping_methods_method_idx").on(table.method),
    activeIdx: index("shipping_methods_active_idx").on(table.isActive),
    sortIdx: index("shipping_methods_sort_idx").on(table.sortOrder),

    checkCosts: check(
      "shipping_check_costs",
      sql`base_cost >= 0 AND (cost_per_kg IS NULL OR cost_per_kg >= 0)`,
    ),
    checkDays: check(
      "shipping_check_days",
      sql`estimated_days_min IS NULL OR estimated_days_max IS NULL OR estimated_days_min <= estimated_days_max`,
    ),
  }),
);

// ============================================================================
// TAX RATES
// ============================================================================

export const taxRates = pgTable(
  "tax_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    // Location
    country: varchar("country", { length: 2 }).notNull(),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    postalCode: varchar("postal_code", { length: 10 }),

    // Rate
    rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),

    // Application
    applicableToProducts: boolean("applicable_to_products").default(true),
    applicableToShipping: boolean("applicable_to_shipping").default(false),

    // Priority (higher = more specific)
    priority: integer("priority").default(0),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    countryIdx: index("tax_rates_country_idx").on(table.country),
    activeIdx: index("tax_rates_active_idx").on(table.isActive),
    priorityIdx: index("tax_rates_priority_idx").on(table.priority),
    locationIdx: index("tax_rates_location_idx").on(table.country, table.region, table.city),

    checkRate: check("tax_check_rate", sql`rate >= 0 AND rate <= 100`),
  }),
);

// ============================================================================
// CURRENCIES
// ============================================================================

export const currencies = pgTable(
  "currencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    code: varchar("code", { length: 3 }).notNull().unique(),

    name: jsonb("name").notNull(),
    symbol: varchar("symbol", { length: 10 }).notNull(),

    // Exchange rate (relative to base currency UAH)
    exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }).default("1.000000"),

    // Display
    decimalPlaces: integer("decimal_places").default(2),
    thousandsSeparator: varchar("thousands_separator", { length: 1 }).default(","),
    decimalSeparator: varchar("decimal_separator", { length: 1 }).default("."),

    isActive: boolean("is_active").default(true),
    isDefault: boolean("is_default").default(false),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("currencies_code_idx").on(table.code),
    activeIdx: index("currencies_active_idx").on(table.isActive),
    oneDefaultCurrency: uniqueIndex("one_default_currency_idx")
      .on(sql`1`)
      .where(sql`is_default = true`),

    checkExchangeRate: check("currency_check_rate", sql`exchange_rate > 0`),
    checkDecimalPlaces: check(
      "currency_check_decimals",
      sql`decimal_places >= 0 AND decimal_places <= 4`,
    ),
  }),
);

// ============================================================================
// LANGUAGES
// ============================================================================

export const languages = pgTable(
  "languages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    code: varchar("code", { length: 2 }).notNull().unique(),

    name: varchar("name", { length: 100 }).notNull(),
    nativeName: varchar("native_name", { length: 100 }).notNull(),

    flag: varchar("flag", { length: 10 }),

    isActive: boolean("is_active").default(true),
    isDefault: boolean("is_default").default(false),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("languages_code_idx").on(table.code),
    activeIdx: index("languages_active_idx").on(table.isActive),
    sortIdx: index("languages_sort_idx").on(table.sortOrder),
    oneDefaultLanguage: uniqueIndex("one_default_language_idx")
      .on(sql`1`)
      .where(sql`is_default = true`),
  }),
);

// ============================================================================
// API KEYS
// ============================================================================

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
    keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),

    // Owner
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    // Permissions
    permissions: jsonb("permissions").notNull(),

    // Rate limiting
    requestsPerMinute: integer("requests_per_minute").default(60),
    requestsPerDay: integer("requests_per_day").default(10000),

    // IP whitelist
    allowedIps: jsonb("allowed_ips"),

    // Status
    isActive: boolean("is_active").default(true),

    // Stats
    lastUsedAt: timestamp("last_used_at"),
    totalRequests: integer("total_requests").default(0),

    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    keyHashIdx: uniqueIndex("api_keys_hash_idx").on(table.keyHash),
    userIdx: index("api_keys_user_idx").on(table.userId),
    vendorIdx: index("api_keys_vendor_idx").on(table.vendorId),
    activeIdx: index("api_keys_active_idx").on(table.isActive),
    expiresIdx: index("api_keys_expires_idx").on(table.expiresAt),

    checkRateLimits: check(
      "api_check_rates",
      sql`requests_per_minute > 0 AND requests_per_day > 0`,
    ),
  }),
);

// ============================================================================
// WEBHOOKS
// ============================================================================

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),

    // Events to listen to (array of webhook_event enum values)
    events: jsonb("events").notNull(),

    // Security
    secret: varchar("secret", { length: 255 }).notNull(),

    // Settings
    isActive: boolean("is_active").default(true),

    // Retry settings
    maxRetries: integer("max_retries").default(3),
    retryDelay: integer("retry_delay").default(60),

    // Stats
    lastTriggeredAt: timestamp("last_triggered_at"),
    successCount: integer("success_count").default(0),
    failureCount: integer("failure_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("webhooks_user_idx").on(table.userId),
    vendorIdx: index("webhooks_vendor_idx").on(table.vendorId),
    activeIdx: index("webhooks_active_idx").on(table.isActive),

    checkRetries: check("webhook_check_retries", sql`max_retries >= 0 AND retry_delay > 0`),
  }),
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    webhookId: uuid("webhook_id")
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),

    event: varchar("event", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),

    // Response
    status: webhookStatusEnum("status").default("pending").notNull(),

    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    responseTime: integer("response_time"),

    attempts: integer("attempts").default(0),
    lastAttemptAt: timestamp("last_attempt_at"),
    nextRetryAt: timestamp("next_retry_at"),

    error: text("error"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    webhookIdx: index("webhook_deliveries_webhook_idx").on(table.webhookId),
    statusIdx: index("webhook_deliveries_status_idx").on(table.status),
    retryIdx: index("webhook_deliveries_retry_idx")
      .on(table.nextRetryAt)
      .where(sql`status = 'retrying'`),
    dateIdx: index("webhook_deliveries_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    flagKey: varchar("flag_key", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // State
    isEnabled: boolean("is_enabled").default(false),

    // Rollout percentage
    rolloutPercentage: integer("rollout_percentage").default(0),

    // Targeting
    targetUserIds: jsonb("target_user_ids"),
    targetSegments: jsonb("target_segments"),
    targetVendorIds: jsonb("target_vendor_ids"),

    // Environment
    environments: jsonb("environments").default('["production"]'),

    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("feature_flags_key_idx").on(table.flagKey),
    enabledIdx: index("feature_flags_enabled_idx").on(table.isEnabled),

    checkRollout: check(
      "feature_check_rollout",
      sql`rollout_percentage >= 0 AND rollout_percentage <= 100`,
    ),
  }),
);

// ============================================================================
// MAINTENANCE MODE
// ============================================================================

export const maintenanceMode = pgTable(
  "maintenance_mode",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    isActive: boolean("is_active").default(false),

    message: jsonb("message"),
    estimatedEndTime: timestamp("estimated_end_time"),

    // Access
    allowedIps: jsonb("allowed_ips"),
    allowedUserIds: jsonb("allowed_user_ids"),

    activatedBy: uuid("activated_by").references(() => users.id, { onDelete: "set null" }),
    activatedAt: timestamp("activated_at"),
    deactivatedAt: timestamp("deactivated_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("maintenance_mode_active_idx").on(table.isActive),
    oneActiveMaintenanceMode: uniqueIndex("one_active_maintenance_mode_idx")
      .on(sql`1`)
      .where(sql`is_active = true`),
    dateIdx: index("maintenance_mode_date_idx").on(table.createdAt),
  }),
);
