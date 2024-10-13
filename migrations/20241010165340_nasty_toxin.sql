ALTER TABLE `notes` MODIFY COLUMN `fileSize` int NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `userId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `lastUpdated` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;