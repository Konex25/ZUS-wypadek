import { Case, UploadedDocument } from "@/types";

// In-memory store for cases
// Will be replaced with proper database later
let cases: Case[] = [];

export function getCases(): Case[] {
  return [...cases];
}

export function getCaseById(id: string): Case | undefined {
  return cases.find((c) => c.id === id);
}

export function addCase(newCase: Case): void {
  cases.push(newCase);
}

export function updateCase(
  id: string,
  updates: Partial<Case>
): Case | undefined {
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  cases[index] = { ...cases[index], ...updates };
  return cases[index];
}

export function deleteCase(id: string): boolean {
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return false;

  cases.splice(index, 1);
  return true;
}

// Helper to generate unique IDs
export function generateCaseId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZUS-${year}${month}-${random}`;
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

