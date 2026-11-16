CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_millimes` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text NOT NULL,
	`region` text NOT NULL,
	`address` text NOT NULL,
	`status` text DEFAULT 'nouveau' NOT NULL,
	`subtotal_millimes` integer NOT NULL,
	`shipping_millimes` integer NOT NULL,
	`total_millimes` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `orders_date_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`contents` text NOT NULL,
	`image` text NOT NULL,
	`price_millimes` integer,
	`stock` integer,
	`active` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "stock_nonnegative" CHECK("products"."stock" IS NULL OR "products"."stock" >= 0),
	CONSTRAINT "price_nonnegative" CHECK("products"."price_millimes" IS NULL OR "products"."price_millimes" >= 0)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
