ALTER TABLE `subtopics` DROP FOREIGN KEY `subtopics_topic_topics_id_fk`;
--> statement-breakpoint
ALTER TABLE `course` MODIFY COLUMN `isCompleted` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `course` MODIFY COLUMN `isCompleted` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `subtopics` MODIFY COLUMN `subTopicIndex` int NOT NULL;--> statement-breakpoint
ALTER TABLE `subtopics` MODIFY COLUMN `isCompleted` boolean;--> statement-breakpoint
ALTER TABLE `subtopics` MODIFY COLUMN `isCompleted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `course` ADD `wantRevision` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `course` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `subtopics` ADD CONSTRAINT `subtopics_topic_topics_id_fk` FOREIGN KEY (`topic`) REFERENCES `topics`(`id`) ON DELETE restrict ON UPDATE cascade;