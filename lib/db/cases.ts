import { prisma } from './prisma'
import { Case, UploadedDocument } from '@/types'

export async function getCases(): Promise<Case[]> {
  const cases = await prisma.case.findMany({
    include: {
      documents: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return cases.map(caseToCaseType)
}

export async function getCaseById(id: string): Promise<Case | undefined> {
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      documents: true,
    },
  })

  if (!caseData) return undefined
  return caseToCaseType(caseData)
}

export async function addCase(newCase: Case): Promise<Case> {
  const { documents, ...caseData } = newCase

  const created = await prisma.case.create({
    data: {
      id: caseData.id,
      status: caseData.status,
      nip: caseData.nip || null,
      error: caseData.error || null,
      aiOpinion: caseData.aiOpinion ? JSON.parse(JSON.stringify(caseData.aiOpinion)) : null,
      differences: caseData.differences ? JSON.parse(JSON.stringify(caseData.differences)) : null,
      createdAt: new Date(caseData.createdAt),
      documents: {
        create: documents.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          uploadedAt: new Date(doc.uploadedAt),
        })),
      },
    },
    include: {
      documents: true,
    },
  })

  return caseToCaseType(created)
}

export async function updateCase(
  id: string,
  updates: Partial<Case>
): Promise<Case | undefined> {
  const { documents, ...caseUpdates } = updates

  try {
    const updated = await prisma.case.update({
      where: { id },
      data: {
        ...(caseUpdates.status && { status: caseUpdates.status }),
        ...(caseUpdates.nip !== undefined && { nip: caseUpdates.nip || null }),
        ...(caseUpdates.error !== undefined && { error: caseUpdates.error || null }),
        ...(caseUpdates.aiOpinion && { 
          aiOpinion: JSON.parse(JSON.stringify(caseUpdates.aiOpinion)) 
        }),
        ...(caseUpdates.differences && { 
          differences: JSON.parse(JSON.stringify(caseUpdates.differences)) 
        }),
        ...(documents && {
          documents: {
            deleteMany: {},
            create: documents.map(doc => ({
              id: doc.id,
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              mimeType: doc.mimeType,
              uploadedAt: new Date(doc.uploadedAt),
            })),
          },
        }),
      },
      include: {
        documents: true,
      },
    })

    return caseToCaseType(updated)
  } catch (error) {
    console.error('Error updating case:', error)
    return undefined
  }
}

export async function deleteCase(id: string): Promise<boolean> {
  try {
    await prisma.case.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting case:', error)
    return false
  }
}

// Helper: Prisma model → Case type
function caseToCaseType(dbCase: any): Case {
  return {
    id: dbCase.id,
    createdAt: dbCase.createdAt.toISOString(),
    status: dbCase.status as Case['status'],
    nip: dbCase.nip || undefined,
    fileIds: [], // Deprecated, ale zachowane dla kompatybilności
    documents: dbCase.documents.map((doc: any) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
    aiOpinion: dbCase.aiOpinion as Case['aiOpinion'],
    differences: dbCase.differences as Case['differences'],
    error: dbCase.error || undefined,
  }
}

// Helper functions (zachowane dla kompatybilności)
export function generateCaseId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ZUS-${year}${month}-${random}`
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

