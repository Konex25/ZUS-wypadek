import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  customType,
  jsonb,
} from "drizzle-orm/pg-core";

export const addressesTable = pgTable("addresses", {
  id: uuid("id").primaryKey(),
  street: text("street").notNull(),
  houseNumber: text("houseNumber").notNull(),
  apartmentNumber: text("apartmentNumber"),
  city: text("city").notNull(),
  postalCode: text("postalCode").notNull(),
  country: text("country"),
});

export const subjectsTable = pgTable("subjects", {
  id: text("id").primaryKey(), // pesel,
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  nip: text("nip"),
  regon: text("regon"),
  documentId: text("documentId").notNull(),
  documentType: text("documentType").notNull(),
  mainAddressId: uuid("mainAddressId").references(() => addressesTable.id),
  correspondenceAddressId: uuid("correspondenceAddressId").references(
    () => addressesTable.id
  ),
  businessAddressId: uuid("businessAddressId").references(
    () => addressesTable.id
  ),
});

export type Subject = typeof subjectsTable.$inferSelect;
export type NewSubject = typeof subjectsTable.$inferInsert;

export const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const caseStatuses = pgEnum("caseStatuses", [
  "PENDING",
  "ACCEPTED",
  "FAILED",
]);

export const fileTable = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type File = typeof fileTable.$inferSelect;
export type NewFile = typeof fileTable.$inferInsert;

export const casesTable = pgTable("cases", {
  id: uuid("id").primaryKey(),
  subjectId: uuid("subjectId"),
  status: caseStatuses("status").notNull().default("PENDING"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
  fileIds: text("fileIds").array(),

  aiResponse: jsonb("aiResponse"),
  aiDecision: jsonb("aiDecision"),
  aiJustifications: jsonb("aiJustifications"),

  workerJustifications: jsonb("workerJustifications"),

  finalDecision: jsonb("finalDecision"),
});

export type Case = typeof casesTable.$inferSelect;
export type NewCase = typeof casesTable.$inferInsert;
