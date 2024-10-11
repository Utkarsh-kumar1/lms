ALTER TABLE `notes` RENAME COLUMN `lastUpdated` TO `updatedAt`;--> statement-breakpoint
ALTER TABLE `notes` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `notes` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;