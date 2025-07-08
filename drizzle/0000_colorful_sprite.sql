CREATE TABLE `animation_frames` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`drawing_id` integer NOT NULL,
	`frame_number` integer NOT NULL,
	`grid_data` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`drawing_id`) REFERENCES `drawings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `drawings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`grid_data` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
