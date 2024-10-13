ALTER TABLE `topics` MODIFY COLUMN `isCompleted` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` MODIFY COLUMN `isCompleted` boolean NOT NULL DEFAULT false;