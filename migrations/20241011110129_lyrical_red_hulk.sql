ALTER TABLE `course` MODIFY COLUMN `subject` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_filePath_unique` UNIQUE(`filePath`);