"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wizard, WizardStep } from "@/components/asystent/Wizard";
import { Krok1DaneOsobowe } from "@/components/asystent/steps/Krok1DaneOsobowe";
import { Krok2Adresy } from "@/components/asystent/steps/Krok2Adresy";
import { Krok4DaneOWypadku } from "@/components/asystent/steps/Krok4DaneOWypadku";
import { Krok5WeryfikacjaElementow } from "@/components/asystent/steps/Krok5WeryfikacjaElementow";
import { Krok7Swiadkowie } from "@/components/asystent/steps/Krok7Swiadkowie";
import { Krok8Podsumowanie } from "@/components/asystent/steps/Krok8Podsumowanie";
import { Krok9Zalaczniki } from "@/components/asystent/steps/Krok9Zalaczniki";
import { DaneOsoboweForm, DaneWypadkuForm, SwiadkowieForm } from "@/lib/validation/schemas";
import { AccidentReport } from "@/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { ProgressBar } from "@/components/asystent/ProgressBar";

export default function EWYPPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<AccidentReport>>({
    notificationType: "zawiadomienie", // Ustawiamy typ na zawiadomienie
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto-save z kluczem specyficznym dla EWYP
  useAutoSave(formData, true, "ewyp-form");

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
      },
      representativeData: (() => {
        // Twórz representativeData TYLKO jeśli:
        // 1. Zaznaczono "inna osoba zawiadamia"
        // 2. I istnieje osobaZawiadamiajaca
        // 3. I ma wypełnione przynajmniej imię lub nazwisko
        if (!data.innaOsobaZawiadamia || !data.osobaZawiadamiajaca) {
          return undefined;
        }
        const osoba = data.osobaZawiadamiajaca;
        // Sprawdź czy są wypełnione podstawowe dane
        if (!osoba.imie?.trim() && !osoba.nazwisko?.trim()) {
          return undefined;
        }
        return {
          pesel: osoba.pesel,
          idDocument: osoba.dokumentTozsamosci ? {
            type: osoba.dokumentTozsamosci.rodzaj,
            series: osoba.dokumentTozsamosci.seria,
            number: osoba.dokumentTozsamosci.numer,
          } : undefined,
          firstName: osoba.imie,
          lastName: osoba.nazwisko,
          dateOfBirth: osoba.dataUrodzenia,
          phone: osoba.telefon,
          mieszkaZaGranica: osoba.mieszkaZaGranica || false,
          addresses: {
            residentialAddress: osoba.adresZamieszkania ? {
              street: osoba.adresZamieszkania.ulica,
              houseNumber: osoba.adresZamieszkania.numerDomu,
              apartmentNumber: osoba.adresZamieszkania.numerLokalu,
              postalCode: osoba.adresZamieszkania.kodPocztowy,
              city: osoba.adresZamieszkania.miejscowosc,
              country: osoba.adresZamieszkania.panstwo,
            } : undefined,
            lastResidentialAddressInPoland: osoba.adresOstatniegoZamieszkaniaWPolsce ? {
              street: osoba.adresOstatniegoZamieszkaniaWPolsce.ulica,
              houseNumber: osoba.adresOstatniegoZamieszkaniaWPolsce.numerDomu,
              apartmentNumber: osoba.adresOstatniegoZamieszkaniaWPolsce.numerLokalu,
              postalCode: osoba.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy,
              city: osoba.adresOstatniegoZamieszkaniaWPolsce.miejscowosc,
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
        };
      })(),
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

  const handleKrok4Complete = useCallback((data: DaneWypadkuForm) => {
    setFormData((prev) => ({
      ...prev,
      accidentData: {
        accidentDate: data.dataWypadku,
        accidentTime: data.godzinaWypadku,
        accidentPlace: data.miejsceWypadku,
        plannedStartTime: data.planowanaGodzinaRozpoczecia,
        plannedEndTime: data.planowanaGodzinaZakonczenia,
        injuryType: data.rodzajUrazow,
        detailedCircumstancesDescription: data.szczegolowyOpisOkolicznosci,
        detailedCausesDescription: data.szczegolowyOpisPrzyczyn,
        accidentPlaceDetails: data.miejsceWypadkuSzczegoly,
        suddenness: {
          confirmed: data.naglosc.potwierdzona,
          description: data.naglosc.opis,
          duration: data.naglosc.czasTrwania,
        },
        externalCause: {
          confirmed: data.przyczynaZewnetrzna.potwierdzona,
          type: data.przyczynaZewnetrzna.typ,
          description: data.przyczynaZewnetrzna.opis,
        },
        injury: {
          confirmed: data.uraz.potwierdzony,
          type: data.uraz.rodzaj,
          location: data.uraz.lokalizacja,
          medicalDocumentation: data.uraz.dokumentacjaMedyczna,
        },
        workRelation: {
          causal: data.zwiazekZPraca.przyczynowy,
          temporal: data.zwiazekZPraca.czasowy,
          spatial: data.zwiazekZPraca.miejscowy,
          functional: data.zwiazekZPraca.funkcjonalny,
          description: data.zwiazekZPraca.opis,
        },
        firstAid: data.pierwszaPomoc ? {
          provided: data.pierwszaPomoc.udzielona,
          facilityName: data.pierwszaPomoc.nazwaPlacowki,
          facilityAddress: data.pierwszaPomoc.adresPlacowki,
        } : undefined,
        authorityProceedings: data.postepowanieOrganow ? {
          conducted: data.postepowanieOrganow.prowadzone,
          authorityName: data.postepowanieOrganow.nazwaOrganu,
          address: data.postepowanieOrganow.adres,
          caseNumber: data.postepowanieOrganow.numerSprawy,
          status: data.postepowanieOrganow.status,
        } : undefined,
        machineryEquipment: data.maszynyUrzadzenia ? {
          applicable: data.maszynyUrzadzenia.dotyczy,
          name: data.maszynyUrzadzenia.nazwa,
          type: data.maszynyUrzadzenia.typ,
          productionDate: data.maszynyUrzadzenia.dataProdukcji,
          operational: data.maszynyUrzadzenia.sprawne,
          compliantWithManufacturer: data.maszynyUrzadzenia.zgodneZProducentem,
          usageMethod: data.maszynyUrzadzenia.sposobUzycia,
          certified: data.maszynyUrzadzenia.atest,
          conformityDeclaration: data.maszynyUrzadzenia.deklaracjaZgodnosci,
          inFixedAssetsRegister: data.maszynyUrzadzenia.wEwidencjiSrodkowTrwalych,
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

  const handleGenerateDocuments = useCallback(() => {
    console.log("Generowanie dokumentów EWYP dla:", formData);
    alert("Funkcjonalność generowania dokumentów PDF będzie dostępna wkrótce!");
  }, [formData]);

  const handleWizardComplete = useCallback(() => {
    console.log("Formularz EWYP ukończony:", formData);
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
      const MAX_STEP_INDEX = 6; // 7 kroków (0-6)
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

  const krok4InitialData = useMemo(() => {
    if (!formData.accidentData) return undefined;
    if (
      !formData.accidentData.suddenness ||
      !formData.accidentData.externalCause ||
      !formData.accidentData.injury ||
      !formData.accidentData.workRelation
    ) {
      return undefined;
    }
    
    return {
      dataWypadku: formData.accidentData.accidentDate || "",
      godzinaWypadku: formData.accidentData.accidentTime || "",
      miejsceWypadku: formData.accidentData.accidentPlace || "",
      planowanaGodzinaRozpoczecia: formData.accidentData.plannedStartTime || "",
      planowanaGodzinaZakonczenia: formData.accidentData.plannedEndTime || "",
      rodzajUrazow: formData.accidentData.injuryType || "",
      szczegolowyOpisOkolicznosci: formData.accidentData.detailedCircumstancesDescription || "",
      szczegolowyOpisPrzyczyn: formData.accidentData.detailedCausesDescription || "",
      miejsceWypadkuSzczegoly: formData.accidentData.accidentPlaceDetails || "",
      naglosc: {
        potwierdzona: formData.accidentData.suddenness.confirmed || false,
        opis: formData.accidentData.suddenness.description || "",
        czasTrwania: formData.accidentData.suddenness.duration,
      },
      przyczynaZewnetrzna: {
        potwierdzona: formData.accidentData.externalCause.confirmed || false,
        typ: (formData.accidentData.externalCause.type || "inne") as "maszyny" | "energia" | "temperatura" | "chemikalia" | "sily_natury" | "warunki_pracy" | "inne",
        opis: formData.accidentData.externalCause.description || "",
      },
      uraz: {
        potwierdzony: formData.accidentData.injury.confirmed || false,
        rodzaj: formData.accidentData.injury.type || "",
        lokalizacja: formData.accidentData.injury.location || "",
        dokumentacjaMedyczna: formData.accidentData.injury.medicalDocumentation,
      },
      zwiazekZPraca: {
        przyczynowy: formData.accidentData.workRelation.causal || false,
        czasowy: formData.accidentData.workRelation.temporal || false,
        miejscowy: formData.accidentData.workRelation.spatial || false,
        funkcjonalny: formData.accidentData.workRelation.functional || false,
        opis: formData.accidentData.workRelation.description || "",
      },
      pierwszaPomoc: formData.accidentData.firstAid ? {
        udzielona: formData.accidentData.firstAid.provided || false,
        nazwaPlacowki: formData.accidentData.firstAid.facilityName,
        adresPlacowki: formData.accidentData.firstAid.facilityAddress,
      } : undefined,
      postepowanieOrganow: formData.accidentData.authorityProceedings ? {
        prowadzone: formData.accidentData.authorityProceedings.conducted || false,
        nazwaOrganu: formData.accidentData.authorityProceedings.authorityName,
        adres: formData.accidentData.authorityProceedings.address,
        numerSprawy: formData.accidentData.authorityProceedings.caseNumber,
        status: formData.accidentData.authorityProceedings.status,
      } : undefined,
      maszynyUrzadzenia: formData.accidentData.machineryEquipment ? {
        dotyczy: formData.accidentData.machineryEquipment.applicable || false,
        nazwa: formData.accidentData.machineryEquipment.name,
        typ: formData.accidentData.machineryEquipment.type,
        dataProdukcji: formData.accidentData.machineryEquipment.productionDate,
        sprawne: formData.accidentData.machineryEquipment.operational,
        zgodneZProducentem: formData.accidentData.machineryEquipment.compliantWithManufacturer,
        sposobUzycia: formData.accidentData.machineryEquipment.usageMethod,
        atest: formData.accidentData.machineryEquipment.certified,
        deklaracjaZgodnosci: formData.accidentData.machineryEquipment.conformityDeclaration,
        wEwidencjiSrodkowTrwalych: formData.accidentData.machineryEquipment.inFixedAssetsRegister,
      } : undefined,
    };
  }, [formData.accidentData]);

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
      id: "dane-wypadku",
      title: "Dane o wypadku",
      description: "Podaj szczegółowe informacje o wypadku",
      component: () => (
        <Krok4DaneOWypadku
          key="krok3"
          onNext={(data) => {
            handleKrok4Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={krok4InitialData}
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
      id: "zalaczniki",
      title: "Załączniki",
      description: "Wybierz załączniki i sposób odbioru odpowiedzi",
      component: () => (
        <Krok9Zalaczniki
          key="krok5"
          onNext={(attachments, responseDeliveryMethod, signatureDate, documentCommitments, documentCommitmentDate) => {
            setFormData((prev) => ({
              ...prev,
              attachments,
              responseDeliveryMethod,
              signatureDate,
              documentCommitments,
              documentCommitmentDate,
            }));
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialAttachments={formData.attachments}
          initialResponseDeliveryMethod={formData.responseDeliveryMethod}
          initialSignatureDate={formData.signatureDate}
          initialDocumentCommitments={formData.documentCommitments}
          initialDocumentCommitmentDate={formData.documentCommitmentDate}
        />
      ),
    },
    {
      id: "weryfikacja-elementow",
      title: "Weryfikacja elementów",
      description: "Sprawdź, czy wszystkie elementy definicji są spełnione",
      component: () => (
        <Krok5WeryfikacjaElementow
          key="krok6"
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          accidentData={formData.accidentData}
        />
      ),
    },
    {
      id: "podsumowanie",
      title: "Podsumowanie",
      description: "Sprawdź dane i wygeneruj dokumenty",
      component: () => (
        <Krok8Podsumowanie
          key="krok7"
          onPrevious={goToPreviousStep}
          onGenerateDocuments={handleGenerateDocuments}
          formData={formData}
        />
      ),
    },
  ], [
    krok1InitialData,
    krok2InitialData,
    krok4InitialData,
    handleKrok1Complete,
    handleKrok2Complete,
    handleKrok4Complete,
    handleKrok7Complete,
    handleGenerateDocuments,
    goToNextStep,
    goToPreviousStep,
    formData,
  ]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  Zawiadomienie o wypadku
                </h1>
                <p className="text-lg text-gray-600">
                  Formularz EWYP
                </p>
              </div>
              <div className="flex-1" />
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}

