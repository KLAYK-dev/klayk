CREATE TYPE "public"."delivery_method" AS ENUM('nova_poshta', 'nova_poshta_courier', 'ukrposhta', 'meest', 'courier', 'self_pickup');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'preparing', 'in_transit', 'arrived_at_warehouse', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'returned', 'failed');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'bundle', 'cashback', 'first_order', 'category', 'vendor', 'product', 'free_shipping', 'tiered', 'seasonal', 'flash_sale', 'loyalty_bonus');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'in_review', 'resolved', 'closed', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('uk', 'en', 'pl', 'de', 'fr', 'ro', 'ru');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_update', 'price_drop', 'stock_available', 'review_reply', 'promo', 'system', 'payment', 'delivery', 'vendor_message');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded', 'dispute');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('liqpay', 'portmone', 'monobank', 'privat24', 'pumb', 'fondy', 'wayforpay', 'cash_on_delivery', 'installment', 'credit', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'pending_review', 'active', 'inactive', 'out_of_stock', 'discontinued', 'archived');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected', 'flagged', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('sale', 'refund', 'commission', 'withdrawal', 'deposit', 'cashback', 'bonus', 'penalty');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'vendor', 'admin', 'moderator', 'support');--> statement-breakpoint
CREATE TYPE "public"."user_segment" AS ENUM('b2c', 'b2b', 'vip', 'wholesale');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."vendor_verification_level" AS ENUM('none', 'email_verified', 'phone_verified', 'document_verified', 'premium', 'enterprise');--> statement-breakpoint
CREATE TABLE "admin_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"note" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"author_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" jsonb NOT NULL,
	"description" jsonb,
	"permissions" jsonb NOT NULL,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"additional_permissions" jsonb,
	"is_active" boolean DEFAULT true,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" varchar(255),
	"last_login_at" timestamp,
	"last_login_ip" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255),
	"user_role" varchar(50),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_fields" jsonb,
	"description" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_url" text,
	"request_method" varchar(10),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"export_type" varchar(50) NOT NULL,
	"format" varchar(20) NOT NULL,
	"filters" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"file_url" text,
	"file_size" integer,
	"record_count" integer,
	"error" text,
	"expires_at" timestamp,
	"requested_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "fraud_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"risk_level" varchar(20) NOT NULL,
	"issues" jsonb NOT NULL,
	"actions_recommended" jsonb,
	"actions_taken" jsonb,
	"reviewed_by" uuid,
	"review_notes" text,
	"is_false_positive" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"item_id" uuid NOT NULL,
	"submitted_by" uuid,
	"status" varchar(20) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'normal',
	"assigned_to" uuid,
	"moderated_by" uuid,
	"moderation_notes" text,
	"rejection_reason" text,
	"auto_moderation_score" integer,
	"auto_moderation_flags" jsonb,
	"item_data" jsonb NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"assigned_at" timestamp,
	"moderated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scheduled_task_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"output" text,
	"error" text,
	"records_processed" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"task_type" varchar(100) NOT NULL,
	"schedule" varchar(100),
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"last_run_status" varchar(20),
	"last_run_duration" integer,
	"last_run_error" text,
	"next_run_at" timestamp,
	"total_runs" integer DEFAULT 0,
	"successful_runs" integer DEFAULT 0,
	"failed_runs" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'open',
	"assigned_to" uuid,
	"resolved_by" uuid,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_by" uuid NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"reported_item_type" varchar(50) NOT NULL,
	"reported_item_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"attachments" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" uuid,
	"review_notes" text,
	"action_taken" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ab_test_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"experiment_type" varchar(50) NOT NULL,
	"variants" jsonb NOT NULL,
	"target_segments" jsonb,
	"target_percentage" integer DEFAULT 100,
	"primary_metric" varchar(100) NOT NULL,
	"secondary_metrics" jsonb,
	"status" varchar(20) DEFAULT 'draft',
	"winning_variant" varchar(100),
	"confidence_level" numeric(5, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ab_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"variant_name" varchar(100) NOT NULL,
	"date" date NOT NULL,
	"total_participants" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2),
	"total_revenue" numeric(14, 2) DEFAULT '0.00',
	"average_order_value" numeric(12, 2),
	"metric_values" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"event_category" varchar(50),
	"event_action" varchar(100),
	"event_label" varchar(255),
	"event_value" integer,
	"page_url" text,
	"page_title" varchar(500),
	"referrer_url" text,
	"product_id" uuid,
	"category_id" uuid,
	"vendor_id" uuid,
	"device_type" varchar(50),
	"browser" varchar(100),
	"os" varchar(100),
	"ip_address" varchar(45),
	"country" varchar(2),
	"city" varchar(100),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"utm_term" varchar(100),
	"utm_content" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohort_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cohort_month" date NOT NULL,
	"months_since_first_order" integer NOT NULL,
	"total_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"retention_rate" numeric(5, 2),
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(14, 2) DEFAULT '0.00',
	"average_order_value" numeric(12, 2),
	"repeat_purchase_rate" numeric(5, 2),
	"average_orders_per_customer" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"total_visitors" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"total_page_views" integer DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(14, 2) DEFAULT '0.00',
	"total_items" integer DEFAULT 0,
	"average_order_value" numeric(12, 2),
	"add_to_cart_count" integer DEFAULT 0,
	"checkout_start_count" integer DEFAULT 0,
	"purchase_count" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2),
	"registration_count" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"question_count" integer DEFAULT 0,
	"traffic_sources" jsonb,
	"top_viewed_products" jsonb,
	"top_sold_products" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnel_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"stage1_visitors" integer DEFAULT 0,
	"stage2_product_views" integer DEFAULT 0,
	"stage3_add_to_cart" integer DEFAULT 0,
	"stage4_checkout_start" integer DEFAULT 0,
	"stage5_purchase" integer DEFAULT 0,
	"stage1to2_rate" numeric(5, 2),
	"stage2to3_rate" numeric(5, 2),
	"stage3to4_rate" numeric(5, 2),
	"stage4to5_rate" numeric(5, 2),
	"overall_conversion_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 0,
	"unique_views" integer DEFAULT 0,
	"add_to_cart_count" integer DEFAULT 0,
	"remove_from_cart_count" integer DEFAULT 0,
	"add_to_wishlist_count" integer DEFAULT 0,
	"order_count" integer DEFAULT 0,
	"quantity_sold" integer DEFAULT 0,
	"revenue" numeric(12, 2) DEFAULT '0.00',
	"view_to_cart_rate" numeric(5, 2),
	"cart_to_purchase_rate" numeric(5, 2),
	"reviews_received" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"stock_level" integer,
	"out_of_stock_duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" varchar(500) NOT NULL,
	"normalized_query" varchar(500) NOT NULL,
	"results_count" integer DEFAULT 0,
	"user_id" uuid,
	"session_id" varchar(255),
	"filters_applied" jsonb,
	"clicked_product_id" uuid,
	"click_position" integer,
	"led_to_order" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "top_search_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" varchar(500) NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"search_count" integer DEFAULT 0,
	"unique_searchers" integer DEFAULT 0,
	"average_results_count" integer,
	"click_through_rate" numeric(5, 2),
	"conversion_rate" numeric(5, 2),
	"has_zero_results" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(14, 2) DEFAULT '0.00',
	"total_commission" numeric(12, 2) DEFAULT '0.00',
	"total_items" integer DEFAULT 0,
	"product_views" integer DEFAULT 0,
	"products_added_to_cart" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"reviews_received" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"custom_options" jsonb,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_recovery_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"token" varchar(100) NOT NULL,
	"discount_code" varchar(50),
	"used_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_recovery_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"guest_email" varchar(255),
	"guest_phone" varchar(20),
	"promo_code" varchar(50),
	"subtotal" numeric(12, 2) DEFAULT '0.00',
	"discount_amount" numeric(12, 2) DEFAULT '0.00',
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"is_abandoned" boolean DEFAULT false,
	"abandoned_at" timestamp,
	"recovery_email_sent" boolean DEFAULT false,
	"recovery_email_sent_at" timestamp,
	"converted_to_order_id" uuid,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "gift_registries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"registry_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1000),
	"event_date" timestamp,
	"event_location" varchar(255),
	"co_owner_user_id" uuid,
	"co_owner_name" varchar(200),
	"co_owner_email" varchar(255),
	"is_public" boolean DEFAULT true,
	"share_token" varchar(100) NOT NULL,
	"shipping_address_id" uuid,
	"allow_group_gifts" boolean DEFAULT true,
	"show_purchased_items" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_registries_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "gift_registry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registry_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"requested_quantity" integer DEFAULT 1 NOT NULL,
	"purchased_quantity" integer DEFAULT 0,
	"priority" varchar(20) DEFAULT 'medium',
	"notes" varchar(500),
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_registry_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registry_item_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"buyer_user_id" uuid,
	"buyer_name" varchar(200),
	"buyer_email" varchar(255),
	"quantity" integer NOT NULL,
	"gift_message" varchar(1000),
	"is_anonymous" boolean DEFAULT false,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_comparisons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"category_id" uuid NOT NULL,
	"product_ids" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recently_viewed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"product_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_for_later" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1,
	"notes" varchar(500),
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1,
	"priority" integer DEFAULT 0,
	"notes" varchar(500),
	"price_when_added" numeric(12, 2),
	"notify_on_price_drop" boolean DEFAULT false,
	"notify_on_back_in_stock" boolean DEFAULT false,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) DEFAULT 'My Wishlist' NOT NULL,
	"description" varchar(500),
	"is_public" boolean DEFAULT false,
	"share_token" varchar(100),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"slug" varchar(255) NOT NULL,
	"icon" varchar(100),
	"image" text,
	"translations" jsonb NOT NULL,
	"meta_title" jsonb,
	"meta_description" jsonb,
	"meta_keywords" jsonb,
	"sort_order" integer DEFAULT 0,
	"level" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"show_in_menu" boolean DEFAULT true,
	"show_in_homepage" boolean DEFAULT false,
	"commission_rate" numeric(5, 2),
	"attribute_schema" jsonb,
	"required_attributes" jsonb,
	"available_filters" jsonb,
	"product_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"labels" jsonb NOT NULL,
	"type" varchar(50) NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT false,
	"is_filterable" boolean DEFAULT true,
	"is_searchable" boolean DEFAULT false,
	"show_in_listing" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"unit" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" jsonb,
	"subtitle" jsonb,
	"image_desktop" text NOT NULL,
	"image_mobile" text,
	"image_tablet" text,
	"link_url" text,
	"link_text" jsonb,
	"position" varchar(50) DEFAULT 'top',
	"background_color" varchar(20),
	"text_color" varchar(20),
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_seo_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"language" varchar(2) NOT NULL,
	"top_content" text,
	"bottom_content" text,
	"faq_items" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" jsonb,
	"subtitle" jsonb,
	"button_text" jsonb,
	"image_desktop" text NOT NULL,
	"image_mobile" text,
	"image_tablet" text,
	"link_url" text,
	"link_target" varchar(20) DEFAULT '_self',
	"position" varchar(50) DEFAULT 'home_main',
	"background_color" varchar(20),
	"text_color" varchar(20),
	"overlay_opacity" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"show_to_segments" jsonb,
	"show_on_pages" jsonb,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid,
	"parent_id" uuid,
	"guest_name" varchar(200),
	"guest_email" varchar(255),
	"comment" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"translations" jsonb NOT NULL,
	"featured_image" text,
	"featured_image_alt" jsonb,
	"author_id" uuid NOT NULL,
	"category_ids" jsonb,
	"tags" jsonb,
	"meta_robots" varchar(50) DEFAULT 'index, follow',
	"canonical_url" text,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'draft',
	"published_at" timestamp,
	"scheduled_for" timestamp,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"subject" jsonb NOT NULL,
	"html_body" jsonb NOT NULL,
	"text_body" jsonb,
	"available_variables" jsonb,
	"from_name" varchar(200),
	"from_email" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "faq_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"icon" varchar(100),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "faq_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"question" jsonb NOT NULL,
	"answer" jsonb NOT NULL,
	"related_product_ids" jsonb,
	"related_category_ids" jsonb,
	"view_count" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(50) NOT NULL,
	"items" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"translations" jsonb NOT NULL,
	"page_type" varchar(50) DEFAULT 'standard',
	"template" varchar(50) DEFAULT 'default',
	"meta_robots" varchar(50) DEFAULT 'index, follow',
	"canonical_url" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"author_id" uuid,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "popups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"popup_type" varchar(50) NOT NULL,
	"title" jsonb,
	"content" jsonb NOT NULL,
	"button_text" jsonb,
	"image" text,
	"action_url" text,
	"display_delay" integer DEFAULT 0,
	"display_on_pages" jsonb,
	"display_frequency" varchar(20) DEFAULT 'once',
	"show_to_segments" jsonb,
	"show_to_new_visitors" boolean DEFAULT true,
	"show_to_returning_visitors" boolean DEFAULT true,
	"exit_intent_enabled" boolean DEFAULT false,
	"impressions" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"customer_name" varchar(200) NOT NULL,
	"customer_title" jsonb,
	"customer_company" varchar(200),
	"customer_photo" text,
	"content" jsonb NOT NULL,
	"rating" integer,
	"source" varchar(50),
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending',
	"approved_by" uuid,
	"approved_at" timestamp,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"warehouse_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"available_quantity" integer GENERATED ALWAYS AS (quantity - reserved_quantity) STORED NOT NULL,
	"min_quantity" integer DEFAULT 0,
	"max_quantity" integer,
	"reorder_point" integer DEFAULT 0,
	"reorder_quantity" integer DEFAULT 0,
	"average_cost" numeric(12, 2),
	"last_purchase_price" numeric(12, 2),
	"last_restocked_at" timestamp,
	"last_sold_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_audit_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"system_quantity" integer NOT NULL,
	"counted_quantity" integer NOT NULL,
	"difference" integer GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED NOT NULL,
	"notes" text,
	"counted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_number" varchar(50) NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"audit_type" varchar(50) NOT NULL,
	"performed_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"notes" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "inventory_audits_audit_number_unique" UNIQUE("audit_number")
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"order_id" uuid,
	"movement_type" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"quantity_before" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"unit_cost" numeric(12, 2),
	"total_cost" numeric(12, 2),
	"reference_type" varchar(50),
	"reference_number" varchar(100),
	"reason" text,
	"notes" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	"fulfilled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventory_transfer_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"requested_quantity" integer NOT NULL,
	"transferred_quantity" integer DEFAULT 0,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "inventory_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_number" varchar(50) NOT NULL,
	"from_warehouse_id" uuid NOT NULL,
	"to_warehouse_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" uuid NOT NULL,
	"approved_by" uuid,
	"notes" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"shipped_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	CONSTRAINT "inventory_transfers_transfer_number_unique" UNIQUE("transfer_number")
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"threshold" integer,
	"current_quantity" integer,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"variant" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"provider_message_id" varchar(255),
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subject" jsonb NOT NULL,
	"html_body" jsonb NOT NULL,
	"text_body" jsonb,
	"from_name" varchar(200),
	"from_email" varchar(255),
	"reply_to" varchar(255),
	"target_segments" jsonb,
	"target_user_ids" jsonb,
	"exclude_user_ids" jsonb,
	"recipient_filters" jsonb,
	"ab_test_enabled" boolean DEFAULT false,
	"ab_test_variants" jsonb,
	"status" varchar(20) DEFAULT 'draft',
	"scheduled_for" timestamp,
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"bounced_count" integer DEFAULT 0,
	"unsubscribed_count" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to" varchar(255) NOT NULL,
	"cc" varchar(500),
	"bcc" varchar(500),
	"from_name" varchar(200),
	"from_email" varchar(255),
	"reply_to" varchar(255),
	"subject" varchar(500) NOT NULL,
	"html_body" text NOT NULL,
	"text_body" text,
	"template_key" varchar(100),
	"template_variables" jsonb,
	"attachments" jsonb,
	"priority" integer DEFAULT 5,
	"status" varchar(20) DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"error_message" text,
	"provider_message_id" varchar(255),
	"provider_response" jsonb,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_id" uuid,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"language" varchar(2) DEFAULT 'uk',
	"interested_categories" jsonb,
	"interested_brands" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"confirmation_token" varchar(100),
	"confirmed_at" timestamp,
	"unsubscribe_token" varchar(100) NOT NULL,
	"unsubscribed_at" timestamp,
	"unsubscribe_reason" text,
	"source" varchar(50),
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"emails_clicked" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_enabled" boolean DEFAULT true,
	"sms_enabled" boolean DEFAULT false,
	"push_enabled" boolean DEFAULT true,
	"in_app_enabled" boolean DEFAULT true,
	"order_updates" jsonb DEFAULT '{"email": true, "sms": true, "push": true, "inApp": true}',
	"price_drops" jsonb DEFAULT '{"email": true, "sms": false, "push": true, "inApp": true}',
	"stock_alerts" jsonb DEFAULT '{"email": true, "sms": false, "push": true, "inApp": true}',
	"promotions" jsonb DEFAULT '{"email": true, "sms": false, "push": false, "inApp": true}',
	"review_replies" jsonb DEFAULT '{"email": true, "sms": false, "push": true, "inApp": true}',
	"vendor_messages" jsonb DEFAULT '{"email": true, "sms": false, "push": true, "inApp": true}',
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" jsonb NOT NULL,
	"message" jsonb NOT NULL,
	"available_variables" jsonb,
	"enable_email" boolean DEFAULT true,
	"enable_sms" boolean DEFAULT false,
	"enable_push" boolean DEFAULT true,
	"enable_in_app" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"action_url" text,
	"action_text" varchar(100),
	"icon" varchar(50),
	"icon_color" varchar(20),
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"endpoint" text NOT NULL,
	"keys" jsonb NOT NULL,
	"user_agent" text,
	"device_type" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sms_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"user_id" uuid,
	"template_key" varchar(100),
	"template_variables" jsonb,
	"priority" integer DEFAULT 5,
	"status" varchar(20) DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"error_message" text,
	"provider" varchar(50),
	"provider_message_id" varchar(255),
	"provider_response" jsonb,
	"cost" varchar(20),
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"method" "delivery_method" NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"recipient_name" varchar(200) NOT NULL,
	"recipient_phone" varchar(20) NOT NULL,
	"country" varchar(2) DEFAULT 'UA',
	"region" varchar(100),
	"city" varchar(100) NOT NULL,
	"address" text,
	"postal_code" varchar(10),
	"warehouse_info" jsonb,
	"tracking_number" varchar(100),
	"carrier_tracking_url" text,
	"estimated_delivery_date" date,
	"actual_delivery_date" date,
	"delivery_fee" numeric(12, 2),
	"insurance_amount" numeric(12, 2),
	"declared_value" numeric(12, 2),
	"package_weight" numeric(8, 2),
	"package_dimensions" jsonb,
	"number_of_packages" smallint DEFAULT 1,
	"carrier_data" jsonb,
	"delivery_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"returned_at" timestamp,
	"failed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_dispute_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"dispute_number" varchar(50) NOT NULL,
	"dispute_type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"resolution" text,
	"resolution_type" varchar(50),
	"opened_by" uuid NOT NULL,
	"assigned_to" uuid,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"escalated_at" timestamp,
	CONSTRAINT "order_disputes_dispute_number_unique" UNIQUE("dispute_number")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"product_name" varchar(500) NOT NULL,
	"product_sku" varchar(100),
	"variant_attributes" jsonb,
	"product_image" text,
	"product_slug" varchar(255),
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0.00',
	"tax_amount" numeric(12, 2) DEFAULT '0.00',
	"discount_amount" numeric(12, 2) DEFAULT '0.00',
	"is_digital" boolean DEFAULT false,
	"digital_download_url" text,
	"digital_download_expires_at" timestamp,
	"digital_download_count" integer DEFAULT 0,
	"digital_download_limit" integer DEFAULT 3,
	"is_returnable" boolean DEFAULT true,
	"returned_quantity" integer DEFAULT 0,
	"refunded_amount" numeric(12, 2) DEFAULT '0.00',
	"warranty_months" integer,
	"warranty_expires_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'UAH',
	"transaction_id" varchar(255),
	"gateway_response" jsonb,
	"error_code" varchar(50),
	"error_message" text,
	"installment_months" smallint,
	"installment_rate" numeric(5, 2),
	"monthly_payment" numeric(12, 2),
	"installment_provider" varchar(100),
	"is_escrow" boolean DEFAULT true,
	"escrow_released_at" timestamp,
	"escrow_release_amount" numeric(12, 2),
	"escrow_hold_days" integer DEFAULT 7,
	"refundable_amount" numeric(12, 2),
	"refunded_amount" numeric(12, 2) DEFAULT '0.00',
	"payment_fee" numeric(12, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"failed_at" timestamp,
	"refunded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_refund_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refund_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"refund_amount" numeric(12, 2) NOT NULL,
	"condition" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_id" uuid,
	"refund_number" varchar(50) NOT NULL,
	"refund_type" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text NOT NULL,
	"reason_category" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" uuid NOT NULL,
	"approved_by" uuid,
	"processed_by" uuid,
	"approval_notes" text,
	"refund_method" varchar(50),
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"rejected_at" timestamp,
	CONSTRAINT "order_refunds_refund_number_unique" UNIQUE("refund_number")
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"comment" text,
	"metadata" jsonb,
	"user_id" uuid,
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"user_id" uuid,
	"vendor_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(20) NOT NULL,
	"customer_name" varchar(200),
	"subtotal" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00',
	"tax_amount" numeric(12, 2) DEFAULT '0.00',
	"delivery_fee" numeric(12, 2) DEFAULT '0.00',
	"total_amount" numeric(12, 2) NOT NULL,
	"commission_rate" numeric(5, 2),
	"commission_fixed" numeric(12, 2),
	"commission_amount" numeric(12, 2),
	"vendor_payout" numeric(12, 2),
	"promo_code" varchar(50),
	"discount_breakdown" jsonb,
	"cashback_used" numeric(12, 2) DEFAULT '0.00',
	"cashback_earned" numeric(12, 2) DEFAULT '0.00',
	"loyalty_points_used" integer DEFAULT 0,
	"loyalty_points_earned" integer DEFAULT 0,
	"customer_segment" "user_segment",
	"customer_note" text,
	"internal_note" text,
	"cancellation_reason" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"source_channel" varchar(50),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"processing_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"completed_at" timestamp,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo" text,
	"banner" text,
	"description" jsonb,
	"is_ukrainian" boolean DEFAULT false,
	"website" varchar(255),
	"meta_title" jsonb,
	"meta_description" jsonb,
	"product_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_bought_together" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"bought_with_product_id" uuid NOT NULL,
	"purchase_count" integer DEFAULT 1,
	"score" numeric(5, 4) DEFAULT '0.0000',
	"last_purchased_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_product_id" uuid NOT NULL,
	"included_product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_optional" boolean DEFAULT false,
	"discount_percentage" numeric(5, 2),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"cdn_url" text,
	"thumbnail_url" text,
	"alt_text" jsonb,
	"title" jsonb,
	"mime_type" varchar(100),
	"file_size" integer,
	"width" integer,
	"height" integer,
	"duration" integer,
	"sort_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"base_price" numeric(12, 2) NOT NULL,
	"sale_price" numeric(12, 2),
	"wholesale_price" numeric(12, 2),
	"changed_by" uuid,
	"change_reason" varchar(100),
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"related_product_id" uuid NOT NULL,
	"relation_type" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" jsonb NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(20),
	"icon" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(100),
	"attributes" jsonb NOT NULL,
	"price_modifier" numeric(12, 2) DEFAULT '0.00',
	"wholesale_price_modifier" numeric(12, 2) DEFAULT '0.00',
	"price" numeric(12, 2),
	"wholesale_price" numeric(12, 2),
	"stock_quantity" integer DEFAULT 0,
	"weight" numeric(8, 2),
	"images" jsonb,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "product_viewed_together" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"viewed_with_product_id" uuid NOT NULL,
	"view_count" integer DEFAULT 1,
	"score" numeric(5, 4) DEFAULT '0.0000',
	"last_viewed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"brand_id" uuid,
	"sku" varchar(100) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"barcode" varchar(100),
	"translations" jsonb NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"sale_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"wholesale_price" numeric(12, 2),
	"min_wholesale_quantity" integer DEFAULT 10,
	"enable_dynamic_pricing" boolean DEFAULT false,
	"dynamic_pricing_rules" jsonb,
	"track_inventory" boolean DEFAULT true,
	"stock_quantity" integer DEFAULT 0,
	"low_stock_threshold" integer DEFAULT 5,
	"allow_backorder" boolean DEFAULT false,
	"backorder_limit" integer,
	"weight" numeric(8, 2),
	"item_length" numeric(8, 2),
	"width" numeric(8, 2),
	"height" numeric(8, 2),
	"volumetric_weight" numeric(8, 2),
	"attributes" jsonb,
	"technical_specs" jsonb,
	"meta_title" jsonb,
	"meta_description" jsonb,
	"meta_keywords" jsonb,
	"canonical_url" text,
	"is_digital" boolean DEFAULT false,
	"digital_files" jsonb,
	"digital_download_limit" integer DEFAULT 3,
	"allow_preorder" boolean DEFAULT false,
	"preorder_release_date" date,
	"preorder_limit" integer,
	"free_shipping" boolean DEFAULT false,
	"shipping_class" varchar(50),
	"requires_refrigeration" boolean DEFAULT false,
	"age_restriction" smallint,
	"warranty_months" integer,
	"returnable" boolean DEFAULT true,
	"return_days" integer DEFAULT 14,
	"video_url" text,
	"video_embed_code" text,
	"view_count" integer DEFAULT 0,
	"wishlist_count" integer DEFAULT 0,
	"compare_count" integer DEFAULT 0,
	"sales_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"review_count" integer DEFAULT 0,
	"question_count" integer DEFAULT 0,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false,
	"is_new_arrival" boolean DEFAULT false,
	"is_bestseller" boolean DEFAULT false,
	"is_exclusive" boolean DEFAULT false,
	"internal_notes" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "abandoned_cart_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"name" varchar(255) NOT NULL,
	"trigger_after_minutes" integer DEFAULT 60,
	"min_cart_value" numeric(12, 2),
	"discount_type" "discount_type",
	"discount_value" numeric(12, 2),
	"email_subject" jsonb,
	"email_template" text,
	"max_uses_per_user" integer DEFAULT 3,
	"valid_for_hours" integer DEFAULT 24,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"category_id" uuid,
	"vendor_id" uuid,
	"name" jsonb,
	"tiers" jsonb NOT NULL,
	"applicable_to_segments" jsonb,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundle_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"required_products" jsonb NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"bundle_price" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cashback_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"name" jsonb NOT NULL,
	"cashback_percentage" numeric(5, 2) NOT NULL,
	"max_cashback_amount" numeric(12, 2),
	"min_order_amount" numeric(12, 2),
	"applicable_to_categories" jsonb,
	"applicable_to_products" jsonb,
	"applicable_to_segments" jsonb,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flash_sale_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flash_sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"discount_value" numeric(12, 2),
	"quantity_limit" integer,
	"quantity_limit_per_user" integer,
	"sold_count" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flash_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"name" jsonb NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" jsonb,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"max_discount_amount" numeric(12, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_quantity_limit" integer,
	"quantity_limit_per_user" integer,
	"current_sold_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"banner_image" text,
	"background_color" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "flash_sales_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "loyalty_points_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"program_id" uuid,
	"order_id" uuid,
	"transaction_type" varchar(50) NOT NULL,
	"points" integer NOT NULL,
	"points_before" integer NOT NULL,
	"points_after" integer NOT NULL,
	"description" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"points_per_currency" numeric(10, 2) DEFAULT '1.00',
	"currency_per_point" numeric(10, 4) DEFAULT '0.01',
	"min_points_for_redemption" integer DEFAULT 100,
	"max_points_per_order" integer,
	"max_points_percentage" numeric(5, 2),
	"points_expiration_days" integer,
	"tiers_enabled" boolean DEFAULT false,
	"tiers" jsonb,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_code_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"user_id" uuid,
	"order_id" uuid,
	"discount_amount" numeric(12, 2) NOT NULL,
	"order_amount" numeric(12, 2) NOT NULL,
	"ip_address" varchar(45),
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"code" varchar(50) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"max_discount_amount" numeric(12, 2),
	"min_order_amount" numeric(12, 2),
	"min_items_count" integer,
	"applicable_to_categories" jsonb,
	"applicable_to_products" jsonb,
	"applicable_to_brands" jsonb,
	"applicable_to_vendors" jsonb,
	"applicable_to_segments" jsonb,
	"specific_user_ids" jsonb,
	"is_first_order_only" boolean DEFAULT false,
	"is_new_customers_only" boolean DEFAULT false,
	"usage_limit" integer,
	"usage_limit_per_user" integer DEFAULT 1,
	"current_usage_count" integer DEFAULT 0,
	"can_stack_with_other_promos" boolean DEFAULT false,
	"can_stack_with_sales" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"description" jsonb,
	"terms" jsonb,
	"is_active" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"auto_apply" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "answer_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"answer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_vendor_answer" boolean DEFAULT false,
	"is_verified_purchaser" boolean DEFAULT false,
	"is_expert" boolean DEFAULT false,
	"status" "review_status" DEFAULT 'approved' NOT NULL,
	"upvote_count" integer DEFAULT 0,
	"downvote_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question" text NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"upvote_count" integer DEFAULT 0,
	"answer_count" integer DEFAULT 0,
	"best_answer_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"rating" smallint NOT NULL,
	"title" varchar(255),
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"pros" text,
	"cons" text,
	"quality_rating" smallint,
	"value_rating" smallint,
	"delivery_rating" smallint,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"moderation_note" text,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"vendor_reply" text,
	"vendor_replied_at" timestamp,
	"vendor_replied_by" uuid,
	"admin_response" text,
	"admin_responded_at" timestamp,
	"flag_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "question_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"comment" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_helpfulness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_helpful" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"mime_type" varchar(100),
	"file_size" integer,
	"width" integer,
	"height" integer,
	"duration" integer,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"rating" smallint NOT NULL,
	"communication_rating" smallint,
	"shipping_speed_rating" smallint,
	"product_quality_rating" smallint,
	"packaging_rating" smallint,
	"comment" text,
	"status" "review_status" DEFAULT 'approved' NOT NULL,
	"vendor_response" text,
	"vendor_responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"user_id" uuid,
	"vendor_id" uuid,
	"permissions" jsonb NOT NULL,
	"requests_per_minute" integer DEFAULT 60,
	"requests_per_day" integer DEFAULT 10000,
	"allowed_ips" jsonb,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp,
	"total_requests" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" jsonb NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"exchange_rate" numeric(12, 6) DEFAULT '1.000000',
	"decimal_places" integer DEFAULT 2,
	"thousands_separator" varchar(1) DEFAULT ',',
	"decimal_separator" varchar(1) DEFAULT '.',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false,
	"rollout_percentage" integer DEFAULT 0,
	"target_user_ids" jsonb,
	"target_segments" jsonb,
	"target_vendor_ids" jsonb,
	"environments" jsonb DEFAULT '["production"]',
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_flag_key_unique" UNIQUE("flag_key")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100) NOT NULL,
	"flag" varchar(10),
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "maintenance_mode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT false,
	"message" jsonb,
	"estimated_end_time" timestamp,
	"allowed_ips" jsonb,
	"allowed_user_ids" jsonb,
	"activated_by" uuid,
	"activated_at" timestamp,
	"deactivated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_gateways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway" varchar(50) NOT NULL,
	"display_name" jsonb NOT NULL,
	"description" jsonb,
	"logo" text,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT false,
	"is_test_mode" boolean DEFAULT true,
	"fixed_fee" numeric(12, 2) DEFAULT '0.00',
	"percentage_fee" numeric(5, 2) DEFAULT '0.00',
	"supports_installments" boolean DEFAULT false,
	"supports_recurring" boolean DEFAULT false,
	"supports_refunds" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"min_amount" numeric(12, 2),
	"max_amount" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_gateways_gateway_unique" UNIQUE("gateway")
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"method" varchar(50) NOT NULL,
	"display_name" jsonb NOT NULL,
	"description" jsonb,
	"logo" text,
	"api_config" jsonb,
	"base_cost" numeric(12, 2) DEFAULT '0.00',
	"cost_per_kg" numeric(12, 2),
	"free_shipping_threshold" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"available_countries" jsonb DEFAULT '["UA"]',
	"estimated_days_min" integer,
	"estimated_days_max" integer,
	"max_weight" numeric(8, 2),
	"max_dimensions" jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_methods_method_unique" UNIQUE("method")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar(100) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"setting_type" varchar(50) NOT NULL,
	"description" text,
	"validation_rules" jsonb,
	"is_public" boolean DEFAULT false,
	"is_editable" boolean DEFAULT true,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(2) NOT NULL,
	"region" varchar(100),
	"city" varchar(100),
	"postal_code" varchar(10),
	"rate" numeric(5, 2) NOT NULL,
	"applicable_to_products" boolean DEFAULT true,
	"applicable_to_shipping" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"http_status" integer,
	"response_body" text,
	"response_time" integer,
	"attempts" integer DEFAULT 0,
	"last_attempt_at" timestamp,
	"next_retry_at" timestamp,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"vendor_id" uuid,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"secret" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"max_retries" integer DEFAULT 3,
	"retry_delay" integer DEFAULT 60,
	"last_triggered_at" timestamp,
	"success_count" integer DEFAULT 0,
	"failure_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_id" uuid,
	"subscribe_to_newsletter" boolean DEFAULT true,
	"subscribe_to_promotions" boolean DEFAULT true,
	"subscribe_to_product_updates" boolean DEFAULT false,
	"interested_categories" jsonb,
	"is_active" boolean DEFAULT true,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid,
	"activity_type" varchar(50) NOT NULL,
	"product_id" uuid,
	"category_id" uuid,
	"vendor_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(100),
	"recipient_name" varchar(200),
	"recipient_phone" varchar(20) NOT NULL,
	"country" varchar(2) DEFAULT 'UA' NOT NULL,
	"region" varchar(100),
	"city" varchar(100) NOT NULL,
	"postal_code" varchar(10),
	"street" varchar(255),
	"building" varchar(20),
	"apartment" varchar(20),
	"floor" varchar(10),
	"entrance_code" varchar(50),
	"nova_poshta_warehouse" varchar(100),
	"nova_poshta_warehouse_ref" varchar(100),
	"ukrposhta_department" varchar(100),
	"meest_point" varchar(100),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_compare_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"device_info" jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"subscription_type" varchar(50) NOT NULL,
	"target_price" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"password_hash" varchar(255),
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'pending_verification' NOT NULL,
	"segment" "user_segment" DEFAULT 'b2c' NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"middle_name" varchar(100),
	"avatar" text,
	"date_of_birth" date,
	"gender" varchar(20),
	"preferred_language" "language" DEFAULT 'uk',
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"marketing_consent" boolean DEFAULT false,
	"diia_verified" boolean DEFAULT false,
	"diia_id" varchar(255),
	"rnokpp" varchar(10),
	"company_name" varchar(255),
	"company_edrpou" varchar(8),
	"company_vat" varchar(12),
	"loyalty_points" integer DEFAULT 0,
	"cashback_balance" numeric(12, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"total_spent" numeric(12, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendor_followers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notify_on_new_products" boolean DEFAULT true,
	"notify_on_sales" boolean DEFAULT true,
	"followed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"transaction_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"payout_method" varchar(50) NOT NULL,
	"payout_details" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendor_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"permissions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"period_date" timestamp NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0.00',
	"total_commission" numeric(12, 2) DEFAULT '0.00',
	"total_products" integer DEFAULT 0,
	"active_products" integer DEFAULT 0,
	"out_of_stock_products" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"average_order_value" numeric(12, 2),
	"conversion_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"order_id" uuid,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"balance_before" numeric(12, 2) NOT NULL,
	"balance_after" numeric(12, 2) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"withdrawal_method" varchar(50),
	"withdrawal_details" jsonb,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"country" varchar(2) DEFAULT 'UA',
	"city" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"postal_code" varchar(10),
	"phone" varchar(20),
	"working_hours" jsonb,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"allow_self_pickup" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo" text,
	"banner" text,
	"edrpou" varchar(8),
	"iban" varchar(29),
	"tax_number" varchar(12),
	"registration_certificate" text,
	"verification_level" "vendor_verification_level" DEFAULT 'none' NOT NULL,
	"verified_at" timestamp,
	"verification_documents" jsonb,
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"support_email" varchar(255),
	"support_phone" varchar(20),
	"facebook_url" varchar(255),
	"instagram_url" varchar(255),
	"telegram_url" varchar(255),
	"tiktok_url" varchar(255),
	"youtube_url" varchar(255),
	"country" varchar(2) DEFAULT 'UA',
	"city" varchar(100),
	"address" text,
	"is_ukrainian_brand" boolean DEFAULT false,
	"return_policy" text,
	"warranty_policy" text,
	"shipping_policy" text,
	"privacy_policy" text,
	"commission_rate" numeric(5, 2) DEFAULT '15.00',
	"commission_fixed" numeric(12, 2) DEFAULT '0.00',
	"commission_min_amount" numeric(12, 2) DEFAULT '0.00',
	"wallet_balance" numeric(12, 2) DEFAULT '0.00',
	"pending_balance" numeric(12, 2) DEFAULT '0.00',
	"total_earnings" numeric(14, 2) DEFAULT '0.00',
	"rating" numeric(3, 2) DEFAULT '0.00',
	"review_count" integer DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"total_revenue" numeric(14, 2) DEFAULT '0.00',
	"response_time" integer DEFAULT 0,
	"fulfillment_rate" numeric(5, 2) DEFAULT '100.00',
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_premium" boolean DEFAULT false,
	"auto_approve_products" boolean DEFAULT false,
	"min_order_amount" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "vendors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_exports" ADD CONSTRAINT "data_exports_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_scores" ADD CONSTRAINT "fraud_scores_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_task_logs" ADD CONSTRAINT "scheduled_task_logs_task_id_scheduled_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."scheduled_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ADD CONSTRAINT "scheduled_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ab_test_experiments" ADD CONSTRAINT "ab_test_experiments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ab_test_results" ADD CONSTRAINT "ab_test_results_experiment_id_ab_test_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."ab_test_experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_daily_stats" ADD CONSTRAINT "vendor_daily_stats_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_recovery_tokens" ADD CONSTRAINT "cart_recovery_tokens_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registries" ADD CONSTRAINT "gift_registries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registries" ADD CONSTRAINT "gift_registries_co_owner_user_id_users_id_fk" FOREIGN KEY ("co_owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_registry_id_gift_registries_id_fk" FOREIGN KEY ("registry_id") REFERENCES "public"."gift_registries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registry_items" ADD CONSTRAINT "gift_registry_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registry_purchases" ADD CONSTRAINT "gift_registry_purchases_registry_item_id_gift_registry_items_id_fk" FOREIGN KEY ("registry_item_id") REFERENCES "public"."gift_registry_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registry_purchases" ADD CONSTRAINT "gift_registry_purchases_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_comparisons" ADD CONSTRAINT "product_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_for_later" ADD CONSTRAINT "saved_for_later_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_for_later" ADD CONSTRAINT "saved_for_later_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_for_later" ADD CONSTRAINT "saved_for_later_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_banners" ADD CONSTRAINT "category_banners_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_seo_content" ADD CONSTRAINT "category_seo_content_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_category_id_faq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."faq_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_warehouse_id_vendor_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."vendor_warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_audit_id_inventory_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."inventory_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audits" ADD CONSTRAINT "inventory_audits_warehouse_id_vendor_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."vendor_warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_transfer_id_inventory_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."inventory_transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_from_warehouse_id_vendor_warehouses_id_fk" FOREIGN KEY ("from_warehouse_id") REFERENCES "public"."vendor_warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_to_warehouse_id_vendor_warehouses_id_fk" FOREIGN KEY ("to_warehouse_id") REFERENCES "public"."vendor_warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_queue" ADD CONSTRAINT "sms_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_deliveries" ADD CONSTRAINT "order_deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_dispute_messages" ADD CONSTRAINT "order_dispute_messages_dispute_id_order_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."order_disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_disputes" ADD CONSTRAINT "order_disputes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_refund_items" ADD CONSTRAINT "order_refund_items_refund_id_order_refunds_id_fk" FOREIGN KEY ("refund_id") REFERENCES "public"."order_refunds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_refund_items" ADD CONSTRAINT "order_refund_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_refunds" ADD CONSTRAINT "order_refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_refunds" ADD CONSTRAINT "order_refunds_payment_id_order_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."order_payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bought_together" ADD CONSTRAINT "product_bought_together_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bought_together" ADD CONSTRAINT "product_bought_together_bought_with_product_id_products_id_fk" FOREIGN KEY ("bought_with_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_bundle_product_id_products_id_fk" FOREIGN KEY ("bundle_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_included_product_id_products_id_fk" FOREIGN KEY ("included_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_assignments" ADD CONSTRAINT "product_tag_assignments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_assignments" ADD CONSTRAINT "product_tag_assignments_tag_id_product_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."product_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_viewed_together" ADD CONSTRAINT "product_viewed_together_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_viewed_together" ADD CONSTRAINT "product_viewed_together_viewed_with_product_id_products_id_fk" FOREIGN KEY ("viewed_with_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abandoned_cart_campaigns" ADD CONSTRAINT "abandoned_cart_campaigns_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_discounts" ADD CONSTRAINT "bulk_discounts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_discounts" ADD CONSTRAINT "bulk_discounts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_discounts" ADD CONSTRAINT "bulk_discounts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_discounts" ADD CONSTRAINT "bundle_discounts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashback_rules" ADD CONSTRAINT "cashback_rules_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sale_products" ADD CONSTRAINT "flash_sale_products_flash_sale_id_flash_sales_id_fk" FOREIGN KEY ("flash_sale_id") REFERENCES "public"."flash_sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sale_products" ADD CONSTRAINT "flash_sale_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points_transactions" ADD CONSTRAINT "loyalty_points_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points_transactions" ADD CONSTRAINT "loyalty_points_transactions_program_id_loyalty_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points_transactions" ADD CONSTRAINT "loyalty_points_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_answer_id_product_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."product_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_answers" ADD CONSTRAINT "product_answers_question_id_product_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."product_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_answers" ADD CONSTRAINT "product_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_question_id_product_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."product_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_review_id_product_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."product_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_review_id_product_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."product_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_media" ADD CONSTRAINT "review_media_review_id_product_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."product_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reminders" ADD CONSTRAINT "review_reminders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reminders" ADD CONSTRAINT "review_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reminders" ADD CONSTRAINT "review_reminders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_mode" ADD CONSTRAINT "maintenance_mode_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_compare_list" ADD CONSTRAINT "user_compare_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wishlist" ADD CONSTRAINT "user_wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_followers" ADD CONSTRAINT "vendor_followers_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_followers" ADD CONSTRAINT "vendor_followers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payout_requests" ADD CONSTRAINT "vendor_payout_requests_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payout_requests" ADD CONSTRAINT "vendor_payout_requests_transaction_id_vendor_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."vendor_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_staff" ADD CONSTRAINT "vendor_staff_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_staff" ADD CONSTRAINT "vendor_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_statistics" ADD CONSTRAINT "vendor_statistics_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_warehouses" ADD CONSTRAINT "vendor_warehouses_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_notes_entity_idx" ON "admin_notes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "admin_notes_author_idx" ON "admin_notes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "admin_notes_public_idx" ON "admin_notes" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "admin_roles_name_idx" ON "admin_roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_user_idx" ON "admin_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_users_role_idx" ON "admin_users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "admin_users_active_idx" ON "admin_users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_date_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_ip_idx" ON "audit_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "data_exports_type_idx" ON "data_exports" USING btree ("export_type");--> statement-breakpoint
CREATE INDEX "data_exports_status_idx" ON "data_exports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "data_exports_requested_by_idx" ON "data_exports" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "data_exports_expires_idx" ON "data_exports" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "fraud_scores_entity_idx" ON "fraud_scores" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "fraud_scores_score_idx" ON "fraud_scores" USING btree ("score");--> statement-breakpoint
CREATE INDEX "fraud_scores_risk_idx" ON "fraud_scores" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "fraud_scores_unreviewed_idx" ON "fraud_scores" USING btree ("reviewed_by") WHERE reviewed_by IS NULL AND risk_level IN ('high', 'critical');--> statement-breakpoint
CREATE INDEX "moderation_queue_type_idx" ON "moderation_queue" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "moderation_queue_status_idx" ON "moderation_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "moderation_queue_priority_idx" ON "moderation_queue" USING btree ("priority","submitted_at");--> statement-breakpoint
CREATE INDEX "moderation_queue_assigned_idx" ON "moderation_queue" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "moderation_queue_submitted_idx" ON "moderation_queue" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "task_logs_task_idx" ON "scheduled_task_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_logs_status_idx" ON "scheduled_task_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_logs_date_idx" ON "scheduled_task_logs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "scheduled_tasks_type_idx" ON "scheduled_tasks" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "scheduled_tasks_active_idx" ON "scheduled_tasks" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "scheduled_tasks_next_run_idx" ON "scheduled_tasks" USING btree ("next_run_at") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX "system_alerts_type_idx" ON "system_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "system_alerts_status_idx" ON "system_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "system_alerts_assigned_idx" ON "system_alerts" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "system_alerts_entity_idx" ON "system_alerts" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "reports_reported_by_idx" ON "user_reports" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "reports_item_idx" ON "user_reports" USING btree ("reported_item_type","reported_item_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "user_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_type_idx" ON "user_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "reports_reviewed_by_idx" ON "user_reports" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "ab_tests_name_idx" ON "ab_test_experiments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ab_tests_status_idx" ON "ab_test_experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ab_tests_type_idx" ON "ab_test_experiments" USING btree ("experiment_type");--> statement-breakpoint
CREATE INDEX "ab_results_experiment_variant_idx" ON "ab_test_results" USING btree ("experiment_id","variant_name");--> statement-breakpoint
CREATE INDEX "ab_results_date_idx" ON "ab_test_results" USING btree ("date");--> statement-breakpoint
CREATE INDEX "analytics_events_session_idx" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "analytics_events_user_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analytics_events_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_product_idx" ON "analytics_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "analytics_events_date_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_utm_source_idx" ON "analytics_events" USING btree ("utm_source");--> statement-breakpoint
CREATE INDEX "cohort_analysis_cohort_idx" ON "cohort_analysis" USING btree ("cohort_month","months_since_first_order");--> statement-breakpoint
CREATE INDEX "daily_stats_date_idx" ON "daily_statistics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "funnel_analytics_date_idx" ON "funnel_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "product_stats_product_date_idx" ON "product_daily_stats" USING btree ("product_id","date");--> statement-breakpoint
CREATE INDEX "product_stats_date_idx" ON "product_daily_stats" USING btree ("date");--> statement-breakpoint
CREATE INDEX "search_analytics_query_idx" ON "search_analytics" USING btree ("normalized_query");--> statement-breakpoint
CREATE INDEX "search_analytics_user_idx" ON "search_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_analytics_date_idx" ON "search_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "search_analytics_clicked_product_idx" ON "search_analytics" USING btree ("clicked_product_id");--> statement-breakpoint
CREATE INDEX "top_queries_query_period_idx" ON "top_search_queries" USING btree ("query","period_type","period_start");--> statement-breakpoint
CREATE INDEX "top_queries_period_idx" ON "top_search_queries" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "top_queries_zero_results_idx" ON "top_search_queries" USING btree ("has_zero_results") WHERE has_zero_results = true;--> statement-breakpoint
CREATE INDEX "vendor_stats_vendor_date_idx" ON "vendor_daily_stats" USING btree ("vendor_id","date");--> statement-breakpoint
CREATE INDEX "vendor_stats_date_idx" ON "vendor_daily_stats" USING btree ("date");--> statement-breakpoint
CREATE INDEX "cart_items_cart_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_idx" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "cart_items_variant_idx" ON "cart_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_idx" ON "cart_items" USING btree ("cart_id","product_id","variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_tokens_token_idx" ON "cart_recovery_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "recovery_tokens_cart_idx" ON "cart_recovery_tokens" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "recovery_tokens_expires_idx" ON "cart_recovery_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "carts_user_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "carts_session_idx" ON "carts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "carts_email_idx" ON "carts" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "carts_abandoned_idx" ON "carts" USING btree ("is_abandoned","abandoned_at") WHERE is_abandoned = true AND recovery_email_sent = false;--> statement-breakpoint
CREATE INDEX "carts_expires_idx" ON "carts" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "registries_user_idx" ON "gift_registries" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registries_share_token_idx" ON "gift_registries" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "registries_event_date_idx" ON "gift_registries" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "registries_public_idx" ON "gift_registries" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "registry_items_registry_idx" ON "gift_registry_items" USING btree ("registry_id");--> statement-breakpoint
CREATE INDEX "registry_items_product_idx" ON "gift_registry_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registry_items_unique_idx" ON "gift_registry_items" USING btree ("registry_id","product_id","variant_id");--> statement-breakpoint
CREATE INDEX "registry_purchases_item_idx" ON "gift_registry_purchases" USING btree ("registry_item_id");--> statement-breakpoint
CREATE INDEX "registry_purchases_order_idx" ON "gift_registry_purchases" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "registry_purchases_buyer_idx" ON "gift_registry_purchases" USING btree ("buyer_user_id");--> statement-breakpoint
CREATE INDEX "comparisons_user_idx" ON "product_comparisons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comparisons_session_idx" ON "product_comparisons" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "comparisons_category_idx" ON "product_comparisons" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "recently_viewed_user_product_idx" ON "recently_viewed" USING btree ("user_id","viewed_at");--> statement-breakpoint
CREATE INDEX "recently_viewed_session_product_idx" ON "recently_viewed" USING btree ("session_id","viewed_at");--> statement-breakpoint
CREATE INDEX "recently_viewed_product_idx" ON "recently_viewed" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "recently_viewed_date_idx" ON "recently_viewed" USING btree ("viewed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_for_later_unique_idx" ON "saved_for_later" USING btree ("user_id","product_id","variant_id");--> statement-breakpoint
CREATE INDEX "saved_for_later_user_idx" ON "saved_for_later" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_for_later_product_idx" ON "saved_for_later" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_wishlist_idx" ON "wishlist_items" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_product_idx" ON "wishlist_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_items_unique_idx" ON "wishlist_items" USING btree ("wishlist_id","product_id","variant_id");--> statement-breakpoint
CREATE INDEX "wishlists_user_idx" ON "wishlists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_share_token_idx" ON "wishlists" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "wishlists_public_idx" ON "wishlists" USING btree ("is_public");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_featured_idx" ON "categories" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "categories_sort_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_level_idx" ON "categories" USING btree ("level");--> statement-breakpoint
CREATE INDEX "categories_menu_idx" ON "categories" USING btree ("show_in_menu");--> statement-breakpoint
CREATE UNIQUE INDEX "category_attributes_category_key_idx" ON "category_attributes" USING btree ("category_id","key");--> statement-breakpoint
CREATE INDEX "category_attributes_category_idx" ON "category_attributes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_attributes_filterable_idx" ON "category_attributes" USING btree ("is_filterable");--> statement-breakpoint
CREATE INDEX "category_banners_category_idx" ON "category_banners" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_banners_active_idx" ON "category_banners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "category_banners_position_idx" ON "category_banners" USING btree ("position");--> statement-breakpoint
CREATE INDEX "category_banners_date_idx" ON "category_banners" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "seo_content_category_language_idx" ON "category_seo_content" USING btree ("category_id","language");--> statement-breakpoint
CREATE INDEX "seo_content_category_idx" ON "category_seo_content" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "banners_position_idx" ON "banners" USING btree ("position");--> statement-breakpoint
CREATE INDEX "banners_active_idx" ON "banners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "banners_date_idx" ON "banners" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "banners_sort_idx" ON "banners" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_categories_parent_idx" ON "blog_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "blog_categories_active_idx" ON "blog_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "blog_comments_post_idx" ON "blog_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "blog_comments_user_idx" ON "blog_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blog_comments_parent_idx" ON "blog_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "blog_comments_status_idx" ON "blog_comments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "blog_posts_author_idx" ON "blog_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_posts_published_idx" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "blog_posts_views_idx" ON "blog_posts" USING btree ("view_count");--> statement-breakpoint
CREATE UNIQUE INDEX "email_templates_key_idx" ON "email_templates" USING btree ("template_key");--> statement-breakpoint
CREATE INDEX "email_templates_active_idx" ON "email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "faq_categories_slug_idx" ON "faq_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "faq_categories_active_idx" ON "faq_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "faq_categories_sort_idx" ON "faq_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "faq_items_category_idx" ON "faq_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "faq_items_active_idx" ON "faq_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "faq_items_sort_idx" ON "faq_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "menus_location_idx" ON "navigation_menus" USING btree ("location");--> statement-breakpoint
CREATE INDEX "menus_active_idx" ON "navigation_menus" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "pages_published_idx" ON "pages" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "pages_type_idx" ON "pages" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX "popups_type_idx" ON "popups" USING btree ("popup_type");--> statement-breakpoint
CREATE INDEX "popups_active_idx" ON "popups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "popups_date_idx" ON "popups" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "testimonials_active_idx" ON "testimonials" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "testimonials_featured_idx" ON "testimonials" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "testimonials_status_idx" ON "testimonials" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_product_warehouse_idx" ON "inventory" USING btree ("product_id","warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_variant_warehouse_idx" ON "inventory" USING btree ("variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "inventory_warehouse_idx" ON "inventory" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "inventory_low_stock_idx" ON "inventory" USING btree ("warehouse_id") WHERE available_quantity <= reorder_point AND available_quantity > 0;--> statement-breakpoint
CREATE INDEX "inventory_out_of_stock_idx" ON "inventory" USING btree ("warehouse_id") WHERE available_quantity = 0;--> statement-breakpoint
CREATE INDEX "audit_items_audit_idx" ON "inventory_audit_items" USING btree ("audit_id");--> statement-breakpoint
CREATE INDEX "audit_items_inventory_idx" ON "inventory_audit_items" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "audit_items_discrepancy_idx" ON "inventory_audit_items" USING btree ("audit_id") WHERE difference != 0;--> statement-breakpoint
CREATE UNIQUE INDEX "audits_number_idx" ON "inventory_audits" USING btree ("audit_number");--> statement-breakpoint
CREATE INDEX "audits_warehouse_idx" ON "inventory_audits" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "audits_status_idx" ON "inventory_audits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audits_date_idx" ON "inventory_audits" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "movements_inventory_idx" ON "inventory_movements" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "movements_order_idx" ON "inventory_movements" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "movements_type_idx" ON "inventory_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "movements_date_idx" ON "inventory_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "movements_reference_idx" ON "inventory_movements" USING btree ("reference_type","reference_number");--> statement-breakpoint
CREATE INDEX "reservations_order_idx" ON "inventory_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "reservations_inventory_idx" ON "inventory_reservations" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "inventory_reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reservations_expires_idx" ON "inventory_reservations" USING btree ("expires_at") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "transfer_items_transfer_idx" ON "inventory_transfer_items" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "transfer_items_product_idx" ON "inventory_transfer_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "transfer_items_variant_idx" ON "inventory_transfer_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transfers_number_idx" ON "inventory_transfers" USING btree ("transfer_number");--> statement-breakpoint
CREATE INDEX "transfers_from_warehouse_idx" ON "inventory_transfers" USING btree ("from_warehouse_id");--> statement-breakpoint
CREATE INDEX "transfers_to_warehouse_idx" ON "inventory_transfers" USING btree ("to_warehouse_id");--> statement-breakpoint
CREATE INDEX "transfers_status_idx" ON "inventory_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transfers_date_idx" ON "inventory_transfers" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "alerts_inventory_idx" ON "stock_alerts" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "alerts_type_idx" ON "stock_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "alerts_unresolved_idx" ON "stock_alerts" USING btree ("is_resolved") WHERE is_resolved = false;--> statement-breakpoint
CREATE INDEX "campaign_recipients_campaign_idx" ON "campaign_recipients" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_recipients_email_idx" ON "campaign_recipients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "campaign_recipients_status_idx" ON "campaign_recipients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_recipients_user_idx" ON "campaign_recipients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "email_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_scheduled_idx" ON "email_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "campaigns_created_by_idx" ON "email_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "email_queue_to_idx" ON "email_queue" USING btree ("to");--> statement-breakpoint
CREATE INDEX "email_queue_status_idx" ON "email_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_queue_scheduled_idx" ON "email_queue" USING btree ("scheduled_for") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "email_queue_priority_idx" ON "email_queue" USING btree ("priority","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_status_idx" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_user_idx" ON "newsletter_subscribers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_preferences_user_idx" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_templates_key_idx" ON "notification_templates" USING btree ("template_key");--> statement-breakpoint
CREATE INDEX "notification_templates_type_idx" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" USING btree ("user_id","is_read") WHERE is_read = false;--> statement-breakpoint
CREATE INDEX "notifications_entity_idx" ON "notifications" USING btree ("related_entity_type","related_entity_id");--> statement-breakpoint
CREATE INDEX "notifications_date_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_active_idx" ON "push_subscriptions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sms_queue_phone_idx" ON "sms_queue" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "sms_queue_status_idx" ON "sms_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_queue_scheduled_idx" ON "sms_queue" USING btree ("scheduled_for") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "sms_queue_user_idx" ON "sms_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deliveries_order_idx" ON "order_deliveries" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "deliveries_status_idx" ON "order_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deliveries_method_idx" ON "order_deliveries" USING btree ("method");--> statement-breakpoint
CREATE INDEX "deliveries_tracking_idx" ON "order_deliveries" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "deliveries_city_idx" ON "order_deliveries" USING btree ("city");--> statement-breakpoint
CREATE INDEX "deliveries_estimated_date_idx" ON "order_deliveries" USING btree ("estimated_delivery_date");--> statement-breakpoint
CREATE INDEX "dispute_messages_dispute_idx" ON "order_dispute_messages" USING btree ("dispute_id");--> statement-breakpoint
CREATE INDEX "dispute_messages_sender_idx" ON "order_dispute_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "dispute_messages_date_idx" ON "order_dispute_messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "disputes_number_idx" ON "order_disputes" USING btree ("dispute_number");--> statement-breakpoint
CREATE INDEX "disputes_order_idx" ON "order_disputes" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "order_disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "disputes_assigned_idx" ON "order_disputes" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "disputes_date_idx" ON "order_disputes" USING btree ("opened_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "order_items_digital_idx" ON "order_items" USING btree ("is_digital");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "order_payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "order_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "order_payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_transaction_idx" ON "order_payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_escrow_idx" ON "order_payments" USING btree ("is_escrow","escrow_released_at") WHERE is_escrow = true AND escrow_released_at IS NULL;--> statement-breakpoint
CREATE INDEX "refund_items_refund_idx" ON "order_refund_items" USING btree ("refund_id");--> statement-breakpoint
CREATE INDEX "refund_items_order_item_idx" ON "order_refund_items" USING btree ("order_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_number_idx" ON "order_refunds" USING btree ("refund_number");--> statement-breakpoint
CREATE INDEX "refunds_order_idx" ON "order_refunds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "refunds_payment_idx" ON "order_refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "refunds_status_idx" ON "order_refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "refunds_date_idx" ON "order_refunds" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "status_history_order_idx" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "status_history_status_idx" ON "order_status_history" USING btree ("to_status");--> statement-breakpoint
CREATE INDEX "status_history_date_idx" ON "order_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_vendor_idx" ON "orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("customer_phone");--> statement-breakpoint
CREATE INDEX "orders_promo_code_idx" ON "orders" USING btree ("promo_code");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "brands_ukrainian_idx" ON "brands" USING btree ("is_ukrainian");--> statement-breakpoint
CREATE INDEX "brands_active_idx" ON "brands" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "brands_featured_idx" ON "brands" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "bought_together_product_idx" ON "product_bought_together" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "bought_together_score_idx" ON "product_bought_together" USING btree ("product_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "bought_together_unique_idx" ON "product_bought_together" USING btree ("product_id","bought_with_product_id");--> statement-breakpoint
CREATE INDEX "bundles_bundle_idx" ON "product_bundles" USING btree ("bundle_product_id");--> statement-breakpoint
CREATE INDEX "bundles_included_idx" ON "product_bundles" USING btree ("included_product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bundles_unique_idx" ON "product_bundles" USING btree ("bundle_product_id","included_product_id");--> statement-breakpoint
CREATE INDEX "media_product_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "media_variant_idx" ON "product_media" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "product_media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_primary_idx" ON "product_media" USING btree ("product_id","is_primary");--> statement-breakpoint
CREATE INDEX "price_history_product_idx" ON "product_price_history" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "price_history_variant_idx" ON "product_price_history" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "price_history_date_idx" ON "product_price_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "relations_product_idx" ON "product_relations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "relations_related_idx" ON "product_relations" USING btree ("related_product_id");--> statement-breakpoint
CREATE INDEX "relations_type_idx" ON "product_relations" USING btree ("relation_type");--> statement-breakpoint
CREATE UNIQUE INDEX "relations_unique_idx" ON "product_relations" USING btree ("product_id","related_product_id","relation_type");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_assignments_unique_idx" ON "product_tag_assignments" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE INDEX "tag_assignments_product_idx" ON "product_tag_assignments" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tag_assignments_tag_idx" ON "product_tag_assignments" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "product_tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_active_idx" ON "product_tags" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "variants_barcode_idx" ON "product_variants" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "variants_active_idx" ON "product_variants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "variants_default_idx" ON "product_variants" USING btree ("product_id","is_default");--> statement-breakpoint
CREATE INDEX "variants_stock_idx" ON "product_variants" USING btree ("stock_quantity");--> statement-breakpoint
CREATE INDEX "viewed_together_product_idx" ON "product_viewed_together" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "viewed_together_score_idx" ON "product_viewed_together" USING btree ("product_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "viewed_together_unique_idx" ON "product_viewed_together" USING btree ("product_id","viewed_with_product_id");--> statement-breakpoint
CREATE INDEX "products_vendor_idx" ON "products" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("vendor_id","sku") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "products_barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("status","category_id") WHERE status = 'active' AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "products_search_idx" ON "products" USING gin (search_vector);--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("base_price");--> statement-breakpoint
CREATE INDEX "products_sale_price_idx" ON "products" USING btree ("sale_price");--> statement-breakpoint
CREATE INDEX "products_rating_idx" ON "products" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "products_views_idx" ON "products" USING btree ("view_count");--> statement-breakpoint
CREATE INDEX "products_sales_idx" ON "products" USING btree ("sales_count");--> statement-breakpoint
CREATE INDEX "products_stock_idx" ON "products" USING btree ("stock_quantity");--> statement-breakpoint
CREATE INDEX "products_attributes_idx" ON "products" USING gin ("attributes");--> statement-breakpoint
CREATE INDEX "abandoned_cart_campaigns_vendor_idx" ON "abandoned_cart_campaigns" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "abandoned_cart_campaigns_active_idx" ON "abandoned_cart_campaigns" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "bulk_discounts_product_idx" ON "bulk_discounts" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "bulk_discounts_category_idx" ON "bulk_discounts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "bulk_discounts_vendor_idx" ON "bulk_discounts" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "bulk_discounts_active_idx" ON "bulk_discounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "bundle_discounts_vendor_idx" ON "bundle_discounts" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "bundle_discounts_active_idx" ON "bundle_discounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "bundle_discounts_date_idx" ON "bundle_discounts" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "cashback_rules_vendor_idx" ON "cashback_rules" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "cashback_rules_active_idx" ON "cashback_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cashback_rules_date_idx" ON "cashback_rules" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "flash_sale_products_unique_idx" ON "flash_sale_products" USING btree ("flash_sale_id","product_id");--> statement-breakpoint
CREATE INDEX "flash_sale_products_sale_idx" ON "flash_sale_products" USING btree ("flash_sale_id");--> statement-breakpoint
CREATE INDEX "flash_sale_products_product_idx" ON "flash_sale_products" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flash_sales_slug_idx" ON "flash_sales" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "flash_sales_vendor_idx" ON "flash_sales" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "flash_sales_active_idx" ON "flash_sales" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "flash_sales_date_idx" ON "flash_sales" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_user_idx" ON "loyalty_points_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_program_idx" ON "loyalty_points_transactions" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_order_idx" ON "loyalty_points_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_points_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_date_idx" ON "loyalty_points_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "loyalty_programs_vendor_idx" ON "loyalty_programs" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "loyalty_programs_active_idx" ON "loyalty_programs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "usage_promo_code_idx" ON "promo_code_usage" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "usage_user_idx" ON "promo_code_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_order_idx" ON "promo_code_usage" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "usage_date_idx" ON "promo_code_usage" USING btree ("used_at");--> statement-breakpoint
CREATE UNIQUE INDEX "promo_codes_code_idx" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promo_codes_vendor_idx" ON "promo_codes" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "promo_codes_active_idx" ON "promo_codes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "promo_codes_date_idx" ON "promo_codes" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "promo_codes_public_idx" ON "promo_codes" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "promo_codes_featured_idx" ON "promo_codes" USING btree ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "answer_votes_unique_idx" ON "answer_votes" USING btree ("user_id","answer_id");--> statement-breakpoint
CREATE INDEX "answer_votes_answer_idx" ON "answer_votes" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "answers_question_idx" ON "product_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "answers_user_idx" ON "product_answers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "answers_status_idx" ON "product_answers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "answers_vendor_idx" ON "product_answers" USING btree ("is_vendor_answer");--> statement-breakpoint
CREATE INDEX "answers_upvote_idx" ON "product_answers" USING btree ("upvote_count");--> statement-breakpoint
CREATE INDEX "questions_product_idx" ON "product_questions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "questions_user_idx" ON "product_questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "questions_status_idx" ON "product_questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_upvote_idx" ON "product_questions" USING btree ("upvote_count");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "product_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "product_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_order_idx" ON "product_reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "product_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "product_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_verified_idx" ON "product_reviews" USING btree ("is_verified_purchase");--> statement-breakpoint
CREATE INDEX "reviews_featured_idx" ON "product_reviews" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "reviews_helpful_idx" ON "product_reviews" USING btree ("helpful_count");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_unique_user_product_order_idx" ON "product_reviews" USING btree ("user_id","product_id","order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_votes_unique_idx" ON "question_votes" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "question_votes_question_idx" ON "question_votes" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "flags_review_idx" ON "review_flags" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "flags_user_idx" ON "review_flags" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flags_status_idx" ON "review_flags" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "flags_unique_idx" ON "review_flags" USING btree ("user_id","review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "helpfulness_unique_idx" ON "review_helpfulness" USING btree ("user_id","review_id");--> statement-breakpoint
CREATE INDEX "helpfulness_review_idx" ON "review_helpfulness" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_media_review_idx" ON "review_media" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_media_type_idx" ON "review_media" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "reminders_order_product_idx" ON "review_reminders" USING btree ("order_id","product_id","reminder_type");--> statement-breakpoint
CREATE INDEX "reminders_status_idx" ON "review_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminders_scheduled_idx" ON "review_reminders" USING btree ("scheduled_for") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "vendor_reviews_vendor_idx" ON "vendor_reviews" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_reviews_user_idx" ON "vendor_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vendor_reviews_order_idx" ON "vendor_reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "vendor_reviews_status_idx" ON "vendor_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendor_reviews_rating_idx" ON "vendor_reviews" USING btree ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_reviews_unique_idx" ON "vendor_reviews" USING btree ("user_id","vendor_id","order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_user_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_vendor_idx" ON "api_keys" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_code_idx" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "currencies_active_idx" ON "currencies" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flags_key_idx" ON "feature_flags" USING btree ("flag_key");--> statement-breakpoint
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags" USING btree ("is_enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_code_idx" ON "languages" USING btree ("code");--> statement-breakpoint
CREATE INDEX "languages_active_idx" ON "languages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "languages_sort_idx" ON "languages" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "maintenance_mode_active_idx" ON "maintenance_mode" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_gateways_gateway_idx" ON "payment_gateways" USING btree ("gateway");--> statement-breakpoint
CREATE INDEX "payment_gateways_active_idx" ON "payment_gateways" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payment_gateways_sort_idx" ON "payment_gateways" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_methods_method_idx" ON "shipping_methods" USING btree ("method");--> statement-breakpoint
CREATE INDEX "shipping_methods_active_idx" ON "shipping_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "shipping_methods_sort_idx" ON "shipping_methods" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "system_settings_type_idx" ON "system_settings" USING btree ("setting_type");--> statement-breakpoint
CREATE INDEX "tax_rates_country_idx" ON "tax_rates" USING btree ("country");--> statement-breakpoint
CREATE INDEX "tax_rates_active_idx" ON "tax_rates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tax_rates_priority_idx" ON "tax_rates" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_webhook_idx" ON "webhook_deliveries" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_retry_idx" ON "webhook_deliveries" USING btree ("next_retry_at") WHERE status = 'retrying';--> statement-breakpoint
CREATE INDEX "webhooks_user_idx" ON "webhooks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhooks_vendor_idx" ON "webhooks" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "webhooks_active_idx" ON "webhooks" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "email_subscriptions_email_idx" ON "email_subscriptions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_subscriptions_user_idx" ON "email_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_subscriptions_active_idx" ON "email_subscriptions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "activity_user_idx" ON "user_activity_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_product_idx" ON "user_activity_log" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "activity_category_idx" ON "user_activity_log" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "user_activity_log" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "activity_date_idx" ON "user_activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "addresses_city_idx" ON "user_addresses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "addresses_default_idx" ON "user_addresses" USING btree ("user_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "compare_user_product_idx" ON "user_compare_list" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "compare_user_category_idx" ON "user_compare_list" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "user_notifications_user_idx" ON "user_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notifications_unread_idx" ON "user_notifications" USING btree ("user_id","is_read") WHERE is_read = false;--> statement-breakpoint
CREATE INDEX "user_notifications_type_idx" ON "user_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_notifications_date_idx" ON "user_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "user_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_product_idx" ON "user_subscriptions" USING btree ("user_id","product_id","subscription_type");--> statement-breakpoint
CREATE INDEX "subscriptions_product_idx" ON "user_subscriptions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "subscriptions_active_idx" ON "user_subscriptions" USING btree ("is_active","subscription_type");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_user_product_idx" ON "user_wishlist" USING btree ("user_id","product_id","variant_id");--> statement-breakpoint
CREATE INDEX "wishlist_user_idx" ON "user_wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_product_idx" ON "user_wishlist" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_segment_idx" ON "users" USING btree ("segment");--> statement-breakpoint
CREATE INDEX "users_diia_idx" ON "users" USING btree ("diia_id");--> statement-breakpoint
CREATE INDEX "users_loyalty_idx" ON "users" USING btree ("loyalty_points");--> statement-breakpoint
CREATE INDEX "users_edrpou_idx" ON "users" USING btree ("company_edrpou");--> statement-breakpoint
CREATE UNIQUE INDEX "followers_vendor_user_idx" ON "vendor_followers" USING btree ("vendor_id","user_id");--> statement-breakpoint
CREATE INDEX "followers_vendor_idx" ON "vendor_followers" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "followers_user_idx" ON "vendor_followers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payout_requests_vendor_idx" ON "vendor_payout_requests" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "payout_requests_status_idx" ON "vendor_payout_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payout_requests_date_idx" ON "vendor_payout_requests" USING btree ("requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_vendor_user_idx" ON "vendor_staff" USING btree ("vendor_id","user_id");--> statement-breakpoint
CREATE INDEX "staff_vendor_idx" ON "vendor_staff" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "staff_user_idx" ON "vendor_staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_active_idx" ON "vendor_staff" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "statistics_vendor_period_idx" ON "vendor_statistics" USING btree ("vendor_id","period_date","period_type");--> statement-breakpoint
CREATE INDEX "statistics_vendor_idx" ON "vendor_statistics" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "statistics_date_idx" ON "vendor_statistics" USING btree ("period_date");--> statement-breakpoint
CREATE INDEX "transactions_vendor_idx" ON "vendor_transactions" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "transactions_order_idx" ON "vendor_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "vendor_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "vendor_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "warehouses_vendor_idx" ON "vendor_warehouses" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "warehouses_city_idx" ON "vendor_warehouses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "warehouses_active_idx" ON "vendor_warehouses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "warehouses_default_idx" ON "vendor_warehouses" USING btree ("vendor_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_slug_idx" ON "vendors" USING btree ("slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "vendors_user_idx" ON "vendors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vendors_ukrainian_idx" ON "vendors" USING btree ("is_ukrainian_brand");--> statement-breakpoint
CREATE INDEX "vendors_active_idx" ON "vendors" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "vendors_rating_idx" ON "vendors" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "vendors_featured_idx" ON "vendors" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "vendors_premium_idx" ON "vendors" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "vendors_edrpou_idx" ON "vendors" USING btree ("edrpou");