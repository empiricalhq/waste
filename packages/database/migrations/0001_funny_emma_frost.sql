ALTER TYPE "public"."app_role" RENAME TO "app_role_enum";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "app_role" TO "appRole";