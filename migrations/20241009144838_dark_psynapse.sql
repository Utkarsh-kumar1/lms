DROP INDEX `topic` ON `notes`;--> statement-breakpoint
DROP INDEX `subjectRef` ON `notes`;--> statement-breakpoint
ALTER TABLE `notes` ADD `courseRef` char(36);--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_courseRef_course_id_fk` FOREIGN KEY (`courseRef`) REFERENCES `course`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `topic_idx` ON `notes` (`topic`);--> statement-breakpoint
CREATE INDEX `subjectRef_idx` ON `notes` (`subjectRef`);--> statement-breakpoint
CREATE INDEX `courseRef_idx` ON `notes` (`courseRef`);