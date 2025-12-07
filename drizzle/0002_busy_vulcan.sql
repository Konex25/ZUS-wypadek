ALTER TABLE "subjects" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "surname" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "nip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "documentId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "documentType" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "pkd" text[];