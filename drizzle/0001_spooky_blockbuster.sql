CREATE TYPE "public"."account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense', 'other');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('draft', 'posted', 'void');--> statement-breakpoint
CREATE TABLE "accounting_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" NOT NULL,
	"parent_id" uuid,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounting_accounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "accounting_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"entry_date" timestamp with time zone DEFAULT now() NOT NULL,
	"memo" text,
	"reference" text,
	"status" "journal_status" DEFAULT 'draft' NOT NULL,
	"posted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounting_journal_entries_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "accounting_journal_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"description" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"debit" numeric(14, 2) DEFAULT 0 NOT NULL,
	"credit" numeric(14, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounting_accounts" ADD CONSTRAINT "accounting_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_journal_lines" ADD CONSTRAINT "accounting_journal_lines_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_journal_lines" ADD CONSTRAINT "accounting_journal_lines_account_id_accounting_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounting_accounts"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "accounting_accounts_parent_idx" ON "accounting_accounts" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "accounting_accounts_type_idx" ON "accounting_accounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "accounting_journal_entries_date_idx" ON "accounting_journal_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "accounting_journal_entries_status_idx" ON "accounting_journal_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "accounting_journal_lines_entry_idx" ON "accounting_journal_lines" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "accounting_journal_lines_account_idx" ON "accounting_journal_lines" USING btree ("account_id");