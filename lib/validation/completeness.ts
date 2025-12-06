import { AccidentReport } from "@/types";

export interface MissingElement {
  step: number;
  stepName: string;
  field: string;
  fieldName: string;
  required: boolean;
  priority: "high" | "medium" | "low";
}

/**
 * Wykrywa brakujące elementy w formularzu
 */
export function detectMissingElements(
  formData: Partial<AccidentReport>
): MissingElement[] {
  const missing: MissingElement[] = [];

  // Krok 0: Rodzaj zgłoszenia
  if (!formData.notificationType) {
    missing.push({
      step: 0,
      stepName: "Wybór rodzaju zgłoszenia",
      field: "notificationType",
      fieldName: "Rodzaj zgłoszenia",
      required: true,
      priority: "high",
    });
  }

  // Krok 1: Dane osobowe
  if (!formData.personalData) {
    missing.push({
      step: 1,
      stepName: "Dane osobowe",
      field: "personalData",
      fieldName: "Wszystkie dane osobowe",
      required: true,
      priority: "high",
    });
  } else {
    const pd = formData.personalData;
    if (!pd.pesel) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.pesel",
        fieldName: "PESEL",
        required: true,
        priority: "high",
      });
    }
    if (!pd.firstName) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.firstName",
        fieldName: "Imię",
        required: true,
        priority: "high",
      });
    }
    if (!pd.lastName) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.lastName",
        fieldName: "Nazwisko",
        required: true,
        priority: "high",
      });
    }
    if (!pd.dateOfBirth) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.dateOfBirth",
        fieldName: "Data urodzenia",
        required: true,
        priority: "high",
      });
    }
    if (!pd.placeOfBirth) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.placeOfBirth",
        fieldName: "Miejsce urodzenia",
        required: true,
        priority: "high",
      });
    }
    if (!pd.phone) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.phone",
        fieldName: "Numer telefonu",
        required: true,
        priority: "high",
      });
    }
    if (!pd.idDocument?.number) {
      missing.push({
        step: 1,
        stepName: "Dane osobowe",
        field: "personalData.idDocument.number",
        fieldName: "Numer dokumentu tożsamości",
        required: true,
        priority: "high",
      });
    }
  }

  // Krok 2: Adresy
  if (!formData.addresses) {
    missing.push({
      step: 2,
      stepName: "Adresy",
      field: "addresses",
      fieldName: "Wszystkie adresy",
      required: true,
      priority: "high",
    });
  } else {
    const addr = formData.addresses;
    if (!addr.residentialAddress?.street) {
      missing.push({
        step: 2,
        stepName: "Adresy",
        field: "addresses.residentialAddress.street",
        fieldName: "Ulica (adres zamieszkania)",
        required: true,
        priority: "high",
      });
    }
    if (!addr.residentialAddress?.city) {
      missing.push({
        step: 2,
        stepName: "Adresy",
        field: "addresses.residentialAddress.city",
        fieldName: "Miejscowość (adres zamieszkania)",
        required: true,
        priority: "high",
      });
    }
    if (!addr.businessAddress?.street) {
      missing.push({
        step: 2,
        stepName: "Adresy",
        field: "addresses.businessAddress.street",
        fieldName: "Ulica (adres działalności)",
        required: true,
        priority: "high",
      });
    }
    if (!addr.businessAddress?.city) {
      missing.push({
        step: 2,
        stepName: "Adresy",
        field: "addresses.businessAddress.city",
        fieldName: "Miejscowość (adres działalności)",
        required: true,
        priority: "high",
      });
    }
  }

  // Krok 4: Dane o wypadku
  if (!formData.accidentData) {
    missing.push({
      step: 4,
      stepName: "Dane o wypadku",
      field: "accidentData",
      fieldName: "Wszystkie dane o wypadku",
      required: true,
      priority: "high",
    });
  } else {
    const ad = formData.accidentData;
    if (!ad.accidentDate) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.accidentDate",
        fieldName: "Data wypadku",
        required: true,
        priority: "high",
      });
    }
    if (!ad.accidentPlace) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.accidentPlace",
        fieldName: "Miejsce wypadku",
        required: true,
        priority: "high",
      });
    }
    if (!ad.injuryType) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.injuryType",
        fieldName: "Rodzaj urazów",
        required: true,
        priority: "high",
      });
    }
    if (!ad.detailedCircumstancesDescription) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.detailedCircumstancesDescription",
        fieldName: "Szczegółowy opis okoliczności",
        required: true,
        priority: "high",
      });
    }
    if (!ad.detailedCausesDescription) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.detailedCausesDescription",
        fieldName: "Szczegółowy opis przyczyn",
        required: true,
        priority: "high",
      });
    }
    // Weryfikacja elementów definicji
    if (!ad.suddenness?.confirmed || !ad.suddenness?.description) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.suddenness",
        fieldName: "Weryfikacja nagłości zdarzenia",
        required: true,
        priority: "high",
      });
    }
    if (!ad.externalCause?.confirmed || !ad.externalCause?.description) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.externalCause",
        fieldName: "Weryfikacja przyczyny zewnętrznej",
        required: true,
        priority: "high",
      });
    }
    if (!ad.injury?.confirmed || !ad.injury?.type) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.injury",
        fieldName: "Weryfikacja urazu",
        required: true,
        priority: "high",
      });
    }
    if (!ad.workRelation?.description) {
      missing.push({
        step: 4,
        stepName: "Dane o wypadku",
        field: "accidentData.workRelation",
        fieldName: "Weryfikacja związku z pracą",
        required: true,
        priority: "high",
      });
    }
  }

  // Krok 6: Wyjaśnienia (jeśli wybrano)
  if (
    (formData.notificationType === "wyjasnienia" ||
      formData.notificationType === "oba") &&
    !formData.victimStatement
  ) {
    missing.push({
      step: 6,
      stepName: "Szczegółowe wyjaśnienia",
      field: "victimStatement",
      fieldName: "Wyjaśnienia poszkodowanego",
      required: true,
      priority: "medium",
    });
  }

  // Krok 8: Załączniki
  if (!formData.responseDeliveryMethod) {
    missing.push({
      step: 8,
      stepName: "Załączniki",
      field: "responseDeliveryMethod",
      fieldName: "Sposób odbioru odpowiedzi",
      required: true,
      priority: "high",
    });
  }
  if (!formData.signatureDate) {
    missing.push({
      step: 8,
      stepName: "Załączniki",
      field: "signatureDate",
      fieldName: "Data podpisu",
      required: true,
      priority: "high",
    });
  }

  return missing;
}

/**
 * Sprawdza kompletność formularza dla danego kroku
 */
export function getStepCompleteness(
  formData: Partial<AccidentReport>,
  stepIndex: number
): {
  isComplete: boolean;
  missingCount: number;
  missingElements: MissingElement[];
} {
  // Jeśli formData jest puste (brak notificationType), wszystkie kroki są nieuzupełnione
  if (!formData || Object.keys(formData).length === 0 || !formData.notificationType) {
    return {
      isComplete: false,
      missingCount: stepIndex === 0 ? 1 : 999, // Krok 0 wymaga notificationType
      missingElements: stepIndex === 0 ? [{
        step: 0,
        stepName: "Wybór rodzaju zgłoszenia",
        field: "notificationType",
        fieldName: "Rodzaj zgłoszenia",
        required: true,
        priority: "high",
      }] : [],
    };
  }

  const allMissing = detectMissingElements(formData);
  const stepMissing = allMissing.filter((m) => m.step === stepIndex);

  return {
    isComplete: stepMissing.length === 0,
    missingCount: stepMissing.length,
    missingElements: stepMissing,
  };
}

/**
 * Oblicza procent uzupełnienia formularza na podstawie uzupełnionych kroków
 * Używa tej samej logiki co ProgressBar dla spójności
 */
export function getFormCompletionPercentage(
  formData: Partial<AccidentReport>
): number {
  // Lista wszystkich kroków (0-8)
  const totalSteps = 9;
  let completedSteps = 0;

  // Sprawdź każdy krok
  for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
    const completeness = getStepCompleteness(formData, stepIndex);
    if (completeness.isComplete) {
      completedSteps++;
    }
  }

  return Math.round((completedSteps / totalSteps) * 100);
}

