import { AccidentReport } from "@/types";

/**
 * Funkcja pomocnicza do debugowania mapowania pól
 * Zwraca listę wszystkich wartości, które będą przypisane do pól PDF
 */
export function debugFieldMapping(formData: Partial<AccidentReport>) {
  const results: Array<{ field: string; value: string; source: string }> = [];

  // Sprawdź dane poszkodowanego
  if (formData.personalData) {
    results.push({
      field: "Page1[0].PESEL[0]",
      value: formData.personalData.pesel || "",
      source: "personalData.pesel"
    });
    results.push({
      field: "Page1[0].Imię[0]",
      value: formData.personalData.firstName || "",
      source: "personalData.firstName"
    });
    results.push({
      field: "Page1[0].Nazwisko[0]",
      value: formData.personalData.lastName || "",
      source: "personalData.lastName"
    });
  }

  // Sprawdź dane osoby zawiadamiającej
  if (formData.representativeData) {
    results.push({
      field: "Page2[0].PESEL2[0]",
      value: formData.representativeData.pesel || "",
      source: "representativeData.pesel"
    });
    results.push({
      field: "Page2[0].Imię2[0]",
      value: formData.representativeData.firstName || "",
      source: "representativeData.firstName"
    });
    results.push({
      field: "Page2[0].Nazwisko2[0]",
      value: formData.representativeData.lastName || "",
      source: "representativeData.lastName"
    });
  } else {
    // Jeśli nie ma osoby zawiadamiającej, sprawdź czy dane poszkodowanego są w Page2
    if (formData.personalData) {
      results.push({
        field: "Page2[0].Imię[0]",
        value: formData.personalData.firstName || "",
        source: "personalData.firstName (bo brak representativeData)"
      });
      results.push({
        field: "Page2[0].Nazwisko[0]",
        value: formData.personalData.lastName || "",
        source: "personalData.lastName (bo brak representativeData)"
      });
      results.push({
        field: "Page2[0].PESEL[0]",
        value: formData.personalData.pesel || "",
        source: "personalData.pesel (bo brak representativeData)"
      });
    }
  }

  return results;
}

