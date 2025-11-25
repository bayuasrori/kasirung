ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "admission_id" uuid;
ALTER TABLE "consultations"
ADD CONSTRAINT "consultations_admission_id_inpatient_admissions_id_fk"
FOREIGN KEY ("admission_id") REFERENCES "inpatient_admissions"("id")
ON DELETE set null ON UPDATE no action;
CREATE INDEX IF NOT EXISTS "consultations_admission_idx" ON "consultations" USING btree ("admission_id");
