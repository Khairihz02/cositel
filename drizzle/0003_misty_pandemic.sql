CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` integer NOT NULL,
	`caption` text NOT NULL,
	`config` text NOT NULL,
	`logo_key` text,
	`preview_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD `design_id` text REFERENCES designs(id);--> statement-breakpoint
CREATE UNIQUE INDEX `order_items_design_id_unique` ON `order_items` (`design_id`);--> statement-breakpoint
ALTER TABLE `products` ADD `sku` text;--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);