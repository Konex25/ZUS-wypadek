import { NextRequest, NextResponse } from "next/server";
import qwen from "@/lib/openai/qwen";

interface LegalQualificationRequest {
  accidentDescription: string;
  activitiesPerformed: string;
  pkdCodes: Array<{ code: string; description?: string }>;
  doctorOpinion?: {
    injuriesMatchDefinition: boolean;
    comment?: string;
  };
}

interface LegalQualificationResponse {
  shouldAccept: boolean;
  shortExplanation: string;
  pkdProbability: number; // 0-100
  detailedJustification: string;
  notes: string; // Information about missing data, required actions/documents
}

const LEGAL_QUALIFICATION_PROMPT = `Jesteś ekspertem ds. prawa pracy i ubezpieczeń społecznych specjalizującym się w kwalifikacji prawnej wypadków przy pracy.

## Twoje zadanie:

Na podstawie zebranego materiału dowodowego dokonaj prawnej kwalifikacji wypadku. Oceń czy zdarzenie spełnia łącznie wszystkie warunki podane w definicji wypadku przy pracy:

1. **Zdarzenie nagłe** - czy wypadek był nagły (nastąpił nagle, nie był długotrwałym procesem)?
2. **Przyczyna zewnętrzna** - czy wypadek został spowodowany przez przyczynę zewnętrzną (działanie siły zewnętrznej, czynnika zewnętrznego)?
3. **Uraz** - czy doprowadziło do urazu (uszkodzenia ciała, choroby)?
4. **Okres ubezpieczenia** - czy nastąpiło w okresie ubezpieczenia wypadkowego z tytułu prowadzenia działalności pozarolniczej?
5. **Zwykłe czynności** - czy nastąpiło podczas wykonywania zwykłych czynności związanych z działalnością?

## Dane wejściowe:

- Opis wypadku: {accidentDescription}
- Czynności wykonywane: {activitiesPerformed}
- Kody PKD: {pkdCodes}
- Opinia lekarza: {doctorOpinion}

## Format odpowiedzi JSON:

{
  "shouldAccept": true/false,
  "shortExplanation": "krótkie wyjaśnienie (2-3 zdania) dlaczego wniosek powinien/powinien zostać przyjęty lub odrzucony",
  "pkdProbability": 0-100,
  "detailedJustification": "szczegółowe uzasadnienie oceny każdego z 5 warunków definicji wypadku przy pracy, analiza zgodności czynności z kodami PKD, ocena opinii lekarza",
  "notes": "informacje o brakujących danych, jakie jeszcze czynności/dokumenty powinny być zrobione/dostarczone aby uzyskać dobrą decyzję, sugestie co można poprawić"
}

**WAŻNE:**
- Bądź precyzyjny i szczegółowy w uzasadnieniu
- Jeśli brakuje danych, wyraźnie to zaznacz w notes
- Prawdopodobieństwo PKD powinno odzwierciedlać jak bardzo czynności wykonywane podczas wypadku są zgodne z kodami PKD działalności
- Uwzględnij opinię lekarza w ocenie, ale nie traktuj jej jako jedynego kryterium`;

export async function POST(request: NextRequest) {
  try {
    const body: LegalQualificationRequest = await request.json();

    if (!body.accidentDescription || !body.activitiesPerformed) {
      return NextResponse.json(
        { error: "Brakuje wymaganych danych: opis wypadku i czynności wykonywane" },
        { status: 400 }
      );
    }

    // Format PKD codes for prompt
    const pkdCodesText = body.pkdCodes
      .map((pkd) => `${pkd.code}${pkd.description ? ` - ${pkd.description}` : ""}`)
      .join(", ");

    // Format doctor opinion for prompt
    const doctorOpinionText = body.doctorOpinion
      ? `Obrażenia ${body.doctorOpinion.injuriesMatchDefinition ? "wpisują się" : "NIE wpisują się"} w definicję wypadku przy pracy.${body.doctorOpinion.comment ? ` Komentarz: ${body.doctorOpinion.comment}` : ""}`
      : "Brak opinii lekarza";

    // Build prompt
    const prompt = LEGAL_QUALIFICATION_PROMPT
      .replace("{accidentDescription}", body.accidentDescription)
      .replace("{activitiesPerformed}", body.activitiesPerformed)
      .replace("{pkdCodes}", pkdCodesText || "Brak kodów PKD")
      .replace("{doctorOpinion}", doctorOpinionText);

    // Call AI for legal qualification
    const response = await qwen.chat.completions.create({
      model: "qwen2.5-72b-instruct",
      messages: [
        {
          role: "system",
          content:
            "Jesteś ekspertem ds. prawa pracy i ubezpieczeń społecznych. Zawsze odpowiadaj w formacie JSON. Zacznij odpowiedź od {.",
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
    let qualificationResult: LegalQualificationResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualificationResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        qualificationResult = {
          shouldAccept: true,
          shortExplanation: "Nie udało się przeanalizować odpowiedzi AI. Wymagana ręczna weryfikacja.",
          pkdProbability: 50,
          detailedJustification: aiResponse,
          notes: "Odpowiedź AI nie została poprawnie sparsowana. Wymagana ręczna analiza.",
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

    // Validate response structure
    if (
      typeof qualificationResult.shouldAccept !== "boolean" ||
      typeof qualificationResult.shortExplanation !== "string" ||
      typeof qualificationResult.pkdProbability !== "number" ||
      typeof qualificationResult.detailedJustification !== "string" ||
      typeof qualificationResult.notes !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Nieprawidłowa struktura odpowiedzi AI",
          received: qualificationResult,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(qualificationResult);
  } catch (error: any) {
    console.error("Error in legal qualification:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas kwalifikacji prawnej" },
      { status: 500 }
    );
  }
}

