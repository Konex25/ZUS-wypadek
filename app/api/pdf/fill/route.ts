import { NextRequest, NextResponse } from "next/server";
import { fillNotificationTemplate, fillStatementTemplate } from "@/lib/pdf/fillTemplate";
import { AccidentReport } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, documentType } = body as {
      formData: Partial<AccidentReport>;
      documentType: "notification" | "statement";
    };

    console.log("=== API PDF Fill - Start ===");
    console.log("Document type:", documentType);
    console.log("Form data keys:", Object.keys(formData || {}));

    if (!formData) {
      console.error("Brak danych formularza");
      return NextResponse.json(
        { error: "Brak danych formularza" },
        { status: 400 }
      );
    }

    let pdfBytes: Uint8Array;

    if (documentType === "notification") {
      console.log("Wypełnianie szablonu zawiadomienia...");
      pdfBytes = await fillNotificationTemplate(formData);
      console.log("✓ Szablon zawiadomienia wypełniony, rozmiar:", pdfBytes.length, "bajtów");
    } else if (documentType === "statement") {
      console.log("Wypełnianie szablonu zapisu wyjaśnień...");
      pdfBytes = await fillStatementTemplate(formData);
      console.log("✓ Szablon zapisu wyjaśnień wypełniony, rozmiar:", pdfBytes.length, "bajtów");
    } else {
      console.error("Nieprawidłowy typ dokumentu:", documentType);
      return NextResponse.json(
        { error: "Nieprawidłowy typ dokumentu" },
        { status: 400 }
      );
    }

    // Zwróć PDF jako odpowiedź
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${documentType === "notification" ? "zawiadomienie-wypadek" : "zapis-wyjasnien"}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Błąd podczas wypełniania szablonu PDF:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas generowania PDF" },
      { status: 500 }
    );
  }
}

