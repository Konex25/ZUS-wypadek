import { NextRequest, NextResponse } from "next/server";
import {
  getCases,
  getCaseById,
  addCase,
  updateCase,
  generateCaseId,
  generateDocumentId,
} from "@/lib/store/cases";
import { Case, UploadedDocument, CaseUploadResponse } from "@/types";
import openai from "@/lib/openai/openai";
import { PROMPT } from "./prompt";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("id");

  if (caseId) {
    const caseData = getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    return NextResponse.json({ case: caseData });
  }

  const cases = getCases();
  return NextResponse.json({ cases });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    // Fallback for single file upload (backwards compatibility)
    const singleFile = formData.get("file") as File | null;
    if (singleFile && files.length === 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json<CaseUploadResponse>(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate all file types
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json<CaseUploadResponse>(
          {
            success: false,
            error: `Invalid file type: ${file.type} (${file.name}). Allowed: JPEG, PNG, WEBP, GIF, PDF`,
          },
          { status: 400 }
        );
      }
    }

    // Create document entries for all files
    const documents: UploadedDocument[] = files.map((file) => ({
      id: generateDocumentId(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    // Create case with documents
    const newCase: Case = {
      id: generateCaseId(),
      createdAt: new Date().toISOString(),
      status: "processing",
      documents,
    };

    addCase(newCase);

    // Process case with AI in background
    processCaseWithAI(newCase.id, files);

    return NextResponse.json<CaseUploadResponse>({
      success: true,
      case: newCase,
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json<CaseUploadResponse>(
      { success: false, error: "Failed to create case" },
      { status: 500 }
    );
  }
}

// Process case documents with OpenAI
async function processCaseWithAI(caseId: string, files: File[]) {
  try {
    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    // Upload all files to OpenAI
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const createdFile = await openai!.files.create({
          file,
          purpose: "assistants",
        });
        return createdFile;
      })
    );

    console.log(
      "Uploaded files to OpenAI:",
      uploadedFiles.map((f) => ({ id: f.id, filename: f.filename }))
    );

    // Build content array with text and all files
    const contentItems: Array<
      | { type: "input_text"; text: string }
      | { type: "input_file"; file_id: string }
    > = [
      { type: "input_text", text: PROMPT },
      ...uploadedFiles.map((file) => ({
        type: "input_file" as const,
        file_id: file.id,
      })),
    ];

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: contentItems,
        },
      ],
    });

    const opinionText = response.output_text || "";
    console.log("AI Opinion:", opinionText);

    // Update case with AI opinion
    updateCase(caseId, {
      status: "completed",
      aiOpinion: opinionText,
    });
  } catch (error) {
    console.error("Error processing case with AI:", error);
    updateCase(caseId, {
      status: "error",
      error: error instanceof Error ? error.message : "AI processing failed",
    });
  }
}
