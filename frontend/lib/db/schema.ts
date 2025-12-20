import { pgTable, uuid, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'


export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // References auth.users(id)
  email: text('email').notNull().unique(),
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
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('videos_user_id_idx').on(table.userId),
  createdAtIdx: index('videos_created_at_idx').on(table.createdAt),
  statusIdx: index('videos_status_idx').on(table.status),
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



export const usersRelations = relations(users, ({ many, one }) => ({
  videos: many(videos),
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



export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert

export type UserStats = typeof userStats.$inferSelect
export type NewUserStats = typeof userStats.$inferInsert

export type VideoTag = typeof videoTags.$inferSelect
export type NewVideoTag = typeof videoTags.$inferInsert
