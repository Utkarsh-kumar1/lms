ALTER TABLE `topics` MODIFY COLUMN `course` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` MODIFY COLUMN `isCompleted` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` MODIFY COLUMN `topicIndex` int NOT NULL;