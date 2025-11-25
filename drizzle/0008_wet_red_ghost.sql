CREATE TABLE "rekam_medis_inap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admission_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"date" date NOT NULL,
	"time" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rekam_medis_inap_soapi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rekam_medis_inap_id" uuid NOT NULL,
	"subjective" text,
	"objective" text,
	"assessment" text,
	"plan" text,
	"instruction" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ALTER COLUMN "appointment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "admission_id" uuid;--> statement-breakpoint
ALTER TABLE "rekam_medis_inap" ADD CONSTRAINT "rekam_medis_inap_admission_id_inpatient_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."inpatient_admissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rekam_medis_inap" ADD CONSTRAINT "rekam_medis_inap_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rekam_medis_inap" ADD CONSTRAINT "rekam_medis_inap_staff_id_medical_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."medical_staff"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rekam_medis_inap_soapi" ADD CONSTRAINT "rekam_medis_inap_soapi_rekam_medis_inap_id_rekam_medis_inap_id_fk" FOREIGN KEY ("rekam_medis_inap_id") REFERENCES "public"."rekam_medis_inap"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "rekam_medis_inap_admission_idx" ON "rekam_medis_inap" USING btree ("admission_id");--> statement-breakpoint
CREATE INDEX "rekam_medis_inap_patient_idx" ON "rekam_medis_inap" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "rekam_medis_inap_staff_idx" ON "rekam_medis_inap" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "rekam_medis_inap_soapi_rekam_medis_inap_idx" ON "rekam_medis_inap_soapi" USING btree ("rekam_medis_inap_id");