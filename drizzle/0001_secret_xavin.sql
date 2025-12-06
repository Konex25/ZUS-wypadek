CREATE TYPE "public"."caseStatuses" AS ENUM('PENDING', 'ACCEPTED', 'FAILED');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"houseNumber" text NOT NULL,
	"apartmentNumber" text,
	"city" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" "bytea" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"nip" text,
	"regon" text,
	"pesel" text NOT NULL,
	"documentId" text NOT NULL,
	"documentType" text NOT NULL,
	"mainAddressId" uuid,
	"correspondenceAddressId" uuid,
	"businessAddressId" uuid
);
--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "subjectId" uuid;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "status" "caseStatuses" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "fileIds" text[];--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "aiResponse" jsonb;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "aiDecision" jsonb;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "aiJustifications" jsonb;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "workerJustifications" jsonb;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "finalDecision" jsonb;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_mainAddressId_addresses_id_fk" FOREIGN KEY ("mainAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_correspondenceAddressId_addresses_id_fk" FOREIGN KEY ("correspondenceAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_businessAddressId_addresses_id_fk" FOREIGN KEY ("businessAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_subjectId_subjects_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;