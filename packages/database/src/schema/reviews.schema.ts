import { sql } from "drizzle-orm";
import {
  boolean,
  check,
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
import { mediaTypeEnum, reviewStatusEnum } from "./enums.js";
import { orders } from "./orders.schema.js";
import { products } from "./products.schema.js";
import { users } from "./users.schema.js";
import { vendors } from "./vendors.schema.js";

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),

    rating: smallint("rating").notNull(), // 1-5
    title: varchar("title", { length: 255 }),
    comment: text("comment"),

    // Verified purchase badge
    isVerifiedPurchase: boolean("is_verified_purchase").default(false),

    // Pros/Cons
    pros: text("pros"),
    cons: text("cons"),

    // --- 💡 Динамічні рейтинги (JSONB) ---
    // Приклад: { "battery": 5, "screen": 4 } або { "fit": "true_to_size" }
    categoryRatings: jsonb("category_ratings"),

    // --- 💡 Контекст автора (JSONB) ---
    // Приклад: { "skin_type": "oily", "age_range": "25-34" }
    authorContext: jsonb("author_context"),

    // --- 💡 Технічні дані (JSONB) ---
    // Приклад: { "ip": "1...", "user_agent": "Mozilla..." }
    metadata: jsonb("metadata"),

    // Moderation
    status: reviewStatusEnum("status").default("pending").notNull(),
    moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderated_at"),
    moderationNote: text("moderation_note"),

    // Helpfulness voting
    helpfulCount: integer("helpful_count").default(0),
    notHelpfulCount: integer("not_helpful_count").default(0),

    // Vendor reply
    vendorReply: text("vendor_reply"),
    vendorRepliedAt: timestamp("vendor_replied_at"),
    vendorRepliedBy: uuid("vendor_replied_by").references(() => users.id, { onDelete: "set null" }),

    // Admin response
    adminResponse: text("admin_response"),
    adminRespondedAt: timestamp("admin_responded_at"),

    // Flags
    flagCount: integer("flag_count").default(0),
    isFeatured: boolean("is_featured").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    productIdx: index("reviews_product_idx").on(table.productId),
    userIdx: index("reviews_user_idx").on(table.userId),
    orderIdx: index("reviews_order_idx").on(table.orderId),
    statusIdx: index("reviews_status_idx").on(table.status),
    ratingIdx: index("reviews_rating_idx").on(table.rating),
    verifiedIdx: index("reviews_verified_idx").on(table.isVerifiedPurchase),
    featuredIdx: index("reviews_featured_idx").on(table.isFeatured),

    // GIN індекс для пошуку по JSON
    ratingsJsonIdx: index("reviews_category_ratings_idx").on(table.categoryRatings),

    // Prevent duplicates
    uniqueUserProductOrder: uniqueIndex("reviews_unique_user_product_order_idx").on(
      table.userId,
      table.productId,
      table.orderId,
    ),

    // Constraints
    ratingCheck: check("review_rating_check", sql`rating >= 1 AND rating <= 5`),
  }),
);

// ============================================================================
// REVIEW MEDIA
// ============================================================================

export const reviewMedia = pgTable(
  "review_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => productReviews.id, { onDelete: "cascade" }),

    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    mimeType: varchar("mime_type", { length: 100 }),
    fileSize: integer("file_size"),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),

    // EXIF дані та інше
    metadata: jsonb("metadata"),

    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewIdx: index("review_media_review_idx").on(table.reviewId),
  }),
);

// ============================================================================
// REVIEW HELPFULNESS
// ============================================================================

export const reviewHelpfulness = pgTable(
  "review_helpfulness",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => productReviews.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    isHelpful: boolean("is_helpful").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserReview: uniqueIndex("helpfulness_unique_idx").on(table.userId, table.reviewId),
    reviewIdx: index("helpfulness_review_idx").on(table.reviewId),
  }),
);

// ============================================================================
// REVIEW FLAGS
// ============================================================================

export const reviewFlags = pgTable(
  "review_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => productReviews.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    reason: varchar("reason", { length: 50 }).notNull(),
    comment: text("comment"),
    status: varchar("status", { length: 20 }).default("pending").notNull(),

    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewIdx: index("flags_review_idx").on(table.reviewId),
    userIdx: index("flags_user_idx").on(table.userId),
    uniqueUserReview: uniqueIndex("flags_unique_idx").on(table.userId, table.reviewId),
  }),
);

// ============================================================================
// VENDOR REVIEWS
// ============================================================================

export const vendorReviews = pgTable(
  "vendor_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),

    rating: smallint("rating").notNull(),

    communicationRating: smallint("communication_rating"),
    shippingSpeedRating: smallint("shipping_speed_rating"),
    productQualityRating: smallint("product_quality_rating"),
    packagingRating: smallint("packaging_rating"),

    comment: text("comment"),
    status: reviewStatusEnum("status").default("approved").notNull(),

    vendorResponse: text("vendor_response"),
    vendorRespondedAt: timestamp("vendor_responded_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    vendorIdx: index("vendor_reviews_vendor_idx").on(table.vendorId),
    userIdx: index("vendor_reviews_user_idx").on(table.userId),
    uniqueUserVendorOrder: uniqueIndex("vendor_reviews_unique_idx").on(
      table.userId,
      table.vendorId,
      table.orderId,
    ),

    ratingCheck: check("vendor_rating_check", sql`rating >= 1 AND rating <= 5`),
  }),
);

// ============================================================================
// PRODUCT QUESTIONS (Q&A)
// ============================================================================

export const productQuestions = pgTable(
  "product_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    question: text("question").notNull(),
    status: reviewStatusEnum("status").default("pending").notNull(),

    moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderated_at"),

    upvoteCount: integer("upvote_count").default(0),
    answerCount: integer("answer_count").default(0),

    bestAnswerId: uuid("best_answer_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("questions_product_idx").on(table.productId),
    userIdx: index("questions_user_idx").on(table.userId),

    countsCheck: check("question_counts_check", sql`upvote_count >= 0 AND answer_count >= 0`),
  }),
);

// ============================================================================
// PRODUCT ANSWERS
// ============================================================================

export const productAnswers = pgTable(
  "product_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => productQuestions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    answer: text("answer").notNull(),

    isVendorAnswer: boolean("is_vendor_answer").default(false),
    isVerifiedPurchaser: boolean("is_verified_purchaser").default(false),
    isExpert: boolean("is_expert").default(false),

    status: reviewStatusEnum("status").default("approved").notNull(),

    upvoteCount: integer("upvote_count").default(0),
    downvoteCount: integer("downvote_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    questionIdx: index("answers_question_idx").on(table.questionId),
    userIdx: index("answers_user_idx").on(table.userId),

    countsCheck: check("answer_counts_check", sql`upvote_count >= 0 AND downvote_count >= 0`),
  }),
);

// ============================================================================
// VOTES
// ============================================================================

export const questionVotes = pgTable(
  "question_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => productQuestions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voteType: varchar("vote_type", { length: 10 }).notNull(), // 'upvote', 'downvote'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserQuestion: uniqueIndex("question_votes_unique_idx").on(table.userId, table.questionId),
    voteCheck: check("q_vote_check", sql`vote_type IN ('upvote', 'downvote')`),
  }),
);

export const answerVotes = pgTable(
  "answer_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    answerId: uuid("answer_id")
      .notNull()
      .references(() => productAnswers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voteType: varchar("vote_type", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserAnswer: uniqueIndex("answer_votes_unique_idx").on(table.userId, table.answerId),
    voteCheck: check("a_vote_check", sql`vote_type IN ('upvote', 'downvote')`),
  }),
);

// ============================================================================
// REVIEW REMINDERS
// ============================================================================

export const reviewReminders = pgTable(
  "review_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    reminderType: varchar("reminder_type", { length: 20 }).notNull(), // 'first', 'second', 'final'
    status: varchar("status", { length: 20 }).default("pending").notNull(),

    scheduledFor: timestamp("scheduled_for").notNull(),
    sentAt: timestamp("sent_at"),
    reviewedAt: timestamp("reviewed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderProductIdx: uniqueIndex("reminders_order_product_idx").on(
      table.orderId,
      table.productId,
      table.reminderType,
    ),
    workerIdx: index("reminders_worker_idx").on(table.scheduledFor).where(sql`status = 'pending'`),
  }),
);
