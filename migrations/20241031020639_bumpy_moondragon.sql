ALTER TABLE `activity` DROP FOREIGN KEY `activity_owner_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `activity` DROP FOREIGN KEY `activity_subTopic_subtopics_id_fk`;
--> statement-breakpoint
ALTER TABLE `activity` MODIFY COLUMN `session` int NOT NULL;--> statement-breakpoint
ALTER TABLE `revision` MODIFY COLUMN `subtopic` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `revision` MODIFY COLUMN `owner` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `revision` MODIFY COLUMN `session` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course` ADD CONSTRAINT `course_courseName_unique` UNIQUE(`courseName`);--> statement-breakpoint
ALTER TABLE `course` ADD `created` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_subTopic_subtopics_id_fk` FOREIGN KEY (`subTopic`) REFERENCES `subtopics`(`id`) ON DELETE restrict ON UPDATE cascade;