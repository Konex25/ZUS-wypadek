import { getCaseById, updateCase } from "@/lib/store/cases";
import { NextResponse } from "next/server";
import { DIFFERENCES_PROMPT, SYSTEM_JSON_PROMPT } from "./prompt";
import openai from "@/lib/openai/openai";

export async function POST(request: Request) {
  const { caseId } = await request.json();
  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI client not initialized" },
      { status: 500 }
    );
  }

  const caseData = getCaseById(caseId);

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const differencesResponse = await openai.responses.create({
    model: "gpt-5.1",
    input: [
      {
        role: "system",
        content: SYSTEM_JSON_PROMPT,
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: DIFFERENCES_PROMPT },
          ...caseData.fileIds.map((fileId) => ({
            type: "input_file" as const,
            file_id: fileId,
          })),
        ],
      },
    ],
  });

  const differences = differencesResponse.output_text || "";
  const parsedDifferences = JSON.parse(differences);
  updateCase(caseId, { differences: parsedDifferences });

  return NextResponse.json({ differences: parsedDifferences });
}
