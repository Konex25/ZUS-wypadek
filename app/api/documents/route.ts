import { NextRequest, NextResponse } from "next/server";
import {
  getDocuments,
  addDocument,
  updateDocument,
  generateDocumentId,
} from "@/lib/store/documents";
import { UploadedDocument, DocumentUploadResponse } from "@/types";
import openai from "@/lib/openai/openai";

export async function GET() {
  const documents = getDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<DocumentUploadResponse>(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    } // Validate file type (allow common document types)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json<DocumentUploadResponse>(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: PDF, JPEG, PNG, WEBP, DOC, DOCX`,
        },
        { status: 400 }
      );
    }

    // Create document entry with pending status
    const document: UploadedDocument = {
      id: generateDocumentId(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      status: "processing",
    };

    addDocument(document); // Simulate AI processing (will be replaced with actual AI endpoint call)
    // For now, just mark as completed after a short delay
    console.log(file);
    await processDocumentWithAI(document.id, file);

    return NextResponse.json<DocumentUploadResponse>({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json<DocumentUploadResponse>(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// Placeholder for AI processing - will call actual AI endpoint later
async function processDocumentWithAI(documentId: string, file: File) {
  try {
    // TODO: Send file to AI processing endpoint
    // const aiResponse = await fetch('/api/ai/process', { ... });
    // const aiResult = await aiResponse.json();

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    console.log(base64);
    const createdFile = await openai.files.create({
      file,
      purpose: "user_data",
    });

    console.log(createdFile.id);

    const response = await openai.responses.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze the following document and extract the data.",
            },
            {
              type: "input_file",
              file_id: createdFile.id,
            },
          ],
        },
      ],
    });

    console.log(response.output_text);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock AI result for now
    const mockAiResult = {
      processed: true,
      extractedData: {
        documentType: "unknown",
        confidence: 0,
        message: "AI processing not yet implemented",
      },
    };

    updateDocument(documentId, {
      status: "completed",
      aiResult: mockAiResult,
    });
  } catch (error) {
    console.error("Error processing document with AI:", error);
    updateDocument(documentId, {
      status: "error",
      error: "AI processing failed",
    });
  }
}
