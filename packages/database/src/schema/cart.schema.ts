import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products, productVariants } from "./products.schema.js";
import { users } from "./users.schema.js";

// ============================================================================
// SHOPPING CART
// ============================================================================

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }), // для гостей

    // Guest info
    guestEmail: varchar("guest_email", { length: 255 }),
    guestPhone: varchar("guest_phone", { length: 20 }),

    // Applied discounts
    promoCode: varchar("promo_code", { length: 50 }),

    // Totals
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0.00"),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),

    // Metadata
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),

    // UTM tracking
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),

    // Abandonment tracking
    isAbandoned: boolean("is_abandoned").default(false),
    abandonedAt: timestamp("abandoned_at"),
    recoveryEmailSent: boolean("recovery_email_sent").default(false),
    recoveryEmailSentAt: timestamp("recovery_email_sent_at"),

    // Conversion
    convertedToOrderId: uuid("converted_to_order_id"),
    convertedAt: timestamp("converted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => ({
    userIdx: index("carts_user_idx").on(table.userId),
    sessionIdx: index("carts_session_idx").on(table.sessionId),
    emailIdx: index("carts_email_idx").on(table.guestEmail),
    abandonedIdx: index("carts_abandoned_idx")
      .on(table.isAbandoned, table.abandonedAt)
      .where(sql`is_abandoned = true AND recovery_email_sent = false`),
    expiresIdx: index("carts_expires_idx").on(table.expiresAt),
  }),
);

// ============================================================================
// CART ITEMS
// ============================================================================

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    quantity: integer("quantity").default(1).notNull(),

    // Price snapshot
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),

    // Custom options
    customOptions: jsonb("custom_options"),

    addedAt: timestamp("added_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    cartIdx: index("cart_items_cart_idx").on(table.cartId),
    productIdx: index("cart_items_product_idx").on(table.productId),
    variantIdx: index("cart_items_variant_idx").on(table.variantId),
    uniqueCartProduct: uniqueIndex("cart_items_unique_idx").on(
      table.cartId,
      table.productId,
      table.variantId,
    ),
  }),
);

// ============================================================================
// SAVED FOR LATER
// ============================================================================

export const savedForLater = pgTable(
  "saved_for_later",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    quantity: integer("quantity").default(1),
    notes: varchar("notes", { length: 500 }),

    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("saved_for_later_unique_idx").on(
      table.userId,
      table.productId,
      table.variantId,
    ),

    userIdx: index("saved_for_later_user_idx").on(table.userId),
    productIdx: index("saved_for_later_product_idx").on(table.productId),
  }),
);

// ============================================================================
// RECENTLY VIEWED
// ============================================================================

export const recentlyViewed = pgTable(
  "recently_viewed",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: index("recently_viewed_user_product_idx").on(table.userId, table.viewedAt),
    sessionProductIdx: index("recently_viewed_session_product_idx").on(
      table.sessionId,
      table.viewedAt,
    ),
    productIdx: index("recently_viewed_product_idx").on(table.productId),
    dateIdx: index("recently_viewed_date_idx").on(table.viewedAt),
  }),
);

// ============================================================================
// PRODUCT COMPARISON
// ============================================================================

export const productComparisons = pgTable(
  "product_comparisons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }),
    categoryId: uuid("category_id").notNull(),

    productIds: jsonb("product_ids").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("comparisons_user_idx").on(table.userId),
    sessionIdx: index("comparisons_session_idx").on(table.sessionId),
    categoryIdx: index("comparisons_category_idx").on(table.categoryId),
  }),
);

// ============================================================================
// WISHLIST
// ============================================================================

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull().default("My Wishlist"),
    description: varchar("description", { length: 500 }),

    isPublic: boolean("is_public").default(false),
    shareToken: varchar("share_token", { length: 100 }),

    isDefault: boolean("is_default").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("wishlists_user_idx").on(table.userId),
    shareTokenIdx: uniqueIndex("wishlists_share_token_idx").on(table.shareToken),
    publicIdx: index("wishlists_public_idx").on(table.isPublic),
  }),
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    quantity: integer("quantity").default(1),
    priority: integer("priority").default(0),
    notes: varchar("notes", { length: 500 }),

    priceWhenAdded: decimal("price_when_added", { precision: 12, scale: 2 }),

    notifyOnPriceDrop: boolean("notify_on_price_drop").default(false),
    notifyOnBackInStock: boolean("notify_on_back_in_stock").default(false),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    wishlistIdx: index("wishlist_items_wishlist_idx").on(table.wishlistId),
    productIdx: index("wishlist_items_product_idx").on(table.productId),
    uniqueWishlistProduct: uniqueIndex("wishlist_items_unique_idx").on(
      table.wishlistId,
      table.productId,
      table.variantId,
    ),
  }),
);

// ============================================================================
// GIFT REGISTRIES
// ============================================================================

export const giftRegistries = pgTable(
  "gift_registries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    registryType: varchar("registry_type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),

    eventDate: timestamp("event_date"),
    eventLocation: varchar("event_location", { length: 255 }),

    coOwnerUserId: uuid("co_owner_user_id").references(() => users.id, { onDelete: "set null" }),
    coOwnerName: varchar("co_owner_name", { length: 200 }),
    coOwnerEmail: varchar("co_owner_email", { length: 255 }),

    isPublic: boolean("is_public").default(true),
    shareToken: varchar("share_token", { length: 100 }).notNull().unique(),

    shippingAddressId: uuid("shipping_address_id"),

    allowGroupGifts: boolean("allow_group_gifts").default(true),
    showPurchasedItems: boolean("show_purchased_items").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("registries_user_idx").on(table.userId),
    shareTokenIdx: uniqueIndex("registries_share_token_idx").on(table.shareToken),
    eventDateIdx: index("registries_event_date_idx").on(table.eventDate),
    publicIdx: index("registries_public_idx").on(table.isPublic),
  }),
);

export const giftRegistryItems = pgTable(
  "gift_registry_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registryId: uuid("registry_id")
      .notNull()
      .references(() => giftRegistries.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),

    requestedQuantity: integer("requested_quantity").default(1).notNull(),
    purchasedQuantity: integer("purchased_quantity").default(0),

    priority: varchar("priority", { length: 20 }).default("medium"),
    notes: varchar("notes", { length: 500 }),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    registryIdx: index("registry_items_registry_idx").on(table.registryId),
    productIdx: index("registry_items_product_idx").on(table.productId),
    uniqueRegistryProduct: uniqueIndex("registry_items_unique_idx").on(
      table.registryId,
      table.productId,
      table.variantId,
    ),
  }),
);

export const giftRegistryPurchases = pgTable(
  "gift_registry_purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registryItemId: uuid("registry_item_id")
      .notNull()
      .references(() => giftRegistryItems.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").notNull(),

    buyerUserId: uuid("buyer_user_id").references(() => users.id, { onDelete: "set null" }),
    buyerName: varchar("buyer_name", { length: 200 }),
    buyerEmail: varchar("buyer_email", { length: 255 }),

    quantity: integer("quantity").notNull(),

    giftMessage: varchar("gift_message", { length: 1000 }),
    isAnonymous: boolean("is_anonymous").default(false),

    purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  },
  (table) => ({
    registryItemIdx: index("registry_purchases_item_idx").on(table.registryItemId),
    orderIdx: index("registry_purchases_order_idx").on(table.orderId),
    buyerIdx: index("registry_purchases_buyer_idx").on(table.buyerUserId),
  }),
);

// ============================================================================
// CART RECOVERY TOKENS
// ============================================================================

export const cartRecoveryTokens = pgTable(
  "cart_recovery_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),

    token: varchar("token", { length: 100 }).notNull().unique(),

    discountCode: varchar("discount_code", { length: 50 }),

    usedAt: timestamp("used_at"),
    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("recovery_tokens_token_idx").on(table.token),
    cartIdx: index("recovery_tokens_cart_idx").on(table.cartId),
    expiresIdx: index("recovery_tokens_expires_idx").on(table.expiresAt),
  }),
);
