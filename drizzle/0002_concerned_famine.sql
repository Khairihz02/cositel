CREATE TABLE `custom_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`quantity` integer NOT NULL,
	`notes` text NOT NULL,
	`logo_key` text NOT NULL,
	`preview_key` text NOT NULL,
	`status` text DEFAULT 'nouveau' NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "custom_minimum" CHECK("custom_requests"."quantity" >= 100)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_requests_request_key_unique` ON `custom_requests` (`request_key`);--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;