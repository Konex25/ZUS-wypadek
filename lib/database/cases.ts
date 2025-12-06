import { addressesTable, casesTable, subjectsTable } from "@/db/schema";
import { database } from "./database";
import { eq } from "drizzle-orm";

export const getCases = async () => {
  const result = await database
    .select()
    .from(casesTable)
    .innerJoin(subjectsTable, eq(casesTable.subjectId, subjectsTable.id))
    .execute();

  return result.map((row) => ({
    id: row.cases.id,
    createdAt: row.cases.createdAt,
    updatedAt: row.cases.updatedAt,
    status: row.cases.status,
    resolvedAt: row.cases.resolvedAt,
    subject: {
      id: row.subjects.id,
      name: row.subjects.name,
      surname: row.subjects.surname,
      pesel: row.subjects.pesel,
    },
  }));
};

export const getCaseById = async (id: string) => {
  const results = await database
    .select()
    .from(casesTable)
    .innerJoin(subjectsTable, eq(casesTable.subjectId, subjectsTable.id))
    .where(eq(casesTable.id, id))
    .execute();

  const result = results[0];
  if (!result) {
    return undefined;
  }

  const mainAddress = await getAddressById(result.subjects.mainAddressId);
  const correspondenceAddress = await getAddressById(
    result.subjects.correspondenceAddressId
  );
  const businessAddress = await getAddressById(
    result.subjects.businessAddressId
  );

  return {
    id: result.cases.id,
    mainAddress,
    correspondenceAddress,
    businessAddress,
    createdAt: result.cases.createdAt,
    updatedAt: result.cases.updatedAt,
    status: result.cases.status,
    resolvedAt: result.cases.resolvedAt,
    subject: {
      id: result.subjects.id,
      name: result.subjects.name,
      surname: result.subjects.surname,
      pesel: result.subjects.pesel,
    },
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
