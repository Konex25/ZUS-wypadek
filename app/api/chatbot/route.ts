import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai/openai";

interface FieldContext {
  fieldName: string;
  fieldLabel: string;
  currentValue: string;
  fieldType?: "textarea" | "input" | "select";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, fieldContext } = body;

    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI nie jest skonfigurowane" },
        { status: 500 }
      );
    }

    // Build context-aware system prompt
    let systemPrompt = `Jesteś pomocnym asystentem formularza ZUS dotyczącego wypadków przy pracy. 
Twoim zadaniem jest pomagać użytkownikom w wypełnianiu formularzy poprzez:
1. Zadawanie pomocniczych pytań, które pomogą użytkownikowi lepiej zrozumieć, co powinien wpisać
2. Poprawianie błędów ortograficznych i gramatycznych w odpowiedziach użytkownika
3. Ulepszanie spójności odpowiedzi, zachowując oryginalną treść i znaczenie

WAŻNE ZASADY:
- Nie zmieniaj nadmiernie treści użytkownika - poprawiaj tylko błędy i ulepszaj spójność
- Zachowaj oryginalne znaczenie i kontekst
- Bądź pomocny, ale nie nachalny
- Odpowiadaj po polsku, w sposób przyjazny i zrozumiały
- Jeśli użytkownik prosi o poprawę tekstu, zwróć poprawioną wersję w formacie: SUGEROWANA_ODPOWIEDŹ: [poprawiony tekst]`;

    if (fieldContext) {
      const ctx: FieldContext = fieldContext;
      systemPrompt += `\n\nAKTUALNY KONTEKST POLA:
- Nazwa pola: ${ctx.fieldName}
- Etykieta: ${ctx.fieldLabel}
- Typ pola: ${ctx.fieldType || "textarea"}
- Aktualna wartość: ${ctx.currentValue || "(puste)"}

Pomóż użytkownikowi wypełnić to pole. Jeśli użytkownik prosi o pomocnicze pytania, zadaj 3-5 konkretnych pytań, które pomogą mu lepiej zrozumieć, co powinien wpisać.`;

      // Add field-specific guidance
      if (ctx.fieldName.includes("naglosc") || ctx.fieldLabel.toLowerCase().includes("nagłość")) {
        systemPrompt += `\n\nSPECJALNE WYTYCZNE DLA POLA NAGŁOŚCI:
Nagłość zdarzenia oznacza, że zdarzenie nastąpiło nagle, natychmiastowo lub w krótkim czasie (nie dłużej niż jedna dniówka robocza).
Pytania pomocnicze mogą dotyczyć:
- Czy zdarzenie nastąpiło natychmiastowo czy trwało jakiś czas?
- Jak długo trwało zdarzenie?
- Czy było to jednorazowe zdarzenie czy proces?
- Jakie były okoliczności czasowe zdarzenia?`;
      }

      if (ctx.fieldName.includes("okolicznosci") || ctx.fieldLabel.toLowerCase().includes("okoliczności")) {
        systemPrompt += `\n\nSPECJALNE WYTYCZNE DLA POLA OKOLICZNOŚCI:
Okoliczności wypadku powinny zawierać szczegółowy opis tego, co się stało, gdzie, kiedy i w jakich warunkach.
Pytania pomocnicze mogą dotyczyć:
- Co dokładnie się stało?
- Gdzie dokładnie nastąpił wypadek?
- Jakie były warunki w miejscu wypadku?
- Co robiłeś w momencie wypadku?
- Jakie były konsekwencje wypadku?`;
      }

      if (ctx.fieldName.includes("przyczyny") || ctx.fieldLabel.toLowerCase().includes("przyczyna")) {
        systemPrompt += `\n\nSPECJALNE WYTYCZNE DLA POLA PRZYCZYN:
Przyczyny wypadku powinny wyjaśniać, dlaczego doszło do wypadku.
Pytania pomocnicze mogą dotyczyć:
- Co bezpośrednio spowodowało wypadek?
- Czy były jakieś czynniki sprzyjające?
- Czy były jakieś zaniedbania lub błędy?
- Jakie warunki doprowadziły do wypadku?`;
      }
    }

    // Build conversation messages
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: message,
      },
    ];

    const response = await openai.responses.create({
      model: "gpt-5.1",
      input: messages,
    });

    const responseText = response.output_text || "Przepraszam, nie mogę teraz odpowiedzieć.";

    // Check if response contains a suggestion
    let suggestion: string | undefined;
    if (responseText.includes("SUGEROWANA_ODPOWIEDŹ:")) {
      suggestion = responseText
        .split("SUGEROWANA_ODPOWIEDŹ:")[1]
        .trim()
        .split("\n")[0]
        .trim();
    }

    return NextResponse.json({
      response: responseText,
      suggestion,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przetwarzania zapytania" },
      { status: 500 }
    );
  }
}
