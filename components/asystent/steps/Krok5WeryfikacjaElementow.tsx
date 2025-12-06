"use client";

import React, { useMemo } from "react";
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
}

export const Krok5WeryfikacjaElementow: React.FC<Krok5WeryfikacjaElementowProps> = React.memo(({
  onNext,
  onPrevious,
  accidentData,
}) => {
  // Funkcja weryfikująca elementy definicji
  const verification = useMemo<{
    suddenness: ElementStatus;
    externalCause: ElementStatus;
    injury: ElementStatus;
    workRelation: ElementStatus;
    overallStatus: "complete" | "incomplete" | "needs_attention";
  }>(() => {
    if (!accidentData) {
      return {
        suddenness: { fulfilled: false, confidence: 0, warnings: ["Brak danych o nagłości"], details: "" },
        externalCause: { fulfilled: false, confidence: 0, warnings: ["Brak danych o przyczynie zewnętrznej"], details: "" },
        injury: { fulfilled: false, confidence: 0, warnings: ["Brak danych o urazie"], details: "" },
        workRelation: { fulfilled: false, confidence: 0, warnings: ["Brak danych o związku z pracą"], details: "" },
        overallStatus: "incomplete",
      };
    }

    const { suddenness, externalCause, injury, workRelation } = accidentData;
    const warnings: string[] = [];

    // Weryfikacja nagłości
    const suddennessStatus: ElementStatus = {
      fulfilled: suddenness?.confirmed === true && (suddenness?.description?.length || 0) > 10,
      confidence: suddenness?.confirmed ? 90 : 0,
      warnings: [],
      details: suddenness?.description || "",
    };
    if (!suddenness?.confirmed) {
      suddennessStatus.warnings.push("Nagłość zdarzenia nie została potwierdzona");
    }
    if ((suddenness?.description?.length || 0) < 10) {
      suddennessStatus.warnings.push("Opis nagłości jest zbyt krótki");
    }

    // Weryfikacja przyczyny zewnętrznej
    const externalCauseStatus: ElementStatus = {
      fulfilled: externalCause?.confirmed === true && (externalCause?.description?.length || 0) > 10,
      confidence: externalCause?.confirmed ? 85 : 0,
      warnings: [],
      details: externalCause?.description || "",
    };
    if (!externalCause?.confirmed) {
      externalCauseStatus.warnings.push("Przyczyna zewnętrzna nie została potwierdzona");
    }
    if ((externalCause?.description?.length || 0) < 10) {
      externalCauseStatus.warnings.push("Opis przyczyny zewnętrznej jest zbyt krótki");
    }
    if (!externalCause?.type || externalCause.type === "inne") {
      externalCauseStatus.warnings.push("Typ przyczyny zewnętrznej nie został szczegółowo określony");
    }

    // Weryfikacja urazu
    const injuryStatus: ElementStatus = {
      fulfilled: injury?.confirmed === true && 
                 (injury?.type?.length || 0) > 0 && 
                 (injury?.location?.length || 0) > 0,
      confidence: injury?.confirmed ? 95 : 0,
      warnings: [],
      details: `${injury?.type || ""} - ${injury?.location || ""}`,
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
    if (injury?.medicalDocumentation === false || injury?.medicalDocumentation === undefined) {
      injuryStatus.warnings.push("Brak potwierdzenia dokumentacji medycznej");
    }

    // Weryfikacja związku z pracą
    const workRelationStatus: ElementStatus = {
      fulfilled: workRelation?.causal === true && 
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
    };
    if (!workRelation?.causal) {
      workRelationStatus.warnings.push("Związek przyczynowy nie został potwierdzony");
    }
    if (!workRelation?.temporal) {
      workRelationStatus.warnings.push("Związek czasowy (w okresie ubezpieczenia) nie został potwierdzony");
    }
    if (!workRelation?.spatial) {
      workRelationStatus.warnings.push("Związek miejscowy nie został potwierdzony");
    }
    if (!workRelation?.functional) {
      workRelationStatus.warnings.push("Związek funkcjonalny (zwykłe czynności) nie został potwierdzony");
    }
    if ((workRelation?.description?.length || 0) < 10) {
      workRelationStatus.warnings.push("Opis związku z pracą jest zbyt krótki");
    }

    // Określenie ogólnego statusu
    const allFulfilled = suddennessStatus.fulfilled && 
                         externalCauseStatus.fulfilled && 
                         injuryStatus.fulfilled && 
                         workRelationStatus.fulfilled;
    
    const hasWarnings = suddennessStatus.warnings.length > 0 ||
                        externalCauseStatus.warnings.length > 0 ||
                        injuryStatus.warnings.length > 0 ||
                        workRelationStatus.warnings.length > 0;

    const overallStatus: "complete" | "incomplete" | "needs_attention" = 
      allFulfilled && !hasWarnings ? "complete" :
      allFulfilled && hasWarnings ? "needs_attention" :
      "incomplete";

    return {
      suddenness: suddennessStatus,
      externalCause: externalCauseStatus,
      injury: injuryStatus,
      workRelation: workRelationStatus,
      overallStatus,
    };
  }, [accidentData]);

  const StatusIcon = ({ fulfilled }: { fulfilled: boolean }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      fulfilled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
    }`}>
      {fulfilled ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  );

  const ElementCard = ({ 
    title, 
    status, 
    description 
  }: { 
    title: string; 
    status: ElementStatus; 
    description: string;
  }) => (
    <Card className="p-6 border-2">
      <div className="flex items-start gap-4">
        <StatusIcon fulfilled={status.fulfilled} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {status.details && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-700">{status.details}</p>
            </div>
          )}

          {status.warnings.length > 0 && (
            <div className="space-y-2">
              {status.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded p-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {status.fulfilled && status.warnings.length === 0 && (
            <div className="text-sm text-green-700 bg-green-50 rounded p-2">
              ✓ Element spełniony
            </div>
          )}

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Pewność:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    status.confidence >= 80 ? "bg-green-500" :
                    status.confidence >= 50 ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${status.confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{status.confidence}%</span>
            </div>
          </div>
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
        <p className="text-lg text-gray-600">
          Sprawdź, czy wszystkie wymagane elementy definicji wypadku przy pracy zostały spełnione
        </p>
      </div>

      {/* Ogólny status */}
      <Card className={`p-6 border-2 ${
        verification.overallStatus === "complete" ? "border-green-500 bg-green-50" :
        verification.overallStatus === "needs_attention" ? "border-yellow-500 bg-yellow-50" :
        "border-red-500 bg-red-50"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            verification.overallStatus === "complete" ? "bg-green-500" :
            verification.overallStatus === "needs_attention" ? "bg-yellow-500" :
            "bg-red-500"
          }`}>
            {verification.overallStatus === "complete" ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {verification.overallStatus === "complete" ? "Wszystkie elementy spełnione" :
               verification.overallStatus === "needs_attention" ? "Wymaga uwagi" :
               "Niektóre elementy nie zostały spełnione"}
            </h3>
            <p className="text-gray-600">
              {verification.overallStatus === "complete" ? 
                "Twoje zgłoszenie zawiera wszystkie wymagane elementy definicji wypadku przy pracy." :
               verification.overallStatus === "needs_attention" ?
                "Zgłoszenie zawiera wszystkie elementy, ale niektóre wymagają doprecyzowania." :
                "Niektóre elementy definicji wypadku nie zostały jeszcze potwierdzone. Przejrzyj szczegóły poniżej."}
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
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">Ważna informacja</p>
            <p className="text-sm text-blue-800">
              Jeśli wszystkie elementy są spełnione, możesz przejść dalej. W przypadku braków lub wątpliwości, 
              wróć do poprzedniego kroku i uzupełnij brakujące informacje.
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
}, (prevProps, nextProps) => {
  return (
    prevProps.accidentData === nextProps.accidentData &&
    prevProps.onNext === nextProps.onNext &&
    prevProps.onPrevious === nextProps.onPrevious
  );
});

Krok5WeryfikacjaElementow.displayName = "Krok5WeryfikacjaElementow";

