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
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subjectId" uuid,
	"status" "caseStatuses" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp,
	"fileIds" text[],
	"aiResponse" jsonb,
	"aiDecision" jsonb,
	"aiJustifications" jsonb,
	"workerJustifications" jsonb,
	"finalDecision" jsonb
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"nip" text,
	"regon" text,
	"documentId" text NOT NULL,
	"documentType" text NOT NULL,
	"mainAddressId" uuid,
	"correspondenceAddressId" uuid,
	"businessAddressId" uuid
);
--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_mainAddressId_addresses_id_fk" FOREIGN KEY ("mainAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_correspondenceAddressId_addresses_id_fk" FOREIGN KEY ("correspondenceAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_businessAddressId_addresses_id_fk" FOREIGN KEY ("businessAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;