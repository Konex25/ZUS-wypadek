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
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  nip: text("nip"),
  regon: text("regon"),
  pesel: text("pesel").notNull(),
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
  data: bytea("data").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const casesTable = pgTable("cases", {
  id: uuid("id").primaryKey(),
  subjectId: uuid("subjectId").references(() => subjectsTable.id),
  status: caseStatuses("status").notNull().default("PENDING"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  fileIds: text("fileIds").array(),

  aiResponse: jsonb("aiResponse"),
  aiDecision: jsonb("aiDecision"),
  aiJustifications: jsonb("aiJustifications"),

  workerJustifications: jsonb("workerJustifications"),

  finalDecision: jsonb("finalDecision"),
});
