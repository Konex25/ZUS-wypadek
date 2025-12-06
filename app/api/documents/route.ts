import { NextRequest, NextResponse } from "next/server";
import {
  getDocuments,
  addDocument,
  updateDocument,
  generateDocumentId,
} from "@/lib/store/documents";
import { UploadedDocument } from "@/types";
import openai from "@/lib/openai/openai";
import { PROMPT } from "./prompt";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

interface MultiUploadResponse {
  success: boolean;
  documents?: UploadedDocument[];
  error?: string;
}

export async function GET() {
  const documents = getDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log(formData);
    const files = formData.getAll("files") as File[];

    // Fallback for single file upload (backwards compatibility)
    const singleFile = formData.get("file") as File | null;
    if (singleFile && files.length === 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json<MultiUploadResponse>(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate all file types
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json<MultiUploadResponse>(
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
      status: "processing" as const,
    }));

    // Add all documents to store
    documents.forEach((doc) => addDocument(doc));

    // Process all files together with AI
    processDocumentsWithAI(documents, files);

    return NextResponse.json<MultiUploadResponse>({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    return NextResponse.json<MultiUploadResponse>(
      { success: false, error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}

// Process multiple documents with OpenAI
async function processDocumentsWithAI(
  documents: UploadedDocument[],
  files: File[]
) {
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
      model: "gpt-5.1",
      input: [
        {
          role: "user",
          content: contentItems,
        },
      ],
    });

    const responseText = response.output_text || "";
    console.log("AI Response:", responseText);

    // Store the response as markdown
    const aiResult: Record<string, unknown> = {
      markdown: responseText,
      model: "gpt-4o",
      processedAt: new Date().toISOString(),
    };

    // Update all documents with the result
    documents.forEach((doc) => {
      updateDocument(doc.id, {
        status: "completed",
        aiResult,
      });
    });
  } catch (error) {
    console.error("Error processing documents with AI:", error);
    documents.forEach((doc) => {
      updateDocument(doc.id, {
        status: "error",
        error: error instanceof Error ? error.message : "AI processing failed",
      });
    });
  }
}
