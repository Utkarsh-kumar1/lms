import { mysqlTable, mysqlSchema, AnyMySqlColumn, char, varchar, json, index, foreignKey, primaryKey, timestamp, int, tinyint, bigint, unique, longtext, boolean, check } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid";


import { relations } from "drizzle-orm/relations";

export const revisionView = mysqlTable("RevisionView", {
	userId: char("userId", { length: 36 }).notNull(),
	username: varchar("username", { length: 255 }).notNull(),
	courseName: varchar("courseName", { length: 255 }).notNull(),
	topics: json("topics"),
});

export const activity = mysqlTable("activity", {
	id: char("id", { length: 36 }).notNull(),
	owner: char("owner", { length: 36 }).notNull().references(() => users.id, { onUpdate: "cascade" }),
	subTopic: char("subTopic", { length: 36 }).notNull().references(() => subtopics.id, { onUpdate: "cascade" }),
	start: timestamp("start", { mode: 'string' }).defaultNow().notNull(),
	end: timestamp("end", { mode: 'string' }),
	session: int("session"),
},
	(table) => {
		return {
			owner: index("owner").on(table.owner),
			subTopic: index("subTopic").on(table.subTopic),
			activityId: primaryKey({ columns: [table.id], name: "activity_id" }),
		}
	});

export const activityView = mysqlTable("activityView", {
	userId: char("userId", { length: 36 }).notNull(),
	username: varchar("username", { length: 255 }).notNull(),
	courseName: varchar("courseName", { length: 255 }).notNull(),
	courseId: char("courseId", { length: 36 }).notNull(),
	topics: json("topics"),
});

export const course = mysqlTable("course", {
	id: char("id", { length: 36 }).notNull().$defaultFn(()=>uuidv4()),
	courseName: varchar("courseName", { length: 255 }).notNull(),
	subject: char("subject", { length: 36 }).references(() => subject.id, { onUpdate: "cascade" }).notNull(),
	isCompleted: tinyint("isCompleted").default(0),
	session: int("session").default(0),
},
	(table) => {
		return {
			course: index("course").on(table.subject),
			courseId: primaryKey({ columns: [table.id], name: "course_id" }),
		}
	});

export const dailyActivitiesScheduled = mysqlTable("dailyActivitiesScheduled", {
	id: char("id", { length: 36 }).notNull(),
	owner: char("owner", { length: 36 }).notNull().references(() => users.id, { onUpdate: "cascade" }),
	startDate: timestamp("startDate", { mode: 'string' }).defaultNow().notNull(),
	task: varchar("task", { length: 50 }).notNull(),
	isCompleted: tinyint("isCompleted").default(0).notNull(),
},
	(table) => {
		return {
			dailyActivitiesScheduledId: primaryKey({ columns: [table.id], name: "dailyActivitiesScheduled_id" }),
		}
	});

export const dailyActivitiesScheduledView = mysqlTable("dailyActivitiesScheduledView", {
	id: char("id", { length: 36 }),
	owner: char("owner", { length: 36 }),
	task: varchar("task", { length: 50 }),
	startDate: timestamp("startDate", { mode: 'string' }).default('0000-00-00 00:00:00'),
	isCompleted: tinyint("isCompleted").default(0),
	streak: bigint("streak", { mode: "number" }),
	isBestStreak: int("isBestStreak"),
});

export const eventLogs = mysqlTable("eventLogs", {
	id: char("id", { length: 36 }).notNull(),
	eventName: varchar("eventName", { length: 50 }).notNull(),
	procedureName: varchar("procedureName", { length: 50 }).notNull(),
	start: timestamp("start", { mode: 'string' }).defaultNow().notNull(),
	end: timestamp("end", { mode: 'string' }),
},
	(table) => {
		return {
			eventLogsId: primaryKey({ columns: [table.id], name: "eventLogs_id" }),
		}
	});

export const notes = mysqlTable("notes", {
	id: char("id", { length: 36 }).notNull().$defaultFn(() => uuidv4()),
	userId: char("userId", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	topic: char("topic", { length: 36 }).references(() => topics.id, { onDelete: "cascade", onUpdate: "cascade" }),
	subjectRef: char("subjectRef", { length: 36 }).references(() => subject.id, { onDelete: "cascade", onUpdate: "cascade" }),
	courseRef: char("courseRef", { length: 36 }).references(() => course.id, { onDelete: "cascade", onUpdate: "cascade" }),
	fileName: varchar("fileName", { length: 255 }).notNull(),
	fileType: varchar("fileType", { length: 255 }).notNull(),
	filePath: varchar("filePath", { length: 255 }).notNull().unique(),
	fileSize: int("fileSize").notNull(),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),

},
	(table) => {
		return {
			topicIdx: index("topic_idx").on(table.topic),
			subjectRefIdx: index("subjectRef_idx").on(table.subjectRef),
			courseRefIdx: index("courseRef_idx").on(table.courseRef),
			notesId: primaryKey({ columns: [table.id], name: "notes_id" }),
			// Adding the check constraint to enforce that at least one of the fields is non-null
			topicOrSubjectOrCourseCheck: check('topic_or_subject_or_course_check', `
            topic IS NOT NULL OR 
            subjectRef IS NOT NULL OR 
            courseRef IS NOT NULL
        `)
		};
	});

export const revision = mysqlTable("revision", {
	id: char("id", { length: 36 }).notNull(),
	subtopic: char("subtopic", { length: 36 }).references(() => subtopics.id, { onUpdate: "cascade" }),
	start: timestamp("start", { mode: 'string' }).defaultNow().notNull(),
	end: timestamp("end", { mode: 'string' }),
	owner: char("owner", { length: 36 }).references(() => users.id, { onUpdate: "cascade" }),
	session: int("session"),
	nextSchedule: timestamp("nextSchedule", { mode: 'string' }),
	revisionCounter: int("revisionCounter", { unsigned: true }).default(1),
	isNextScheduled: tinyint("isNextScheduled").default(0).notNull(),
},
	(table) => {
		return {
			subtopic: index("subtopic").on(table.subtopic),
			owner: index("owner").on(table.owner),
			revisionId: primaryKey({ columns: [table.id], name: "revision_id" }),
		}
	});

export const subject = mysqlTable("subject", {
	id: char("id", { length: 36 }).notNull().$defaultFn(() => uuidv4()),
	subjectName: varchar("subjectName", { length: 255 }).notNull(),
	owner: char("owner", { length: 36 }).references(() => users.id, { onUpdate: "cascade" }).notNull(),
	isCompleted: tinyint("isCompleted").default(0),
	isActive: tinyint("isActive").default(1),
},
	(table) => {
		return {
			owner: index("owner").on(table.owner),
			subjectId: primaryKey({ columns: [table.id], name: "subject_id" }),
		}
	});

export const subtopics = mysqlTable("subtopics", {
	id: char("id", { length: 36 }).notNull(),
	subtopicName: varchar("subtopicName", { length: 255 }).notNull(),
	subTopicIndex: int("subTopicIndex"),
	topic: char("topic", { length: 36 }).references(() => topics.id, { onUpdate: "cascade" }),
	isCompleted: tinyint("isCompleted").default(0),
},
	(table) => {
		return {
			topic: index("topic").on(table.topic),
			subtopicsId: primaryKey({ columns: [table.id], name: "subtopics_id" }),
		}
	});

export const topicNotes = mysqlTable("topic_notes", {
	userId: char("userId", { length: 36 }).notNull(),
	username: varchar("username", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	subjectName: varchar("subjectName", { length: 255 }).notNull(),
	courseName: varchar("courseName", { length: 255 }).notNull(),
	topicName: varchar("topicName", { length: 255 }).notNull(),
	topicIndex: int("topicIndex"),
	isCompleted: tinyint("isCompleted").default(0),
	topicId: char("topicId", { length: 36 }).notNull(),
	notes: json("notes"),
});

export const topics = mysqlTable("topics", {
	id: char("id", { length: 36 }).notNull(),
	topicName: varchar("topicName", { length: 255 }).notNull(),
	course: char("course", { length: 36 }).references(() => course.id, { onUpdate: "cascade" }),
	isCompleted: tinyint("isCompleted").default(0),
	topicIndex: int("topicIndex"),
},
	(table) => {
		return {
			subject: index("subject").on(table.course),
			topicsId: primaryKey({ columns: [table.id], name: "topics_id" }),
		}
	});

export const userData = mysqlTable("userData", {
	id: char("id", { length: 36 }).notNull(),
	userName: varchar("userName", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	firstName: varchar("firstName", { length: 255 }),
	userData: json("UserData"),
});

export const users = mysqlTable("users", {
	id: char("id", { length: 36 }).notNull().$defaultFn(() => uuidv4()),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	username: varchar("username", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	firstName: varchar("firstName", { length: 255 }).notNull(),
	lastName: varchar("lastName", { length: 255 }),
	avatarUrl: varchar("avatarUrl", { length: 255 }),
	userPassword: varchar("userPassword", { length: 255 }).notNull(),
	refreshToken: varchar("refreshToken", { length: 255 }),
	spaceRepetition: json("spaceRepetition").$default(() => JSON.stringify([])),
	activityScheduleCount: int("ActivityScheduleCount").default(4),
	otp: varchar("otp", { length: 4 }),
	isVerified: boolean("isVerified").notNull().default(0),
	otpExpiry: varchar("otpExpiry", { length: 100 }),
	tasks: json("tasks").$default(() => JSON.stringify([])),
},
	(table) => {
		return {
			usersId: primaryKey({ columns: [table.id], name: "users_id" }),
			username: unique("username").on(table.username),
			email: unique("email").on(table.email),
		}
	});



//Relations

export const notesRelations = relations(notes, ({ one, many }) => ({
	subject: one(subject, {
		fields: [notes.subjectRef],
		references: [subject.id]
	}),
	topic: one(topics, {
		fields: [notes.topic],
		references: [topics.id]
	}),
	user: one(users, {
		fields: [notes.userId],
		references: [users.id]
	}),
	course: one(course, {
		fields: [notes.courseRef],
		references: [course.id]
	})

}))


export const activityRelations = relations(activity, ({ one }) => ({
	subtopic: one(subtopics, {
		fields: [activity.subTopic],
		references: [subtopics.id]
	}),
	user: one(users, {
		fields: [activity.owner],
		references: [users.id]
	}),
}));

export const subtopicsRelations = relations(subtopics, ({ one, many }) => ({
	activities: many(activity),
	revisions: many(revision),
	topic: one(topics, {
		fields: [subtopics.topic],
		references: [topics.id]
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	activities: many(activity),
	dailyActivitiesScheduleds: many(dailyActivitiesScheduled),
	revisions: many(revision),
	subjects: many(subject),
	notes: many(notes)
}));

export const courseRelations = relations(course, ({ one, many }) => ({
	subject: one(subject, {
		fields: [course.subject],
		references: [subject.id]
	}),
	topics: many(topics),
	notes : many(notes)
}));

export const subjectRelations = relations(subject, ({ one, many }) => ({
	courses: many(course),
	user: one(users, {
		fields: [subject.owner],
		references: [users.id]
	}),
	notes: many(notes)
}));

export const dailyActivitiesScheduledRelations = relations(dailyActivitiesScheduled, ({ one }) => ({
	user: one(users, {
		fields: [dailyActivitiesScheduled.owner],
		references: [users.id]
	}),
}));

export const revisionRelations = relations(revision, ({ one }) => ({
	subtopic: one(subtopics, {
		fields: [revision.subtopic],
		references: [subtopics.id]
	}),
	user: one(users, {
		fields: [revision.owner],
		references: [users.id]
	}),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
	subtopics: many(subtopics),
	course: one(course, {
		fields: [topics.course],
		references: [course.id]
	}),
	notes: many(notes)
}));