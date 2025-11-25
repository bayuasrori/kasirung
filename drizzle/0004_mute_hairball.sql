CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('consultation', 'checkup', 'follow_up', 'emergency', 'vaccination', 'procedure');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A_positive', 'A_negative', 'B_positive', 'B_negative', 'AB_positive', 'AB_negative', 'O_positive', 'O_negative', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."consultation_status" AS ENUM('ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_type" AS ENUM('medicine', 'consumable', 'equipment');--> statement-breakpoint
CREATE TYPE "public"."medical_staff_role" AS ENUM('doctor', 'nurse', 'midwife', 'specialist', 'pharmacist', 'lab_technician', 'receptionist');--> statement-breakpoint
CREATE TYPE "public"."pasien_status" AS ENUM('aktif', 'tidak_aktif', 'alih');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('in', 'out', 'adjust', 'expired', 'returned');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"service_id" uuid,
	"appointment_date" date NOT NULL,
	"appointment_time" text NOT NULL,
	"duration" integer,
	"type" "appointment_type" NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"chief_complaint" text,
	"history" text,
	"physical_examination" text,
	"diagnosis" text,
	"treatment" text,
	"notes" text,
	"status" "consultation_status" DEFAULT 'ongoing' NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "inventory_type" NOT NULL,
	"unit" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 10 NOT NULL,
	"max_stock" integer DEFAULT 100 NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"expiry_date" date,
	"supplier" text,
	"category_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_inventory_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "medical_invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"service_id" uuid,
	"item_id" uuid,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid,
	"patient_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"payment_method" "payment_method",
	"paid_at" timestamp with time zone,
	"due_date" date NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "medical_service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_service_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "medical_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"duration" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_services_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "medical_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"nip" text NOT NULL,
	"name" text NOT NULL,
	"role" "medical_staff_role" NOT NULL,
	"specialization" text,
	"phone" text,
	"email" text,
	"license_number" text,
	"education" text,
	"experience" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_staff_nip_unique" UNIQUE("nip")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mr_number" text NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" "gender" NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"blood_type" "blood_type" DEFAULT 'unknown',
	"allergies" text,
	"emergency_contact" jsonb,
	"insurance_id" text,
	"status" "pasien_status" DEFAULT 'aktif' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_mr_number_unique" UNIQUE("mr_number")
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"duration" text NOT NULL,
	"instructions" text,
	"status" "prescription_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"location" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"type" "stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"reference" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vital_signs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"systolic" integer,
	"diastolic" integer,
	"heart_rate" integer,
	"respiratory_rate" integer,
	"temperature" numeric(4, 1),
	"oxygen_saturation" integer,
	"weight" numeric(5, 2),
	"height" numeric(5, 2),
	"bmi" numeric(4, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ruangan_kosan" ALTER COLUMN "kapasitas" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_medical_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."medical_staff"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_medical_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."medical_services"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_staff_id_medical_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."medical_staff"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoice_items" ADD CONSTRAINT "medical_invoice_items_invoice_id_medical_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."medical_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoice_items" ADD CONSTRAINT "medical_invoice_items_service_id_medical_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."medical_services"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoice_items" ADD CONSTRAINT "medical_invoice_items_item_id_medical_inventory_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."medical_inventory"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_staff" ADD CONSTRAINT "medical_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_staff_id_medical_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."medical_staff"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_staff_id_medical_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."medical_staff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_medical_inventory_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."medical_inventory"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "appointments_patient_idx" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_staff_idx" ON "appointments" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consultations_appointment_idx" ON "consultations" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "consultations_patient_idx" ON "consultations" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "consultations_staff_idx" ON "consultations" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "consultations_status_idx" ON "consultations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "medical_inventory_code_idx" ON "medical_inventory" USING btree ("code");--> statement-breakpoint
CREATE INDEX "medical_inventory_type_idx" ON "medical_inventory" USING btree ("type");--> statement-breakpoint
CREATE INDEX "medical_invoice_items_invoice_idx" ON "medical_invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "medical_invoices_patient_idx" ON "medical_invoices" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "medical_invoices_appointment_idx" ON "medical_invoices" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "medical_invoices_status_idx" ON "medical_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "medical_services_category_idx" ON "medical_services" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "medical_services_code_idx" ON "medical_services" USING btree ("code");--> statement-breakpoint
CREATE INDEX "medical_staff_user_idx" ON "medical_staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "medical_staff_role_idx" ON "medical_staff" USING btree ("role");--> statement-breakpoint
CREATE INDEX "patients_mr_number_idx" ON "patients" USING btree ("mr_number");--> statement-breakpoint
CREATE INDEX "patients_status_idx" ON "patients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prescriptions_consultation_idx" ON "prescriptions" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "prescriptions_patient_idx" ON "prescriptions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "prescriptions_staff_idx" ON "prescriptions" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "staff_schedules_staff_idx" ON "staff_schedules" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "staff_schedules_day_idx" ON "staff_schedules" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "stock_movements_item_idx" ON "stock_movements" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "stock_movements_type_idx" ON "stock_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "vital_signs_consultation_idx" ON "vital_signs" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "vital_signs_patient_idx" ON "vital_signs" USING btree ("patient_id");