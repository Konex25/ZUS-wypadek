"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Wizard, WizardStep } from "@/components/asystent/Wizard";
import { Krok0RodzajZgloszenia } from "@/components/asystent/steps/Krok0RodzajZgloszenia";
import { Krok1DaneOsobowe } from "@/components/asystent/steps/Krok1DaneOsobowe";
import { Krok2Adresy } from "@/components/asystent/steps/Krok2Adresy";
import { Krok4DaneOWypadku } from "@/components/asystent/steps/Krok4DaneOWypadku";
import { RodzajZgloszeniaForm, DaneOsoboweForm, DaneWypadkuForm } from "@/lib/validation/schemas";
import { ZgloszenieWypadku } from "@/types";

export default function AsystentPage() {
  const [formData, setFormData] = useState<Partial<ZgloszenieWypadku>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleKrok0Complete = useCallback((data: RodzajZgloszeniaForm) => {
    setFormData((prev) => {
      // Sprawdź czy wartość się faktycznie zmieniła
      if (prev.rodzajZgloszenia === data.rodzajZgloszenia) {
        return prev; // Zwróć ten sam obiekt jeśli nic się nie zmieniło
      }
      return {
        ...prev,
        rodzajZgloszenia: data.rodzajZgloszenia,
      };
    });
  }, []);

  const handleKrok1Complete = useCallback((data: DaneOsoboweForm) => {
    setFormData((prev) => ({
      ...prev,
      daneOsobowe: {
        pesel: data.pesel,
        dokumentTozsamosci: {
          rodzaj: data.dokumentTozsamosci.rodzaj,
          seria: data.dokumentTozsamosci.seria,
          numer: data.dokumentTozsamosci.numer,
        },
        imie: data.imie,
        nazwisko: data.nazwisko,
        dataUrodzenia: data.dataUrodzenia,
        miejsceUrodzenia: data.miejsceUrodzenia,
        telefon: data.telefon,
        email: data.email,
      },
    }));
  }, []);

  const handleKrok2Complete = useCallback((data: any) => {
    setFormData((prev) => ({
      ...prev,
      adresy: data,
    }));
  }, []);

  const handleKrok4Complete = useCallback((data: DaneWypadkuForm) => {
    setFormData((prev) => ({
      ...prev,
      daneWypadku: {
        dataWypadku: data.dataWypadku,
        godzinaWypadku: data.godzinaWypadku,
        miejsceWypadku: data.miejsceWypadku,
        planowanaGodzinaRozpoczecia: data.planowanaGodzinaRozpoczecia,
        planowanaGodzinaZakonczenia: data.planowanaGodzinaZakonczenia,
        rodzajUrazow: data.rodzajUrazow,
        szczegolowyOpisOkolicznosci: data.szczegolowyOpisOkolicznosci,
        szczegolowyOpisPrzyczyn: data.szczegolowyOpisPrzyczyn,
        miejsceWypadkuSzczegoly: data.miejsceWypadkuSzczegoly,
        naglosc: data.naglosc,
        przyczynaZewnetrzna: data.przyczynaZewnetrzna,
        uraz: data.uraz,
        zwiazekZPraca: data.zwiazekZPraca,
        pierwszaPomoc: data.pierwszaPomoc,
        postepowanieOrganow: data.postepowanieOrganow,
        maszynyUrzadzenia: data.maszynyUrzadzenia,
      },
    }));
  }, []);

  const handleWizardComplete = useCallback(() => {
    console.log("Formularz ukończony:", formData);
    // Tutaj będzie logika generowania dokumentów
    alert("Formularz został ukończony! (Funkcjonalność w trakcie implementacji)");
  }, [formData]);

  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    console.log(`Przejście do kroku ${stepIndex + 1}`);
  }, []);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex]);

  // Memoize initialData żeby nie tworzyć nowego obiektu za każdym razem
  const krok0InitialData = useMemo(() => {
    return formData.rodzajZgloszenia ? { rodzajZgloszenia: formData.rodzajZgloszenia } : undefined;
  }, [formData.rodzajZgloszenia]);

  // Memoize initialData dla kroku 1
  const krok1InitialData = useMemo(() => {
    if (!formData.daneOsobowe) return undefined;
    // Konwersja z typu ZgloszenieWypadku do typu formularza
    return {
      pesel: formData.daneOsobowe.pesel,
      dokumentTozsamosci: {
        rodzaj: formData.daneOsobowe.dokumentTozsamosci.rodzaj as "dowód osobisty" | "paszport" | "inny",
        seria: formData.daneOsobowe.dokumentTozsamosci.seria,
        numer: formData.daneOsobowe.dokumentTozsamosci.numer,
      },
      imie: formData.daneOsobowe.imie,
      nazwisko: formData.daneOsobowe.nazwisko,
      dataUrodzenia: formData.daneOsobowe.dataUrodzenia,
      miejsceUrodzenia: formData.daneOsobowe.miejsceUrodzenia,
      telefon: formData.daneOsobowe.telefon,
      email: formData.daneOsobowe.email,
    };
  }, [formData.daneOsobowe]);

  // Memoize initialData dla kroku 2
  const krok2InitialData = useMemo(() => {
    return formData.adresy;
  }, [formData.adresy]);

  // Memoize initialData dla kroku 4
  const krok4InitialData = useMemo(() => {
    if (!formData.daneWypadku) return undefined;
    return {
      dataWypadku: formData.daneWypadku.dataWypadku,
      godzinaWypadku: formData.daneWypadku.godzinaWypadku,
      miejsceWypadku: formData.daneWypadku.miejsceWypadku,
      planowanaGodzinaRozpoczecia: formData.daneWypadku.planowanaGodzinaRozpoczecia,
      planowanaGodzinaZakonczenia: formData.daneWypadku.planowanaGodzinaZakonczenia,
      rodzajUrazow: formData.daneWypadku.rodzajUrazow,
      szczegolowyOpisOkolicznosci: formData.daneWypadku.szczegolowyOpisOkolicznosci,
      szczegolowyOpisPrzyczyn: formData.daneWypadku.szczegolowyOpisPrzyczyn,
      miejsceWypadkuSzczegoly: formData.daneWypadku.miejsceWypadkuSzczegoly,
      naglosc: formData.daneWypadku.naglosc,
      przyczynaZewnetrzna: {
        ...formData.daneWypadku.przyczynaZewnetrzna,
        typ: formData.daneWypadku.przyczynaZewnetrzna.typ as "maszyny" | "energia" | "temperatura" | "chemikalia" | "sily_natury" | "warunki_pracy" | "inne",
      },
      uraz: formData.daneWypadku.uraz,
      zwiazekZPraca: formData.daneWypadku.zwiazekZPraca,
      pierwszaPomoc: formData.daneWypadku.pierwszaPomoc,
      postepowanieOrganow: formData.daneWypadku.postepowanieOrganow,
      maszynyUrzadzenia: formData.daneWypadku.maszynyUrzadzenia,
    };
  }, [formData.daneWypadku]);

  const steps: WizardStep[] = useMemo(() => [
    {
      id: "rodzaj-zgloszenia",
      title: "Wybór rodzaju zgłoszenia",
      description: "Wybierz, jakie dokumenty chcesz złożyć",
      component: () => (
        <Krok0RodzajZgloszenia
          key="krok0"
          onNext={handleKrok0Complete}
          initialData={krok0InitialData}
        />
      ),
    },
    {
      id: "dane-osobowe",
      title: "Dane osobowe",
      description: "Podaj swoje dane osobowe",
      component: () => (
        <Krok1DaneOsobowe
          key="krok1"
          onNext={(data) => {
            handleKrok1Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={krok1InitialData}
        />
      ),
    },
    {
      id: "adresy",
      title: "Adresy",
      description: "Podaj adresy zamieszkania i działalności",
      component: () => (
        <Krok2Adresy
          key="krok2"
          onNext={(data) => {
            handleKrok2Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={krok2InitialData}
        />
      ),
    },
    {
      id: "dane-wypadku",
      title: "Dane o wypadku",
      description: "Podaj szczegółowe informacje o wypadku",
      component: () => (
        <Krok4DaneOWypadku
          key="krok4"
          onNext={(data) => {
            handleKrok4Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={krok4InitialData}
        />
      ),
    },
  ], [krok0InitialData, krok1InitialData, krok2InitialData, krok4InitialData, handleKrok0Complete, handleKrok1Complete, handleKrok2Complete, handleKrok4Complete, goToNextStep, goToPreviousStep, currentStepIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Wirtualny Asystent
            </h1>
            <p className="text-lg text-gray-600">
              Pomoc w zgłoszeniu wypadku przy pracy
            </p>
          </div>
          <Wizard
            steps={steps}
            onComplete={handleWizardComplete}
            onStepChange={handleStepChange}
            currentStep={currentStepIndex}
          />
        </div>
      </div>
    </div>
  );
}

