ALTER TABLE `activity` DROP FOREIGN KEY `FK_activity_subtopics`;
--> statement-breakpoint
ALTER TABLE `activity` DROP FOREIGN KEY `FK_activity_users`;
--> statement-breakpoint
ALTER TABLE `course` DROP FOREIGN KEY `FK_course_subject`;
--> statement-breakpoint
ALTER TABLE `dailyActivitiesScheduled` DROP FOREIGN KEY `FK_dailyActivitiesScheduled_users`;
--> statement-breakpoint
ALTER TABLE `revision` DROP FOREIGN KEY `FK_revision_subtopics`;
--> statement-breakpoint
ALTER TABLE `revision` DROP FOREIGN KEY `FK_revision_users`;
--> statement-breakpoint
ALTER TABLE `subject` DROP FOREIGN KEY `FK_subject_users`;
--> statement-breakpoint
ALTER TABLE `subtopics` DROP FOREIGN KEY `FK_subtopics_topics`;
--> statement-breakpoint
ALTER TABLE `topics` DROP FOREIGN KEY `FK_topics_course`;
--> statement-breakpoint
ALTER TABLE `activity` MODIFY COLUMN `start` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `dailyActivitiesScheduled` MODIFY COLUMN `startDate` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `eventLogs` MODIFY COLUMN `start` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `revision` MODIFY COLUMN `start` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `created` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `spaceRepetition` json;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isVerified` boolean;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `activity` ADD CONSTRAINT `activity_subTopic_subtopics_id_fk` FOREIGN KEY (`subTopic`) REFERENCES `subtopics`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `course` ADD CONSTRAINT `course_subject_subject_id_fk` FOREIGN KEY (`subject`) REFERENCES `subject`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `dailyActivitiesScheduled` ADD CONSTRAINT `dailyActivitiesScheduled_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `revision` ADD CONSTRAINT `revision_subtopic_subtopics_id_fk` FOREIGN KEY (`subtopic`) REFERENCES `subtopics`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `revision` ADD CONSTRAINT `revision_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `subject` ADD CONSTRAINT `subject_owner_users_id_fk` FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `subtopics` ADD CONSTRAINT `subtopics_topic_topics_id_fk` FOREIGN KEY (`topic`) REFERENCES `topics`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `topics` ADD CONSTRAINT `topics_course_course_id_fk` FOREIGN KEY (`course`) REFERENCES `course`(`id`) ON DELETE no action ON UPDATE cascade;