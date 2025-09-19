ALTER TABLE "citizen_issue_report" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "driver_issue_report" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."citizen_issue_type";--> statement-breakpoint
DROP TYPE "public"."driver_issue_type";