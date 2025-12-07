"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wizard, WizardStep } from "@/components/asystent/Wizard";
import { Krok1DaneOsobowe } from "@/components/asystent/steps/Krok1DaneOsobowe";
import { Krok2Adresy } from "@/components/asystent/steps/Krok2Adresy";
import { Krok6Wyjasnienia } from "@/components/asystent/steps/Krok6Wyjasnienia";
import { Krok7Swiadkowie } from "@/components/asystent/steps/Krok7Swiadkowie";
import { Krok8Podsumowanie } from "@/components/asystent/steps/Krok8Podsumowanie";
import { DaneOsoboweForm, WyjasnieniaForm, SwiadkowieForm } from "@/lib/validation/schemas";
import { AccidentReport } from "@/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { ProgressBar } from "@/components/asystent/ProgressBar";

function WyjasnieniaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<Partial<AccidentReport>>({
    notificationType: "wyjasnienia", // Ustawiamy typ na wyjaśnienia
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Auto-save z kluczem specyficznym dla wyjaśnień
  useAutoSave(formData, true, "wyjasnienia-form");

  // Załaduj dane z EWYP jeśli istnieją
  useEffect(() => {
    const fromEwyp = searchParams.get("fromEwyp");
    if (fromEwyp === "true") {
      const savedData = localStorage.getItem("ewyp-to-wyjasnienia");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.fromEwyp) {
            // Prewypełnij formularz danymi z EWYP
            setFormData((prev) => ({
              ...prev,
              personalData: parsedData.personalData,
              addresses: parsedData.addresses,
              accidentData: parsedData.accidentData,
              witnesses: parsedData.witnesses,
            }));
            // Usuń dane z localStorage po załadowaniu
            localStorage.removeItem("ewyp-to-wyjasnienia");
            setIsDataLoaded(true);
          }
        } catch (error) {
          console.error("Błąd podczas ładowania danych z EWYP:", error);
        }
      }
    }
    setIsDataLoaded(true);
  }, [searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(formData).length > 1) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

  const handleKrok1Complete = useCallback((data: DaneOsoboweForm) => {
    setFormData((prev) => ({
      ...prev,
      personalData: {
        pesel: data.pesel,
        idDocument: {
          type: data.dokumentTozsamosci.rodzaj,
          series: data.dokumentTozsamosci.seria,
          number: data.dokumentTozsamosci.numer,
        },
        firstName: data.imie,
        lastName: data.nazwisko,
        dateOfBirth: data.dataUrodzenia,
        placeOfBirth: data.miejsceUrodzenia,
        phone: data.telefon,
        email: data.email,
      },
      representativeData: data.innaOsobaZawiadamia && data.osobaZawiadamiajaca ? {
        pesel: data.osobaZawiadamiajaca.pesel,
        idDocument: data.osobaZawiadamiajaca.dokumentTozsamosci ? {
          type: data.osobaZawiadamiajaca.dokumentTozsamosci.rodzaj,
          series: data.osobaZawiadamiajaca.dokumentTozsamosci.seria,
          number: data.osobaZawiadamiajaca.dokumentTozsamosci.numer,
        } : undefined,
        firstName: data.osobaZawiadamiajaca.imie,
        lastName: data.osobaZawiadamiajaca.nazwisko,
        dateOfBirth: data.osobaZawiadamiajaca.dataUrodzenia,
        phone: data.osobaZawiadamiajaca.telefon,
        mieszkaZaGranica: data.osobaZawiadamiajaca.mieszkaZaGranica || false,
        addresses: {
          residentialAddress: data.osobaZawiadamiajaca.adresZamieszkania ? {
            street: data.osobaZawiadamiajaca.adresZamieszkania.ulica,
            houseNumber: data.osobaZawiadamiajaca.adresZamieszkania.numerDomu,
            apartmentNumber: data.osobaZawiadamiajaca.adresZamieszkania.numerLokalu,
            postalCode: data.osobaZawiadamiajaca.adresZamieszkania.kodPocztowy,
            city: data.osobaZawiadamiajaca.adresZamieszkania.miejscowosc,
            country: data.osobaZawiadamiajaca.adresZamieszkania.panstwo,
          } : {
            street: "",
            houseNumber: "",
            postalCode: "",
            city: "",
          },
          lastResidentialAddressInPoland: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce ? {
            street: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.ulica,
            houseNumber: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.numerDomu,
            apartmentNumber: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.numerLokalu,
            postalCode: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy,
            city: data.osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.miejscowosc,
            country: "Polska",
          } : undefined,
          businessAddress: {
            street: "",
            houseNumber: "",
            postalCode: "",
            city: "",
          },
        },
        powerOfAttorneyProvided: false,
      } : undefined,
    }));
  }, []);

  const handleKrok2Complete = useCallback((data: any) => {
    setFormData((prev) => ({
      ...prev,
      addresses: {
        residentialAddress: {
          street: data.adresZamieszkania.ulica,
          houseNumber: data.adresZamieszkania.numerDomu,
          apartmentNumber: data.adresZamieszkania.numerLokalu,
          postalCode: data.adresZamieszkania.kodPocztowy,
          city: data.adresZamieszkania.miejscowosc,
          country: data.adresZamieszkania.panstwo,
        },
        lastResidentialAddressInPoland: data.adresOstatniegoZamieszkaniaWPolsce ? {
          street: data.adresOstatniegoZamieszkaniaWPolsce.ulica,
          houseNumber: data.adresOstatniegoZamieszkaniaWPolsce.numerDomu,
          apartmentNumber: data.adresOstatniegoZamieszkaniaWPolsce.numerLokalu,
          postalCode: data.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy,
          city: data.adresOstatniegoZamieszkaniaWPolsce.miejscowosc,
          country: data.adresOstatniegoZamieszkaniaWPolsce.panstwo,
        } : undefined,
        correspondenceAddress: data.adresDoKorespondencji ? {
          type: data.adresDoKorespondencji.typ,
          address: data.adresDoKorespondencji.adres ? {
            street: data.adresDoKorespondencji.adres.ulica,
            houseNumber: data.adresDoKorespondencji.adres.numerDomu,
            apartmentNumber: data.adresDoKorespondencji.adres.numerLokalu,
            postalCode: data.adresDoKorespondencji.adres.kodPocztowy,
            city: data.adresDoKorespondencji.adres.miejscowosc,
            country: data.adresDoKorespondencji.adres.panstwo,
          } : undefined,
          posteRestante: data.adresDoKorespondencji.posteRestante ? {
            postalCode: data.adresDoKorespondencji.posteRestante.kodPocztowy,
            postOfficeName: data.adresDoKorespondencji.posteRestante.nazwaPlacowki,
          } : undefined,
          postOfficeBox: data.adresDoKorespondencji.skrytka ? {
            number: data.adresDoKorespondencji.skrytka.numer,
            postalCode: data.adresDoKorespondencji.skrytka.kodPocztowy,
            postOfficeName: data.adresDoKorespondencji.skrytka.nazwaPlacowki,
          } : undefined,
          postOfficeBoxP: data.adresDoKorespondencji.przegrodka ? {
            number: data.adresDoKorespondencji.przegrodka.numer,
            postalCode: data.adresDoKorespondencji.przegrodka.kodPocztowy,
            postOfficeName: data.adresDoKorespondencji.przegrodka.nazwaPlacowki,
          } : undefined,
        } : undefined,
        businessAddress: {
          street: data.adresDzialalnosci.ulica,
          houseNumber: data.adresDzialalnosci.numerDomu,
          apartmentNumber: data.adresDzialalnosci.numerLokalu,
          postalCode: data.adresDzialalnosci.kodPocztowy,
          city: data.adresDzialalnosci.miejscowosc,
          phone: data.adresDzialalnosci.telefon,
        },
        childcareAddress: data.opiekaNadDzieckiem && data.adresOpiekiNadDzieckiem ? {
          street: data.adresOpiekiNadDzieckiem.ulica,
          houseNumber: data.adresOpiekiNadDzieckiem.numerDomu,
          apartmentNumber: data.adresOpiekiNadDzieckiem.numerLokalu,
          postalCode: data.adresOpiekiNadDzieckiem.kodPocztowy,
          city: data.adresOpiekiNadDzieckiem.miejscowosc,
          phone: data.adresOpiekiNadDzieckiem.telefon,
        } : undefined,
      },
      businessData: (data.nip || data.regon || data.pkdCode) ? {
        nip: data.nip,
        regon: data.regon,
        pkdCode: data.pkdCode,
        businessScope: data.businessScope,
        address: {
          street: data.adresDzialalnosci.ulica,
          houseNumber: data.adresDzialalnosci.numerDomu,
          apartmentNumber: data.adresDzialalnosci.numerLokalu,
          postalCode: data.adresDzialalnosci.kodPocztowy,
          city: data.adresDzialalnosci.miejscowosc,
        },
      } : prev.businessData,
    }));
  }, []);

  const handleKrok6Complete = useCallback((data: WyjasnieniaForm) => {
    setFormData((prev) => ({
      ...prev,
      victimStatement: {
        activityTypeBeforeAccident: data.rodzajCzynnosciPrzedWypadkiem,
        accidentCircumstances: data.okolicznosciWypadku,
        accidentCauses: data.przyczynyWypadku,
        machineryTools: data.maszynyNarzedzia ? {
          applicable: data.maszynyNarzedzia.dotyczy,
          name: data.maszynyNarzedzia.nazwa,
          type: data.maszynyNarzedzia.typ,
          productionDate: data.maszynyNarzedzia.dataProdukcji,
          operational: data.maszynyNarzedzia.sprawne,
          compliantWithManufacturer: data.maszynyNarzedzia.zgodneZProducentem,
          usageMethod: data.maszynyNarzedzia.sposobUzycia,
        } : undefined,
        protectiveMeasures: data.srodkiOchrony ? {
          used: data.srodkiOchrony.stosowane,
          type: data.srodkiOchrony.rodzaj,
          appropriate: data.srodkiOchrony.wlasciwe,
          operational: data.srodkiOchrony.sprawne,
        } : undefined,
        safetyMeasures: data.asekuracja ? {
          used: data.asekuracja.stosowana,
          description: data.asekuracja.opis,
        } : undefined,
        requiredNumberOfPeople: data.wymaganaLiczbaOsob ? {
          independently: data.wymaganaLiczbaOsob.samodzielnie,
          twoPeopleRequired: data.wymaganaLiczbaOsob.wymaganeDwieOsoby,
        } : undefined,
        healthAndSafety: data.bhp ? {
          complied: data.bhp.przestrzegane,
          preparation: data.bhp.przygotowanie,
          healthAndSafetyTraining: data.bhp.szkoleniaBHP,
          occupationalRiskAssessment: data.bhp.ocenaRyzykaZawodowego,
          riskReductionMeasures: data.bhp.srodkiZmniejszajaceRyzyko,
        } : undefined,
        sobrietyState: data.stanTrzezwosci ? {
          intoxication: data.stanTrzezwosci.nietrzezwosc,
          drugs: data.stanTrzezwosci.srodkiOdurzajace,
          examinationOnAccidentDay: data.stanTrzezwosci.badanieWymienDnia ? {
            conducted: data.stanTrzezwosci.badanieWymienDnia.przeprowadzone,
            byWhom: data.stanTrzezwosci.badanieWymienDnia.przezKogo,
          } : undefined,
        } : undefined,
        controlAuthorities: data.organyKontroli ? {
          actionsTaken: data.organyKontroli.podjeteCzynnosci,
          authorityName: data.organyKontroli.nazwaOrganu,
          address: data.organyKontroli.adres,
          caseNumber: data.organyKontroli.numerSprawy,
          status: data.organyKontroli.status,
        } : undefined,
        firstAid: data.pierwszaPomoc ? {
          provided: data.pierwszaPomoc.udzielona,
          when: data.pierwszaPomoc.kiedy,
          where: data.pierwszaPomoc.gdzie,
          facilityName: data.pierwszaPomoc.nazwaPlacowki,
          hospitalizationPeriod: data.pierwszaPomoc.okresHospitalizacji,
          hospitalizationPlace: data.pierwszaPomoc.miejsceHospitalizacji,
          recognizedInjury: data.pierwszaPomoc.urazRozpoznany,
          incapacityPeriod: data.pierwszaPomoc.okresNiezdolnosci,
        } : undefined,
        sickLeave: data.zwolnienieLekarskie ? {
          onAccidentDay: data.zwolnienieLekarskie.wDniuWypadku,
          description: data.zwolnienieLekarskie.opis,
        } : undefined,
      },
    }));
  }, []);

  const handleKrok7Complete = useCallback((data: SwiadkowieForm) => {
    setFormData((prev) => ({
      ...prev,
      witnesses: data.swiadkowie?.map((swiadek) => ({
        firstName: swiadek.imie,
        lastName: swiadek.nazwisko,
        street: swiadek.ulica,
        houseNumber: swiadek.numerDomu,
        apartmentNumber: swiadek.numerLokalu,
        postalCode: swiadek.kodPocztowy,
        city: swiadek.miejscowosc,
        country: swiadek.panstwo,
        phone: swiadek.telefon,
      })),
    }));
  }, []);

  const handleGenerateDocuments = useCallback(async () => {
    try {
      // Dynamiczny import funkcji generującej PDF (działa tylko w przeglądarce)
      if (typeof window === "undefined") {
        alert("Generowanie PDF dostępne tylko w przeglądarce");
        return;
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
    } catch (error) {
      console.error("Błąd podczas generowania PDF:", error);
      alert("Wystąpił błąd podczas generowania dokumentu PDF");
    }
  }, [formData]);

  const handleWizardComplete = useCallback(() => {
    console.log("Formularz wyjaśnień ukończony:", formData);
    alert("Formularz został ukończony! (Funkcjonalność w trakcie implementacji)");
  }, [formData]);

  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const goToNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const MAX_STEP_INDEX = 4; // 5 kroków (0-4): dane osobowe, adresy, wyjaśnienia, świadkowie, podsumowanie
      if (prev < MAX_STEP_INDEX) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const krok1InitialData = useMemo(() => {
    if (!formData.personalData) return undefined;
    return {
      pesel: formData.personalData.pesel,
      dokumentTozsamosci: {
        rodzaj: formData.personalData.idDocument.type as "dowód osobisty" | "paszport" | "inny",
        seria: formData.personalData.idDocument.series,
        numer: formData.personalData.idDocument.number,
      },
      imie: formData.personalData.firstName,
      nazwisko: formData.personalData.lastName,
      dataUrodzenia: formData.personalData.dateOfBirth,
      miejsceUrodzenia: formData.personalData.placeOfBirth,
      telefon: formData.personalData.phone,
      email: formData.personalData.email,
      innaOsobaZawiadamia: !!formData.representativeData,
      osobaZawiadamiajaca: formData.representativeData ? {
        pesel: formData.representativeData.pesel,
        dokumentTozsamosci: formData.representativeData.idDocument ? {
          rodzaj: formData.representativeData.idDocument.type as "dowód osobisty" | "paszport" | "inny",
          seria: formData.representativeData.idDocument.series,
          numer: formData.representativeData.idDocument.number,
        } : undefined,
        imie: formData.representativeData.firstName,
        nazwisko: formData.representativeData.lastName,
        dataUrodzenia: formData.representativeData.dateOfBirth,
        telefon: formData.representativeData.phone,
        adresZamieszkania: formData.representativeData.addresses?.residentialAddress ? {
          ulica: formData.representativeData.addresses.residentialAddress.street || "",
          numerDomu: formData.representativeData.addresses.residentialAddress.houseNumber || "",
          numerLokalu: formData.representativeData.addresses.residentialAddress.apartmentNumber,
          kodPocztowy: formData.representativeData.addresses.residentialAddress.postalCode || "",
          miejscowosc: formData.representativeData.addresses.residentialAddress.city || "",
          panstwo: formData.representativeData.addresses.residentialAddress.country,
        } : undefined,
        mieszkaZaGranica: formData.representativeData.mieszkaZaGranica || false,
        adresOstatniegoZamieszkaniaWPolsce: formData.representativeData.addresses?.lastResidentialAddressInPoland ? {
          ulica: formData.representativeData.addresses.lastResidentialAddressInPoland.street || "",
          numerDomu: formData.representativeData.addresses.lastResidentialAddressInPoland.houseNumber || "",
          numerLokalu: formData.representativeData.addresses.lastResidentialAddressInPoland.apartmentNumber,
          kodPocztowy: formData.representativeData.addresses.lastResidentialAddressInPoland.postalCode || "",
          miejscowosc: formData.representativeData.addresses.lastResidentialAddressInPoland.city || "",
        } : undefined,
      } : undefined,
    };
  }, [formData.personalData, formData.representativeData]);

  const krok2InitialData = useMemo(() => {
    if (!formData.addresses) return undefined;
    if (!formData.addresses.residentialAddress || !formData.addresses.businessAddress) return undefined;
    
    return {
      adresZamieszkania: {
        ulica: formData.addresses.residentialAddress.street || "",
        numerDomu: formData.addresses.residentialAddress.houseNumber || "",
        numerLokalu: formData.addresses.residentialAddress.apartmentNumber,
        kodPocztowy: formData.addresses.residentialAddress.postalCode || "",
        miejscowosc: formData.addresses.residentialAddress.city || "",
        panstwo: formData.addresses.residentialAddress.country,
      },
      adresOstatniegoZamieszkaniaWPolsce: formData.addresses.lastResidentialAddressInPoland ? {
        ulica: formData.addresses.lastResidentialAddressInPoland.street || "",
        numerDomu: formData.addresses.lastResidentialAddressInPoland.houseNumber || "",
        numerLokalu: formData.addresses.lastResidentialAddressInPoland.apartmentNumber,
        kodPocztowy: formData.addresses.lastResidentialAddressInPoland.postalCode || "",
        miejscowosc: formData.addresses.lastResidentialAddressInPoland.city || "",
        panstwo: formData.addresses.lastResidentialAddressInPoland.country,
      } : undefined,
      adresDoKorespondencji: formData.addresses.correspondenceAddress ? {
        typ: formData.addresses.correspondenceAddress.type,
        adres: formData.addresses.correspondenceAddress.address ? {
          ulica: formData.addresses.correspondenceAddress.address.street || "",
          numerDomu: formData.addresses.correspondenceAddress.address.houseNumber || "",
          numerLokalu: formData.addresses.correspondenceAddress.address.apartmentNumber,
          kodPocztowy: formData.addresses.correspondenceAddress.address.postalCode || "",
          miejscowosc: formData.addresses.correspondenceAddress.address.city || "",
          panstwo: formData.addresses.correspondenceAddress.address.country,
        } : undefined,
        posteRestante: formData.addresses.correspondenceAddress.posteRestante ? {
          kodPocztowy: formData.addresses.correspondenceAddress.posteRestante.postalCode || "",
          nazwaPlacowki: formData.addresses.correspondenceAddress.posteRestante.postOfficeName || "",
        } : undefined,
        skrytka: formData.addresses.correspondenceAddress.postOfficeBox ? {
          numer: formData.addresses.correspondenceAddress.postOfficeBox.number || "",
          kodPocztowy: formData.addresses.correspondenceAddress.postOfficeBox.postalCode || "",
          nazwaPlacowki: formData.addresses.correspondenceAddress.postOfficeBox.postOfficeName || "",
        } : undefined,
        przegrodka: formData.addresses.correspondenceAddress.postOfficeBoxP ? {
          numer: formData.addresses.correspondenceAddress.postOfficeBoxP.number || "",
          kodPocztowy: formData.addresses.correspondenceAddress.postOfficeBoxP.postalCode || "",
          nazwaPlacowki: formData.addresses.correspondenceAddress.postOfficeBoxP.postOfficeName || "",
        } : undefined,
      } : undefined,
      adresDzialalnosci: {
        ulica: formData.addresses.businessAddress.street || "",
        numerDomu: formData.addresses.businessAddress.houseNumber || "",
        numerLokalu: formData.addresses.businessAddress.apartmentNumber,
        kodPocztowy: formData.addresses.businessAddress.postalCode || "",
        miejscowosc: formData.addresses.businessAddress.city || "",
        telefon: formData.addresses.businessAddress.phone,
      },
      opiekaNadDzieckiem: !!formData.addresses.childcareAddress,
      adresOpiekiNadDzieckiem: formData.addresses.childcareAddress ? {
        ulica: formData.addresses.childcareAddress.street || "",
        numerDomu: formData.addresses.childcareAddress.houseNumber || "",
        numerLokalu: formData.addresses.childcareAddress.apartmentNumber,
        kodPocztowy: formData.addresses.childcareAddress.postalCode || "",
        miejscowosc: formData.addresses.childcareAddress.city || "",
        telefon: formData.addresses.childcareAddress.phone,
      } : undefined,
    };
  }, [formData.addresses]);


  const steps: WizardStep[] = useMemo(() => [
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
      id: "wyjasnienia",
      title: "Szczegółowe wyjaśnienia",
      description: "Podaj szczegółowe wyjaśnienia dotyczące wypadku",
      component: () => (
        <Krok6Wyjasnienia
          key="krok3"
          onNext={(data) => {
            handleKrok6Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={undefined}
        />
      ),
    },
    {
      id: "swiadkowie",
      title: "Świadkowie",
      description: "Dodaj dane świadków wypadku (opcjonalnie)",
      component: () => (
        <Krok7Swiadkowie
          key="krok4"
          onNext={(data) => {
            handleKrok7Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={undefined}
        />
      ),
    },
    {
      id: "podsumowanie",
      title: "Podsumowanie",
      description: "Sprawdź dane i wygeneruj dokumenty",
      component: () => (
        <Krok8Podsumowanie
          key="krok6"
          onPrevious={goToPreviousStep}
          onGenerateDocuments={handleGenerateDocuments}
          formData={formData}
        />
      ),
    },
  ], [
    krok1InitialData,
    krok2InitialData,
    handleKrok1Complete,
    handleKrok2Complete,
    handleKrok6Complete,
    handleKrok7Complete,
    handleGenerateDocuments,
    goToNextStep,
    goToPreviousStep,
    formData,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <button
                  onClick={() => router.push("/asystent")}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  ← Powrót
                </button>
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Zapis wyjaśnień poszkodowanego
                </h1>
                <p className="text-lg text-gray-600">
                  Szczegółowe wyjaśnienia dotyczące wypadku
                </p>
              </div>
              <div className="flex-1" />
            </div>
          </div>

          {isDataLoaded && (
            <Wizard
              steps={steps}
              onComplete={handleWizardComplete}
              onStepChange={handleStepChange}
              currentStep={currentStepIndex}
              progressBar={
                <ProgressBar
                  steps={steps.map((s) => ({
                    id: s.id,
                    title: s.title,
                    description: s.description,
                  }))}
                  currentStep={currentStepIndex}
                  formData={formData}
                  onStepClick={(index) => {
                    if (index <= currentStepIndex) {
                      setCurrentStepIndex(index);
                      handleStepChange(index);
                    }
                  }}
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function WyjasnieniaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Ładowanie...</div>}>
      <WyjasnieniaPageContent />
    </Suspense>
  );
}

