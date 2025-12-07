import { NextRequest, NextResponse } from "next/server";
import qwen from "@/lib/openai/qwen";

interface DocumentDifferencesRequest {
  formData: any;
  analysisResult?: any;
}

const DIFFERENCES_PROMPT = `Jesteś ekspertem ds. analizy dokumentów i wykrywania niespójności. Przeanalizuj dostarczone dane i wskaż różnice oraz niespójności między dokumentami.

## Twoje zadanie:

Przeanalizuj dane dotyczące wypadku i wskaż:
1. **Niespójności w godzinach/datach** - czy godziny wypadku są spójne we wszystkich źródłach?
2. **Różnice w relacjach świadków** - czy relacje świadków są zgodne z opisem poszkodowanego?
3. **Niespójności w opisie okoliczności** - czy opisy wypadku są spójne?
4. **Różnice w danych osobowych** - czy dane poszkodowanego są spójne?
5. **Inne wykryte niespójności**

## Dane wejściowe:

{formData}

## Format odpowiedzi JSON:

{
  "differences": [
    {
      "field": "godzina wypadku",
      "details": "Szczegółowy opis niespójności - np. 'W dokumencie A godzina wypadku to 10:00, a w dokumencie B 10:30'",
      "documents": ["Dokument A", "Dokument B"],
      "severity": "high|medium|low"
    }
  ],
  "allDatesConsistent": true/false,
  "allStatementsConsistent": true/false,
  "allTimesConsistent": true/false,
  "summary": "Podsumowanie głównych różnic lub informacja o pełnej zgodności",
  "isInGeneralConsistent": true/false
}

**WAŻNE:**
- Bądź precyzyjny i szczegółowy
- Jeśli brakuje danych, zaznacz to wyraźnie
- Nie wymyślaj faktów - opieraj się tylko na dostarczonych danych
- Oznacz ważność każdej niespójności (high/medium/low)`;

export async function POST(request: NextRequest) {
  try {
    const body: DocumentDifferencesRequest = await request.json();

    if (!body.formData) {
      return NextResponse.json(
        { error: "Brakuje wymaganych danych" },
        { status: 400 }
      );
    }

    // Format form data for prompt
    const formDataText = JSON.stringify(body.formData, null, 2);

    // Build prompt
    const prompt = DIFFERENCES_PROMPT.replace("{formData}", formDataText);

    // Call AI for differences analysis
    const response = await qwen.chat.completions.create({
      model: "qwen2.5-72b-instruct",
      messages: [
        {
          role: "system",
          content:
            "Jesteś ekspertem ds. analizy dokumentów. Zawsze odpowiadaj w formacie JSON. Zacznij odpowiedź od {.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const aiResponse = response.choices[0]?.message?.content || "";

    // Parse AI response
    let differencesResult: any;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        differencesResult = JSON.parse(jsonMatch[0]);
      } else {
        differencesResult = {
          differences: [],
          allDatesConsistent: true,
          allStatementsConsistent: true,
          allTimesConsistent: true,
          summary: "Nie udało się przeanalizować odpowiedzi AI. Wymagana ręczna weryfikacja.",
          isInGeneralConsistent: true,
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return NextResponse.json(
        {
          error: "Błąd parsowania odpowiedzi AI",
          rawResponse: aiResponse,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(differencesResult);
  } catch (error: any) {
    console.error("Error in document differences analysis:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas analizy różnic między dokumentami" },
      { status: 500 }
    );
  }
}

