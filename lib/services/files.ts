import { fileTable, NewFile } from "@/db/schema";
import { insertFileForAnalysis } from "../analyser/files";
import { database } from "../database/database";

export const createFile = async (file: File): Promise<string> => {
  const aiFileId = await insertFileForAnalysis(file);

  const fileData: NewFile = {
    id: aiFileId,
    data: Buffer.from(await file.arrayBuffer()),
    name: file.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await database.insert(fileTable).values(fileData);

  return fileData.id;
};
