CREATE TYPE "public"."app_role_enum" AS ENUM('admin', 'supervisor', 'driver', 'citizen');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."assignment_status" AS ENUM('scheduled', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('active', 'inactive', 'draft');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('route_deviation', 'prolonged_stop', 'late_start');--> statement-breakpoint
CREATE TYPE "public"."citizen_issue_type" AS ENUM('missed_collection', 'illegal_dumping');--> statement-breakpoint
CREATE TYPE "public"."driver_issue_type" AS ENUM('mechanical_failure', 'road_blocked', 'truck_full', 'other');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('ios', 'android');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"display_username" text,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"appRole" "app_role_enum" DEFAULT 'citizen' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"gender" "gender",
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"phoneNumber" text,
	"lastLoginAt" timestamp,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "truck" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"license_plate" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "truck_license_plate_unique" UNIQUE("license_plate")
);
--> statement-breakpoint
CREATE TABLE "truck_current_location" (
	"truck_id" text PRIMARY KEY NOT NULL,
	"route_assignment_id" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"speed" double precision,
	"heading" double precision,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "truck_location_history" (
	"id" text PRIMARY KEY NOT NULL,
	"truck_id" text NOT NULL,
	"route_assignment_id" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"speed" double precision,
	"heading" double precision,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_lat" double precision NOT NULL,
	"start_lng" double precision NOT NULL,
	"estimated_duration_minutes" integer NOT NULL,
	"status" "route_status" DEFAULT 'active' NOT NULL,
	"created_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"route_id" text NOT NULL,
	"truck_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"assigned_date" date NOT NULL,
	"scheduled_start_time" timestamp NOT NULL,
	"scheduled_end_time" timestamp NOT NULL,
	"status" "assignment_status" DEFAULT 'scheduled' NOT NULL,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"last_completed_waypoint_sequence" integer,
	"notes" text,
	"assigned_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_schedule" (
	"route_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_waypoint" (
	"id" text PRIMARY KEY NOT NULL,
	"route_id" text NOT NULL,
	"sequence_order" integer NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"street_name" text,
	"estimated_arrival_offset_minutes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citizen_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"street_name" text,
	"reference" text,
	"notifications_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_education_progress" (
	"user_id" text NOT NULL,
	"content_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"score" integer,
	"time_spent_seconds" integer,
	CONSTRAINT "user_education_progress_user_id_content_id_pk" PRIMARY KEY("user_id","content_id")
);
--> statement-breakpoint
CREATE TABLE "citizen_issue_report" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "citizen_issue_type" NOT NULL,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"description" text,
	"photo_url" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_issue_report" (
	"id" text PRIMARY KEY NOT NULL,
	"driver_id" text NOT NULL,
	"route_assignment_id" text NOT NULL,
	"type" "driver_issue_type" NOT NULL,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "system_alert" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "alert_type" NOT NULL,
	"message" text NOT NULL,
	"status" "alert_status" DEFAULT 'unread' NOT NULL,
	"route_assignment_id" text,
	"truck_id" text,
	"driver_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispatch_message" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"content" text NOT NULL,
	"read_at" timestamp,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_notification_token" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_type" "device_type" NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "truck_current_location" ADD CONSTRAINT "truck_current_location_truck_id_truck_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."truck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "truck_current_location" ADD CONSTRAINT "truck_current_location_route_assignment_id_route_assignment_id_fk" FOREIGN KEY ("route_assignment_id") REFERENCES "public"."route_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "truck_location_history" ADD CONSTRAINT "truck_location_history_truck_id_truck_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."truck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_assignment" ADD CONSTRAINT "route_assignment_route_id_route_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."route"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_assignment" ADD CONSTRAINT "route_assignment_truck_id_truck_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."truck"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_assignment" ADD CONSTRAINT "route_assignment_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_assignment" ADD CONSTRAINT "route_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_schedule" ADD CONSTRAINT "route_schedule_route_id_route_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_waypoint" ADD CONSTRAINT "route_waypoint_route_id_route_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_profile" ADD CONSTRAINT "citizen_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_education_progress" ADD CONSTRAINT "user_education_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_issue_report" ADD CONSTRAINT "citizen_issue_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_issue_report" ADD CONSTRAINT "driver_issue_report_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_issue_report" ADD CONSTRAINT "driver_issue_report_route_assignment_id_route_assignment_id_fk" FOREIGN KEY ("route_assignment_id") REFERENCES "public"."route_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alert" ADD CONSTRAINT "system_alert_route_assignment_id_route_assignment_id_fk" FOREIGN KEY ("route_assignment_id") REFERENCES "public"."route_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alert" ADD CONSTRAINT "system_alert_truck_id_truck_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."truck"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alert" ADD CONSTRAINT "system_alert_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_message" ADD CONSTRAINT "dispatch_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_message" ADD CONSTRAINT "dispatch_message_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_token" ADD CONSTRAINT "push_notification_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "user_app_role_idx" ON "user" USING btree ("appRole");--> statement-breakpoint
CREATE INDEX "user_is_active_idx" ON "user" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "truck_is_active_idx" ON "truck" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "truck_name_idx" ON "truck" USING btree ("name");--> statement-breakpoint
CREATE INDEX "truck_current_location_updated_idx" ON "truck_current_location" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "truck_current_location_assignment_idx" ON "truck_current_location" USING btree ("route_assignment_id");--> statement-breakpoint
CREATE INDEX "truck_current_location_coords_idx" ON "truck_current_location" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "truck_location_history_truck_recorded_idx" ON "truck_location_history" USING btree ("truck_id","recorded_at");--> statement-breakpoint
CREATE INDEX "truck_location_history_recorded_idx" ON "truck_location_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "truck_location_history_assignment_idx" ON "truck_location_history" USING btree ("route_assignment_id");--> statement-breakpoint
CREATE INDEX "route_status_idx" ON "route" USING btree ("status");--> statement-breakpoint
CREATE INDEX "route_created_by_idx" ON "route" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "route_start_location_idx" ON "route" USING btree ("start_lat","start_lng");--> statement-breakpoint
CREATE INDEX "route_assignment_date_idx" ON "route_assignment" USING btree ("assigned_date");--> statement-breakpoint
CREATE INDEX "route_assignment_status_idx" ON "route_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "route_assignment_driver_idx" ON "route_assignment" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "route_assignment_truck_idx" ON "route_assignment" USING btree ("truck_id");--> statement-breakpoint
CREATE INDEX "route_assignment_scheduled_start_idx" ON "route_assignment" USING btree ("scheduled_start_time");--> statement-breakpoint
CREATE INDEX "route_assignment_route_date_idx" ON "route_assignment" USING btree ("route_id","assigned_date");--> statement-breakpoint
CREATE UNIQUE INDEX "route_schedule_pkey" ON "route_schedule" USING btree ("route_id","day_of_week");--> statement-breakpoint
CREATE INDEX "route_schedule_day_idx" ON "route_schedule" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "route_waypoint_route_sequence_idx" ON "route_waypoint" USING btree ("route_id","sequence_order");--> statement-breakpoint
CREATE INDEX "route_waypoint_location_idx" ON "route_waypoint" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "citizen_profile_location_idx" ON "citizen_profile" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "user_education_progress_user_idx" ON "user_education_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_education_progress_completed_idx" ON "user_education_progress" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "citizen_issue_report_status_idx" ON "citizen_issue_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "citizen_issue_report_user_idx" ON "citizen_issue_report" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "citizen_issue_report_created_idx" ON "citizen_issue_report" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "citizen_issue_report_location_idx" ON "citizen_issue_report" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "citizen_issue_report_type_idx" ON "citizen_issue_report" USING btree ("type");--> statement-breakpoint
CREATE INDEX "driver_issue_report_status_idx" ON "driver_issue_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "driver_issue_report_driver_idx" ON "driver_issue_report" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "driver_issue_report_assignment_idx" ON "driver_issue_report" USING btree ("route_assignment_id");--> statement-breakpoint
CREATE INDEX "driver_issue_report_created_idx" ON "driver_issue_report" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "driver_issue_report_location_idx" ON "driver_issue_report" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "system_alert_status_idx" ON "system_alert" USING btree ("status");--> statement-breakpoint
CREATE INDEX "system_alert_created_at_idx" ON "system_alert" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "system_alert_type_idx" ON "system_alert" USING btree ("type");--> statement-breakpoint
CREATE INDEX "system_alert_driver_idx" ON "system_alert" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "dispatch_message_recipient_sent_idx" ON "dispatch_message" USING btree ("recipient_id","sent_at");--> statement-breakpoint
CREATE INDEX "dispatch_message_sender_idx" ON "dispatch_message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "dispatch_message_read_at_idx" ON "dispatch_message" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "push_notification_token_user_idx" ON "push_notification_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_notification_token_last_used_idx" ON "push_notification_token" USING btree ("last_used_at");