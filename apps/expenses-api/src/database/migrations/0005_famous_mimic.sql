CREATE TYPE "public"."installment_item_status" AS ENUM('open', 'paid', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."installment_plan_status" AS ENUM('active', 'prepaid', 'canceled');--> statement-breakpoint
CREATE TABLE "credit_card_installment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"status" "installment_item_status" DEFAULT 'open' NOT NULL,
	"paid_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_card_installment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"installments_total" integer NOT NULL,
	"installments_remaining" integer NOT NULL,
	"status" "installment_plan_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_card_installment_items" ADD CONSTRAINT "credit_card_installment_items_plan_id_credit_card_installment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."credit_card_installment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_installment_plans" ADD CONSTRAINT "credit_card_installment_plans_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_installment_plans" ADD CONSTRAINT "credit_card_installment_plans_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;