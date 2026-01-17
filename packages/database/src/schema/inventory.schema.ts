import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products, productVariants } from "./products.schema.js";
import { vendorWarehouses } from "./vendors.schema.js";

// ============================================================================
// INVENTORY (складські залишки)
// ============================================================================

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => vendorWarehouses.id, { onDelete: "restrict" }),

    quantity: integer("quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    availableQuantity: integer("available_quantity")
      .generatedAlwaysAs(sql`quantity - reserved_quantity`)
      .notNull(),

    // Safety stock levels
    minQuantity: integer("min_quantity").default(0),
    maxQuantity: integer("max_quantity"),

    // Replenishment settings
    reorderPoint: integer("reorder_point").default(0),
    reorderQuantity: integer("reorder_quantity").default(0),

    // Cost tracking
    averageCost: decimal("average_cost", { precision: 12, scale: 2 }),
    lastPurchasePrice: decimal("last_purchase_price", { precision: 12, scale: 2 }),

    lastRestockedAt: timestamp("last_restocked_at"),
    lastSoldAt: timestamp("last_sold_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productWarehouseIdx: uniqueIndex("inventory_product_warehouse_idx").on(
      table.productId,
      table.warehouseId,
    ),

    variantWarehouseIdx: uniqueIndex("inventory_variant_warehouse_idx").on(
      table.variantId,
      table.warehouseId,
    ),

    warehouseIdx: index("inventory_warehouse_idx").on(table.warehouseId),
    lowStockIdx: index("inventory_low_stock_idx")
      .on(table.warehouseId)
      .where(sql`available_quantity <= reorder_point AND available_quantity > 0`),
    outOfStockIdx: index("inventory_out_of_stock_idx")
      .on(table.warehouseId)
      .where(sql`available_quantity = 0`),
  }),
);

// ============================================================================
// INVENTORY RESERVATIONS (резервування товарів)
// ============================================================================

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull(),

    // Auto-release settings
    expiresAt: timestamp("expires_at").notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    // 'active', 'released', 'fulfilled', 'expired'

    // Tracking
    createdAt: timestamp("created_at").defaultNow().notNull(),
    releasedAt: timestamp("released_at"),
    fulfilledAt: timestamp("fulfilled_at"),
  },
  (table) => ({
    orderIdx: index("reservations_order_idx").on(table.orderId),
    inventoryIdx: index("reservations_inventory_idx").on(table.inventoryId),
    statusIdx: index("reservations_status_idx").on(table.status),
    expiresIdx: index("reservations_expires_idx").on(table.expiresAt).where(sql`status = 'active'`),
  }),
);

// ============================================================================
// INVENTORY MOVEMENTS (історія руху товарів)
// ============================================================================

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),
    orderId: uuid("order_id"),

    movementType: varchar("movement_type", { length: 50 }).notNull(),
    // 'in' - надходження, 'out' - списання, 'adjustment' - корекція,
    // 'return' - повернення, 'damaged' - пошкоджено, 'transfer' - переміщення

    quantity: integer("quantity").notNull(),
    quantityBefore: integer("quantity_before").notNull(),
    quantityAfter: integer("quantity_after").notNull(),

    // Cost for accounting
    unitCost: decimal("unit_cost", { precision: 12, scale: 2 }),
    totalCost: decimal("total_cost", { precision: 12, scale: 2 }),

    // Reference documents
    referenceType: varchar("reference_type", { length: 50 }), // 'purchase_order', 'sale', 'manual'
    referenceNumber: varchar("reference_number", { length: 100 }),

    reason: text("reason"),
    notes: text("notes"),

    // Who made the change
    userId: uuid("user_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    inventoryIdx: index("movements_inventory_idx").on(table.inventoryId),
    orderIdx: index("movements_order_idx").on(table.orderId),
    typeIdx: index("movements_type_idx").on(table.movementType),
    dateIdx: index("movements_date_idx").on(table.createdAt),
    referenceIdx: index("movements_reference_idx").on(table.referenceType, table.referenceNumber),
  }),
);

// ============================================================================
// STOCK ALERTS (сповіщення про залишки)
// ============================================================================

export const stockAlerts = pgTable(
  "stock_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),

    alertType: varchar("alert_type", { length: 50 }).notNull(),
    // 'low_stock', 'out_of_stock', 'overstock', 'reorder_point'

    threshold: integer("threshold"),
    currentQuantity: integer("current_quantity"),

    isResolved: boolean("is_resolved").default(false),
    resolvedAt: timestamp("resolved_at"),

    notifiedAt: timestamp("notified_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    inventoryIdx: index("alerts_inventory_idx").on(table.inventoryId),
    typeIdx: index("alerts_type_idx").on(table.alertType),
    unresolvedIdx: index("alerts_unresolved_idx")
      .on(table.isResolved)
      .where(sql`is_resolved = false`),
  }),
);

// ============================================================================
// INVENTORY TRANSFERS (переміщення між складами)
// ============================================================================

export const inventoryTransfers = pgTable(
  "inventory_transfers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(),

    fromWarehouseId: uuid("from_warehouse_id")
      .notNull()
      .references(() => vendorWarehouses.id, { onDelete: "restrict" }),
    toWarehouseId: uuid("to_warehouse_id")
      .notNull()
      .references(() => vendorWarehouses.id, { onDelete: "restrict" }),

    status: varchar("status", { length: 20 }).default("pending").notNull(),
    // 'pending', 'in_transit', 'completed', 'cancelled'

    // Who initiated
    requestedBy: uuid("requested_by").notNull(),
    approvedBy: uuid("approved_by"),

    notes: text("notes"),

    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    approvedAt: timestamp("approved_at"),
    shippedAt: timestamp("shipped_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
  },
  (table) => ({
    transferNumberIdx: uniqueIndex("transfers_number_idx").on(table.transferNumber),
    fromWarehouseIdx: index("transfers_from_warehouse_idx").on(table.fromWarehouseId),
    toWarehouseIdx: index("transfers_to_warehouse_idx").on(table.toWarehouseId),
    statusIdx: index("transfers_status_idx").on(table.status),
    dateIdx: index("transfers_date_idx").on(table.requestedAt),
  }),
);

export const inventoryTransferItems = pgTable(
  "inventory_transfer_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transferId: uuid("transfer_id")
      .notNull()
      .references(() => inventoryTransfers.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "restrict" }),

    requestedQuantity: integer("requested_quantity").notNull(),
    transferredQuantity: integer("transferred_quantity").default(0),

    notes: text("notes"),
  },
  (table) => ({
    transferIdx: index("transfer_items_transfer_idx").on(table.transferId),
    productIdx: index("transfer_items_product_idx").on(table.productId),
    variantIdx: index("transfer_items_variant_idx").on(table.variantId),
  }),
);

// ============================================================================
// INVENTORY AUDITS (інвентаризація)
// ============================================================================

export const inventoryAudits = pgTable(
  "inventory_audits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auditNumber: varchar("audit_number", { length: 50 }).notNull().unique(),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => vendorWarehouses.id, { onDelete: "restrict" }),

    status: varchar("status", { length: 20 }).default("in_progress").notNull(),
    // 'in_progress', 'completed', 'cancelled'

    auditType: varchar("audit_type", { length: 50 }).notNull(),
    // 'full', 'partial', 'cycle_count', 'spot_check'

    // Who performed audit
    performedBy: uuid("performed_by").notNull(),
    reviewedBy: uuid("reviewed_by"),

    notes: text("notes"),

    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    auditNumberIdx: uniqueIndex("audits_number_idx").on(table.auditNumber),
    warehouseIdx: index("audits_warehouse_idx").on(table.warehouseId),
    statusIdx: index("audits_status_idx").on(table.status),
    dateIdx: index("audits_date_idx").on(table.startedAt),
  }),
);

export const inventoryAuditItems = pgTable(
  "inventory_audit_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auditId: uuid("audit_id")
      .notNull()
      .references(() => inventoryAudits.id, { onDelete: "cascade" }),
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "restrict" }),

    systemQuantity: integer("system_quantity").notNull(), // Кількість в системі
    countedQuantity: integer("counted_quantity").notNull(), // Реально підраховано
    difference: integer("difference")
      .generatedAlwaysAs(sql`counted_quantity - system_quantity`)
      .notNull(),

    notes: text("notes"),

    countedAt: timestamp("counted_at").defaultNow().notNull(),
  },
  (table) => ({
    auditIdx: index("audit_items_audit_idx").on(table.auditId),
    inventoryIdx: index("audit_items_inventory_idx").on(table.inventoryId),
    discrepancyIdx: index("audit_items_discrepancy_idx")
      .on(table.auditId)
      .where(sql`difference != 0`),
  }),
);
