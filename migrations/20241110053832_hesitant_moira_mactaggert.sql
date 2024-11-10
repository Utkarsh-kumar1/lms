ALTER TABLE `course` ADD `ActivityScheduleCount` int DEFAULT 4;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `spaceRepetition`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `ActivityScheduleCount`;