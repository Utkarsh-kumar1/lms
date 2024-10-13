ALTER TABLE `notes` MODIFY COLUMN `topic` char(36);--> statement-breakpoint
ALTER TABLE `notes` MODIFY COLUMN `subjectRef` char(36);--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_topic_topics_id_fk` FOREIGN KEY (`topic`) REFERENCES `topics`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_subjectRef_subject_id_fk` FOREIGN KEY (`subjectRef`) REFERENCES `subject`(`id`) ON DELETE cascade ON UPDATE cascade;