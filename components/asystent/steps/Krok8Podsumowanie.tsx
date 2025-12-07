"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccidentReport } from "@/types";

interface Krok8PodsumowanieProps {
  onPrevious: () => void;
  onGenerateDocuments: () => void;
  formData: Partial<AccidentReport>;
}

export const Krok8Podsumowanie: React.FC<Krok8PodsumowanieProps> = React.memo(({
  onPrevious,
  onGenerateDocuments,
  formData,
}) => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async (documentType: "notification" | "statement") => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/pdf/fill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          documentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd podczas generowania PDF");
      }

      // Pobierz PDF jako blob
      const blob = await response.blob();
      
      // Utwórz link do pobrania
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = documentType === "notification" 
        ? "zawiadomienie-wypadek.pdf" 
        : "zapis-wyjasnien.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Błąd podczas generowania PDF:", err);
      setError(err.message || "Nie udało się wygenerować PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (formData.notificationType === "zawiadomienie" || formData.notificationType === "oba") {
      await handleGeneratePDF("notification");
    }
    if (formData.notificationType === "wyjasnienia" || formData.notificationType === "oba") {
      await handleGeneratePDF("statement");
    }
  };

  const handleGenerateWyjasnieniaPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Dynamiczny import funkcji generującej PDF z HTML (działa tylko w przeglądarce)
      if (typeof window === "undefined") {
        throw new Error("Generowanie PDF dostępne tylko w przeglądarce");
      }

      const { generateWyjasnieniaPDF } = await import("@/lib/wyjasnienia/generateDocument");
      const pdfBlob = await generateWyjasnieniaPDF(formData);
      
      // Pobierz PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zapis-wyjasnien-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Błąd podczas generowania PDF wyjaśnień:", err);
      setError(err.message || "Nie udało się wygenerować PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoToWyjasnienia = () => {
    // Zapisz dane z EWYP do localStorage, aby można było je wykorzystać w formularzu wyjaśnień
    const dataToSave = {
      personalData: formData.personalData,
      addresses: formData.addresses,
      accidentData: formData.accidentData,
      witnesses: formData.witnesses,
      fromEwyp: true, // Flaga wskazująca, że dane pochodzą z EWYP
    };
    localStorage.setItem("ewyp-to-wyjasnienia", JSON.stringify(dataToSave));
    
    // Przekieruj do strony wyjaśnień
    router.push("/asystent/wyjasnienia?fromEwyp=true");
  };
  const SummarySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2 text-sm text-gray-700">
        {children}
      </div>
    </Card>
  );

  const SummaryRow = ({ label, value }: { label: string; value?: string | number | boolean }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="font-medium text-gray-600">{label}:</span>
        <span className="text-gray-900">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Podsumowanie zgłoszenia
        </h2>
        <p className="text-lg text-gray-600">
          Sprawdź wszystkie wprowadzone dane przed wygenerowaniem dokumentów
        </p>
      </div>

      {/* Rodzaj zgłoszenia */}
      {formData.notificationType && (
        <SummarySection title="Rodzaj zgłoszenia">
          <SummaryRow 
            label="Typ" 
            value={
              formData.notificationType === "zawiadomienie" 
                ? "Zawiadomienie o wypadku" 
                : formData.notificationType === "wyjasnienia"
                ? "Zapis wyjaśnień poszkodowanego"
                : "Oba dokumenty"
            } 
          />
        </SummarySection>
      )}

      {/* Dane osobowe */}
      {formData.personalData && (
        <SummarySection title="Dane osobowe poszkodowanego">
          <SummaryRow label="Imię" value={formData.personalData.firstName} />
          <SummaryRow label="Nazwisko" value={formData.personalData.lastName} />
          <SummaryRow label="PESEL" value={formData.personalData.pesel} />
          <SummaryRow label="Data urodzenia" value={formData.personalData.dateOfBirth} />
          <SummaryRow label="Miejsce urodzenia" value={formData.personalData.placeOfBirth} />
          <SummaryRow label="Telefon" value={formData.personalData.phone} />
          <SummaryRow label="Email" value={formData.personalData.email} />
          <SummaryRow 
            label="Dokument tożsamości" 
            value={`${formData.personalData.idDocument.type} ${formData.personalData.idDocument.series || ""} ${formData.personalData.idDocument.number}`.trim()} 
          />
        </SummarySection>
      )}

      {/* Adresy */}
      {formData.addresses && (
        <SummarySection title="Adresy">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-700 mb-2">Adres zamieszkania:</p>
              <p className="text-gray-900">
                {formData.addresses.residentialAddress?.street} {formData.addresses.residentialAddress?.houseNumber}
                {formData.addresses.residentialAddress?.apartmentNumber && `/${formData.addresses.residentialAddress.apartmentNumber}`}
                <br />
                {formData.addresses.residentialAddress?.postalCode} {formData.addresses.residentialAddress?.city}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Adres działalności:</p>
              <p className="text-gray-900">
                {formData.addresses.businessAddress?.street} {formData.addresses.businessAddress?.houseNumber}
                {formData.addresses.businessAddress?.apartmentNumber && `/${formData.addresses.businessAddress.apartmentNumber}`}
                <br />
                {formData.addresses.businessAddress?.postalCode} {formData.addresses.businessAddress?.city}
                {formData.addresses.businessAddress?.phone && (
                  <>
                    <br />
                    Tel: {formData.addresses.businessAddress.phone}
                  </>
                )}
              </p>
            </div>
          </div>
        </SummarySection>
      )}

      {/* Dane o wypadku */}
      {formData.accidentData && (
        <SummarySection title="Dane o wypadku">
          <SummaryRow label="Data wypadku" value={formData.accidentData.accidentDate} />
          <SummaryRow label="Godzina wypadku" value={formData.accidentData.accidentTime} />
          <SummaryRow label="Miejsce wypadku" value={formData.accidentData.accidentPlace} />
          <SummaryRow label="Rodzaj urazów" value={formData.accidentData.injuryType} />
          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Opis okoliczności:</p>
            <p className="text-gray-900">{formData.accidentData.detailedCircumstancesDescription}</p>
          </div>
          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Opis przyczyn:</p>
            <p className="text-gray-900">{formData.accidentData.detailedCausesDescription}</p>
          </div>
        </SummarySection>
      )}

      {/* Wyjaśnienia */}
      {formData.victimStatement && (
        <SummarySection title="Wyjaśnienia poszkodowanego">
          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Rodzaj czynności przed wypadkiem:</p>
            <p className="text-gray-900">{formData.victimStatement.activityTypeBeforeAccident}</p>
          </div>
          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Okoliczności wypadku:</p>
            <p className="text-gray-900">{formData.victimStatement.accidentCircumstances}</p>
          </div>
          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Przyczyny wypadku:</p>
            <p className="text-gray-900">{formData.victimStatement.accidentCauses}</p>
          </div>
        </SummarySection>
      )}

      {/* Świadkowie */}
      {formData.witnesses && formData.witnesses.length > 0 && (
        <SummarySection title="Świadkowie">
          {formData.witnesses.map((witness, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-700">
                Świadek {index + 1}: {witness.firstName} {witness.lastName}
              </p>
              {witness.phone && <p className="text-gray-600 text-xs">Tel: {witness.phone}</p>}
            </div>
          ))}
        </SummarySection>
      )}

      {/* Informacja o dokumentach */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">Przed wygenerowaniem dokumentów</p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li>Sprawdź, czy wszystkie dane są poprawne</li>
              <li>Upewnij się, że wszystkie wymagane pola zostały wypełnione</li>
              <li>Po wygenerowaniu dokumentów będziesz mógł je wydrukować i podpisać</li>
              <li>Dokumenty można przesłać przez PUE/eZUS lub złożyć w placówce ZUS</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Błąd */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Przyciski */}
      <div className="flex justify-between pt-6">
        <Button variant="secondary" size="lg" onClick={onPrevious} disabled={isGenerating}>
          ← Wstecz
        </Button>
        <div className="flex gap-3">
          {(formData.notificationType === "zawiadomienie" || formData.notificationType === "oba") && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => handleGeneratePDF("notification")}
              disabled={isGenerating}
            >
              {isGenerating ? "Generowanie..." : "Pobierz zawiadomienie PDF"}
            </Button>
          )}
          {/* Przycisk do przejścia do formularza wyjaśnień (tylko dla zawiadomienia) */}
          {(formData.notificationType === "zawiadomienie" || formData.notificationType === "oba") && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleGoToWyjasnienia}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              Generuj i przejdź do zapisu wyjaśnień →
            </Button>
          )}
          {/* Przycisk dla zapisu wyjaśnień - używa generowania PDF z HTML */}
          {(formData.notificationType === "wyjasnienia" || formData.notificationType === "oba") && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleGenerateWyjasnieniaPDF}
              disabled={isGenerating}
            >
              {isGenerating ? "Generowanie..." : "Pobierz zapis wyjaśnień PDF"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.formData) === JSON.stringify(nextProps.formData) &&
    prevProps.onPrevious === nextProps.onPrevious &&
    prevProps.onGenerateDocuments === nextProps.onGenerateDocuments
  );
});

Krok8Podsumowanie.displayName = "Krok8Podsumowanie";

