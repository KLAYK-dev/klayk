import { sql } from "drizzle-orm";
import {
  boolean,
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
import { users } from "./users.schema.js";

// ============================================================================
// ADMIN ROLES & PERMISSIONS
// ============================================================================

export const adminRoles = pgTable(
  "admin_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 100 }).notNull().unique(),
    displayName: jsonb("display_name").notNull(),
    description: jsonb("description"),

    // Permissions
    permissions: jsonb("permissions").notNull(),
    // Structure: {
    //   users: {view: true, create: true, edit: true, delete: false},
    //   products: {view: true, create: false, edit: true, delete: false, approve: true},
    //   orders: {...},
    //   vendors: {...},
    //   ...
    // }

    isSystem: boolean("is_system").default(false), // Системні ролі не можна видалити

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("admin_roles_name_idx").on(table.name),
  }),
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRoles.id, { onDelete: "restrict" }),

    // Additional permissions (override role)
    additionalPermissions: jsonb("additional_permissions"),

    isActive: boolean("is_active").default(true),

    // Two-factor authentication
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    twoFactorSecret: varchar("two_factor_secret", { length: 255 }),

    lastLoginAt: timestamp("last_login_at"),
    lastLoginIp: varchar("last_login_ip", { length: 45 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: uniqueIndex("admin_users_user_idx").on(table.userId),
    roleIdx: index("admin_users_role_idx").on(table.roleId),
    activeIdx: index("admin_users_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// AUDIT LOGS (критично для безпеки)
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Who
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userEmail: varchar("user_email", { length: 255 }),
    userRole: varchar("user_role", { length: 50 }),

    // What
    action: varchar("action", { length: 100 }).notNull(),
    // 'create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'export', 'import'

    entityType: varchar("entity_type", { length: 100 }).notNull(),
    // 'user', 'product', 'order', 'vendor', 'setting', etc

    entityId: uuid("entity_id"),

    // Changes
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    changedFields: jsonb("changed_fields"), // Array of field names

    // Context
    description: text("description"),

    // Request details
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    requestUrl: text("request_url"),
    requestMethod: varchar("request_method", { length: 10 }),

    // Additional metadata
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("audit_logs_user_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    dateIdx: index("audit_logs_date_idx").on(table.createdAt),
    ipIdx: index("audit_logs_ip_idx").on(table.ipAddress),
  }),
);

// Partitioning CRITICAL for audit logs:
// CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
// FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

// ============================================================================
// MODERATION QUEUE
// ============================================================================

export const moderationQueue = pgTable(
  "moderation_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    itemType: varchar("item_type", { length: 50 }).notNull(),
    // 'product', 'review', 'vendor', 'comment', 'question', 'answer'

    itemId: uuid("item_id").notNull(),

    // Submitted by
    submittedBy: uuid("submitted_by").references(() => users.id, { onDelete: "set null" }),

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'approved', 'rejected', 'flagged', 'escalated'

    priority: varchar("priority", { length: 20 }).default("normal"),
    // 'low', 'normal', 'high', 'urgent'

    // Moderation
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
    moderationNotes: text("moderation_notes"),
    rejectionReason: text("rejection_reason"),

    // Auto-moderation
    autoModerationScore: integer("auto_moderation_score"), // 0-100
    autoModerationFlags: jsonb("auto_moderation_flags"),
    // ['profanity', 'spam', 'suspicious_content', ...]

    // Data snapshot
    itemData: jsonb("item_data").notNull(),

    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    assignedAt: timestamp("assigned_at"),
    moderatedAt: timestamp("moderated_at"),
  },
  (table) => ({
    typeIdx: index("moderation_queue_type_idx").on(table.itemType),
    statusIdx: index("moderation_queue_status_idx").on(table.status),
    priorityIdx: index("moderation_queue_priority_idx").on(table.priority, table.submittedAt),
    assignedIdx: index("moderation_queue_assigned_idx").on(table.assignedTo),
    submittedIdx: index("moderation_queue_submitted_idx").on(table.submittedBy),
  }),
);

// ============================================================================
// REPORTS (скарги користувачів)
// ============================================================================

export const userReports = pgTable(
  "user_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    reportedBy: uuid("reported_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    reportType: varchar("report_type", { length: 50 }).notNull(),
    // 'product', 'review', 'vendor', 'user', 'comment', 'listing'

    reportedItemType: varchar("reported_item_type", { length: 50 }).notNull(),
    reportedItemId: uuid("reported_item_id").notNull(),

    // Reason
    reason: varchar("reason", { length: 50 }).notNull(),
    // 'spam', 'offensive', 'fraud', 'counterfeit', 'copyright', 'inappropriate', 'other'

    description: text("description").notNull(),

    // Evidence
    attachments: jsonb("attachments"), // screenshots, URLs, etc

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'reviewing', 'resolved', 'dismissed', 'escalated'

    // Review
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewNotes: text("review_notes"),
    actionTaken: text("action_taken"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    reportedByIdx: index("reports_reported_by_idx").on(table.reportedBy),
    itemIdx: index("reports_item_idx").on(table.reportedItemType, table.reportedItemId),
    statusIdx: index("reports_status_idx").on(table.status),
    typeIdx: index("reports_type_idx").on(table.reportType),
    reviewedByIdx: index("reports_reviewed_by_idx").on(table.reviewedBy),
  }),
);

// ============================================================================
// ADMIN NOTES (внутрішні нотатки)
// ============================================================================

export const adminNotes = pgTable(
  "admin_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    note: text("note").notNull(),

    // Visibility
    isPublic: boolean("is_public").default(false), // Чи видно користувачу

    // Author
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("admin_notes_entity_idx").on(table.entityType, table.entityId),
    authorIdx: index("admin_notes_author_idx").on(table.authorId),
    publicIdx: index("admin_notes_public_idx").on(table.isPublic),
  }),
);

// ============================================================================
// SYSTEM ALERTS
// ============================================================================

export const systemAlerts = pgTable(
  "system_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    alertType: varchar("alert_type", { length: 50 }).notNull(),
    // 'security', 'performance', 'fraud', 'inventory', 'payment', 'error'

    severity: varchar("severity", { length: 20 }).notNull(),
    // 'info', 'warning', 'error', 'critical'

    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),

    // Context
    entityType: varchar("entity_type", { length: 50 }),
    entityId: uuid("entity_id"),

    // Metadata
    metadata: jsonb("metadata"),

    // Status
    status: varchar("status", { length: 20 }).default("open"),
    // 'open', 'acknowledged', 'resolved', 'dismissed'

    // Assignment
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

    // Resolution
    resolvedBy: uuid("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolutionNotes: text("resolution_notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    acknowledgedAt: timestamp("acknowledged_at"),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    typeIdx: index("system_alerts_type_idx").on(table.alertType),
    severityIdx: index("system_alerts_severity_idx").on(table.severity),
    statusIdx: index("system_alerts_status_idx").on(table.status),
    assignedIdx: index("system_alerts_assigned_idx").on(table.assignedTo),
    entityIdx: index("system_alerts_entity_idx").on(table.entityType, table.entityId),
  }),
);

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

export const scheduledTasks = pgTable(
  "scheduled_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    taskType: varchar("task_type", { length: 100 }).notNull(),
    // 'email_campaign', 'data_export', 'report_generation', 'cleanup', 'sync'

    // Schedule
    schedule: varchar("schedule", { length: 100 }), // Cron expression

    // Configuration
    config: jsonb("config").notNull(),

    // Status
    isActive: boolean("is_active").default(true),

    // Last run
    lastRunAt: timestamp("last_run_at"),
    lastRunStatus: varchar("last_run_status", { length: 20 }),
    lastRunDuration: integer("last_run_duration"), // seconds
    lastRunError: text("last_run_error"),

    // Next run
    nextRunAt: timestamp("next_run_at"),

    // Stats
    totalRuns: integer("total_runs").default(0),
    successfulRuns: integer("successful_runs").default(0),
    failedRuns: integer("failed_runs").default(0),

    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index("scheduled_tasks_type_idx").on(table.taskType),
    activeIdx: index("scheduled_tasks_active_idx").on(table.isActive),
    nextRunIdx: index("scheduled_tasks_next_run_idx")
      .on(table.nextRunAt)
      .where(sql`is_active = true`),
  }),
);

export const scheduledTaskLogs = pgTable(
  "scheduled_task_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => scheduledTasks.id, { onDelete: "cascade" }),

    status: varchar("status", { length: 20 }).notNull(),
    // 'started', 'completed', 'failed', 'cancelled'

    startedAt: timestamp("started_at").notNull(),
    completedAt: timestamp("completed_at"),

    duration: integer("duration"), // seconds

    // Results
    output: text("output"),
    error: text("error"),

    // Stats
    recordsProcessed: integer("records_processed"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index("task_logs_task_idx").on(table.taskId),
    statusIdx: index("task_logs_status_idx").on(table.status),
    dateIdx: index("task_logs_date_idx").on(table.startedAt),
  }),
);

// ============================================================================
// DATA EXPORTS
// ============================================================================

export const dataExports = pgTable(
  "data_exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    exportType: varchar("export_type", { length: 50 }).notNull(),
    // 'orders', 'products', 'users', 'analytics', 'inventory'

    format: varchar("format", { length: 20 }).notNull(),
    // 'csv', 'xlsx', 'json', 'pdf'

    // Filters
    filters: jsonb("filters"),

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'processing', 'completed', 'failed'

    // Result
    fileUrl: text("file_url"),
    fileSize: integer("file_size"), // bytes
    recordCount: integer("record_count"),

    // Error
    error: text("error"),

    // Expiration
    expiresAt: timestamp("expires_at"),

    // Requested by
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    typeIdx: index("data_exports_type_idx").on(table.exportType),
    statusIdx: index("data_exports_status_idx").on(table.status),
    requestedByIdx: index("data_exports_requested_by_idx").on(table.requestedBy),
    expiresIdx: index("data_exports_expires_idx").on(table.expiresAt),
  }),
);

// ============================================================================
// FRAUD DETECTION
// ============================================================================

export const fraudScores = pgTable(
  "fraud_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    entityType: varchar("entity_type", { length: 50 }).notNull(),
    // 'order', 'user', 'review', 'vendor'

    entityId: uuid("entity_id").notNull(),

    // Score (0-100, higher = more suspicious)
    score: integer("score").notNull(),

    // Risk level
    riskLevel: varchar("risk_level", { length: 20 }).notNull(),
    // 'low', 'medium', 'high', 'critical'

    // Detected issues
    issues: jsonb("issues").notNull(),
    // [{type: 'duplicate_account', severity: 'high', details: {...}}, ...]

    // Actions taken
    actionsRecommended: jsonb("actions_recommended"),
    actionsTaken: jsonb("actions_taken"),

    // Review
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewNotes: text("review_notes"),

    isFalsePositive: boolean("is_false_positive").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => ({
    entityIdx: index("fraud_scores_entity_idx").on(table.entityType, table.entityId),
    scoreIdx: index("fraud_scores_score_idx").on(table.score),
    riskIdx: index("fraud_scores_risk_idx").on(table.riskLevel),
    unreviewedIdx: index("fraud_scores_unreviewed_idx")
      .on(table.reviewedBy)
      .where(sql`reviewed_by IS NULL AND risk_level IN ('high', 'critical')`),
  }),
);
