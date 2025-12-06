import { NextRequest, NextResponse } from "next/server";
import { getCaseById } from "@/lib/store/cases";
import { generateAccidentCard } from "@/lib/pdf/generateAccidentCard";

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

  if (caseData.status !== "completed") {
    return NextResponse.json(
      { error: "Sprawa nie została jeszcze przetworzona. Poczekaj na zakończenie analizy." },
      { status: 400 }
    );
  }

  if (!caseData.aiOpinion) {
    return NextResponse.json(
      { error: "Brak opinii AI dla tej sprawy. Nie można wygenerować karty wypadku." },
      { status: 400 }
    );
  }

  try {
    console.log(`Generating accident card for case: ${caseId}`);
    
    const pdfBytes = await generateAccidentCard(caseData);
    
    console.log(`Accident card generated successfully, size: ${pdfBytes.length} bytes`);

    const date = new Date().toISOString().split("T")[0];
    const filename = `karta-wypadku-${caseId}-${date}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("Error generating accident card:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Błąd podczas generowania karty wypadku" },
      { status: 500 }
    );
  }
}

