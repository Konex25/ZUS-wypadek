import { NextRequest, NextResponse } from "next/server";
import { getPDFFormFields } from "@/lib/pdf/fillTemplate";
import path from "path";

/**
 * Endpoint do debugowania - zwraca listę pól w szablonie PDF
 * Użyj tego, aby sprawdzić jakie pola są w Twoim szablonie PDF
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get("template") || "zawiadomienie-wypadek.pdf";
    
    const templatePath = path.join(process.cwd(), "public", "templates", templateName);
    
    const fields = await getPDFFormFields(templatePath);
    
    return NextResponse.json({
      template: templateName,
      fields,
      count: fields.length,
    });
  } catch (error: any) {
    console.error("Błąd podczas odczytywania pól PDF:", error);
    return NextResponse.json(
      { 
        error: error.message || "Błąd podczas odczytywania pól PDF",
        hint: "Upewnij się, że szablon PDF znajduje się w folderze public/templates/"
      },
      { status: 500 }
    );
  }
}



