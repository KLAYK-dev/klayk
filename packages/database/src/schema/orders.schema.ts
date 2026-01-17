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
import {
  deliveryMethodEnum,
  deliveryStatusEnum,
  orderStatusEnum,
  paymentMethodTypeEnum, // <-- Використовуємо правильний enum з type
  paymentStatusEnum,
  userSegmentEnum,
} from "./enums.js";
import { products, productVariants } from "./products.schema.js";
import { users } from "./users.schema.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// ORDERS
// ============================================================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),

    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),

    // Використовуємо "draft" або "new" як початковий статус
    status: orderStatusEnum("status").default("draft").notNull(),

    // Contact info
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }),

    // Pricing
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
    deliveryFee: decimal("delivery_fee", { precision: 12, scale: 2 }).default("0.00"),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),

    // Commission
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
    commissionFixed: decimal("commission_fixed", { precision: 12, scale: 2 }),
    commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }),
    vendorPayout: decimal("vendor_payout", { precision: 12, scale: 2 }),

    // Applied discounts
    promoCode: varchar("promo_code", { length: 50 }),
    discountBreakdown: jsonb("discount_breakdown"),

    cashbackUsed: decimal("cashback_used", { precision: 12, scale: 2 }).default("0.00"),
    cashbackEarned: decimal("cashback_earned", { precision: 12, scale: 2 }).default("0.00"),
    loyaltyPointsUsed: integer("loyalty_points_used").default(0),
    loyaltyPointsEarned: integer("loyalty_points_earned").default(0),

    // Customer segment
    customerSegment: userSegmentEnum("customer_segment"),

    // Notes
    customerNote: text("customer_note"),
    internalNote: text("internal_note"),
    cancellationReason: text("cancellation_reason"),

    // IP & Device
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    // Source tracking
    sourceChannel: varchar("source_channel", { length: 50 }),
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at"),
    processingAt: timestamp("processing_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    orderNumberIdx: uniqueIndex("orders_number_idx").on(table.orderNumber),
    userIdx: index("orders_user_idx").on(table.userId),
    vendorIdx: index("orders_vendor_idx").on(table.vendorId),
    statusIdx: index("orders_status_idx").on(table.status),
    createdIdx: index("orders_created_idx").on(table.createdAt),
    emailIdx: index("orders_email_idx").on(table.customerEmail),
    phoneIdx: index("orders_phone_idx").on(table.customerPhone),
    promoCodeIdx: index("orders_promo_code_idx").on(table.promoCode),
  }),
);

// ============================================================================
// ORDER ITEMS
// ============================================================================

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),

    // Snapshot data
    productName: varchar("product_name", { length: 500 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }),
    variantAttributes: jsonb("variant_attributes"),
    productImage: text("product_image"),
    productSlug: varchar("product_slug", { length: 255 }),

    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),

    // Tax
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),

    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),

    // Digital
    isDigital: boolean("is_digital").default(false),
    digitalDownloadUrl: text("digital_download_url"),
    digitalDownloadExpiresAt: timestamp("digital_download_expires_at"),
    digitalDownloadCount: integer("digital_download_count").default(0),
    digitalDownloadLimit: integer("digital_download_limit").default(3),

    // Returns
    isReturnable: boolean("is_returnable").default(true),
    returnedQuantity: integer("returned_quantity").default(0),
    refundedAmount: decimal("refunded_amount", { precision: 12, scale: 2 }).default("0.00"),

    warrantyMonths: integer("warranty_months"),
    warrantyExpiresAt: date("warranty_expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
    productIdx: index("order_items_product_idx").on(table.productId),
    variantIdx: index("order_items_variant_idx").on(table.variantId),
    digitalIdx: index("order_items_digital_idx").on(table.isDigital),
  }),
);

// ============================================================================
// ORDER DELIVERIES
// ============================================================================

export const orderDeliveries = pgTable(
  "order_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    method: deliveryMethodEnum("method").notNull(),
    status: deliveryStatusEnum("status").default("pending").notNull(),

    // Address
    recipientName: varchar("recipient_name", { length: 200 }).notNull(),
    recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
    country: varchar("country", { length: 2 }).default("UA"),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }).notNull(),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 10 }),

    warehouseInfo: jsonb("warehouse_info"),

    // Tracking
    trackingNumber: varchar("tracking_number", { length: 100 }),
    carrierTrackingUrl: text("carrier_tracking_url"),
    estimatedDeliveryDate: date("estimated_delivery_date"),
    actualDeliveryDate: date("actual_delivery_date"),

    deliveryFee: decimal("delivery_fee", { precision: 12, scale: 2 }),
    insuranceAmount: decimal("insurance_amount", { precision: 12, scale: 2 }),
    declaredValue: decimal("declared_value", { precision: 12, scale: 2 }),

    // Package
    packageWeight: decimal("package_weight", { precision: 8, scale: 2 }),
    packageDimensions: jsonb("package_dimensions"),
    numberOfPackages: smallint("number_of_packages").default(1),

    carrierData: jsonb("carrier_data"),
    deliveryInstructions: text("delivery_instructions"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    returnedAt: timestamp("returned_at"),
    failedAt: timestamp("failed_at"),
  },
  (table) => ({
    orderIdx: index("deliveries_order_idx").on(table.orderId),
    statusIdx: index("deliveries_status_idx").on(table.status),
    methodIdx: index("deliveries_method_idx").on(table.method),
    trackingIdx: index("deliveries_tracking_idx").on(table.trackingNumber),
    cityIdx: index("deliveries_city_idx").on(table.city),
    estimatedDateIdx: index("deliveries_estimated_date_idx").on(table.estimatedDeliveryDate),
  }),
);

// ============================================================================
// ORDER PAYMENTS
// ============================================================================

export const orderPayments = pgTable(
  "order_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    // Використовуємо правильний enum
    method: paymentMethodTypeEnum("method").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),

    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("UAH"),

    transactionId: varchar("transaction_id", { length: 255 }),
    gatewayResponse: jsonb("gateway_response"),
    errorCode: varchar("error_code", { length: 50 }),
    errorMessage: text("error_message"),

    // Installment
    installmentMonths: smallint("installment_months"),
    installmentRate: decimal("installment_rate", { precision: 5, scale: 2 }),
    monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }),
    installmentProvider: varchar("installment_provider", { length: 100 }),

    // Escrow
    isEscrow: boolean("is_escrow").default(true),
    escrowReleasedAt: timestamp("escrow_released_at"),
    escrowReleaseAmount: decimal("escrow_release_amount", { precision: 12, scale: 2 }),
    escrowHoldDays: integer("escrow_hold_days").default(7),

    refundableAmount: decimal("refundable_amount", { precision: 12, scale: 2 }),
    refundedAmount: decimal("refunded_amount", { precision: 12, scale: 2 }).default("0.00"),

    paymentFee: decimal("payment_fee", { precision: 12, scale: 2 }).default("0.00"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
    failedAt: timestamp("failed_at"),
    refundedAt: timestamp("refunded_at"),
  },
  (table) => ({
    orderIdx: index("payments_order_idx").on(table.orderId),
    statusIdx: index("payments_status_idx").on(table.status),
    methodIdx: index("payments_method_idx").on(table.method),
    transactionIdx: index("payments_transaction_idx").on(table.transactionId),
    escrowIdx: index("payments_escrow_idx")
      .on(table.isEscrow, table.escrowReleasedAt)
      .where(sql`is_escrow = true AND escrow_released_at IS NULL`),
  }),
);

// ============================================================================
// ORDER STATUS HISTORY
// ============================================================================

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),

    comment: text("comment"),
    metadata: jsonb("metadata"),

    userId: uuid("user_id"),
    notificationSent: boolean("notification_sent").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("status_history_order_idx").on(table.orderId),
    statusIdx: index("status_history_status_idx").on(table.toStatus),
    dateIdx: index("status_history_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// ORDER REFUNDS
// ============================================================================

export const orderRefunds = pgTable(
  "order_refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    paymentId: uuid("payment_id").references(() => orderPayments.id, { onDelete: "set null" }),

    refundNumber: varchar("refund_number", { length: 50 }).notNull().unique(),
    refundType: varchar("refund_type", { length: 50 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),

    reason: text("reason").notNull(),
    reasonCategory: varchar("reason_category", { length: 50 }),
    status: varchar("status", { length: 20 }).default("pending").notNull(),

    requestedBy: uuid("requested_by").notNull(),
    approvedBy: uuid("approved_by"),
    processedBy: uuid("processed_by"),

    approvalNotes: text("approval_notes"),
    refundMethod: varchar("refund_method", { length: 50 }),

    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    approvedAt: timestamp("approved_at"),
    processedAt: timestamp("processed_at"),
    completedAt: timestamp("completed_at"),
    rejectedAt: timestamp("rejected_at"),
  },
  (table) => ({
    refundNumberIdx: uniqueIndex("refunds_number_idx").on(table.refundNumber),
    orderIdx: index("refunds_order_idx").on(table.orderId),
    paymentIdx: index("refunds_payment_idx").on(table.paymentId),
    statusIdx: index("refunds_status_idx").on(table.status),
    dateIdx: index("refunds_date_idx").on(table.requestedAt),
  }),
);

export const orderRefundItems = pgTable(
  "order_refund_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    refundId: uuid("refund_id")
      .notNull()
      .references(() => orderRefunds.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),

    quantity: integer("quantity").notNull(),
    refundAmount: decimal("refund_amount", { precision: 12, scale: 2 }).notNull(),
    condition: varchar("condition", { length: 50 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    refundIdx: index("refund_items_refund_idx").on(table.refundId),
    orderItemIdx: index("refund_items_order_item_idx").on(table.orderItemId),
  }),
);

// ============================================================================
// ORDER DISPUTES
// ============================================================================

export const orderDisputes = pgTable(
  "order_disputes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),

    disputeNumber: varchar("dispute_number", { length: 50 }).notNull().unique(),
    disputeType: varchar("dispute_type", { length: 50 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 20 }).default("open").notNull(),

    resolution: text("resolution"),
    resolutionType: varchar("resolution_type", { length: 50 }),

    openedBy: uuid("opened_by").notNull(),
    assignedTo: uuid("assigned_to"),

    openedAt: timestamp("opened_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    resolvedAt: timestamp("resolved_at"),
    closedAt: timestamp("closed_at"),
    escalatedAt: timestamp("escalated_at"),
  },
  (table) => ({
    disputeNumberIdx: uniqueIndex("disputes_number_idx").on(table.disputeNumber),
    orderIdx: index("disputes_order_idx").on(table.orderId),
    statusIdx: index("disputes_status_idx").on(table.status),
    assignedIdx: index("disputes_assigned_idx").on(table.assignedTo),
    dateIdx: index("disputes_date_idx").on(table.openedAt),
  }),
);

export const orderDisputeMessages = pgTable(
  "order_dispute_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    disputeId: uuid("dispute_id")
      .notNull()
      .references(() => orderDisputes.id, { onDelete: "cascade" }),

    senderId: uuid("sender_id").notNull(),
    senderType: varchar("sender_type", { length: 20 }).notNull(),

    message: text("message").notNull(),
    attachments: jsonb("attachments"),
    isInternal: boolean("is_internal").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    disputeIdx: index("dispute_messages_dispute_idx").on(table.disputeId),
    senderIdx: index("dispute_messages_sender_idx").on(table.senderId),
    dateIdx: index("dispute_messages_date_idx").on(table.createdAt),
  }),
);
