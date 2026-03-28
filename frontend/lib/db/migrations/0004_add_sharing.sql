-- Migration: Add sharing functionality to videos and chats
-- This migration adds columns for sharing videos and chats via public links
-- All columns are added with safe defaults to avoid breaking existing data

-- Add sharing columns to videos table
ALTER TABLE "videos" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;
ALTER TABLE "videos" ADD COLUMN "share_token" text;
ALTER TABLE "videos" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "videos" ADD COLUMN "shared_at" timestamp;

-- Add sharing columns to chats table
ALTER TABLE "chats" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;
ALTER TABLE "chats" ADD COLUMN "share_token" text;
ALTER TABLE "chats" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "chats" ADD COLUMN "shared_at" timestamp;

-- Add unique constraint on share_token (sparse index - only non-null values)
ALTER TABLE "videos" ADD CONSTRAINT "videos_share_token_unique" UNIQUE ("share_token");
ALTER TABLE "chats" ADD CONSTRAINT "chats_share_token_unique" UNIQUE ("share_token");

-- Add indexes for efficient lookups
CREATE INDEX "videos_share_token_idx" ON "videos" USING btree ("share_token") WHERE "share_token" IS NOT NULL;
CREATE INDEX "chats_share_token_idx" ON "chats" USING btree ("share_token") WHERE "share_token" IS NOT NULL;

-- Add index for public videos/chats queries
CREATE INDEX "videos_is_public_idx" ON "videos" USING btree ("is_public") WHERE "is_public" = true;
CREATE INDEX "chats_is_public_idx" ON "chats" USING btree ("is_public") WHERE "is_public" = true;
