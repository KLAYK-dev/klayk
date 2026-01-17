import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products.schema.js";
import { users } from "./users.schema.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// ANALYTICS EVENTS (загальні події для аналітики)
// ============================================================================

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Session
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Event
    eventType: varchar("event_type", { length: 100 }).notNull(),
    // 'page_view', 'product_view', 'add_to_cart', 'remove_from_cart',
    // 'checkout_start', 'purchase', 'search', 'filter', 'click'

    eventCategory: varchar("event_category", { length: 50 }),
    eventAction: varchar("event_action", { length: 100 }),
    eventLabel: varchar("event_label", { length: 255 }),
    eventValue: integer("event_value"),

    // Page context
    pageUrl: text("page_url"),
    pageTitle: varchar("page_title", { length: 500 }),
    referrerUrl: text("referrer_url"),

    // Related entities
    productId: uuid("product_id"),
    categoryId: uuid("category_id"),
    vendorId: uuid("vendor_id"),

    // Device & location
    deviceType: varchar("device_type", { length: 50 }), // 'desktop', 'mobile', 'tablet'
    browser: varchar("browser", { length: 100 }),
    os: varchar("os", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    country: varchar("country", { length: 2 }),
    city: varchar("city", { length: 100 }),

    // UTM parameters
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),
    utmTerm: varchar("utm_term", { length: 100 }),
    utmContent: varchar("utm_content", { length: 100 }),

    // Additional metadata
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("analytics_events_session_idx").on(table.sessionId),
    userIdx: index("analytics_events_user_idx").on(table.userId),
    eventTypeIdx: index("analytics_events_type_idx").on(table.eventType),
    productIdx: index("analytics_events_product_idx").on(table.productId),
    dateIdx: index("analytics_events_date_idx").on(table.createdAt),
    utmSourceIdx: index("analytics_events_utm_source_idx").on(table.utmSource),
  }),
);

// Partitioning CRITICAL for performance:
// CREATE TABLE analytics_events_y2024m01 PARTITION OF analytics_events
// FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

// ============================================================================
// DAILY STATISTICS (агреговані дані по днях)
// ============================================================================

export const dailyStatistics = pgTable(
  "daily_statistics",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    date: date("date").notNull(),

    // Overall metrics
    totalVisitors: integer("total_visitors").default(0),
    uniqueVisitors: integer("unique_visitors").default(0),
    totalPageViews: integer("total_page_views").default(0),

    // E-commerce metrics
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0.00"),
    totalItems: integer("total_items").default(0),
    averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }),

    // Conversion
    addToCartCount: integer("add_to_cart_count").default(0),
    checkoutStartCount: integer("checkout_start_count").default(0),
    purchaseCount: integer("purchase_count").default(0),
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),

    // User actions
    registrationCount: integer("registration_count").default(0),
    reviewCount: integer("review_count").default(0),
    questionCount: integer("question_count").default(0),

    // Traffic sources
    trafficSources: jsonb("traffic_sources"),
    // {direct: 1200, organic: 800, social: 450, email: 200, ...}

    // Top products
    topViewedProducts: jsonb("top_viewed_products"), // [{productId, views}]
    topSoldProducts: jsonb("top_sold_products"), // [{productId, quantity, revenue}]

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index("daily_stats_date_idx").on(table.date),
  }),
);

// ============================================================================
// VENDOR PERFORMANCE (денна статистика по продавцях)
// ============================================================================

export const vendorDailyStats = pgTable(
  "vendor_daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),

    date: date("date").notNull(),

    // Sales
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0.00"),
    totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0.00"),
    totalItems: integer("total_items").default(0),

    // Products
    productViews: integer("product_views").default(0),
    productsAddedToCart: integer("products_added_to_cart").default(0),

    // Customer engagement
    newCustomers: integer("new_customers").default(0),
    returningCustomers: integer("returning_customers").default(0),

    // Reviews
    reviewsReceived: integer("reviews_received").default(0),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorDateIdx: index("vendor_stats_vendor_date_idx").on(table.vendorId, table.date),
    dateIdx: index("vendor_stats_date_idx").on(table.date),
  }),
);

// ============================================================================
// PRODUCT PERFORMANCE (денна статистика по товарах)
// ============================================================================

export const productDailyStats = pgTable(
  "product_daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    date: date("date").notNull(),

    // Views
    views: integer("views").default(0),
    uniqueViews: integer("unique_views").default(0),

    // Engagement
    addToCartCount: integer("add_to_cart_count").default(0),
    removeFromCartCount: integer("remove_from_cart_count").default(0),
    addToWishlistCount: integer("add_to_wishlist_count").default(0),

    // Sales
    orderCount: integer("order_count").default(0),
    quantitySold: integer("quantity_sold").default(0),
    revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0.00"),

    // Conversion
    viewToCartRate: decimal("view_to_cart_rate", { precision: 5, scale: 2 }),
    cartToPurchaseRate: decimal("cart_to_purchase_rate", { precision: 5, scale: 2 }),

    // Reviews
    reviewsReceived: integer("reviews_received").default(0),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),

    // Stock
    stockLevel: integer("stock_level"),
    outOfStockDuration: integer("out_of_stock_duration"), // minutes

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productDateIdx: index("product_stats_product_date_idx").on(table.productId, table.date),
    dateIdx: index("product_stats_date_idx").on(table.date),
  }),
);

// ============================================================================
// SEARCH ANALYTICS (статистика пошукових запитів)
// ============================================================================

export const searchAnalytics = pgTable(
  "search_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    query: varchar("query", { length: 500 }).notNull(),
    normalizedQuery: varchar("normalized_query", { length: 500 }).notNull(), // lowercase, trimmed

    // Results
    resultsCount: integer("results_count").default(0),

    // User context
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 255 }),

    // Filters applied
    filtersApplied: jsonb("filters_applied"),

    // Engagement
    clickedProductId: uuid("clicked_product_id"),
    clickPosition: integer("click_position"), // позиція кліку в результатах

    // Conversion
    ledToOrder: boolean("led_to_order").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    queryIdx: index("search_analytics_query_idx").on(table.normalizedQuery),
    userIdx: index("search_analytics_user_idx").on(table.userId),
    dateIdx: index("search_analytics_date_idx").on(table.createdAt),
    clickedProductIdx: index("search_analytics_clicked_product_idx").on(table.clickedProductId),
  }),
);

// ============================================================================
// TOP SEARCH QUERIES (агреговані популярні запити)
// ============================================================================

export const topSearchQueries = pgTable(
  "top_search_queries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    query: varchar("query", { length: 500 }).notNull(),

    // Period
    periodType: varchar("period_type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),

    // Stats
    searchCount: integer("search_count").default(0),
    uniqueSearchers: integer("unique_searchers").default(0),
    averageResultsCount: integer("average_results_count"),
    clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 2 }),
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),

    // Zero results
    hasZeroResults: boolean("has_zero_results").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    queryPeriodIdx: index("top_queries_query_period_idx").on(
      table.query,
      table.periodType,
      table.periodStart,
    ),
    periodIdx: index("top_queries_period_idx").on(table.periodType, table.periodStart),
    zeroResultsIdx: index("top_queries_zero_results_idx")
      .on(table.hasZeroResults)
      .where(sql`has_zero_results = true`),
  }),
);

// ============================================================================
// FUNNEL ANALYSIS (аналіз воронки продажів)
// ============================================================================

export const funnelAnalytics = pgTable(
  "funnel_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    date: date("date").notNull(),

    // Funnel stages
    stage1_visitors: integer("stage1_visitors").default(0), // Відвідувачі
    stage2_productViews: integer("stage2_product_views").default(0), // Перегляди товарів
    stage3_addToCart: integer("stage3_add_to_cart").default(0), // Додали в кошик
    stage4_checkoutStart: integer("stage4_checkout_start").default(0), // Почали оформлення
    stage5_purchase: integer("stage5_purchase").default(0), // Купили

    // Drop-off rates
    stage1to2_rate: decimal("stage1to2_rate", { precision: 5, scale: 2 }),
    stage2to3_rate: decimal("stage2to3_rate", { precision: 5, scale: 2 }),
    stage3to4_rate: decimal("stage3to4_rate", { precision: 5, scale: 2 }),
    stage4to5_rate: decimal("stage4to5_rate", { precision: 5, scale: 2 }),

    // Overall conversion
    overallConversionRate: decimal("overall_conversion_rate", { precision: 5, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index("funnel_analytics_date_idx").on(table.date),
  }),
);

// ============================================================================
// COHORT ANALYSIS (когортний аналіз користувачів)
// ============================================================================

export const cohortAnalysis = pgTable(
  "cohort_analysis",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    cohortMonth: date("cohort_month").notNull(), // Місяць першого замовлення
    monthsSinceFirstOrder: integer("months_since_first_order").notNull(), // 0, 1, 2, 3, ...

    // Retention
    totalCustomers: integer("total_customers").default(0),
    returningCustomers: integer("returning_customers").default(0),
    retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }),

    // Revenue
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0.00"),
    averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }),

    // Customer metrics
    repeatPurchaseRate: decimal("repeat_purchase_rate", { precision: 5, scale: 2 }),
    averageOrdersPerCustomer: decimal("average_orders_per_customer", { precision: 5, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cohortIdx: index("cohort_analysis_cohort_idx").on(
      table.cohortMonth,
      table.monthsSinceFirstOrder,
    ),
  }),
);

// ============================================================================
// AB TEST EXPERIMENTS
// ============================================================================

export const abTestExperiments = pgTable(
  "ab_test_experiments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    experimentType: varchar("experiment_type", { length: 50 }).notNull(),
    // 'ui_change', 'pricing', 'promotion', 'email', 'product_placement'

    // Variants
    variants: jsonb("variants").notNull(),
    // [{name: 'control', weight: 50, config: {...}}, {name: 'variant_a', weight: 50, config: {...}}]

    // Targeting
    targetSegments: jsonb("target_segments"),
    targetPercentage: integer("target_percentage").default(100), // % of users to include

    // Metrics
    primaryMetric: varchar("primary_metric", { length: 100 }).notNull(), // 'conversion_rate', 'revenue', 'aov'
    secondaryMetrics: jsonb("secondary_metrics"),

    // Status
    status: varchar("status", { length: 20 }).default("draft"),
    // 'draft', 'running', 'paused', 'completed', 'archived'

    // Results
    winningVariant: varchar("winning_variant", { length: 100 }),
    confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),

    // Timing
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("ab_tests_name_idx").on(table.name),
    statusIdx: index("ab_tests_status_idx").on(table.status),
    typeIdx: index("ab_tests_type_idx").on(table.experimentType),
  }),
);

export const abTestResults = pgTable(
  "ab_test_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => abTestExperiments.id, { onDelete: "cascade" }),
    variantName: varchar("variant_name", { length: 100 }).notNull(),

    date: date("date").notNull(),

    // Participants
    totalParticipants: integer("total_participants").default(0),

    // Conversions
    conversions: integer("conversions").default(0),
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),

    // Revenue
    totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0.00"),
    averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }),

    // Additional metrics
    metricValues: jsonb("metric_values"), // {metric_name: value}

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    experimentVariantIdx: index("ab_results_experiment_variant_idx").on(
      table.experimentId,
      table.variantName,
    ),
    dateIdx: index("ab_results_date_idx").on(table.date),
  }),
);
