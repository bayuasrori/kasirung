DO $$ BEGIN
    CREATE TYPE "public"."admission_status" AS ENUM('admitted', 'discharged', 'transferred');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."bed_status" AS ENUM('available', 'occupied', 'maintenance', 'cleaning');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inpatient_admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"bed_id" uuid NOT NULL,
	"admission_date" timestamp with time zone DEFAULT now() NOT NULL,
	"discharge_date" timestamp with time zone,
	"status" "admission_status" DEFAULT 'admitted' NOT NULL,
	"diagnosis" text,
	"notes" text,
	"admitted_by" uuid,
	"discharged_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inpatient_beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"bed_number" text NOT NULL,
	"status" "bed_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inpatient_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"rate" numeric(12, 2) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inpatient_admissions" ADD CONSTRAINT "inpatient_admissions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inpatient_admissions" ADD CONSTRAINT "inpatient_admissions_bed_id_inpatient_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."inpatient_beds"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inpatient_admissions" ADD CONSTRAINT "inpatient_admissions_admitted_by_users_id_fk" FOREIGN KEY ("admitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatient_admissions" ADD CONSTRAINT "inpatient_admissions_discharged_by_users_id_fk" FOREIGN KEY ("discharged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inpatient_beds" ADD CONSTRAINT "inpatient_beds_room_id_inpatient_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."inpatient_rooms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "inpatient_admissions_patient_idx" ON "inpatient_admissions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "inpatient_admissions_bed_idx" ON "inpatient_admissions" USING btree ("bed_id");--> statement-breakpoint
CREATE INDEX "inpatient_admissions_status_idx" ON "inpatient_admissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inpatient_beds_room_idx" ON "inpatient_beds" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "inpatient_beds_status_idx" ON "inpatient_beds" USING btree ("status");