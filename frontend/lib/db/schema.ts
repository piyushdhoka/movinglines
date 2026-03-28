import { pgTable, uuid, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'


export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // References auth.users(id)
  email: text('email').notNull().unique(),
  credits: integer('credits').notNull().default(2), // Free credits for new users
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}))


export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Video metadata
  prompt: text('prompt').notNull(),
  videoUrl: text('video_url').notNull(), // Full Supabase storage URL
  bucketPath: text('bucket_path').notNull(), // e.g., "{user_id}/{video_id}.mp4"

  // Generation details
  quality: text('quality', { enum: ['l', 'm', 'h', 'k'] }).notNull().default('m'),
  duration: integer('duration'), // Video duration in seconds
  fileSize: integer('file_size'), // File size in bytes

  // Status tracking
  status: text('status', { enum: ['processing', 'completed', 'failed'] }).notNull().default('completed'),
  generatedScript: text('generated_script'), // The Manim code generated
  errorMessage: text('error_message'), // If generation failed

  // Sharing
  isPublic: boolean('is_public').notNull().default(false), // Whether video is publicly shareable
  shareToken: text('share_token').unique(), // Optional short token for cleaner URLs
  viewCount: integer('view_count').notNull().default(0), // Track share link views
  sharedAt: timestamp('shared_at'), // When sharing was first enabled

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('videos_user_id_idx').on(table.userId),
  createdAtIdx: index('videos_created_at_idx').on(table.createdAt),
  statusIdx: index('videos_status_idx').on(table.status),
  shareTokenIdx: index('videos_share_token_idx').on(table.shareToken),
}))


export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),

  // Video counts
  totalVideos: integer('total_videos').notNull().default(0),
  completedVideos: integer('completed_videos').notNull().default(0),
  failedVideos: integer('failed_videos').notNull().default(0),

  // Storage usage
  totalStorageBytes: integer('total_storage_bytes').notNull().default(0), // Sum of all video file sizes

  // Activity tracking
  lastVideoCreatedAt: timestamp('last_video_created_at'),
  firstVideoCreatedAt: timestamp('first_video_created_at'),

  // Timestamps
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  totalVideosIdx: index('user_stats_total_videos_idx').on(table.totalVideos),
}))

export const videoTags = pgTable('video_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index('video_tags_video_id_idx').on(table.videoId),
  tagIdx: index('video_tags_tag_idx').on(table.tag),
}))


export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),

  // Sharing
  isPublic: boolean('is_public').notNull().default(false), // Whether chat is publicly shareable
  shareToken: text('share_token').unique(), // Optional short token for cleaner URLs
  viewCount: integer('view_count').notNull().default(0), // Track share link views
  sharedAt: timestamp('shared_at'), // When sharing was first enabled

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('chats_user_id_idx').on(table.userId),
  createdAtIdx: index('chats_created_at_idx').on(table.createdAt),
  shareTokenIdx: index('chats_share_token_idx').on(table.shareToken),
}))

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatId: uuid('chat_id').references(() => chats.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  quality: text('quality', { enum: ['l', 'm', 'h', 'k'] }).notNull(),
  status: text('status', { enum: ['processing', 'generating_script', 'rendering', 'uploading', 'completed', 'failed'] }).notNull().default('processing'),
  progress: integer('progress').notNull().default(0),
  videoUrl: text('video_url'),
  generatedScript: text('generated_script'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('tasks_user_id_idx').on(table.userId),
  chatIdIdx: index('tasks_chat_id_idx').on(table.chatId),
  statusIdx: index('tasks_status_idx').on(table.status),
  createdAtIdx: index('tasks_created_at_idx').on(table.createdAt),
}))


export const usersRelations = relations(users, ({ many, one }) => ({
  videos: many(videos),
  chats: many(chats),
  tasks: many(tasks),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
}))

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  tags: many(videoTags),
}))

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}))

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [tasks.chatId],
    references: [chats.id],
  }),
}))


export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert

export type UserStats = typeof userStats.$inferSelect
export type NewUserStats = typeof userStats.$inferInsert

export type VideoTag = typeof videoTags.$inferSelect
export type NewVideoTag = typeof videoTags.$inferInsert

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
