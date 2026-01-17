import { sql } from "drizzle-orm";
import {
  boolean,
  check,
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
import { notificationTypeEnum } from "./enums.js";
import { users } from "./users.schema.js";

// ============================================================================
// IN-APP NOTIFICATIONS
// ============================================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: notificationTypeEnum("type").notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),

    // Related entities
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    // 'order', 'product', 'vendor', 'review', 'payment'
    relatedEntityId: uuid("related_entity_id"),

    // Action
    actionUrl: text("action_url"),
    actionText: varchar("action_text", { length: 100 }),

    // Icon & styling
    icon: varchar("icon", { length: 50 }),
    iconColor: varchar("icon_color", { length: 20 }),

    // Status
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),

    // Expiration
    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
    unreadIdx: index("notifications_unread_idx")
      .on(table.userId, table.isRead)
      .where(sql`is_read = false`),
    entityIdx: index("notifications_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    dateIdx: index("notifications_date_idx").on(table.createdAt),
  }),
);

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Channels
    emailEnabled: boolean("email_enabled").default(true),
    smsEnabled: boolean("sms_enabled").default(false),
    pushEnabled: boolean("push_enabled").default(true),
    inAppEnabled: boolean("in_app_enabled").default(true),

    // Notification types preferences
    orderUpdates: jsonb("order_updates").default(
      '{"email": true, "sms": true, "push": true, "inApp": true}',
    ),
    priceDrops: jsonb("price_drops").default(
      '{"email": true, "sms": false, "push": true, "inApp": true}',
    ),
    stockAlerts: jsonb("stock_alerts").default(
      '{"email": true, "sms": false, "push": true, "inApp": true}',
    ),
    promotions: jsonb("promotions").default(
      '{"email": true, "sms": false, "push": false, "inApp": true}',
    ),
    reviewReplies: jsonb("review_replies").default(
      '{"email": true, "sms": false, "push": true, "inApp": true}',
    ),
    vendorMessages: jsonb("vendor_messages").default(
      '{"email": true, "sms": false, "push": true, "inApp": true}',
    ),

    // Quiet hours
    quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
    quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // "22:00"
    quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // "08:00"

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: uniqueIndex("notification_preferences_user_idx").on(table.userId),
    // Validate time format (HH:MM)
    checkTimeFormat: check(
      "quiet_hours_format",
      sql`(quiet_hours_start ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$') AND (quiet_hours_end ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')`,
    ),
  }),
);

// ============================================================================
// PUSH NOTIFICATION SUBSCRIPTIONS (Web Push)
// ============================================================================

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),

    endpoint: text("endpoint").notNull(),
    keys: jsonb("keys").notNull(), // {p256dh, auth}

    // Device info
    userAgent: text("user_agent"),
    deviceType: varchar("device_type", { length: 50 }), // 'desktop', 'mobile', 'tablet'

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => ({
    userIdx: index("push_subscriptions_user_idx").on(table.userId),
    endpointIdx: uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint),
    activeIdx: index("push_subscriptions_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// EMAIL QUEUE
// ============================================================================

export const emailQueue = pgTable(
  "email_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    to: varchar("to", { length: 255 }).notNull(),
    cc: varchar("cc", { length: 500 }),
    bcc: varchar("bcc", { length: 500 }),

    fromName: varchar("from_name", { length: 200 }),
    fromEmail: varchar("from_email", { length: 255 }),
    replyTo: varchar("reply_to", { length: 255 }),

    subject: varchar("subject", { length: 500 }).notNull(),
    htmlBody: text("html_body").notNull(),
    textBody: text("text_body"),

    // Template used
    templateKey: varchar("template_key", { length: 100 }),
    templateVariables: jsonb("template_variables"),

    // Attachments
    attachments: jsonb("attachments"), // [{filename, path, contentType}]

    // Priority
    priority: integer("priority").default(5), // 1-10, higher = more important

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'sending', 'sent', 'failed', 'bounced'

    attempts: integer("attempts").default(0),
    maxAttempts: integer("max_attempts").default(3),

    errorMessage: text("error_message"),

    // Provider response
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    providerResponse: jsonb("provider_response"),

    // Tracking
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),

    // Scheduling
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    toIdx: index("email_queue_to_idx").on(table.to),
    statusIdx: index("email_queue_status_idx").on(table.status),
    scheduledIdx: index("email_queue_scheduled_idx")
      .on(table.scheduledFor)
      .where(sql`status = 'pending'`),
    priorityIdx: index("email_queue_priority_idx").on(table.priority, table.createdAt),
  }),
);

// ============================================================================
// SMS QUEUE
// ============================================================================

export const smsQueue = pgTable(
  "sms_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    message: text("message").notNull(),

    // User context
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Template
    templateKey: varchar("template_key", { length: 100 }),
    templateVariables: jsonb("template_variables"),

    // Priority
    priority: integer("priority").default(5),

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'sending', 'sent', 'failed', 'bounced'

    attempts: integer("attempts").default(0),
    maxAttempts: integer("max_attempts").default(3),

    errorMessage: text("error_message"),

    // Provider
    provider: varchar("provider", { length: 50 }), // 'turbosms', 'smsclub', 'twilio'
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    providerResponse: jsonb("provider_response"),

    // Cost tracking
    cost: varchar("cost", { length: 20 }),

    // Scheduling
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("sms_queue_phone_idx").on(table.phoneNumber),
    statusIdx: index("sms_queue_status_idx").on(table.status),
    scheduledIdx: index("sms_queue_scheduled_idx")
      .on(table.scheduledFor)
      .where(sql`status = 'pending'`),
    userIdx: index("sms_queue_user_idx").on(table.userId),
  }),
);

// ============================================================================
// EMAIL CAMPAIGNS (масові розсилки)
// ============================================================================

export const emailCampaigns = pgTable(
  "email_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Email content
    subject: jsonb("subject").notNull(),
    htmlBody: jsonb("html_body").notNull(),
    textBody: jsonb("text_body"),

    // Sender
    fromName: varchar("from_name", { length: 200 }),
    fromEmail: varchar("from_email", { length: 255 }),
    replyTo: varchar("reply_to", { length: 255 }),

    // Targeting
    targetSegments: jsonb("target_segments"), // ['b2c', 'b2b']
    targetUserIds: jsonb("target_user_ids"), // specific users
    excludeUserIds: jsonb("exclude_user_ids"),

    // Filters
    recipientFilters: jsonb("recipient_filters"),
    // {minTotalOrders: 5, lastOrderDaysAgo: 30, categories: [...]}

    // A/B testing
    abTestEnabled: boolean("ab_test_enabled").default(false),
    abTestVariants: jsonb("ab_test_variants"),

    // Status
    status: varchar("status", { length: 20 }).default("draft"),
    // 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'

    // Scheduling
    scheduledFor: timestamp("scheduled_for"),

    // Stats
    totalRecipients: integer("total_recipients").default(0),
    sentCount: integer("sent_count").default(0),
    deliveredCount: integer("delivered_count").default(0),
    openedCount: integer("opened_count").default(0),
    clickedCount: integer("clicked_count").default(0),
    bouncedCount: integer("bounced_count").default(0),
    unsubscribedCount: integer("unsubscribed_count").default(0),

    // Timing
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    sentAt: timestamp("sent_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    statusIdx: index("campaigns_status_idx").on(table.status),
    scheduledIdx: index("campaigns_scheduled_idx").on(table.scheduledFor),
    createdByIdx: index("campaigns_created_by_idx").on(table.createdBy),
  }),
);

// ============================================================================
// CAMPAIGN RECIPIENTS
// ============================================================================

export const campaignRecipients = pgTable(
  "campaign_recipients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => emailCampaigns.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    email: varchar("email", { length: 255 }).notNull(),

    // A/B test variant
    variant: varchar("variant", { length: 50 }),

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'

    // Tracking
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    bouncedAt: timestamp("bounced_at"),

    // Provider
    providerMessageId: varchar("provider_message_id", { length: 255 }),

    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    campaignIdx: index("campaign_recipients_campaign_idx").on(table.campaignId),
    emailIdx: index("campaign_recipients_email_idx").on(table.email),
    statusIdx: index("campaign_recipients_status_idx").on(table.status),
    userIdx: index("campaign_recipients_user_idx").on(table.userId),
  }),
);

// ============================================================================
// NEWSLETTER SUBSCRIBERS
// ============================================================================

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Preferences
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    language: varchar("language", { length: 2 }).default("uk"),

    // Interests
    interestedCategories: jsonb("interested_categories"),
    interestedBrands: jsonb("interested_brands"),

    // Status
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'active', 'unsubscribed', 'bounced', 'complained'

    // Confirmation
    confirmationToken: varchar("confirmation_token", { length: 100 }),
    confirmedAt: timestamp("confirmed_at"),

    // Unsubscription
    unsubscribeToken: varchar("unsubscribe_token", { length: 100 }).notNull(),
    unsubscribedAt: timestamp("unsubscribed_at"),
    unsubscribeReason: text("unsubscribe_reason"),

    // Source
    source: varchar("source", { length: 50 }), // 'website', 'popup', 'checkout', 'manual'

    // Stats
    emailsSent: integer("emails_sent").default(0),
    emailsOpened: integer("emails_opened").default(0),
    emailsClicked: integer("emails_clicked").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("newsletter_email_idx").on(table.email),
    statusIdx: index("newsletter_status_idx").on(table.status),
    userIdx: index("newsletter_user_idx").on(table.userId),
  }),
);

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const notificationTemplates = pgTable(
  "notification_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    templateKey: varchar("template_key", { length: 100 }).notNull().unique(),
    // 'order_confirmed', 'order_shipped', 'price_dropped', etc

    type: notificationTypeEnum("type").notNull(),

    // Multilingual
    title: jsonb("title").notNull(),
    message: jsonb("message").notNull(),

    // Variables
    availableVariables: jsonb("available_variables"),

    // Channels
    enableEmail: boolean("enable_email").default(true),
    enableSms: boolean("enable_sms").default(false),
    enablePush: boolean("enable_push").default(true),
    enableInApp: boolean("enable_in_app").default(true),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("notification_templates_key_idx").on(table.templateKey),
    typeIdx: index("notification_templates_type_idx").on(table.type),
  }),
);
