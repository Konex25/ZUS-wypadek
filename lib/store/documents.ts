import { UploadedDocument } from "@/types";

// In-memory store for uploaded documents
// Will be replaced with proper database later
let documents: UploadedDocument[] = [];

export function getDocuments(): UploadedDocument[] {
  return [...documents];
}

export function getDocumentById(id: string): UploadedDocument | undefined {
  return documents.find((doc) => doc.id === id);
}

export function addDocument(document: UploadedDocument): void {
  documents.push(document);
}

export function updateDocument(
  id: string,
  updates: Partial<UploadedDocument>
): UploadedDocument | undefined {
  const index = documents.findIndex((doc) => doc.id === id);
  if (index === -1) return undefined;

  documents[index] = { ...documents[index], ...updates };
  return documents[index];
}

export function deleteDocument(id: string): boolean {
  const index = documents.findIndex((doc) => doc.id === id);
  if (index === -1) return false;

  documents.splice(index, 1);
  return true;
}

// Helper to generate unique IDs
export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

