import { addressesTable, casesTable, subjectsTable } from "@/db/schema";
import { database } from "./database";
import { eq } from "drizzle-orm";

export const getCases = async () => {
  // Use leftJoin instead of innerJoin to include cases even if subject is missing
  const result = await database
    .select()
    .from(casesTable)
    .leftJoin(subjectsTable, eq(casesTable.subjectId, subjectsTable.id))
    .execute();

  return result.map((row) => ({
    id: row.cases.id,
    createdAt: row.cases.createdAt,
    updatedAt: row.cases.updatedAt,
    status: row.cases.status,
    resolvedAt: row.cases.resolvedAt,
    fileIds: row.cases.fileIds,
    subject: row.subjects
      ? {
          id: row.subjects.id,
          name: row.subjects.name,
          surname: row.subjects.surname,
        }
      : null,
  }));
};

export const getCaseById = async (id: string) => {
  const results = await database
    .select()
    .from(casesTable)
    .leftJoin(subjectsTable, eq(casesTable.subjectId, subjectsTable.id))
    .where(eq(casesTable.id, id))
    .execute();

  const result = results[0];
  if (!result) {
    return undefined;
  }

  const mainAddress = result.subjects
    ? await getAddressById(result.subjects.mainAddressId)
    : undefined;
  const correspondenceAddress = result.subjects
    ? await getAddressById(result.subjects.correspondenceAddressId)
    : undefined;
  const businessAddress = result.subjects
    ? await getAddressById(result.subjects.businessAddressId)
    : undefined;

  return {
    id: result.cases.id,
    mainAddress,
    correspondenceAddress,
    businessAddress,
    createdAt: result.cases.createdAt,
    updatedAt: result.cases.updatedAt,
    status: result.cases.status,
    resolvedAt: result.cases.resolvedAt,
    fileIds: result.cases.fileIds,
    aiResponse: result.cases.aiResponse,
    aiDecision: result.cases.aiDecision,
    aiJustifications: result.cases.aiJustifications,
    workerJustifications: result.cases.workerJustifications,
    finalDecision: result.cases.finalDecision,
    subject: result.subjects
      ? {
          id: result.subjects.id,
          name: result.subjects.name,
          surname: result.subjects.surname,
        }
      : null,
  };
};

const getAddressById = async (id?: string | null) => {
  if (!id) {
    return undefined;
  }

  const result = await database
    .select()
    .from(addressesTable)
    .where(eq(addressesTable.id, id))
    .execute();

  return result[0];
};
