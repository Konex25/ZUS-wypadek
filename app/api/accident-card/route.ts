import { NextRequest, NextResponse } from "next/server";
import { getCaseById } from "@/lib/database/cases";
import { generateAccidentCard } from "@/lib/pdf/generateAccidentCard";
import { AIOpinion, Case, Justification } from "@/types";

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

  if (caseData.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "Sprawa nie została jeszcze przetworzona. Poczekaj na zakończenie analizy." },
      { status: 400 }
    );
  }

  if (!caseData.aiDecision && !caseData.aiResponse) {
    return NextResponse.json(
      { error: "Brak danych AI dla tej sprawy. Nie można wygenerować karty wypadku." },
      { status: 400 }
    );
  }

  try {
    console.log(`Generating accident card for case: ${caseId}`);
    
    // Build aiOpinion from database data
    const aiResponse = caseData.aiResponse as any;
    const formData = aiResponse?.[0]?.data 
      ? (typeof aiResponse[0].data === 'string' ? JSON.parse(aiResponse[0].data) : aiResponse[0].data)
      : {};
    
    const accidentData = formData.accidentData || {};
    const aiJustifications = caseData.aiJustifications as Justification[] || [];
    
    const aiOpinion: AIOpinion = {
      date: accidentData.accidentDate || formData.date || "",
      place: accidentData.accidentPlace || formData.place || "",
      country: formData.country,
      description: accidentData.detailedCircumstancesDescription || formData.description || "",
      causes: accidentData.detailedCausesDescription || formData.causes || "",
      decision: (caseData.aiDecision as any) || "NEED_MORE_INFORMATION",
      justifications: aiJustifications,
      hasInjury: accidentData.injury?.confirmed || formData.hasInjury || false,
      injuryDescription: accidentData.injury?.type || formData.injuryDescription,
    };

    // Build documents array from fileIds
    const documents = (caseData.fileIds || []).map((fileId: string) => ({
      id: fileId,
      fileName: fileId, // Use fileId as fileName if we don't have the actual name
      fileSize: 0,
      mimeType: "application/pdf",
      uploadedAt: caseData.createdAt?.toISOString() || new Date().toISOString(),
    }));

    // Create Case object compatible with generateAccidentCard
    const caseForPdf: Case = {
      id: caseData.id,
      createdAt: caseData.createdAt?.toISOString() || new Date().toISOString(),
      status: "completed", // Frontend status
      fileIds: caseData.fileIds || [],
      documents,
      aiOpinion,
    };
    
    const pdfBytes = await generateAccidentCard(caseForPdf);
    
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

