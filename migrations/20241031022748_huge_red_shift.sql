ALTER TABLE `course` ADD CONSTRAINT `Unique_subject_courseName` UNIQUE(`subject`,`courseName`);--> statement-breakpoint
ALTER TABLE `subject` ADD CONSTRAINT `unique_user_subject` UNIQUE(`owner`,`subjectName`);--> statement-breakpoint
ALTER TABLE `subtopics` ADD CONSTRAINT `unique_topic_subtopic` UNIQUE(`topic`,`subtopicName`);--> statement-breakpoint
ALTER TABLE `topics` ADD CONSTRAINT `unique_course_topic` UNIQUE(`course`,`topicName`);
