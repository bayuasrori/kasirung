CREATE TYPE "public"."kosan_room_status" AS ENUM('kosong', 'terisi');
--> statement-breakpoint
CREATE TYPE "public"."kosan_tenant_status" AS ENUM('aktif', 'keluar');
--> statement-breakpoint
CREATE TABLE "gedung_kosan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_gedung" text NOT NULL,
	"alamat" text NOT NULL,
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ruangan_kosan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gedung_id" uuid NOT NULL,
	"nama_ruangan" text NOT NULL,
	"lantai" text,
	"kapasitas" integer DEFAULT 1 NOT NULL,
	"status" "kosan_room_status" DEFAULT 'kosong' NOT NULL,
	"harga_bulanan" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "penghuni_kosan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pelanggan_id" uuid NOT NULL,
	"gedung_id" uuid NOT NULL,
	"ruangan_id" uuid NOT NULL,
	"tanggal_masuk" date NOT NULL,
	"tanggal_keluar" date,
	"status" "kosan_tenant_status" DEFAULT 'aktif' NOT NULL,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ruangan_kosan" ADD CONSTRAINT "ruangan_kosan_gedung_id_gedung_kosan_id_fk" FOREIGN KEY ("gedung_id") REFERENCES "public"."gedung_kosan"("id") ON DELETE restrict ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "penghuni_kosan" ADD CONSTRAINT "penghuni_kosan_pelanggan_id_customers_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "penghuni_kosan" ADD CONSTRAINT "penghuni_kosan_gedung_id_gedung_kosan_id_fk" FOREIGN KEY ("gedung_id") REFERENCES "public"."gedung_kosan"("id") ON DELETE restrict ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "penghuni_kosan" ADD CONSTRAINT "penghuni_kosan_ruangan_id_ruangan_kosan_id_fk" FOREIGN KEY ("ruangan_id") REFERENCES "public"."ruangan_kosan"("id") ON DELETE restrict ON UPDATE cascade;
--> statement-breakpoint
CREATE INDEX "ruangan_kosan_gedung_idx" ON "ruangan_kosan" USING btree ("gedung_id");
--> statement-breakpoint
CREATE INDEX "ruangan_kosan_status_idx" ON "ruangan_kosan" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "penghuni_kosan_pelanggan_idx" ON "penghuni_kosan" USING btree ("pelanggan_id");
--> statement-breakpoint
CREATE INDEX "penghuni_kosan_ruangan_idx" ON "penghuni_kosan" USING btree ("ruangan_id");
--> statement-breakpoint
CREATE INDEX "penghuni_kosan_status_idx" ON "penghuni_kosan" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "penghuni_kosan_gedung_idx" ON "penghuni_kosan" USING btree ("gedung_id");
