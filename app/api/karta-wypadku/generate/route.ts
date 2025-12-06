import { NextRequest, NextResponse } from "next/server";
import { generateKartaWypadkuHTML } from "@/lib/karta-wypadku/generateDocument";
import { KartaWypadku } from "@/types/karta-wypadku";

export async function POST(request: NextRequest) {
  try {
    const data: KartaWypadku = await request.json();

    // Walidacja podstawowa
    if (!data.daneIdentyfikacyjnePoszkodowanego?.imieNazwisko) {
      return NextResponse.json(
        { error: "Brak wymaganych danych poszkodowanego" },
        { status: 400 }
      );
    }

    // Generuj HTML
    const html = generateKartaWypadkuHTML(data);

    // Zwróć HTML jako odpowiedź
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="karta-wypadku-${new Date().toISOString().split("T")[0]}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Błąd podczas generowania dokumentu" },
      { status: 500 }
    );
  }
}

