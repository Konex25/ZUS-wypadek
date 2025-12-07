import { NewFile } from "@/db/schema";
import { v4 } from "uuid";
import openai from "../openai/openai";
import { ANALYZE_FILES_FOR_CASE_PROMPT } from "./prompts";
import { EXTRACTION_PROMPT } from "./prompts/extraction";

export const analyzeFilesForCase = async (
  files: File[]
): Promise<NewFile[]> => {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }

  const uploadedFiles = await Promise.all(
    files.map(async (file) => analyzeAndCreateFile(file))
  );

  return uploadedFiles;
};

const analyzeAndCreateFile = async (file: File): Promise<NewFile> => {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }

  const uploadedFile = await openai!.files.create({
    file,
    purpose: "assistants",
  });

  const response = await openai.responses.create({
    model: "gpt-5.1",
    input: [
      {
        role: "system",
        content: ANALYZE_FILES_FOR_CASE_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "input_file",
            file_id: uploadedFile.id,
          },
          {
            type: "input_text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  return {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: JSON.parse(response.output_text),
    name: file.name,
  } satisfies NewFile;
};
