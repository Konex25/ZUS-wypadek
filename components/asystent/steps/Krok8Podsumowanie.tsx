"use client";

import React from "react";
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
          <SummaryRow label="Typ" value={formData.notificationType} />
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

      {/* Przyciski */}
      <div className="flex justify-between pt-6">
        <Button variant="secondary" size="lg" onClick={onPrevious}>
          ← Wstecz
        </Button>
        <Button variant="primary" size="lg" onClick={onGenerateDocuments}>
          Generuj dokumenty PDF
        </Button>
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

