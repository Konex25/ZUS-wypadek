import openai from "../openai/openai";

export const insertFileForAnalysis = async (file: File): Promise<string> => {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }

  const uploadedFile = await openai!.files.create({
    file,
    purpose: "assistants",
  });

  return uploadedFile.id;
};
