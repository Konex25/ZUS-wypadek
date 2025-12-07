"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Wizard, WizardStep } from "@/components/asystent/Wizard";
import { Krok0RodzajZgloszenia } from "@/components/asystent/steps/Krok0RodzajZgloszenia";
import { Krok1DaneOsobowe } from "@/components/asystent/steps/Krok1DaneOsobowe";
import { Krok2Adresy } from "@/components/asystent/steps/Krok2Adresy";
import { Krok4DaneOWypadku } from "@/components/asystent/steps/Krok4DaneOWypadku";
import { Krok5WeryfikacjaElementow } from "@/components/asystent/steps/Krok5WeryfikacjaElementow";
import { Krok6Wyjasnienia } from "@/components/asystent/steps/Krok6Wyjasnienia";
import { Krok7Swiadkowie } from "@/components/asystent/steps/Krok7Swiadkowie";
import { Krok8Podsumowanie } from "@/components/asystent/steps/Krok8Podsumowanie";
import { Krok9Zalaczniki } from "@/components/asystent/steps/Krok9Zalaczniki";
import { RodzajZgloszeniaForm, DaneOsoboweForm, DaneWypadkuForm, WyjasnieniaForm, SwiadkowieForm } from "@/lib/validation/schemas";
import { AccidentReport } from "@/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { detectMissingElements, getStepCompleteness, getFormCompletionPercentage } from "@/lib/validation/completeness";
import { ProgressBar } from "@/components/asystent/ProgressBar";

export default function AsystentPage() {
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  // Auto-save
  const { restoreData, clearData, hasSavedData } = useAutoSave(formData, true);
  const [isMounted, setIsMounted] = useState(false);

  // Oznacz komponent jako zamontowany po hydratacji
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load form data from analysis if available
  useEffect(() => {
    if (isMounted && Object.keys(formData).length === 0) {
      try {
        const formDataFromAnalysisStr = sessionStorage.getItem(
          "formDataFromAnalysis"
        );
        if (formDataFromAnalysisStr) {
          const data = JSON.parse(formDataFromAnalysisStr);
          if (data && Object.keys(data).length > 0) {
            setFormData(data);
            // Clear sessionStorage after loading
            sessionStorage.removeItem("formDataFromAnalysis");
          }
        }
      } catch (error) {
        console.error("Error loading form data from analysis:", error);
      }
    }
  }, [isMounted, formData]);

  // Przywróć zapisane dane przy pierwszym załadowaniu (tylko po hydratacji)
  useEffect(() => {
    if (isMounted && hasSavedData && Object.keys(formData).length === 0) {
      const saved = restoreData();
      if (saved && Object.keys(saved).length > 0) {
        setShowRestoreDialog(true);
      }
    }
  }, [isMounted, hasSavedData, formData, restoreData]); // Tylko po hydratacji

  const handleRestoreData = () => {
    const saved = restoreData();
    if (saved) {
      setFormData(saved);
      setShowRestoreDialog(false);
    }
  };

  const handleDiscardData = () => {
    clearData();
    setShowRestoreDialog(false);
  };

  // Ostrzeżenie przed opuszczeniem strony z niezapisanych zmian
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(formData).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

  const handleKrok0Complete = useCallback((data: RodzajZgloszeniaForm) => {
    setFormData((prev) => {
      // Sprawdź czy wartość się faktycznie zmieniła
      if (prev.notificationType === data.rodzajZgloszenia) {
        return prev; // Zwróć ten sam obiekt jeśli nic się nie zmieniło
      }
      return {
        ...prev,
        notificationType: data.rodzajZgloszenia,
      };
    });
  }, []);

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
      // Opcjonalne: dane osoby zawiadamiającej
      representativeData:
        data.innaOsobaZawiadamia && data.osobaZawiadamiajaca
          ? {
              pesel: data.osobaZawiadamiajaca.pesel,
              idDocument: data.osobaZawiadamiajaca.dokumentTozsamosci
                ? {
                    type: data.osobaZawiadamiajaca.dokumentTozsamosci.rodzaj,
                    series: data.osobaZawiadamiajaca.dokumentTozsamosci.seria,
                    number: data.osobaZawiadamiajaca.dokumentTozsamosci.numer,
                  }
                : undefined,
              firstName: data.osobaZawiadamiajaca.imie,
              lastName: data.osobaZawiadamiajaca.nazwisko,
              dateOfBirth: data.osobaZawiadamiajaca.dataUrodzenia,
              phone: data.osobaZawiadamiajaca.telefon,
              mieszkaZaGranica:
                data.osobaZawiadamiajaca.mieszkaZaGranica || false,
              addresses: {
                residentialAddress: data.osobaZawiadamiajaca.adresZamieszkania
                  ? {
                      street: data.osobaZawiadamiajaca.adresZamieszkania.ulica,
                      houseNumber:
                        data.osobaZawiadamiajaca.adresZamieszkania.numerDomu,
                      apartmentNumber:
                        data.osobaZawiadamiajaca.adresZamieszkania.numerLokalu,
                      postalCode:
                        data.osobaZawiadamiajaca.adresZamieszkania.kodPocztowy,
                      city: data.osobaZawiadamiajaca.adresZamieszkania
                        .miejscowosc,
                      country:
                        data.osobaZawiadamiajaca.adresZamieszkania.panstwo,
                    }
                  : {
                      street: "",
                      houseNumber: "",
                      postalCode: "",
                      city: "",
                    },
                lastResidentialAddressInPoland: data.osobaZawiadamiajaca
                  .adresOstatniegoZamieszkaniaWPolsce
                  ? {
                      street:
                        data.osobaZawiadamiajaca
                          .adresOstatniegoZamieszkaniaWPolsce.ulica,
                      houseNumber:
                        data.osobaZawiadamiajaca
                          .adresOstatniegoZamieszkaniaWPolsce.numerDomu,
                      apartmentNumber:
                        data.osobaZawiadamiajaca
                          .adresOstatniegoZamieszkaniaWPolsce.numerLokalu,
                      postalCode:
                        data.osobaZawiadamiajaca
                          .adresOstatniegoZamieszkaniaWPolsce.kodPocztowy,
                      city: data.osobaZawiadamiajaca
                        .adresOstatniegoZamieszkaniaWPolsce.miejscowosc,
                      country: "Polska",
                    }
                  : undefined,
                businessAddress: {
                  street: "",
                  houseNumber: "",
                  postalCode: "",
                  city: "",
                },
              },
              powerOfAttorneyProvided: false, // Będzie wypełnione w kroku załączników
            }
          : undefined,
    }));
  }, []);

  const handleKrok2Complete = useCallback((data: any) => {
    // Konwersja z formatu formularza (polskie nazwy) do formatu interfejsu (angielskie nazwy)
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
        lastResidentialAddressInPoland: data.adresOstatniegoZamieszkaniaWPolsce
          ? {
              street: data.adresOstatniegoZamieszkaniaWPolsce.ulica,
              houseNumber: data.adresOstatniegoZamieszkaniaWPolsce.numerDomu,
              apartmentNumber:
                data.adresOstatniegoZamieszkaniaWPolsce.numerLokalu,
              postalCode: data.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy,
              city: data.adresOstatniegoZamieszkaniaWPolsce.miejscowosc,
              country: data.adresOstatniegoZamieszkaniaWPolsce.panstwo,
            }
          : undefined,
        correspondenceAddress: data.adresDoKorespondencji
          ? {
              type: data.adresDoKorespondencji.typ,
              address: data.adresDoKorespondencji.adres
                ? {
                    street: data.adresDoKorespondencji.adres.ulica,
                    houseNumber: data.adresDoKorespondencji.adres.numerDomu,
                    apartmentNumber:
                      data.adresDoKorespondencji.adres.numerLokalu,
                    postalCode: data.adresDoKorespondencji.adres.kodPocztowy,
                    city: data.adresDoKorespondencji.adres.miejscowosc,
                    country: data.adresDoKorespondencji.adres.panstwo,
                  }
                : undefined,
              posteRestante: data.adresDoKorespondencji.posteRestante
                ? {
                    postalCode:
                      data.adresDoKorespondencji.posteRestante.kodPocztowy,
                    postOfficeName:
                      data.adresDoKorespondencji.posteRestante.nazwaPlacowki,
                  }
                : undefined,
              postOfficeBox: data.adresDoKorespondencji.skrytka
                ? {
                    number: data.adresDoKorespondencji.skrytka.numer,
                    postalCode: data.adresDoKorespondencji.skrytka.kodPocztowy,
                    postOfficeName:
                      data.adresDoKorespondencji.skrytka.nazwaPlacowki,
                  }
                : undefined,
              postOfficeBoxP: data.adresDoKorespondencji.przegrodka
                ? {
                    number: data.adresDoKorespondencji.przegrodka.numer,
                    postalCode:
                      data.adresDoKorespondencji.przegrodka.kodPocztowy,
                    postOfficeName:
                      data.adresDoKorespondencji.przegrodka.nazwaPlacowki,
                  }
                : undefined,
            }
          : undefined,
        businessAddress: {
          street: data.adresDzialalnosci.ulica,
          houseNumber: data.adresDzialalnosci.numerDomu,
          apartmentNumber: data.adresDzialalnosci.numerLokalu,
          postalCode: data.adresDzialalnosci.kodPocztowy,
          city: data.adresDzialalnosci.miejscowosc,
          phone: data.adresDzialalnosci.telefon,
        },
        childcareAddress:
          data.opiekaNadDzieckiem && data.adresOpiekiNadDzieckiem
            ? {
                street: data.adresOpiekiNadDzieckiem.ulica,
                houseNumber: data.adresOpiekiNadDzieckiem.numerDomu,
                apartmentNumber: data.adresOpiekiNadDzieckiem.numerLokalu,
                postalCode: data.adresOpiekiNadDzieckiem.kodPocztowy,
                city: data.adresOpiekiNadDzieckiem.miejscowosc,
                phone: data.adresOpiekiNadDzieckiem.telefon,
              }
            : undefined,
      },
      // Zapisz dane działalności z CEIDG (jeśli dostępne)
      businessData:
        data.nip || data.regon || data.pkdCode
          ? {
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
            }
          : prev.businessData,
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
        firstAid: data.pierwszaPomoc
          ? {
              provided: data.pierwszaPomoc.udzielona,
              facilityName: data.pierwszaPomoc.nazwaPlacowki,
              facilityAddress: data.pierwszaPomoc.adresPlacowki,
            }
          : undefined,
        authorityProceedings: data.postepowanieOrganow
          ? {
              conducted: data.postepowanieOrganow.prowadzone,
              authorityName: data.postepowanieOrganow.nazwaOrganu,
              address: data.postepowanieOrganow.adres,
              caseNumber: data.postepowanieOrganow.numerSprawy,
              status: data.postepowanieOrganow.status,
            }
          : undefined,
        machineryEquipment: data.maszynyUrzadzenia
          ? {
              applicable: data.maszynyUrzadzenia.dotyczy,
              name: data.maszynyUrzadzenia.nazwa,
              type: data.maszynyUrzadzenia.typ,
              productionDate: data.maszynyUrzadzenia.dataProdukcji,
              operational: data.maszynyUrzadzenia.sprawne,
              compliantWithManufacturer:
                data.maszynyUrzadzenia.zgodneZProducentem,
              usageMethod: data.maszynyUrzadzenia.sposobUzycia,
              certified: data.maszynyUrzadzenia.atest,
              conformityDeclaration: data.maszynyUrzadzenia.deklaracjaZgodnosci,
              inFixedAssetsRegister:
                data.maszynyUrzadzenia.wEwidencjiSrodkowTrwalych,
            }
          : undefined,
      },
    }));
  }, []);

  const handleKrok6Complete = useCallback((data: WyjasnieniaForm) => {
    setFormData((prev) => ({
      ...prev,
      victimStatement: {
        activityTypeBeforeAccident: data.rodzajCzynnosciPrzedWypadkiem,
        accidentCircumstances: data.okolicznosciWypadku,
        accidentCauses: data.przyczynyWypadku,
        machineryTools: data.maszynyNarzedzia
          ? {
              applicable: data.maszynyNarzedzia.dotyczy,
              name: data.maszynyNarzedzia.nazwa,
              type: data.maszynyNarzedzia.typ,
              productionDate: data.maszynyNarzedzia.dataProdukcji,
              operational: data.maszynyNarzedzia.sprawne,
              compliantWithManufacturer:
                data.maszynyNarzedzia.zgodneZProducentem,
              usageMethod: data.maszynyNarzedzia.sposobUzycia,
            }
          : undefined,
        protectiveMeasures: data.srodkiOchrony
          ? {
              used: data.srodkiOchrony.stosowane,
              type: data.srodkiOchrony.rodzaj,
              appropriate: data.srodkiOchrony.wlasciwe,
              operational: data.srodkiOchrony.sprawne,
            }
          : undefined,
        safetyMeasures: data.asekuracja
          ? {
              used: data.asekuracja.stosowana,
              description: data.asekuracja.opis,
            }
          : undefined,
        requiredNumberOfPeople: data.wymaganaLiczbaOsob
          ? {
              independently: data.wymaganaLiczbaOsob.samodzielnie,
              twoPeopleRequired: data.wymaganaLiczbaOsob.wymaganeDwieOsoby,
            }
          : undefined,
        healthAndSafety: data.bhp
          ? {
              complied: data.bhp.przestrzegane,
              preparation: data.bhp.przygotowanie,
              healthAndSafetyTraining: data.bhp.szkoleniaBHP,
              occupationalRiskAssessment: data.bhp.ocenaRyzykaZawodowego,
              riskReductionMeasures: data.bhp.srodkiZmniejszajaceRyzyko,
            }
          : undefined,
        sobrietyState: data.stanTrzezwosci
          ? {
              intoxication: data.stanTrzezwosci.nietrzezwosc,
              drugs: data.stanTrzezwosci.srodkiOdurzajace,
              examinationOnAccidentDay: data.stanTrzezwosci.badanieWymienDnia
                ? {
                    conducted:
                      data.stanTrzezwosci.badanieWymienDnia.przeprowadzone,
                    byWhom: data.stanTrzezwosci.badanieWymienDnia.przezKogo,
                  }
                : undefined,
            }
          : undefined,
        controlAuthorities: data.organyKontroli
          ? {
              actionsTaken: data.organyKontroli.podjeteCzynnosci,
              authorityName: data.organyKontroli.nazwaOrganu,
              address: data.organyKontroli.adres,
              caseNumber: data.organyKontroli.numerSprawy,
              status: data.organyKontroli.status,
            }
          : undefined,
        firstAid: data.pierwszaPomoc
          ? {
              provided: data.pierwszaPomoc.udzielona,
              when: data.pierwszaPomoc.kiedy,
              where: data.pierwszaPomoc.gdzie,
              facilityName: data.pierwszaPomoc.nazwaPlacowki,
              hospitalizationPeriod: data.pierwszaPomoc.okresHospitalizacji,
              hospitalizationPlace: data.pierwszaPomoc.miejsceHospitalizacji,
              recognizedInjury: data.pierwszaPomoc.urazRozpoznany,
              incapacityPeriod: data.pierwszaPomoc.okresNiezdolnosci,
            }
          : undefined,
        sickLeave: data.zwolnienieLekarskie
          ? {
              onAccidentDay: data.zwolnienieLekarskie.wDniuWypadku,
              description: data.zwolnienieLekarskie.opis,
            }
          : undefined,
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
    console.log("Generowanie dokumentów dla:", formData);
    // Tutaj będzie logika generowania PDF
    alert("Funkcjonalność generowania dokumentów PDF będzie dostępna wkrótce!");
  }, [formData]);

  const handleWizardComplete = useCallback(() => {
    console.log("Formularz ukończony:", formData);
    // Tutaj będzie logika generowania dokumentów
    alert(
      "Formularz został ukończony! (Funkcjonalność w trakcie implementacji)"
    );
  }, [formData]);

  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    console.log(`Przejście do kroku ${stepIndex + 1}`);
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
      // Używamy funkcjonalnej aktualizacji, aby uniknąć zależności od steps
      // Faktyczna liczba kroków to 8 (indeksy 0-7), więc maksymalny indeks to 7
      const MAX_STEP_INDEX = 8;
      if (prev < MAX_STEP_INDEX) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  // Memoize initialData żeby nie tworzyć nowego obiektu za każdym razem
  const krok0InitialData = useMemo(() => {
    return formData.notificationType
      ? { rodzajZgloszenia: formData.notificationType }
      : undefined;
  }, [formData.notificationType]);

  // Memoize initialData dla kroku 1
  const krok1InitialData = useMemo(() => {
    if (!formData.personalData) return undefined;
    // Konwersja z typu AccidentReport do typu formularza
    return {
      pesel: formData.personalData.pesel,
      dokumentTozsamosci: {
        rodzaj: formData.personalData.idDocument.type as
          | "dowód osobisty"
          | "paszport"
          | "inny",
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
      osobaZawiadamiajaca: formData.representativeData
        ? {
            pesel: formData.representativeData.pesel,
            dokumentTozsamosci: formData.representativeData.idDocument
              ? {
                  rodzaj: formData.representativeData.idDocument.type as
                    | "dowód osobisty"
                    | "paszport"
                    | "inny",
                  seria: formData.representativeData.idDocument.series,
                  numer: formData.representativeData.idDocument.number,
                }
              : undefined,
            imie: formData.representativeData.firstName,
            nazwisko: formData.representativeData.lastName,
            dataUrodzenia: formData.representativeData.dateOfBirth,
            telefon: formData.representativeData.phone,
            adresZamieszkania: formData.representativeData.addresses
              ?.residentialAddress
              ? {
                  ulica:
                    formData.representativeData.addresses.residentialAddress
                      .street || "",
                  numerDomu:
                    formData.representativeData.addresses.residentialAddress
                      .houseNumber || "",
                  numerLokalu:
                    formData.representativeData.addresses.residentialAddress
                      .apartmentNumber,
                  kodPocztowy:
                    formData.representativeData.addresses.residentialAddress
                      .postalCode || "",
                  miejscowosc:
                    formData.representativeData.addresses.residentialAddress
                      .city || "",
                  panstwo:
                    formData.representativeData.addresses.residentialAddress
                      .country,
                }
              : undefined,
            mieszkaZaGranica:
              formData.representativeData.mieszkaZaGranica || false,
            adresOstatniegoZamieszkaniaWPolsce: formData.representativeData
              .addresses?.lastResidentialAddressInPoland
              ? {
                  ulica:
                    formData.representativeData.addresses
                      .lastResidentialAddressInPoland.street || "",
                  numerDomu:
                    formData.representativeData.addresses
                      .lastResidentialAddressInPoland.houseNumber || "",
                  numerLokalu:
                    formData.representativeData.addresses
                      .lastResidentialAddressInPoland.apartmentNumber,
                  kodPocztowy:
                    formData.representativeData.addresses
                      .lastResidentialAddressInPoland.postalCode || "",
                  miejscowosc:
                    formData.representativeData.addresses
                      .lastResidentialAddressInPoland.city || "",
                }
              : undefined,
          }
        : undefined,
    };
  }, [formData.personalData, formData.representativeData]);

  // Memoize initialData dla kroku 2 - konwersja z formatu interfejsu do formatu formularza
  const krok2InitialData = useMemo(() => {
    if (!formData.addresses) return undefined;
    if (
      !formData.addresses.residentialAddress ||
      !formData.addresses.businessAddress
    )
      return undefined;

    return {
      adresZamieszkania: {
        ulica: formData.addresses.residentialAddress.street || "",
        numerDomu: formData.addresses.residentialAddress.houseNumber || "",
        numerLokalu: formData.addresses.residentialAddress.apartmentNumber,
        kodPocztowy: formData.addresses.residentialAddress.postalCode || "",
        miejscowosc: formData.addresses.residentialAddress.city || "",
        panstwo: formData.addresses.residentialAddress.country,
      },
      adresOstatniegoZamieszkaniaWPolsce: formData.addresses
        .lastResidentialAddressInPoland
        ? {
            ulica:
              formData.addresses.lastResidentialAddressInPoland.street || "",
            numerDomu:
              formData.addresses.lastResidentialAddressInPoland.houseNumber ||
              "",
            numerLokalu:
              formData.addresses.lastResidentialAddressInPoland.apartmentNumber,
            kodPocztowy:
              formData.addresses.lastResidentialAddressInPoland.postalCode ||
              "",
            miejscowosc:
              formData.addresses.lastResidentialAddressInPoland.city || "",
            panstwo: formData.addresses.lastResidentialAddressInPoland.country,
          }
        : undefined,
      adresDoKorespondencji: formData.addresses.correspondenceAddress
        ? {
            typ: formData.addresses.correspondenceAddress.type,
            adres: formData.addresses.correspondenceAddress.address
              ? {
                  ulica:
                    formData.addresses.correspondenceAddress.address.street ||
                    "",
                  numerDomu:
                    formData.addresses.correspondenceAddress.address
                      .houseNumber || "",
                  numerLokalu:
                    formData.addresses.correspondenceAddress.address
                      .apartmentNumber,
                  kodPocztowy:
                    formData.addresses.correspondenceAddress.address
                      .postalCode || "",
                  miejscowosc:
                    formData.addresses.correspondenceAddress.address.city || "",
                  panstwo:
                    formData.addresses.correspondenceAddress.address.country,
                }
              : undefined,
            posteRestante: formData.addresses.correspondenceAddress
              .posteRestante
              ? {
                  kodPocztowy:
                    formData.addresses.correspondenceAddress.posteRestante
                      .postalCode || "",
                  nazwaPlacowki:
                    formData.addresses.correspondenceAddress.posteRestante
                      .postOfficeName || "",
                }
              : undefined,
            skrytka: formData.addresses.correspondenceAddress.postOfficeBox
              ? {
                  numer:
                    formData.addresses.correspondenceAddress.postOfficeBox
                      .number || "",
                  kodPocztowy:
                    formData.addresses.correspondenceAddress.postOfficeBox
                      .postalCode || "",
                  nazwaPlacowki:
                    formData.addresses.correspondenceAddress.postOfficeBox
                      .postOfficeName || "",
                }
              : undefined,
            przegrodka: formData.addresses.correspondenceAddress.postOfficeBoxP
              ? {
                  numer:
                    formData.addresses.correspondenceAddress.postOfficeBoxP
                      .number || "",
                  kodPocztowy:
                    formData.addresses.correspondenceAddress.postOfficeBoxP
                      .postalCode || "",
                  nazwaPlacowki:
                    formData.addresses.correspondenceAddress.postOfficeBoxP
                      .postOfficeName || "",
                }
              : undefined,
          }
        : undefined,
      adresDzialalnosci: {
        ulica: formData.addresses.businessAddress.street || "",
        numerDomu: formData.addresses.businessAddress.houseNumber || "",
        numerLokalu: formData.addresses.businessAddress.apartmentNumber,
        kodPocztowy: formData.addresses.businessAddress.postalCode || "",
        miejscowosc: formData.addresses.businessAddress.city || "",
        telefon: formData.addresses.businessAddress.phone,
      },
      opiekaNadDzieckiem: !!formData.addresses.childcareAddress,
      adresOpiekiNadDzieckiem: formData.addresses.childcareAddress
        ? {
            ulica: formData.addresses.childcareAddress.street || "",
            numerDomu: formData.addresses.childcareAddress.houseNumber || "",
            numerLokalu: formData.addresses.childcareAddress.apartmentNumber,
            kodPocztowy: formData.addresses.childcareAddress.postalCode || "",
            miejscowosc: formData.addresses.childcareAddress.city || "",
            telefon: formData.addresses.childcareAddress.phone,
          }
        : undefined,
    };
  }, [formData.addresses]);

  // Memoize initialData dla kroku 4 - konwersja z formatu interfejsu do formatu formularza
  const krok4InitialData = useMemo(() => {
    if (!formData.accidentData) return undefined;
    // Sprawdź czy wszystkie wymagane zagnieżdżone obiekty istnieją
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
      szczegolowyOpisOkolicznosci:
        formData.accidentData.detailedCircumstancesDescription || "",
      szczegolowyOpisPrzyczyn:
        formData.accidentData.detailedCausesDescription || "",
      miejsceWypadkuSzczegoly: formData.accidentData.accidentPlaceDetails || "",
      naglosc: {
        potwierdzona: formData.accidentData.suddenness.confirmed || false,
        opis: formData.accidentData.suddenness.description || "",
        czasTrwania: formData.accidentData.suddenness.duration,
      },
      przyczynaZewnetrzna: {
        potwierdzona: formData.accidentData.externalCause.confirmed || false,
        typ: (formData.accidentData.externalCause.type || "inne") as
          | "maszyny"
          | "energia"
          | "temperatura"
          | "chemikalia"
          | "sily_natury"
          | "warunki_pracy"
          | "inne",
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
      pierwszaPomoc: formData.accidentData.firstAid
        ? {
            udzielona: formData.accidentData.firstAid.provided || false,
            nazwaPlacowki: formData.accidentData.firstAid.facilityName,
            adresPlacowki: formData.accidentData.firstAid.facilityAddress,
          }
        : undefined,
      postepowanieOrganow: formData.accidentData.authorityProceedings
        ? {
            prowadzone:
              formData.accidentData.authorityProceedings.conducted || false,
            nazwaOrganu:
              formData.accidentData.authorityProceedings.authorityName,
            adres: formData.accidentData.authorityProceedings.address,
            numerSprawy: formData.accidentData.authorityProceedings.caseNumber,
            status: formData.accidentData.authorityProceedings.status,
          }
        : undefined,
      maszynyUrzadzenia: formData.accidentData.machineryEquipment
        ? {
            dotyczy:
              formData.accidentData.machineryEquipment.applicable || false,
            nazwa: formData.accidentData.machineryEquipment.name,
            typ: formData.accidentData.machineryEquipment.type,
            dataProdukcji:
              formData.accidentData.machineryEquipment.productionDate,
            sprawne: formData.accidentData.machineryEquipment.operational,
            zgodneZProducentem:
              formData.accidentData.machineryEquipment
                .compliantWithManufacturer,
            sposobUzycia: formData.accidentData.machineryEquipment.usageMethod,
            atest: formData.accidentData.machineryEquipment.certified,
            deklaracjaZgodnosci:
              formData.accidentData.machineryEquipment.conformityDeclaration,
            wEwidencjiSrodkowTrwalych:
              formData.accidentData.machineryEquipment.inFixedAssetsRegister,
          }
        : undefined,
    };
  }, [formData.accidentData]);

  // Sprawdź czy należy pokazać krok 6 (wyjaśnienia)
  const shouldShowWyjasnienia =
    formData.notificationType === "wyjasnienia" ||
    formData.notificationType === "oba";

  const steps: WizardStep[] = useMemo(() => {
    const baseSteps: WizardStep[] = [
      {
        id: "rodzaj-zgloszenia",
        title: "Wybór rodzaju zgłoszenia",
        description: "Wybierz, jakie dokumenty chcesz złożyć",
        component: () => (
          <Krok0RodzajZgloszenia
            key="krok0"
            onNext={(data) => {
              handleKrok0Complete(data);
              goToNextStep();
            }}
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
      {
        id: "weryfikacja-elementow",
        title: "Weryfikacja elementów",
        description: "Sprawdź, czy wszystkie elementy definicji są spełnione",
        component: () => (
          <Krok5WeryfikacjaElementow
            key="krok5"
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            accidentData={formData.accidentData}
          />
        ),
      },
    ];

    // Dodaj krok 6 (wyjaśnienia) tylko jeśli wybrano "wyjasnienia" lub "oba"
    if (shouldShowWyjasnienia) {
      baseSteps.push({
        id: "wyjasnienia",
        title: "Szczegółowe wyjaśnienia",
        description: "Podaj szczegółowe wyjaśnienia dotyczące wypadku",
        component: () => (
          <Krok6Wyjasnienia
            key="krok6"
            onNext={(data) => {
              handleKrok6Complete(data);
              goToNextStep();
            }}
            onPrevious={goToPreviousStep}
            initialData={undefined}
          />
        ),
      });
    }

    // Krok 7 - Świadkowie (zawsze dostępny, opcjonalny)
    baseSteps.push({
      id: "swiadkowie",
      title: "Świadkowie",
      description: "Dodaj dane świadków wypadku (opcjonalnie)",
      component: () => (
        <Krok7Swiadkowie
          key="krok7"
          onNext={(data) => {
            handleKrok7Complete(data);
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialData={undefined}
        />
      ),
    });

    // Krok 8 - Załączniki
    baseSteps.push({
      id: "zalaczniki",
      title: "Załączniki",
      description: "Wybierz załączniki i sposób odbioru odpowiedzi",
      component: () => (
        <Krok9Zalaczniki
          key="krok8"
          onNext={(
            attachments,
            responseDeliveryMethod,
            signatureDate,
            documentCommitments
          ) => {
            setFormData((prev) => ({
              ...prev,
              attachments,
              responseDeliveryMethod,
              signatureDate,
              documentCommitments,
            }));
            goToNextStep();
          }}
          onPrevious={goToPreviousStep}
          initialAttachments={formData.attachments}
          initialResponseDeliveryMethod={formData.responseDeliveryMethod}
          initialSignatureDate={formData.signatureDate}
          initialDocumentCommitments={formData.documentCommitments}
        />
      ),
    });

    // Krok 9 - Podsumowanie
    baseSteps.push({
      id: "podsumowanie",
      title: "Podsumowanie",
      description: "Sprawdź dane i wygeneruj dokumenty",
      component: () => (
        <Krok8Podsumowanie
          key="krok9"
          onPrevious={goToPreviousStep}
          onGenerateDocuments={handleGenerateDocuments}
          formData={formData}
        />
      ),
    });

    return baseSteps;
  }, [
    krok0InitialData,
    krok1InitialData,
    krok2InitialData,
    krok4InitialData,
    handleKrok0Complete,
    handleKrok1Complete,
    handleKrok2Complete,
    handleKrok4Complete,
    handleKrok6Complete,
    handleKrok7Complete,
    handleGenerateDocuments,
    goToNextStep,
    goToPreviousStep,
    shouldShowWyjasnienia,
    formData,
  ]);

  // Oblicz kompletność dla progress bara
  const completionPercentage = useMemo(
    () => getFormCompletionPercentage(formData),
    [formData]
  );

  const missingElements = useMemo(
    () => detectMissingElements(formData),
    [formData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1" />
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Wirtualny Asystent
                </h1>
                <p className="text-lg text-gray-600">
                  Pomoc w zgłoszeniu wypadku przy pracy
                </p>
              </div>
              <div className="flex-1 flex justify-end">
                {isMounted && hasSavedData && (
                  <button
                    onClick={() => {
                      if (
                        confirm("Czy na pewno chcesz wyczyścić zapisane dane?")
                      ) {
                        clearData();
                        setFormData({});
                        setCurrentStepIndex(0);
                      }
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Wyczyść zapisane dane"
                  >
                    🗑️ Wyczyść dane
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dialog przywracania danych */}
          {showRestoreDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Przywrócić zapisane dane?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Znaleziono zapisane dane formularza. Czy chcesz je przywrócić?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleDiscardData}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Odrzuć
                  </button>
                  <button
                    onClick={handleRestoreData}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Przywróć
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wskaźnik brakujących elementów */}
          {missingElements.length > 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5 mr-2"
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
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Brakuje {missingElements.length} elementów do uzupełnienia
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Procent uzupełnienia: {completionPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}

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

