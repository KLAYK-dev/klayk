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
// PAGES (статичні сторінки)
// ============================================================================

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", { length: 255 }).notNull().unique(),

    // Multilingual content
    translations: jsonb("translations").notNull(),
    // Structure: {uk: {title, content, metaTitle, metaDescription}, en: {...}, ...}

    // Page type
    pageType: varchar("page_type", { length: 50 }).default("standard"),
    // 'standard', 'landing', 'about', 'privacy', 'terms', 'faq', 'contact'

    // Template
    template: varchar("template", { length: 50 }).default("default"),

    // SEO
    metaRobots: varchar("meta_robots", { length: 50 }).default("index, follow"),
    canonicalUrl: text("canonical_url"),

    // Status
    isPublished: boolean("is_published").default(false),
    publishedAt: timestamp("published_at"),

    // Author
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),

    // Order
    sortOrder: integer("sort_order").default(0),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    slugIdx: uniqueIndex("pages_slug_idx").on(table.slug).where(sql`deleted_at IS NULL`),
    publishedIdx: index("pages_published_idx").on(table.isPublished),
    typeIdx: index("pages_type_idx").on(table.pageType),
  }),
);

// ============================================================================
// BLOG POSTS
// ============================================================================

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", { length: 255 }).notNull().unique(),

    // Multilingual content
    translations: jsonb("translations").notNull(),
    // {uk: {title, excerpt, content, metaTitle, metaDescription}, ...}

    // Featured image
    featuredImage: text("featured_image"),
    featuredImageAlt: jsonb("featured_image_alt"),

    // Author
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    // Categories
    categoryIds: jsonb("category_ids"), // array of blog category IDs

    // Tags
    tags: jsonb("tags"), // multilingual tags

    // SEO
    metaRobots: varchar("meta_robots", { length: 50 }).default("index, follow"),
    canonicalUrl: text("canonical_url"),

    // Stats
    viewCount: integer("view_count").default(0),
    likeCount: integer("like_count").default(0),
    commentCount: integer("comment_count").default(0),

    // Status
    status: varchar("status", { length: 20 }).default("draft"),
    // 'draft', 'published', 'scheduled', 'archived'

    // Publishing
    publishedAt: timestamp("published_at"),
    scheduledFor: timestamp("scheduled_for"),

    // Featured
    isFeatured: boolean("is_featured").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    slugIdx: uniqueIndex("blog_posts_slug_idx").on(table.slug).where(sql`deleted_at IS NULL`),
    authorIdx: index("blog_posts_author_idx").on(table.authorId),
    statusIdx: index("blog_posts_status_idx").on(table.status),
    publishedIdx: index("blog_posts_published_idx").on(table.publishedAt),
    featuredIdx: index("blog_posts_featured_idx").on(table.isFeatured),
    viewsIdx: index("blog_posts_views_idx").on(table.viewCount),
  }),
);

// ============================================================================
// BLOG CATEGORIES
// ============================================================================

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", { length: 255 }).notNull().unique(),

    // Multilingual
    name: jsonb("name").notNull(),
    description: jsonb("description"),

    // Hierarchy
    parentId: uuid("parent_id"),

    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("blog_categories_slug_idx").on(table.slug),
    parentIdx: index("blog_categories_parent_idx").on(table.parentId),
    activeIdx: index("blog_categories_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// BLOG COMMENTS
// ============================================================================

export const blogComments = pgTable(
  "blog_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    parentId: uuid("parent_id"), // для відповідей

    // Guest info
    guestName: varchar("guest_name", { length: 200 }),
    guestEmail: varchar("guest_email", { length: 255 }),

    comment: text("comment").notNull(),

    // Moderation
    status: varchar("status", { length: 20 }).default("pending"),
    // 'pending', 'approved', 'rejected', 'spam'

    moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderated_at"),

    // Metadata
    ipAddress: varchar("ip_address", { length: 45 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("blog_comments_post_idx").on(table.postId),
    userIdx: index("blog_comments_user_idx").on(table.userId),
    parentIdx: index("blog_comments_parent_idx").on(table.parentId),
    statusIdx: index("blog_comments_status_idx").on(table.status),
  }),
);

// ============================================================================
// BANNERS (головні банери)
// ============================================================================

export const banners = pgTable(
  "banners",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Multilingual
    title: jsonb("title"),
    subtitle: jsonb("subtitle"),
    buttonText: jsonb("button_text"),

    // Images (responsive)
    imageDesktop: text("image_desktop").notNull(),
    imageMobile: text("image_mobile"),
    imageTablet: text("image_tablet"),

    // Link
    linkUrl: text("link_url"),
    linkTarget: varchar("link_target", { length: 20 }).default("_self"),

    // Position
    position: varchar("position", { length: 50 }).default("home_main"),
    // 'home_main', 'home_secondary', 'category_top', 'sidebar'

    // Style
    backgroundColor: varchar("background_color", { length: 20 }),
    textColor: varchar("text_color", { length: 20 }),
    overlayOpacity: integer("overlay_opacity").default(0), // 0-100

    // Display settings
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),

    // Scheduling
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    // Targeting
    showToSegments: jsonb("show_to_segments"), // ['b2c', 'b2b']
    showOnPages: jsonb("show_on_pages"), // specific page URLs

    // Stats
    impressions: integer("impressions").default(0),
    clicks: integer("clicks").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    positionIdx: index("banners_position_idx").on(table.position),
    activeIdx: index("banners_active_idx").on(table.isActive),
    dateIdx: index("banners_date_idx").on(table.startDate, table.endDate),
    sortIdx: index("banners_sort_idx").on(table.sortOrder),
  }),
);

// ============================================================================
// FAQ
// ============================================================================

export const faqCategories = pgTable(
  "faq_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", { length: 255 }).notNull().unique(),

    // Multilingual
    name: jsonb("name").notNull(),
    description: jsonb("description"),

    icon: varchar("icon", { length: 100 }),

    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("faq_categories_slug_idx").on(table.slug),
    activeIdx: index("faq_categories_active_idx").on(table.isActive),
    sortIdx: index("faq_categories_sort_idx").on(table.sortOrder),
  }),
);

export const faqItems = pgTable(
  "faq_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => faqCategories.id, { onDelete: "cascade" }),

    // Multilingual
    question: jsonb("question").notNull(),
    answer: jsonb("answer").notNull(),

    // Related products/categories (optional)
    relatedProductIds: jsonb("related_product_ids"),
    relatedCategoryIds: jsonb("related_category_ids"),

    // Stats
    viewCount: integer("view_count").default(0),
    helpfulCount: integer("helpful_count").default(0),
    notHelpfulCount: integer("not_helpful_count").default(0),

    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("faq_items_category_idx").on(table.categoryId),
    activeIdx: index("faq_items_active_idx").on(table.isActive),
    sortIdx: index("faq_items_sort_idx").on(table.sortOrder),
  }),
);

// ============================================================================
// TESTIMONIALS (відгуки про сайт/сервіс)
// ============================================================================

export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Customer info
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    customerTitle: jsonb("customer_title"), // "CEO", "Manager"
    customerCompany: varchar("customer_company", { length: 200 }),
    customerPhoto: text("customer_photo"),

    // Testimonial
    content: jsonb("content").notNull(),
    rating: integer("rating"), // 1-5

    // Source
    source: varchar("source", { length: 50 }), // 'website', 'email', 'google', 'facebook'

    // Display
    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),

    // Moderation
    status: varchar("status", { length: 20 }).default("pending"),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at"),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("testimonials_active_idx").on(table.isActive),
    featuredIdx: index("testimonials_featured_idx").on(table.isFeatured),
    statusIdx: index("testimonials_status_idx").on(table.status),
  }),
);

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    templateKey: varchar("template_key", { length: 100 }).notNull().unique(),
    // 'order_confirmation', 'shipping_notification', 'password_reset', etc

    // Multilingual
    subject: jsonb("subject").notNull(),
    htmlBody: jsonb("html_body").notNull(),
    textBody: jsonb("text_body"),

    // Variables available
    availableVariables: jsonb("available_variables"),
    // [{name: 'order_number', description: 'Order number'}, ...]

    // Default from
    fromName: varchar("from_name", { length: 200 }),
    fromEmail: varchar("from_email", { length: 255 }),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("email_templates_key_idx").on(table.templateKey),
    activeIdx: index("email_templates_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// POPUPS / MODALS
// ============================================================================

export const popups = pgTable(
  "popups",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    popupType: varchar("popup_type", { length: 50 }).notNull(),
    // 'newsletter', 'discount', 'exit_intent', 'announcement', 'age_verification'

    // Multilingual content
    title: jsonb("title"),
    content: jsonb("content").notNull(),
    buttonText: jsonb("button_text"),

    // Image
    image: text("image"),

    // Action
    actionUrl: text("action_url"),

    // Display settings
    displayDelay: integer("display_delay").default(0), // seconds
    displayOnPages: jsonb("display_on_pages"), // specific URLs or 'all'
    displayFrequency: varchar("display_frequency", { length: 20 }).default("once"),
    // 'once', 'daily', 'session', 'always'

    // Targeting
    showToSegments: jsonb("show_to_segments"),
    showToNewVisitors: boolean("show_to_new_visitors").default(true),
    showToReturningVisitors: boolean("show_to_returning_visitors").default(true),

    // Exit intent specific
    exitIntentEnabled: boolean("exit_intent_enabled").default(false),

    // Stats
    impressions: integer("impressions").default(0),
    conversions: integer("conversions").default(0),

    isActive: boolean("is_active").default(true),

    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index("popups_type_idx").on(table.popupType),
    activeIdx: index("popups_active_idx").on(table.isActive),
    dateIdx: index("popups_date_idx").on(table.startDate, table.endDate),
  }),
);

// ============================================================================
// NAVIGATION MENUS
// ============================================================================

export const navigationMenus = pgTable(
  "navigation_menus",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),
    location: varchar("location", { length: 50 }).notNull(),
    // 'header', 'footer', 'mobile', 'sidebar'

    items: jsonb("items").notNull(),
    // Nested structure: [{label: {uk: '...', en: '...'}, url: '...', children: [...]}]

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    locationIdx: index("menus_location_idx").on(table.location),
    activeIdx: index("menus_active_idx").on(table.isActive),
  }),
);
