import { NextRequest, NextResponse } from "next/server";
import { generateWyjasnieniaHTML } from "@/lib/wyjasnienia/generateDocument";
import { AccidentReport } from "@/types";

/**
 * Endpoint zwracający HTML dokumentu wyjaśnień poszkodowanego
 * Konwersja na PDF powinna być wykonana po stronie klienta
 * używając funkcji generateWyjasnieniaPDF
 */
export async function POST(request: NextRequest) {
  try {
    const data: Partial<AccidentReport> = await request.json();

    // Walidacja podstawowa
    if (!data.personalData) {
      return NextResponse.json(
        { error: "Brak wymaganych danych poszkodowanego" },
        { status: 400 }
      );
    }

    // Generuj HTML
    const html = generateWyjasnieniaHTML(data);

    // Zwróć HTML jako odpowiedź
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="zapis-wyjasnien-${new Date().toISOString().split("T")[0]}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating wyjasnienia document:", error);
    return NextResponse.json(
      { error: "Błąd podczas generowania dokumentu" },
      { status: 500 }
    );
  }
}
