import { NextRequest, NextResponse } from "next/server";
import { getCaseById } from "@/lib/store/cases";
import { mapCaseToKartaWypadku } from "@/lib/karta-wypadku/mapCaseToKartaWypadku";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("caseId");

  if (!caseId) {
    return NextResponse.json(
      { error: "Brak parametru caseId" },
      { status: 400 }
    );
  }

  const caseData = getCaseById(caseId);

  if (!caseData) {
    return NextResponse.json(
      { error: "Nie znaleziono sprawy o podanym ID" },
      { status: 404 }
    );
  }

  if (!caseData.aiOpinion) {
    return NextResponse.json(
      { error: "Brak opinii AI dla tej sprawy. Nie można wygenerować danych do karty wypadku." },
      { status: 400 }
    );
  }

  try {
    const kartaWypadkuData = mapCaseToKartaWypadku(caseData);
    
    return NextResponse.json({
      success: true,
      data: kartaWypadkuData,
      caseId: caseId,
    });
  } catch (error) {
    console.error("Error mapping case to karta wypadku:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Błąd podczas mapowania danych" },
      { status: 500 }
    );
  }
}

