export const SYSTEM_JSON_PROMPT = `
You are part of a bigger system, and you must always respond with a pure JSON response. The system will break if you don't.
Return valid raw JSON only. Begin your response with {`;

export const DIFFERENCES_PROMPT = `
Porównaj wszystkie dostarczone dokumenty i wskaż różnice dotyczące okoliczności, szczególnie skupiając się na datach zdarzenia lub wypadku. Zweryfikuj, czy data wypadku jest spójna we wszystkich dokumentach, zwłaszcza pomiędzy oświadczeniem poszkodowanego, opinią lekarską oraz ewentualnymi zeznaniami świadków. Jeśli występują jakiekolwiek rozbieżności dotyczące daty wypadku lub innych kluczowych szczegółów, dokładnie je wskaż i zidentyfikuj w których dokumentach występują. Podkreśl również, czy opinia lekarska i opinie świadków są zgodne ze zgłoszeniem poszkodowanego – jeżeli nie, wskaż dokładne różnice i dokumenty, których dotyczą.
Zwróć odpowiedź w czystym formacie JSON według następującego schematu:
{
  "differences": [
    {
      "field": "data wypadku",
      "details": "Opis rozbieżności, w których dokumentach występują różne daty",
      "documents": ["Dokument 1", "Dokument 2"]
    },
    {
      "field": "zgodność opinii",
      "details": "Opis różnic pomiędzy opinią lekarską/świadków a zeznaniem poszkodowanego",
      "documents": ["Dokument X", "Dokument Y"]
    }
    // ...inne wykryte różnice, jeśli róznic nie ma lub są marginalne, zwróć pustą tablicę
  ],
  "allDatesConsistent": true/false,
  "allStatementsConsistent": true/false,
  "summary": "Podsumowanie głównych różnic lub informacja o pełnej zgodności.",
  "isInGeneralConsistent": true/false
}

**WAŻNE:**
- Opieraj się WYŁĄCZNIE na informacjach z dostarczonych w formacie JSON
- Jeśli brakuje jakichś danych, zaznacz to wyraźnie
- Nie wymyślaj faktów - jeśli czegoś nie ma w dokumentach, napisz "brak informacji"
- Bądź obiektywny i bezstronny
`;
