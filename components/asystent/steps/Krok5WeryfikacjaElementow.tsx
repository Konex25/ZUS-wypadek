"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccidentData } from "@/types";

interface Krok5WeryfikacjaElementowProps {
  onNext: () => void;
  onPrevious: () => void;
  accidentData?: AccidentData;
}

interface ElementStatus {
  fulfilled: boolean;
  confidence: number;
  warnings: string[];
  details: string;
  compatibilityScore?: number;
  compatibilityReasoning?: string;
  isLoading?: boolean;
  error?: string;
}

interface CompatibilityResponse {
  compatibilityScore: number;
  compatibilityReasoning: string;
}

export const Krok5WeryfikacjaElementow: React.FC<Krok5WeryfikacjaElementowProps> =
  React.memo(({ onNext, onPrevious, accidentData }) => {
    const [verificationState, setVerificationState] = useState<{
      suddenness: ElementStatus;
      externalCause: ElementStatus;
      injury: ElementStatus;
      workRelation: ElementStatus;
    } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasVerified, setHasVerified] = useState(false);

    // Funkcja wywołująca API weryfikacji kompatybilności
    const checkCompatibility = async (
      question: string,
      answer: string
    ): Promise<CompatibilityResponse | null> => {
      try {
        const response = await fetch("/api/answer-compatibility", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        });

        if (!response.ok) {
          throw new Error("Błąd podczas weryfikacji kompatybilności");
        }

        const data: CompatibilityResponse = await response.json();
        return data;
      } catch (error) {
        console.error("Error checking compatibility:", error);
        return null;
      }
    };

    // Funkcje generujące pytania i odpowiedzi dla każdego elementu
    const getSuddennessQuestion = () =>
      "Czy zdarzenie było nagłe (natychmiastowe lub trwające maksymalnie 1 dzień) zgodnie z definicją wypadku przy pracy z art. 3 ustawy o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych?";

    const getSuddennessAnswer = () => {
      if (!accidentData?.suddenness) return "";
      return `Nagłość zdarzenia: ${
        accidentData.suddenness.confirmed
          ? "potwierdzona"
          : "nie potwierdzona"
      }. ${accidentData.suddenness.description || ""}${
        accidentData.suddenness.duration
          ? ` Czas trwania: ${accidentData.suddenness.duration}.`
          : ""
      }`;
    };

    const getExternalCauseQuestion = () =>
      "Czy uraz został spowodowany przez przyczynę zewnętrzną (maszyny, energia, temperatura, chemikalia, siły natury, warunki pracy) zgodnie z definicją wypadku przy pracy?";

    const getExternalCauseAnswer = () => {
      if (!accidentData?.externalCause) return "";
      const typeMap: Record<string, string> = {
        maszyny: "maszyny",
        energia: "energia",
        temperatura: "temperatura",
        chemikalia: "chemikalia",
        sily_natury: "siły natury",
        warunki_pracy: "warunki pracy",
        inne: "inne",
      };
      const typeText =
        typeMap[accidentData.externalCause.type] ||
        accidentData.externalCause.type ||
        "nie określono";
      return `Przyczyna zewnętrzna: ${
        accidentData.externalCause.confirmed
          ? "potwierdzona"
          : "nie potwierdzona"
      }. Typ: ${typeText}. ${accidentData.externalCause.description || ""}`;
    };

    const getInjuryQuestion = () =>
      "Czy doszło do urazu (uszkodzenia tkanek ciała lub narządów wskutek działania czynnika zewnętrznego) z potwierdzeniem dokumentacji medycznej zgodnie z definicją wypadku przy pracy?";

    const getInjuryAnswer = () => {
      if (!accidentData?.injury) return "";
      return `Uraz: ${
        accidentData.injury.confirmed ? "potwierdzony" : "nie potwierdzony"
      }. Rodzaj: ${
        accidentData.injury.type || "nie określono"
      }. Lokalizacja: ${
        accidentData.injury.location || "nie określono"
      }. Dokumentacja medyczna: ${
        accidentData.injury.medicalDocumentation ? "tak" : "nie"
      }.`;
    };

    const getWorkRelationQuestion = () =>
      "Czy wypadek ma związek z pracą w zakresie: związku przyczynowego, związku czasowego (w okresie ubezpieczenia), związku miejscowego i związku funkcjonalnego (zwykłe czynności związane z działalnością) zgodnie z definicją wypadku przy pracy?";

    const getWorkRelationAnswer = () => {
      if (!accidentData?.workRelation) return "";
      return `Związek z pracą: przyczynowy: ${
        accidentData.workRelation.causal ? "tak" : "nie"
      }, czasowy (w okresie ubezpieczenia): ${
        accidentData.workRelation.temporal ? "tak" : "nie"
      }, miejscowy: ${
        accidentData.workRelation.spatial ? "tak" : "nie"
      }, funkcjonalny (zwykłe czynności): ${
        accidentData.workRelation.functional ? "tak" : "nie"
      }. ${accidentData.workRelation.description || ""}`;
    };

    const verifyAllElements = async () => {
      if (!accidentData) return;
      
      setIsVerifying(true);
        // Inicjalizacja stanu z podstawową weryfikacją
        const initialVerification = {
          suddenness: {
            fulfilled:
              accidentData.suddenness?.confirmed === true &&
              (accidentData.suddenness?.description?.length || 0) > 10,
            confidence: accidentData.suddenness?.confirmed ? 90 : 0,
            warnings: [],
            details: accidentData.suddenness?.description || "",
            isLoading: true,
          },
          externalCause: {
            fulfilled:
              accidentData.externalCause?.confirmed === true &&
              (accidentData.externalCause?.description?.length || 0) > 10,
            confidence: accidentData.externalCause?.confirmed ? 85 : 0,
            warnings: [],
            details: accidentData.externalCause?.description || "",
            isLoading: true,
          },
          injury: {
            fulfilled:
              accidentData.injury?.confirmed === true &&
              (accidentData.injury?.type?.length || 0) > 0 &&
              (accidentData.injury?.location?.length || 0) > 0,
            confidence: accidentData.injury?.confirmed ? 95 : 0,
            warnings: [],
            details: `${accidentData.injury?.type || ""} - ${
              accidentData.injury?.location || ""
            }`,
            isLoading: true,
          },
          workRelation: {
            fulfilled:
              accidentData.workRelation?.causal === true &&
              accidentData.workRelation?.temporal === true &&
              accidentData.workRelation?.spatial === true &&
              accidentData.workRelation?.functional === true &&
              (accidentData.workRelation?.description?.length || 0) > 10,
            confidence:
              (accidentData.workRelation?.causal ? 25 : 0) +
              (accidentData.workRelation?.temporal ? 25 : 0) +
              (accidentData.workRelation?.spatial ? 25 : 0) +
              (accidentData.workRelation?.functional ? 25 : 0),
            warnings: [],
            details: accidentData.workRelation?.description || "",
            isLoading: true,
          },
        };

        setVerificationState(initialVerification);

        // Weryfikacja nagłości
        const suddennessAnswer = getSuddennessAnswer();
        if (suddennessAnswer) {
          const suddennessResult = await checkCompatibility(
            getSuddennessQuestion(),
            suddennessAnswer
          );
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  suddenness: {
                    ...prev.suddenness,
                    isLoading: false,
                    compatibilityScore: suddennessResult?.compatibilityScore,
                    compatibilityReasoning:
                      suddennessResult?.compatibilityReasoning,
                    confidence: suddennessResult
                      ? suddennessResult.compatibilityScore
                      : prev.suddenness.confidence,
                    fulfilled: suddennessResult
                      ? suddennessResult.compatibilityScore >= 70 &&
                        prev.suddenness.fulfilled
                      : prev.suddenness.fulfilled,
                    warnings:
                      suddennessResult &&
                      suddennessResult.compatibilityScore < 70
                        ? [
                            ...prev.suddenness.warnings,
                            suddennessResult.compatibilityReasoning,
                          ]
                        : prev.suddenness.warnings,
                  },
                }
              : null
          );
        } else {
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  suddenness: { ...prev.suddenness, isLoading: false },
                }
              : null
          );
        }

        // Weryfikacja przyczyny zewnętrznej
        const externalCauseAnswer = getExternalCauseAnswer();
        if (externalCauseAnswer) {
          const externalCauseResult = await checkCompatibility(
            getExternalCauseQuestion(),
            externalCauseAnswer
          );
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  externalCause: {
                    ...prev.externalCause,
                    isLoading: false,
                    compatibilityScore: externalCauseResult?.compatibilityScore,
                    compatibilityReasoning:
                      externalCauseResult?.compatibilityReasoning,
                    confidence: externalCauseResult
                      ? externalCauseResult.compatibilityScore
                      : prev.externalCause.confidence,
                    fulfilled: externalCauseResult
                      ? externalCauseResult.compatibilityScore >= 70 &&
                        prev.externalCause.fulfilled
                      : prev.externalCause.fulfilled,
                    warnings:
                      externalCauseResult &&
                      externalCauseResult.compatibilityScore < 70
                        ? [
                            ...prev.externalCause.warnings,
                            externalCauseResult.compatibilityReasoning,
                          ]
                        : prev.externalCause.warnings,
                  },
                }
              : null
          );
        } else {
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  externalCause: { ...prev.externalCause, isLoading: false },
                }
              : null
          );
        }

        // Weryfikacja urazu
        const injuryAnswer = getInjuryAnswer();
        if (injuryAnswer) {
          const injuryResult = await checkCompatibility(
            getInjuryQuestion(),
            injuryAnswer
          );
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  injury: {
                    ...prev.injury,
                    isLoading: false,
                    compatibilityScore: injuryResult?.compatibilityScore,
                    compatibilityReasoning:
                      injuryResult?.compatibilityReasoning,
                    confidence: injuryResult
                      ? injuryResult.compatibilityScore
                      : prev.injury.confidence,
                    fulfilled: injuryResult
                      ? injuryResult.compatibilityScore >= 70 &&
                        prev.injury.fulfilled
                      : prev.injury.fulfilled,
                    warnings:
                      injuryResult && injuryResult.compatibilityScore < 70
                        ? [
                            ...prev.injury.warnings,
                            injuryResult.compatibilityReasoning,
                          ]
                        : prev.injury.warnings,
                  },
                }
              : null
          );
        } else {
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  injury: { ...prev.injury, isLoading: false },
                }
              : null
          );
        }

        // Weryfikacja związku z pracą
        const workRelationAnswer = getWorkRelationAnswer();
        if (workRelationAnswer) {
          const workRelationResult = await checkCompatibility(
            getWorkRelationQuestion(),
            workRelationAnswer
          );
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  workRelation: {
                    ...prev.workRelation,
                    isLoading: false,
                    compatibilityScore: workRelationResult?.compatibilityScore,
                    compatibilityReasoning:
                      workRelationResult?.compatibilityReasoning,
                    confidence: workRelationResult
                      ? workRelationResult.compatibilityScore
                      : prev.workRelation.confidence,
                    fulfilled: workRelationResult
                      ? workRelationResult.compatibilityScore >= 70 &&
                        prev.workRelation.fulfilled
                      : prev.workRelation.fulfilled,
                    warnings:
                      workRelationResult &&
                      workRelationResult.compatibilityScore < 70
                        ? [
                            ...prev.workRelation.warnings,
                            workRelationResult.compatibilityReasoning,
                          ]
                        : prev.workRelation.warnings,
                  },
                }
              : null
          );
        } else {
          setVerificationState((prev) =>
            prev
              ? {
                  ...prev,
                  workRelation: { ...prev.workRelation, isLoading: false },
                }
              : null
          );
        }
        
        setIsVerifying(false);
        setHasVerified(true);
      };

    // Funkcja weryfikująca elementy definicji (z podstawową logiką + wyniki z API)
    const verification = useMemo<{
      suddenness: ElementStatus;
      externalCause: ElementStatus;
      injury: ElementStatus;
      workRelation: ElementStatus;
      overallStatus: "complete" | "incomplete" | "needs_attention";
    }>(() => {
      if (!accidentData) {
        return {
          suddenness: {
            fulfilled: false,
            confidence: 0,
            warnings: ["Brak danych o nagłości"],
            details: "",
          },
          externalCause: {
            fulfilled: false,
            confidence: 0,
            warnings: ["Brak danych o przyczynie zewnętrznej"],
            details: "",
          },
          injury: {
            fulfilled: false,
            confidence: 0,
            warnings: ["Brak danych o urazie"],
            details: "",
          },
          workRelation: {
            fulfilled: false,
            confidence: 0,
            warnings: ["Brak danych o związku z pracą"],
            details: "",
          },
          overallStatus: "incomplete",
        };
      }

      // Użyj stanu z API jeśli dostępny, w przeciwnym razie użyj podstawowej weryfikacji
      if (verificationState) {
        const { suddenness, externalCause, injury, workRelation } =
          verificationState;

        // Dodaj podstawowe ostrzeżenia jeśli nie są już w stanie
        const suddennessStatus: ElementStatus = {
          ...suddenness,
          warnings: [...suddenness.warnings],
        };
        if (
          !accidentData.suddenness?.confirmed &&
          !suddennessStatus.warnings.some((w) => w.includes("potwierdzona"))
        ) {
          suddennessStatus.warnings.push(
            "Nagłość zdarzenia nie została potwierdzona"
          );
        }
        if (
          (accidentData.suddenness?.description?.length || 0) < 10 &&
          !suddennessStatus.warnings.some((w) => w.includes("krótki"))
        ) {
          suddennessStatus.warnings.push("Opis nagłości jest zbyt krótki");
        }

        const externalCauseStatus: ElementStatus = {
          ...externalCause,
          warnings: [...externalCause.warnings],
        };
        if (
          !accidentData.externalCause?.confirmed &&
          !externalCauseStatus.warnings.some((w) => w.includes("potwierdzona"))
        ) {
          externalCauseStatus.warnings.push(
            "Przyczyna zewnętrzna nie została potwierdzona"
          );
        }
        if (
          (accidentData.externalCause?.description?.length || 0) < 10 &&
          !externalCauseStatus.warnings.some((w) => w.includes("krótki"))
        ) {
          externalCauseStatus.warnings.push(
            "Opis przyczyny zewnętrznej jest zbyt krótki"
          );
        }
        if (
          (!accidentData.externalCause?.type ||
            accidentData.externalCause.type === "inne") &&
          !externalCauseStatus.warnings.some((w) => w.includes("Typ"))
        ) {
          externalCauseStatus.warnings.push(
            "Typ przyczyny zewnętrznej nie został szczegółowo określony"
          );
        }

        const injuryStatus: ElementStatus = {
          ...injury,
          warnings: [...injury.warnings],
        };
        if (
          !accidentData.injury?.confirmed &&
          !injuryStatus.warnings.some((w) => w.includes("potwierdzony"))
        ) {
          injuryStatus.warnings.push("Uraz nie został potwierdzony");
        }
        if (
          !accidentData.injury?.type ||
          accidentData.injury.type.length === 0
        ) {
          if (!injuryStatus.warnings.some((w) => w.includes("Rodzaj"))) {
            injuryStatus.warnings.push("Rodzaj urazu nie został określony");
          }
        }
        if (
          !accidentData.injury?.location ||
          accidentData.injury.location.length === 0
        ) {
          if (!injuryStatus.warnings.some((w) => w.includes("Lokalizacja"))) {
            injuryStatus.warnings.push(
              "Lokalizacja urazu nie została określona"
            );
          }
        }
        if (
          (accidentData.injury?.medicalDocumentation === false ||
            accidentData.injury?.medicalDocumentation === undefined) &&
          !injuryStatus.warnings.some((w) => w.includes("dokumentacji"))
        ) {
          injuryStatus.warnings.push(
            "Brak potwierdzenia dokumentacji medycznej"
          );
        }

        const workRelationStatus: ElementStatus = {
          ...workRelation,
          warnings: [...workRelation.warnings],
        };
        if (
          !accidentData.workRelation?.causal &&
          !workRelationStatus.warnings.some((w) => w.includes("przyczynowy"))
        ) {
          workRelationStatus.warnings.push(
            "Związek przyczynowy nie został potwierdzony"
          );
        }
        if (
          !accidentData.workRelation?.temporal &&
          !workRelationStatus.warnings.some((w) => w.includes("czasowy"))
        ) {
          workRelationStatus.warnings.push(
            "Związek czasowy (w okresie ubezpieczenia) nie został potwierdzony"
          );
        }
        if (
          !accidentData.workRelation?.spatial &&
          !workRelationStatus.warnings.some((w) => w.includes("miejscowy"))
        ) {
          workRelationStatus.warnings.push(
            "Związek miejscowy nie został potwierdzony"
          );
        }
        if (
          !accidentData.workRelation?.functional &&
          !workRelationStatus.warnings.some((w) => w.includes("funkcjonalny"))
        ) {
          workRelationStatus.warnings.push(
            "Związek funkcjonalny (zwykłe czynności) nie został potwierdzony"
          );
        }
        if (
          (accidentData.workRelation?.description?.length || 0) < 10 &&
          !workRelationStatus.warnings.some((w) => w.includes("Opis związku"))
        ) {
          workRelationStatus.warnings.push(
            "Opis związku z pracą jest zbyt krótki"
          );
        }

        // Określenie ogólnego statusu
        const allFulfilled =
          suddennessStatus.fulfilled &&
          externalCauseStatus.fulfilled &&
          injuryStatus.fulfilled &&
          workRelationStatus.fulfilled;

        const hasWarnings =
          suddennessStatus.warnings.length > 0 ||
          externalCauseStatus.warnings.length > 0 ||
          injuryStatus.warnings.length > 0 ||
          workRelationStatus.warnings.length > 0;

        // Po weryfikacji AI można pokazać pełny status
        const overallStatus: "complete" | "incomplete" | "needs_attention" =
          allFulfilled && !hasWarnings
            ? "complete"
            : allFulfilled && hasWarnings
            ? "needs_attention"
            : "incomplete";

        return {
          suddenness: suddennessStatus,
          externalCause: externalCauseStatus,
          injury: injuryStatus,
          workRelation: workRelationStatus,
          overallStatus,
        };
      }

      // Fallback - podstawowa weryfikacja bez API
      const { suddenness, externalCause, injury, workRelation } = accidentData;

      // Weryfikacja nagłości
      const suddennessStatus: ElementStatus = {
        fulfilled:
          suddenness?.confirmed === true &&
          (suddenness?.description?.length || 0) > 10,
        confidence: suddenness?.confirmed ? 90 : 0,
        warnings: [],
        details: suddenness?.description || "",
        isLoading: false, // Nie pokazuj stanu ładowania przed weryfikacją AI
      };
      if (!suddenness?.confirmed) {
        suddennessStatus.warnings.push(
          "Nagłość zdarzenia nie została potwierdzona"
        );
      }
      if ((suddenness?.description?.length || 0) < 10) {
        suddennessStatus.warnings.push("Opis nagłości jest zbyt krótki");
      }

      // Weryfikacja przyczyny zewnętrznej
      const externalCauseStatus: ElementStatus = {
        fulfilled:
          externalCause?.confirmed === true &&
          (externalCause?.description?.length || 0) > 10,
        confidence: externalCause?.confirmed ? 85 : 0,
        warnings: [],
        details: externalCause?.description || "",
        isLoading: false, // Nie pokazuj stanu ładowania przed weryfikacją AI
      };
      if (!externalCause?.confirmed) {
        externalCauseStatus.warnings.push(
          "Przyczyna zewnętrzna nie została potwierdzona"
        );
      }
      if ((externalCause?.description?.length || 0) < 10) {
        externalCauseStatus.warnings.push(
          "Opis przyczyny zewnętrznej jest zbyt krótki"
        );
      }
      if (!externalCause?.type || externalCause.type === "inne") {
        externalCauseStatus.warnings.push(
          "Typ przyczyny zewnętrznej nie został szczegółowo określony"
        );
      }

      // Weryfikacja urazu
      const injuryStatus: ElementStatus = {
        fulfilled:
          injury?.confirmed === true &&
          (injury?.type?.length || 0) > 0 &&
          (injury?.location?.length || 0) > 0,
        confidence: injury?.confirmed ? 95 : 0,
        warnings: [],
        details: `${injury?.type || ""} - ${injury?.location || ""}`,
        isLoading: false, // Nie pokazuj stanu ładowania przed weryfikacją AI
      };
      if (!injury?.confirmed) {
        injuryStatus.warnings.push("Uraz nie został potwierdzony");
      }
      if (!injury?.type || injury.type.length === 0) {
        injuryStatus.warnings.push("Rodzaj urazu nie został określony");
      }
      if (!injury?.location || injury.location.length === 0) {
        injuryStatus.warnings.push("Lokalizacja urazu nie została określona");
      }
      if (
        injury?.medicalDocumentation === false ||
        injury?.medicalDocumentation === undefined
      ) {
        injuryStatus.warnings.push("Brak potwierdzenia dokumentacji medycznej");
      }

      // Weryfikacja związku z pracą
      const workRelationStatus: ElementStatus = {
        fulfilled:
          workRelation?.causal === true &&
          workRelation?.temporal === true &&
          workRelation?.spatial === true &&
          workRelation?.functional === true &&
          (workRelation?.description?.length || 0) > 10,
        confidence:
          (workRelation?.causal ? 25 : 0) +
          (workRelation?.temporal ? 25 : 0) +
          (workRelation?.spatial ? 25 : 0) +
          (workRelation?.functional ? 25 : 0),
        warnings: [],
        details: workRelation?.description || "",
        isLoading: false, // Nie pokazuj stanu ładowania przed weryfikacją AI
      };
      if (!workRelation?.causal) {
        workRelationStatus.warnings.push(
          "Związek przyczynowy nie został potwierdzony"
        );
      }
      if (!workRelation?.temporal) {
        workRelationStatus.warnings.push(
          "Związek czasowy (w okresie ubezpieczenia) nie został potwierdzony"
        );
      }
      if (!workRelation?.spatial) {
        workRelationStatus.warnings.push(
          "Związek miejscowy nie został potwierdzony"
        );
      }
      if (!workRelation?.functional) {
        workRelationStatus.warnings.push(
          "Związek funkcjonalny (zwykłe czynności) nie został potwierdzony"
        );
      }
      if ((workRelation?.description?.length || 0) < 10) {
        workRelationStatus.warnings.push(
          "Opis związku z pracą jest zbyt krótki"
        );
      }

      // Określenie ogólnego statusu
      // Przed weryfikacją AI zawsze pokazuj "incomplete" lub "needs_attention", nigdy "complete"
      const allFulfilled =
        suddennessStatus.fulfilled &&
        externalCauseStatus.fulfilled &&
        injuryStatus.fulfilled &&
        workRelationStatus.fulfilled;

      const hasWarnings =
        suddennessStatus.warnings.length > 0 ||
        externalCauseStatus.warnings.length > 0 ||
        injuryStatus.warnings.length > 0 ||
        workRelationStatus.warnings.length > 0;

      // Przed weryfikacją AI nie pokazuj statusu "complete"
      const overallStatus: "complete" | "incomplete" | "needs_attention" =
        !hasVerified
          ? hasWarnings
            ? "incomplete"
            : "needs_attention" // Wymaga weryfikacji AI
          : allFulfilled && !hasWarnings
          ? "complete"
          : allFulfilled && hasWarnings
          ? "needs_attention"
          : "incomplete";

      return {
        suddenness: suddennessStatus,
        externalCause: externalCauseStatus,
        injury: injuryStatus,
        workRelation: workRelationStatus,
        overallStatus,
      };
    }, [accidentData, verificationState, hasVerified]);

    const StatusIcon = ({ fulfilled }: { fulfilled: boolean }) => (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          fulfilled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {fulfilled ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
    );

    const ElementCard = ({
      title,
      status,
      description,
    }: {
      title: string;
      status: ElementStatus;
      description: string;
    }) => (
      <Card className="p-6 border-2">
        <div className="flex items-start gap-4">
          <StatusIcon fulfilled={status.fulfilled} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>

            {status.details && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">{status.details}</p>
              </div>
            )}

            {status.warnings.length > 0 && (
              <div className="space-y-2">
                {status.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded p-2"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {status.isLoading && (
              <div className="text-sm text-blue-700 bg-blue-50 rounded p-2 flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Weryfikacja kompatybilności...
              </div>
            )}

            {status.compatibilityReasoning && !status.isLoading && (
              <div
                className={`text-sm rounded p-2 mb-2 ${
                  (status.compatibilityScore || 0) >= 70
                    ? "text-green-700 bg-green-50"
                    : "text-amber-700 bg-amber-50"
                }`}
              >
                <div className="font-medium mb-1">
                  Weryfikacja kompatybilności: {status.compatibilityScore}%
                </div>
                <div className="text-xs">{status.compatibilityReasoning}</div>
              </div>
            )}

            {status.fulfilled &&
              status.warnings.length === 0 &&
              !status.isLoading && (
                <div className="text-sm text-green-700 bg-green-50 rounded p-2">
                  ✓ Element spełniony
                </div>
              )}

            {!status.isLoading && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Pewność:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.confidence >= 80
                          ? "bg-green-500"
                          : status.confidence >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(status.confidence, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {status.confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );

    return (
      <div className="space-y-6 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Weryfikacja elementów definicji wypadku
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Sprawdź, czy wszystkie wymagane elementy definicji wypadku przy
            pracy zostały spełnione
          </p>
          {!hasVerified && (
            <Button
              variant="primary"
              size="lg"
              onClick={verifyAllElements}
              disabled={isVerifying || !accidentData}
              className="mb-4"
            >
              {isVerifying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Weryfikacja w toku...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Uruchom weryfikację AI
                </>
              )}
            </Button>
          )}
          {hasVerified && !isVerifying && (
            <div className="text-sm text-green-700 bg-green-50 rounded-lg p-3 inline-block mb-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Weryfikacja AI została wykonana</span>
              </div>
            </div>
          )}
        </div>

        {/* Ogólny status */}
        <Card
          className={`p-6 border-2 ${
            !hasVerified
              ? "border-blue-500 bg-blue-50"
              : verification.overallStatus === "complete"
              ? "border-green-500 bg-green-50"
              : verification.overallStatus === "needs_attention"
              ? "border-yellow-500 bg-yellow-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                !hasVerified
                  ? "bg-blue-500"
                  : verification.overallStatus === "complete"
                  ? "bg-green-500"
                  : verification.overallStatus === "needs_attention"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {!hasVerified ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ) : verification.overallStatus === "complete" ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {!hasVerified
                  ? "Wymagana weryfikacja AI"
                  : verification.overallStatus === "complete"
                  ? "Wszystkie elementy spełnione"
                  : verification.overallStatus === "needs_attention"
                  ? "Wymaga uwagi"
                  : "Niektóre elementy nie zostały spełnione"}
              </h3>
              <p className="text-gray-600">
                {!hasVerified
                  ? "Kliknij przycisk 'Uruchom weryfikację AI', aby przeprowadzić szczegółową analizę zgodności wszystkich elementów definicji wypadku przy pracy."
                  : verification.overallStatus === "complete"
                  ? "Twoje zgłoszenie zawiera wszystkie wymagane elementy definicji wypadku przy pracy."
                  : verification.overallStatus === "needs_attention"
                  ? "Zgłoszenie zawiera wszystkie elementy, ale niektóre wymagają doprecyzowania."
                  : "Niektóre elementy definicji wypadku nie zostały jeszcze potwierdzone. Przejrzyj szczegóły poniżej."}
              </p>
            </div>
          </div>
        </Card>

        {/* Szczegółowa weryfikacja */}
        <div className="space-y-4">
          <ElementCard
            title="Nagłość zdarzenia"
            description="Zdarzenie musi być nagłe (natychmiastowe lub trwające maksymalnie 1 dzień)"
            status={verification.suddenness}
          />

          <ElementCard
            title="Przyczyna zewnętrzna"
            description="Uraz musi być spowodowany przez czynnik zewnętrzny (maszyny, energia, temperatura, chemikalia, siły natury, warunki pracy)"
            status={verification.externalCause}
          />

          <ElementCard
            title="Uraz"
            description="Musi dojść do urazu z potwierdzeniem dokumentacji medycznej"
            status={verification.injury}
          />

          <ElementCard
            title="Związek z pracą"
            description="Wypadek musi mieć związek przyczynowy, czasowy (w okresie ubezpieczenia), miejscowy i funkcjonalny (zwykłe czynności związane z działalnością)"
            status={verification.workRelation}
          />
        </div>

        {/* Informacja */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Ważna informacja
              </p>
              <p className="text-sm text-blue-800">
                Jeśli wszystkie elementy są spełnione, możesz przejść dalej. W
                przypadku braków lub wątpliwości, wróć do poprzedniego kroku i
                uzupełnij brakujące informacje.
              </p>
            </div>
          </div>
        </Card>

        {/* Przyciski nawigacji */}
        <div className="flex justify-between pt-6">
          <Button variant="secondary" size="lg" onClick={onPrevious}>
            ← Wstecz
          </Button>
          <Button variant="primary" size="lg" onClick={onNext}>
            Dalej →
          </Button>
        </div>
      </div>
    );
  });

Krok5WeryfikacjaElementow.displayName = "Krok5WeryfikacjaElementow";
