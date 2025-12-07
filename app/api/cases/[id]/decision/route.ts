import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database/database";
import { casesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface UpdateDecisionRequest {
  decision: "ACCEPTED" | "FAILED" | "NEED_MORE_INFO";
  comment?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const body: UpdateDecisionRequest = await request.json();

    if (!body.decision) {
      return NextResponse.json(
        { error: "Brakuje wymaganej decyzji" },
        { status: 400 }
      );
    }

    // Map decision to status
    let status: "PROCESSING" | "ACCEPTED" | "FAILED" = "PROCESSING";
    if (body.decision === "ACCEPTED") {
      status = "ACCEPTED";
    } else if (body.decision === "FAILED") {
      status = "FAILED";
    } else if (body.decision === "NEED_MORE_INFO") {
      status = "PROCESSING"; // Keep in processing if more info needed
    }

    // Update case
    await database
      .update(casesTable)
      .set({
        status: status,
        finalDecision: {
          decision: body.decision,
          comment: body.comment || undefined,
          updatedAt: new Date().toISOString(),
        },
        resolvedAt: status === "ACCEPTED" || status === "FAILED" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId))
      .execute();

    return NextResponse.json({
      success: true,
      caseId: caseId,
      status: status,
      decision: body.decision,
    });
  } catch (error: any) {
    console.error("Error updating case decision:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas aktualizacji decyzji" },
      { status: 500 }
    );
  }
}

