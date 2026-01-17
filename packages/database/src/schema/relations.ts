import { relations } from "drizzle-orm";
import {
  adminNotes,
  adminRoles,
  adminUsers,
  auditLogs,
  dataExports,
  fraudScores,
  moderationQueue,
  scheduledTaskLogs,
  scheduledTasks,
  systemAlerts,
  userReports,
} from "./admin.schema.js";
import {
  abTestExperiments,
  abTestResults,
  analyticsEvents,
  productDailyStats,
  searchAnalytics,
  vendorDailyStats,
} from "./analytics.schema.js";
import { cartItems, carts, wishlistItems, wishlists } from "./cart.schema.js";
import {
  categories,
  categoryAttributes,
  categoryBanners,
  categorySeoContent,
} from "./categories.schema.js";
import {
  blogCategories,
  blogComments,
  blogPosts,
  faqCategories,
  faqItems,
  pages,
  testimonials,
} from "./content.schema.js";
import { inventory, inventoryMovements, inventoryReservations } from "./inventory.schema.js";
import { campaignRecipients, emailCampaigns, notifications } from "./notifications.schema.js";
import {
  orderDeliveries,
  orderDisputeMessages,
  orderDisputes,
  orderItems,
  orderPayments,
  orderRefundItems,
  orderRefunds,
  orderStatusHistory,
  orders,
} from "./orders.schema.js";
import {
  brands,
  productBoughtTogether,
  productBundles,
  productMedia,
  productPriceHistory,
  productRelations,
  products,
  productTagAssignments,
  productTags,
  productVariants,
  productViewedTogether,
} from "./products.schema.js";
import {
  abandonedCartCampaigns,
  bulkDiscounts,
  bundleDiscounts,
  cashbackRules,
  flashSaleProducts,
  flashSales,
  loyaltyPointsTransactions,
  loyaltyPrograms,
  promoCodes,
  promoCodeUsage,
} from "./promotions.schema.js";
import {
  answerVotes,
  productAnswers,
  productQuestions,
  productReviews,
  questionVotes,
  reviewFlags,
  reviewHelpfulness,
  reviewMedia,
  vendorReviews,
} from "./reviews.schema.js";
import {
  apiKeys,
  featureFlags,
  maintenanceMode,
  systemSettings,
  webhookDeliveries,
  webhooks,
} from "./settings.schema.js";

import {
  emailSubscriptions,
  userActivityLog,
  userAddresses,
  userCompareList,
  userNotifications,
  userSessions,
  userSubscriptions,
  users,
  userWishlist,
} from "./users.schema.js";
import {
  vendorCategoryCommissions,
  vendorFollowers,
  vendorPayoutRequests,
  vendorStaff,
  vendorStatistics,
  vendors,
  vendorTransactions,
  vendorWarehouses,
} from "./vendors.schema.js";

// ============================================================================
// 👤 USER RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(userSessions),
  addresses: many(userAddresses),
  activityLogs: many(userActivityLog),
  subscriptions: many(userSubscriptions),
  emailSubscription: one(emailSubscriptions, {
    fields: [users.email],
    references: [emailSubscriptions.email],
  }),
  notifications: many(userNotifications),
  wishlists: many(wishlists),
  wishlistItems: many(userWishlist),
  compareList: many(userCompareList),
  carts: many(carts),
  orders: many(orders),
  reviews: many(productReviews),
  questions: many(productQuestions),
  answers: many(productAnswers),
  loyaltyTransactions: many(loyaltyPointsTransactions),

  // Якщо юзер є вендором
  vendor: one(vendors, {
    fields: [users.id],
    references: [vendors.userId],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
}));

export const userActivityLogRelations = relations(userActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLog.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userActivityLog.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// 🏢 VENDOR RELATIONS
// ============================================================================

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  owner: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  warehouses: many(vendorWarehouses),
  products: many(products),
  orders: many(orders),
  transactions: many(vendorTransactions),
  payoutRequests: many(vendorPayoutRequests),
  staff: many(vendorStaff),
  followers: many(vendorFollowers),
  reviews: many(vendorReviews),
  promotions: many(promoCodes),
  loyaltyPrograms: many(loyaltyPrograms),
  statistics: many(vendorStatistics),
  categoryCommissions: many(vendorCategoryCommissions),
}));

export const vendorStaffRelations = relations(vendorStaff, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorStaff.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [vendorStaff.userId],
    references: [users.id],
  }),
  invitedByUser: one(users, {
    fields: [vendorStaff.invitedBy],
    references: [users.id],
  }),
}));

export const vendorWarehousesRelations = relations(vendorWarehouses, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendorWarehouses.vendorId],
    references: [vendors.id],
  }),
  inventory: many(inventory),
}));

export const vendorTransactionsRelations = relations(vendorTransactions, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorTransactions.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorPayoutRequestsRelations = relations(vendorPayoutRequests, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorPayoutRequests.vendorId],
    references: [vendors.id],
  }),
  transaction: one(vendorTransactions, {
    fields: [vendorPayoutRequests.transactionId],
    references: [vendorTransactions.id],
  }),
  processedByUser: one(users, {
    fields: [vendorPayoutRequests.processedBy],
    references: [users.id],
  }),
}));

export const vendorFollowersRelations = relations(vendorFollowers, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorFollowers.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [vendorFollowers.userId],
    references: [users.id],
  }),
}));

export const vendorStatisticsRelations = relations(vendorStatistics, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorStatistics.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorCategoryCommissionsRelations = relations(
  vendorCategoryCommissions,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [vendorCategoryCommissions.vendorId],
      references: [vendors.id],
    }),
  }),
);

// ============================================================================
// 📂 CATEGORY RELATIONS
// ============================================================================

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent_child",
  }),
  children: many(categories, {
    relationName: "parent_child",
  }),
  products: many(products),
  attributes: many(categoryAttributes),
  banners: many(categoryBanners),
  seoContent: many(categorySeoContent),
  bulkDiscounts: many(bulkDiscounts),
}));

export const categoryAttributesRelations = relations(categoryAttributes, ({ one }) => ({
  category: one(categories, {
    fields: [categoryAttributes.categoryId],
    references: [categories.id],
  }),
}));

export const categoryBannersRelations = relations(categoryBanners, ({ one }) => ({
  category: one(categories, {
    fields: [categoryBanners.categoryId],
    references: [categories.id],
  }),
}));

export const categorySeoContentRelations = relations(categorySeoContent, ({ one }) => ({
  category: one(categories, {
    fields: [categorySeoContent.categoryId],
    references: [categories.id],
  }),
}));

// ============================================================================
// 🛍️ PRODUCT RELATIONS
// ============================================================================

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  variants: many(productVariants),
  media: many(productMedia),
  reviews: many(productReviews),
  questions: many(productQuestions),
  priceHistory: many(productPriceHistory),
  inventory: many(inventory),
  tagAssignments: many(productTagAssignments),
  relatedProducts: many(productRelations, { relationName: "sourceProduct" }),
  viewedTogether: many(productViewedTogether, { relationName: "viewedSource" }),
  boughtTogether: many(productBoughtTogether, { relationName: "boughtSource" }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  inventory: many(inventory),
  media: many(productMedia),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productMedia.variantId],
    references: [productVariants.id],
  }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productTagAssignmentsRelations = relations(productTagAssignments, ({ one }) => ({
  product: one(products, {
    fields: [productTagAssignments.productId],
    references: [products.id],
  }),
  tag: one(productTags, {
    fields: [productTagAssignments.tagId],
    references: [productTags.id],
  }),
}));

export const productTagsRelations = relations(productTags, ({ many }) => ({
  products: many(productTagAssignments),
}));

export const productBundlesRelations = relations(productBundles, ({ one }) => ({
  bundleProduct: one(products, {
    fields: [productBundles.bundleProductId],
    references: [products.id],
    relationName: "bundleParent",
  }),
  includedProduct: one(products, {
    fields: [productBundles.includedProductId],
    references: [products.id],
    relationName: "bundleChild",
  }),
}));

// ============================================================================
// 📦 INVENTORY RELATIONS
// ============================================================================

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
  warehouse: one(vendorWarehouses, {
    fields: [inventory.warehouseId],
    references: [vendorWarehouses.id],
  }),
  reservations: many(inventoryReservations),
  movements: many(inventoryMovements),
}));

// ============================================================================
// 🚚 ORDER RELATIONS
// ============================================================================

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id],
  }),
  items: many(orderItems),
  deliveries: many(orderDeliveries),
  payments: many(orderPayments),
  statusHistory: many(orderStatusHistory),
  refunds: many(orderRefunds),
  disputes: many(orderDisputes),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderDeliveriesRelations = relations(orderDeliveries, ({ one }) => ({
  order: one(orders, {
    fields: [orderDeliveries.orderId],
    references: [orders.id],
  }),
}));

export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, {
    fields: [orderPayments.orderId],
    references: [orders.id],
  }),
}));

export const orderRefundsRelations = relations(orderRefunds, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderRefunds.orderId],
    references: [orders.id],
  }),
  payment: one(orderPayments, {
    fields: [orderRefunds.paymentId],
    references: [orderPayments.id],
  }),
  items: many(orderRefundItems),
}));

export const orderDisputesRelations = relations(orderDisputes, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderDisputes.orderId],
    references: [orders.id],
  }),
  messages: many(orderDisputeMessages),
}));

// ============================================================================
// 🛒 CART & WISHLIST RELATIONS
// ============================================================================

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// ⭐ REVIEWS RELATIONS
// ============================================================================

export const productReviewsRelations = relations(productReviews, ({ one, many }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [productReviews.orderId],
    references: [orders.id],
  }),
  media: many(reviewMedia),
  flags: many(reviewFlags),
  votes: many(reviewHelpfulness),
}));

export const reviewMediaRelations = relations(reviewMedia, ({ one }) => ({
  review: one(productReviews, {
    fields: [reviewMedia.reviewId],
    references: [productReviews.id],
  }),
}));

export const vendorReviewsRelations = relations(vendorReviews, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorReviews.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [vendorReviews.userId],
    references: [users.id],
  }),
}));

export const productQuestionsRelations = relations(productQuestions, ({ one, many }) => ({
  product: one(products, {
    fields: [productQuestions.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productQuestions.userId],
    references: [users.id],
  }),
  answers: many(productAnswers),
  bestAnswer: one(productAnswers, {
    fields: [productQuestions.bestAnswerId],
    references: [productAnswers.id],
  }),
}));

export const productAnswersRelations = relations(productAnswers, ({ one, many }) => ({
  question: one(productQuestions, {
    fields: [productAnswers.questionId],
    references: [productQuestions.id],
  }),
  user: one(users, {
    fields: [productAnswers.userId],
    references: [users.id],
  }),
  votes: many(answerVotes),
}));

export const questionVotesRelations = relations(questionVotes, ({ one }) => ({
  question: one(productQuestions, {
    fields: [questionVotes.questionId],
    references: [productQuestions.id],
  }),
  user: one(users, {
    fields: [questionVotes.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 🏷️ PROMOTION & LOYALTY RELATIONS
// ============================================================================

export const promoCodesRelations = relations(promoCodes, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [promoCodes.vendorId],
    references: [vendors.id],
  }),
  usages: many(promoCodeUsage),
}));

export const promoCodeUsageRelations = relations(promoCodeUsage, ({ one }) => ({
  promoCode: one(promoCodes, {
    fields: [promoCodeUsage.promoCodeId],
    references: [promoCodes.id],
  }),
  user: one(users, {
    fields: [promoCodeUsage.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [promoCodeUsage.orderId],
    references: [orders.id],
  }),
}));

export const flashSalesRelations = relations(flashSales, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [flashSales.vendorId],
    references: [vendors.id],
  }),
  products: many(flashSaleProducts),
}));

export const flashSaleProductsRelations = relations(flashSaleProducts, ({ one }) => ({
  flashSale: one(flashSales, {
    fields: [flashSaleProducts.flashSaleId],
    references: [flashSales.id],
  }),
  product: one(products, {
    fields: [flashSaleProducts.productId],
    references: [products.id],
  }),
}));

export const cashbackRulesRelations = relations(cashbackRules, ({ one }) => ({
  vendor: one(vendors, {
    fields: [cashbackRules.vendorId],
    references: [vendors.id],
  }),
}));

export const loyaltyProgramsRelations = relations(loyaltyPrograms, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [loyaltyPrograms.vendorId],
    references: [vendors.id],
  }),
  transactions: many(loyaltyPointsTransactions),
}));

export const loyaltyPointsTransactionsRelations = relations(
  loyaltyPointsTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [loyaltyPointsTransactions.userId],
      references: [users.id],
    }),
    program: one(loyaltyPrograms, {
      fields: [loyaltyPointsTransactions.programId],
      references: [loyaltyPrograms.id],
    }),
    order: one(orders, {
      fields: [loyaltyPointsTransactions.orderId],
      references: [orders.id],
    }),
  }),
);

export const bulkDiscountsRelations = relations(bulkDiscounts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [bulkDiscounts.vendorId],
    references: [vendors.id],
  }),
  product: one(products, {
    fields: [bulkDiscounts.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [bulkDiscounts.categoryId],
    references: [categories.id],
  }),
}));

export const bundleDiscountsRelations = relations(bundleDiscounts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [bundleDiscounts.vendorId],
    references: [vendors.id],
  }),
}));

export const abandonedCartCampaignsRelations = relations(abandonedCartCampaigns, ({ one }) => ({
  vendor: one(vendors, {
    fields: [abandonedCartCampaigns.vendorId],
    references: [vendors.id],
  }),
}));

// ============================================================================
// 🔔 NOTIFICATION & MARKETING RELATIONS
// ============================================================================

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id],
  }),
  recipients: many(campaignRecipients),
}));

export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [campaignRecipients.campaignId],
    references: [emailCampaigns.id],
  }),
  user: one(users, {
    fields: [campaignRecipients.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 📝 CONTENT RELATIONS
// ============================================================================

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  comments: many(blogComments),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ one, many }) => ({
  parent: one(blogCategories, {
    fields: [blogCategories.parentId],
    references: [blogCategories.id],
    relationName: "parent_child_category",
  }),
  children: many(blogCategories, {
    relationName: "parent_child_category",
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
    relationName: "comment_thread",
  }),
  replies: many(blogComments, {
    relationName: "comment_thread",
  }),
  moderator: one(users, {
    fields: [blogComments.moderatedBy],
    references: [users.id],
  }),
}));

export const faqItemsRelations = relations(faqItems, ({ one }) => ({
  category: one(faqCategories, {
    fields: [faqItems.categoryId],
    references: [faqCategories.id],
  }),
}));

export const faqCategoriesRelations = relations(faqCategories, ({ many }) => ({
  items: many(faqItems),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [testimonials.approvedBy],
    references: [users.id],
  }),
}));

// ============================================================================
// 📊 ANALYTICS RELATIONS
// ============================================================================

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [analyticsEvents.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [analyticsEvents.categoryId],
    references: [categories.id],
  }),
  vendor: one(vendors, {
    fields: [analyticsEvents.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorDailyStatsRelations = relations(vendorDailyStats, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorDailyStats.vendorId],
    references: [vendors.id],
  }),
}));

export const productDailyStatsRelations = relations(productDailyStats, ({ one }) => ({
  product: one(products, {
    fields: [productDailyStats.productId],
    references: [products.id],
  }),
}));

export const searchAnalyticsRelations = relations(searchAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [searchAnalytics.userId],
    references: [users.id],
  }),
  clickedProduct: one(products, {
    fields: [searchAnalytics.clickedProductId],
    references: [products.id],
  }),
}));

export const abTestExperimentsRelations = relations(abTestExperiments, ({ one, many }) => ({
  creator: one(users, {
    fields: [abTestExperiments.createdBy],
    references: [users.id],
  }),
  results: many(abTestResults),
}));

export const abTestResultsRelations = relations(abTestResults, ({ one }) => ({
  experiment: one(abTestExperiments, {
    fields: [abTestResults.experimentId],
    references: [abTestExperiments.id],
  }),
}));

// ============================================================================
// 👑 ADMIN RELATIONS
// ============================================================================

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
  }),
  role: one(adminRoles, {
    fields: [adminUsers.roleId],
    references: [adminRoles.id],
  }),
}));

export const adminRolesRelations = relations(adminRoles, ({ many }) => ({
  adminUsers: many(adminUsers),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  submittedByUser: one(users, {
    fields: [moderationQueue.submittedBy],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [moderationQueue.assignedTo],
    references: [users.id],
  }),
  moderatedByUser: one(users, {
    fields: [moderationQueue.moderatedBy],
    references: [users.id],
  }),
}));

export const userReportsRelations = relations(userReports, ({ one }) => ({
  reporter: one(users, {
    fields: [userReports.reportedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [userReports.reviewedBy],
    references: [users.id],
  }),
}));

export const adminNotesRelations = relations(adminNotes, ({ one }) => ({
  author: one(users, {
    fields: [adminNotes.authorId],
    references: [users.id],
  }),
}));

export const systemAlertsRelations = relations(systemAlerts, ({ one }) => ({
  assignedToUser: one(users, {
    fields: [systemAlerts.assignedTo],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [systemAlerts.resolvedBy],
    references: [users.id],
  }),
}));

export const scheduledTasksRelations = relations(scheduledTasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [scheduledTasks.createdBy],
    references: [users.id],
  }),
  logs: many(scheduledTaskLogs),
}));

export const scheduledTaskLogsRelations = relations(scheduledTaskLogs, ({ one }) => ({
  task: one(scheduledTasks, {
    fields: [scheduledTaskLogs.taskId],
    references: [scheduledTasks.id],
  }),
}));

export const dataExportsRelations = relations(dataExports, ({ one }) => ({
  requester: one(users, {
    fields: [dataExports.requestedBy],
    references: [users.id],
  }),
}));

export const fraudScoresRelations = relations(fraudScores, ({ one }) => ({
  reviewer: one(users, {
    fields: [fraudScores.reviewedBy],
    references: [users.id],
  }),
}));

// ============================================================================
// ⚙️ SYSTEM & WEBHOOK RELATIONS
// ============================================================================

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [apiKeys.vendorId],
    references: [vendors.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [webhooks.vendorId],
    references: [vendors.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id],
  }),
}));

export const featureFlagsRelations = relations(featureFlags, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [featureFlags.updatedBy],
    references: [users.id],
  }),
}));

export const maintenanceModeRelations = relations(maintenanceMode, ({ one }) => ({
  activatedByUser: one(users, {
    fields: [maintenanceMode.activatedBy],
    references: [users.id],
  }),
}));
