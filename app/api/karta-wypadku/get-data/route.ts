import { NextRequest, NextResponse } from "next/server";
import { getCaseById } from "@/lib/database/cases";
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

  const caseData = await getCaseById(caseId);

  if (!caseData) {
    return NextResponse.json(
      { error: "Nie znaleziono sprawy o podanym ID" },
      { status: 404 }
    );
  }

  try {
    const kartaWypadkuData = mapCaseToKartaWypadku(caseData as any);
    return NextResponse.json({
      success: true,
      data: kartaWypadkuData,
      caseId: caseId,
    });
  } catch (error) {
    console.error("Error mapping case to karta wypadku:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Błąd podczas mapowania danych",
      },
      { status: 500 }
    );
  }
}

