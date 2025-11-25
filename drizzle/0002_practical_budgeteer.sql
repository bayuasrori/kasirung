CREATE TYPE "public"."budget_scenario" AS ENUM('baseline', 'optimistic', 'conservative');
--> statement-breakpoint
CREATE TYPE "public"."budget_type" AS ENUM('revenue', 'expense');
--> statement-breakpoint
CREATE TABLE "accounting_budget_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"scenario" "budget_scenario" NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounting_budget_plans_year_scenario_idx" UNIQUE("year", "scenario")
);
--> statement-breakpoint
CREATE TABLE "accounting_budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"type" "budget_type" NOT NULL,
	"account_id" uuid,
	"account_code" text NOT NULL,
	"account_name" text NOT NULL,
	"current_amount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"planned_amount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounting_budget_plans" ADD CONSTRAINT "accounting_budget_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "accounting_budget_items" ADD CONSTRAINT "accounting_budget_items_plan_id_accounting_budget_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."accounting_budget_plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "accounting_budget_items" ADD CONSTRAINT "accounting_budget_items_account_id_accounting_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounting_accounts"("id") ON DELETE set null ON UPDATE cascade;
--> statement-breakpoint
CREATE INDEX "accounting_budget_items_plan_idx" ON "accounting_budget_items" USING btree ("plan_id");
--> statement-breakpoint
CREATE INDEX "accounting_budget_items_type_idx" ON "accounting_budget_items" USING btree ("type");
