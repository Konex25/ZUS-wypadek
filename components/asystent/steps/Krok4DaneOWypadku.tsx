"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daneWypadkuSchema, DaneWypadkuForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Chatbot } from "@/components/ui/chatbot";
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";

interface Krok4DaneOWypadkuProps {
  onNext: (data: DaneWypadkuForm) => void;
  onPrevious: () => void;
  initialData?: Partial<DaneWypadkuForm>;
}

export const Krok4DaneOWypadku: React.FC<Krok4DaneOWypadkuProps> = React.memo(({
  onNext,
  onPrevious,
  initialData,
}) => {
  const [maszynyUrzadzenia, setMaszynyUrzadzenia] = useState(
    initialData?.maszynyUrzadzenia?.dotyczy || false
  );
  const [pierwszaPomoc, setPierwszaPomoc] = useState(
    initialData?.pierwszaPomoc?.udzielona || false
  );
  const [postepowanieOrganow, setPostepowanieOrganow] = useState(
    initialData?.postepowanieOrganow?.prowadzone || false
  );
  const [activeField, setActiveField] = useState<{
    fieldName: string;
    fieldLabel: string;
    currentValue: string;
    fieldType?: "textarea" | "input" | "select";
  } | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickedInChatbotRef = useRef<boolean>(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Sprawdź, czy kliknięcie było w chatbocie
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.fixed.bottom-24')) {
        // Jeśli kliknięto w chatbota, ustaw flagę
        clickedInChatbotRef.current = true;
        // Anuluj timeout blur
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
        // Reset flagi po krótkim czasie
        setTimeout(() => {
          clickedInChatbotRef.current = false;
        }, 100);
      } else {
        clickedInChatbotRef.current = false;
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DaneWypadkuForm>({
    resolver: zodResolver(daneWypadkuSchema),
    defaultValues: initialData || {
      naglosc: {
        potwierdzona: true,
        opis: "",
      },
      przyczynaZewnetrzna: {
        potwierdzona: true,
        typ: "inne",
        opis: "",
      },
      uraz: {
        potwierdzony: true,
        rodzaj: "",
        lokalizacja: "",
      },
      zwiazekZPraca: {
        przyczynowy: false,
        czasowy: false,
        miejscowy: false,
        funkcjonalny: false,
        opis: "",
      },
    },
  });

  const onSubmit = (data: DaneWypadkuForm) => {
    onNext(data);
  };

  const fillExampleData = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = "10:30";
    
    setValue("dataWypadku", dateStr);
    setValue("godzinaWypadku", timeStr);
    setValue("miejsceWypadku", "Warszawa, ul. Przykładowa 10");
    setValue("miejsceWypadkuSzczegoly", "Pomieszczenie biurowe na pierwszym piętrze, przy stanowisku pracy");
    setValue("planowanaGodzinaRozpoczecia", "08:00");
    setValue("planowanaGodzinaZakonczenia", "16:00");
    setValue("rodzajUrazow", "Skaleczenie lewej dłoni, stłuczenie nadgarstka");
    
    setValue("szczegolowyOpisOkolicznosci", 
      "Podczas wykonywania prac remontowych, przy cięciu materiału za pomocą piły tarczowej, " +
      "doszło do nagłego kontaktu dłoni z ostrą krawędzią narzędzia. Zdarzenie nastąpiło natychmiastowo, " +
      "w wyniku poślizgnięcia się materiału podczas cięcia. Konsekwencją było skaleczenie lewej dłoni " +
      "oraz stłuczenie nadgarstka."
    );
    
    setValue("szczegolowyOpisPrzyczyn", 
      "Główną przyczyną wypadku było nieprawidłowe zabezpieczenie materiału podczas cięcia. " +
      "Dodatkowo, narzędzie było używane bez odpowiednich środków ochrony osobistej. " +
      "Materiał poślizgnął się z powodu braku właściwego zamocowania."
    );
    
    // Nagłość
    setValue("naglosc.potwierdzona", true);
    setValue("naglosc.opis", "Zdarzenie nastąpiło natychmiastowo - kontakt z ostrą krawędzią trwał kilka sekund");
    
    // Przyczyna zewnętrzna
    setValue("przyczynaZewnetrzna.potwierdzona", true);
    setValue("przyczynaZewnetrzna.typ", "maszyny");
    setValue("przyczynaZewnetrzna.opis", "Ostra krawędź piły tarczowej spowodowała skaleczenie");
    
    // Uraz
    setValue("uraz.potwierdzony", true);
    setValue("uraz.rodzaj", "Skaleczenie i stłuczenie");
    setValue("uraz.lokalizacja", "Lewa dłoń i nadgarstek");
    setValue("uraz.dokumentacjaMedyczna", true);
    
    // Związek z pracą
    setValue("zwiazekZPraca.przyczynowy", true);
    setValue("zwiazekZPraca.czasowy", true);
    setValue("zwiazekZPraca.miejscowy", true);
    setValue("zwiazekZPraca.funkcjonalny", true);
    setValue("zwiazekZPraca.opis", 
      "Wypadek nastąpił podczas wykonywania zwykłych czynności związanych z prowadzoną działalnością " +
      "gospodarczą (prace remontowe). Zdarzenie miało miejsce w miejscu pracy, w czasie pracy, " +
      "a uraz był bezpośrednim skutkiem wykonywanej czynności."
    );
    
    // Pierwsza pomoc
    setPierwszaPomoc(true);
    setValue("pierwszaPomoc.udzielona", true);
    setValue("pierwszaPomoc.nazwaPlacowki", "Szpital Miejski w Warszawie");
    setValue("pierwszaPomoc.adresPlacowki", "ul. Szpitalna 1, 00-001 Warszawa");
    
    // Postępowanie organów
    setPostepowanieOrganow(false);
    
    // Maszyny i urządzenia
    setMaszynyUrzadzenia(true);
    setValue("maszynyUrzadzenia.dotyczy", true);
    setValue("maszynyUrzadzenia.nazwa", "Piła tarczowa");
    setValue("maszynyUrzadzenia.typ", "Elektryczna");
    setValue("maszynyUrzadzenia.sprawne", true);
    setValue("maszynyUrzadzenia.zgodneZProducentem", true);
    setValue("maszynyUrzadzenia.atest", true);
    setValue("maszynyUrzadzenia.deklaracjaZgodnosci", true);
    setValue("maszynyUrzadzenia.wEwidencjiSrodkowTrwalych", false);
  };

  const handleSuggestion = (suggestion: string) => {
    if (activeField) {
      const fieldPath = activeField.fieldName.split(".");
      if (fieldPath.length === 1) {
        setValue(fieldPath[0] as any, suggestion);
      } else if (fieldPath.length === 2) {
        setValue(`${fieldPath[0]}.${fieldPath[1]}` as any, suggestion);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative" style={{ zIndex: 1, position: 'relative' }}>
      <Chatbot
        fieldContext={activeField || undefined}
        onSuggestion={handleSuggestion}
      />
      <ExampleDataButton onFill={fillExampleData} />
      <div className="space-y-6">
        {/* Podstawowe informacje o wypadku */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Podstawowe informacje</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Data wypadku"
                type="date"
                required
                error={errors.dataWypadku?.message}
                {...register("dataWypadku")}
              />
              <Input
                label="Godzina wypadku"
                type="time"
                required
                error={errors.godzinaWypadku?.message}
                helperText="Format: HH:MM"
                {...register("godzinaWypadku")}
              />
            </div>

            <Input
              label="Miejsce wypadku"
              required
              error={errors.miejsceWypadku?.message}
              helperText="Podaj dokładne miejsce wypadku"
              {...register("miejsceWypadku")}
            />

            <Input
              label="Szczegóły miejsca wypadku"
              required
              error={errors.miejsceWypadkuSzczegoly?.message}
              helperText="Opisz dokładnie miejsce, w którym wydarzył się wypadek"
              {...register("miejsceWypadkuSzczegoly")}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Planowana godzina rozpoczęcia pracy"
                type="time"
                required
                error={errors.planowanaGodzinaRozpoczecia?.message}
                {...register("planowanaGodzinaRozpoczecia")}
              />
              <Input
                label="Planowana godzina zakończenia pracy"
                type="time"
                required
                error={errors.planowanaGodzinaZakonczenia?.message}
                {...register("planowanaGodzinaZakonczenia")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rodzaj urazów <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
                {...register("rodzajUrazow")}
              />
              {errors.rodzajUrazow && (
                <p className="mt-1 text-sm text-red-600">{errors.rodzajUrazow.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Szczegółowe opisy */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Szczegółowe opisy</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Szczegółowy opis okoliczności wypadku <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                required
                placeholder="Opisz dokładnie, co się stało i w jakich okolicznościach doszło do wypadku..."
                onFocus={() => {
                  // Anuluj poprzedni timeout, jeśli istnieje
                  if (blurTimeoutRef.current) {
                    clearTimeout(blurTimeoutRef.current);
                    blurTimeoutRef.current = null;
                  }
                  setActiveField({
                    fieldName: "szczegolowyOpisOkolicznosci",
                    fieldLabel: "Szczegółowy opis okoliczności wypadku",
                    currentValue: watch("szczegolowyOpisOkolicznosci") || "",
                    fieldType: "textarea",
                  });
                }}
                {...register("szczegolowyOpisOkolicznosci", {
                  onBlur: (e) => {
                    // Sprawdź, czy kliknięcie było w chatbocie
                    if (clickedInChatbotRef.current) {
                      // Jeśli kliknięto w chatbota, nie resetuj activeField
                      if (blurTimeoutRef.current) {
                        clearTimeout(blurTimeoutRef.current);
                        blurTimeoutRef.current = null;
                      }
                      return;
                    }
                    // Opóźnij resetowanie activeField, aby umożliwić kliknięcie w chatbota
                    blurTimeoutRef.current = setTimeout(() => {
                      if (!clickedInChatbotRef.current) {
                        setActiveField(null);
                      }
                    }, 500);
                  }
                })}
              />
              {errors.szczegolowyOpisOkolicznosci && (
                <p className="mt-1 text-sm text-red-600">{errors.szczegolowyOpisOkolicznosci.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Wskaż: co się stało, w jakich okolicznościach doszło do wypadku, jakie były konsekwencje
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Szczegółowy opis przyczyn wypadku <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                required
                placeholder="Opisz przyczyny, które doprowadziły do wypadku..."
                onFocus={() => {
                  // Anuluj poprzedni timeout, jeśli istnieje
                  if (blurTimeoutRef.current) {
                    clearTimeout(blurTimeoutRef.current);
                    blurTimeoutRef.current = null;
                  }
                  setActiveField({
                    fieldName: "szczegolowyOpisPrzyczyn",
                    fieldLabel: "Szczegółowy opis przyczyn wypadku",
                    currentValue: watch("szczegolowyOpisPrzyczyn") || "",
                    fieldType: "textarea",
                  });
                }}
                {...register("szczegolowyOpisPrzyczyn", {
                  onBlur: (e) => {
                    // Sprawdź, czy kliknięcie było w chatbocie
                    if (clickedInChatbotRef.current) {
                      // Jeśli kliknięto w chatbota, nie resetuj activeField
                      if (blurTimeoutRef.current) {
                        clearTimeout(blurTimeoutRef.current);
                        blurTimeoutRef.current = null;
                      }
                      return;
                    }
                    // Opóźnij resetowanie activeField, aby umożliwić kliknięcie w chatbota
                    blurTimeoutRef.current = setTimeout(() => {
                      if (!clickedInChatbotRef.current) {
                        setActiveField(null);
                      }
                    }, 500);
                  }
                })}
              />
              {errors.szczegolowyOpisPrzyczyn && (
                <p className="mt-1 text-sm text-red-600">{errors.szczegolowyOpisPrzyczyn.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Weryfikacja elementów definicji wypadku przy pracy */}
        <Card>
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900">
              Weryfikacja elementów definicji wypadku przy pracy
            </h4>
            <p className="text-sm text-gray-600">
              Aby zdarzenie mogło być uznane za wypadek przy pracy, muszą być spełnione wszystkie poniższe warunki.
            </p>

            {/* Nagłość */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-bold text-gray-900">
                  Nagłość zdarzenia
              </h5>
              <p className="text-xs text-gray-600">
                Zdarzenie nagłe to natychmiastowe ujawnienie się przyczyny zewnętrznej lub działanie tej przyczyny 
                przez pewien okres, ale nie dłużej niż przez jedną dniówkę roboczą.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis nagłości <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="Opisz, czy zdarzenie było nagłe (np. wybuch, upadek, zderzenie)..."
                  onFocus={() => {
                    // Anuluj poprzedni timeout, jeśli istnieje
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current);
                      blurTimeoutRef.current = null;
                    }
                    setActiveField({
                      fieldName: "naglosc.opis",
                      fieldLabel: "Opis nagłości zdarzenia",
                      currentValue: watch("naglosc.opis") || "",
                      fieldType: "textarea",
                    });
                  }}
                  {...register("naglosc.opis", {
                    onBlur: (e) => {
                      // Sprawdź, czy kliknięcie było w chatbocie
                      if (clickedInChatbotRef.current) {
                        // Jeśli kliknięto w chatbota, nie resetuj activeField
                        if (blurTimeoutRef.current) {
                          clearTimeout(blurTimeoutRef.current);
                          blurTimeoutRef.current = null;
                        }
                        return;
                      }
                      // Opóźnij resetowanie activeField, aby umożliwić kliknięcie w chatbota
                      blurTimeoutRef.current = setTimeout(() => {
                        if (!clickedInChatbotRef.current) {
                          setActiveField(null);
                        }
                      }, 300);
                    }
                  })}
                />
                {errors.naglosc?.opis && (
                  <p className="mt-1 text-sm text-red-600">{errors.naglosc.opis.message}</p>
                )}
                <Input
                  label="Czas trwania zdarzenia (jeśli nie było natychmiastowe)"
                  type="text"
                  error={errors.naglosc?.czasTrwania?.message}
                  helperText="Np. '2 godziny', 'pół dnia roboczego'"
                  {...register("naglosc.czasTrwania")}
                />
              </div>
            </div>

            {/* Przyczyna zewnętrzna */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-bold text-gray-900">
                  Przyczyna zewnętrzna
              </h5>
              <p className="text-xs text-gray-600">
                Przyczyna zewnętrzna to czynnik występujący poza organizmem człowieka, który spowodował uraz.
              </p>
              <div className="space-y-3">
                <Select
                  label="Typ przyczyny zewnętrznej"
                  required
                  error={errors.przyczynaZewnetrzna?.typ?.message}
                  options={[
                    { value: "maszyny", label: "Maszyny i urządzenia" },
                    { value: "energia", label: "Energia elektryczna" },
                    { value: "temperatura", label: "Temperatura (wysoka/niska)" },
                    { value: "chemikalia", label: "Substancje chemiczne" },
                    { value: "sily_natury", label: "Siły natury" },
                    { value: "warunki_pracy", label: "Warunki w miejscu pracy" },
                    { value: "inne", label: "Inne" },
                  ]}
                  value={watch("przyczynaZewnetrzna.typ")}
                  onValueChange={(value) => {
                    setValue("przyczynaZewnetrzna.typ", value as any);
                  }}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis przyczyny zewnętrznej <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Opisz, jaki czynnik zewnętrzny spowodował uraz..."
                    onFocus={() => {
                      // Anuluj poprzedni timeout, jeśli istnieje
                      if (blurTimeoutRef.current) {
                        clearTimeout(blurTimeoutRef.current);
                        blurTimeoutRef.current = null;
                      }
                      setActiveField({
                        fieldName: "przyczynaZewnetrzna.opis",
                        fieldLabel: "Opis przyczyny zewnętrznej",
                        currentValue: watch("przyczynaZewnetrzna.opis") || "",
                        fieldType: "textarea",
                      });
                    }}
                    {...register("przyczynaZewnetrzna.opis", {
                      onBlur: (e) => {
                        // Sprawdź, czy kliknięcie było w chatbocie
                        if (clickedInChatbotRef.current) {
                          // Jeśli kliknięto w chatbota, nie resetuj activeField
                          if (blurTimeoutRef.current) {
                            clearTimeout(blurTimeoutRef.current);
                            blurTimeoutRef.current = null;
                          }
                          return;
                        }
                        // Opóźnij resetowanie activeField, aby umożliwić kliknięcie w chatbota
                        blurTimeoutRef.current = setTimeout(() => {
                          if (!clickedInChatbotRef.current) {
                            setActiveField(null);
                          }
                        }, 300);
                      }
                    })}
                  />
                  {errors.przyczynaZewnetrzna?.opis && (
                    <p className="mt-1 text-sm text-red-600">{errors.przyczynaZewnetrzna.opis.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Uraz */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-bold text-gray-900">
                  Uraz
              </h5>
              <p className="text-xs text-gray-600">
                Uraz to uszkodzenie tkanek ciała lub narządów człowieka wskutek działania czynnika zewnętrznego.
              </p>
              <div className="space-y-3">
                <Input
                  label="Rodzaj urazu"
                  required
                  error={errors.uraz?.rodzaj?.message}
                  placeholder="Np. skaleczenie, stłuczenie, zwichnięcie..."
                  {...register("uraz.rodzaj")}
                />
                <Input
                  label="Lokalizacja urazu"
                  required
                  error={errors.uraz?.lokalizacja?.message}
                  placeholder="Np. lewa ręka, głowa, prawa noga..."
                  {...register("uraz.lokalizacja")}
                />
                <Checkbox
                  label="Mam dokumentację medyczną potwierdzającą uraz"
                  checked={watch("uraz.dokumentacjaMedyczna") || false}
                  onCheckedChange={(checked) => {
                    setValue("uraz.dokumentacjaMedyczna", checked || false);
                  }}
                />
              </div>
            </div>

            {/* Związek z pracą */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-bold text-gray-900">
                  Związek z pracą
              </h5>
              <p className="text-xs text-gray-600">
                Między wypadkiem a pracą musi zachodzić ścisły związek: przyczynowy, czasowy, miejscowy i funkcjonalny.
              </p>
              <div className="space-y-3">
                <Checkbox
                  label="Związek przyczynowy - wypadek był skutkiem wykonywanej pracy"
                  checked={watch("zwiazekZPraca.przyczynowy")}
                  onCheckedChange={(checked) => {
                    setValue("zwiazekZPraca.przyczynowy", checked || false);
                  }}
                />
                <Checkbox
                  label="Związek czasowy - wypadek nastąpił w okresie ubezpieczenia wypadkowego"
                  checked={watch("zwiazekZPraca.czasowy")}
                  onCheckedChange={(checked) => {
                    setValue("zwiazekZPraca.czasowy", checked || false);
                  }}
                />
                <Checkbox
                  label="Związek miejscowy - wypadek nastąpił w miejscu związanym z pracą"
                  checked={watch("zwiazekZPraca.miejscowy")}
                  onCheckedChange={(checked) => {
                    setValue("zwiazekZPraca.miejscowy", checked || false);
                  }}
                />
                <Checkbox
                  label="Związek funkcjonalny - wypadek nastąpił podczas wykonywania zwykłych czynności związanych z działalnością"
                  checked={watch("zwiazekZPraca.funkcjonalny")}
                  onCheckedChange={(checked) => {
                    setValue("zwiazekZPraca.funkcjonalny", checked || false);
                  }}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis związku z pracą <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Opisz, jak wypadek wiąże się z wykonywaną pracą..."
                    onFocus={() => {
                      // Anuluj poprzedni timeout, jeśli istnieje
                      if (blurTimeoutRef.current) {
                        clearTimeout(blurTimeoutRef.current);
                        blurTimeoutRef.current = null;
                      }
                      setActiveField({
                        fieldName: "zwiazekZPraca.opis",
                        fieldLabel: "Opis związku z pracą",
                        currentValue: watch("zwiazekZPraca.opis") || "",
                        fieldType: "textarea",
                      });
                    }}
                    {...register("zwiazekZPraca.opis", {
                      onBlur: (e) => {
                        // Sprawdź, czy kliknięcie było w chatbocie
                        if (clickedInChatbotRef.current) {
                          // Jeśli kliknięto w chatbota, nie resetuj activeField
                          if (blurTimeoutRef.current) {
                            clearTimeout(blurTimeoutRef.current);
                            blurTimeoutRef.current = null;
                          }
                          return;
                        }
                        // Opóźnij resetowanie activeField, aby umożliwić kliknięcie w chatbota
                        blurTimeoutRef.current = setTimeout(() => {
                          if (!clickedInChatbotRef.current) {
                            setActiveField(null);
                          }
                        }, 300);
                      }
                    })}
                  />
                  {errors.zwiazekZPraca?.opis && (
                    <p className="mt-1 text-sm text-red-600">{errors.zwiazekZPraca.opis.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dodatkowe informacje */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Dodatkowe informacje</h4>

            {/* Pierwsza pomoc */}
            <div className="space-y-3">
              <Checkbox
                label="Udzielono mi pierwszej pomocy medycznej"
                checked={pierwszaPomoc}
                onCheckedChange={(checked) => {
                  setPierwszaPomoc(checked || false);
                  setValue("pierwszaPomoc.udzielona", checked || false);
                }}
              />
              {pierwszaPomoc && (
                <div className="ml-7 space-y-3">
                  <Input
                    label="Nazwa placówki służby zdrowia"
                    {...register("pierwszaPomoc.nazwaPlacowki")}
                  />
                  <Input
                    label="Adres placówki"
                    {...register("pierwszaPomoc.adresPlacowki")}
                  />
                </div>
              )}
            </div>

            {/* Postępowanie organów */}
            <div className="space-y-3">
              <Checkbox
                label="Prowadzono postępowanie w sprawie wypadku (policja, prokuratura, inspekcja pracy)"
                checked={postepowanieOrganow}
                onCheckedChange={(checked) => {
                  setPostepowanieOrganow(checked || false);
                  setValue("postepowanieOrganow.prowadzone", checked || false);
                }}
              />
              {postepowanieOrganow && (
                <div className="ml-7 space-y-3">
                  <Input
                    label="Nazwa organu"
                    {...register("postepowanieOrganow.nazwaOrganu")}
                  />
                  <Input
                    label="Adres organu"
                    {...register("postepowanieOrganow.adres")}
                  />
                  <Input
                    label="Numer sprawy/decyzji"
                    {...register("postepowanieOrganow.numerSprawy")}
                  />
                  <Select
                    label="Status sprawy"
                    options={[
                      { value: "w_trakcie", label: "W trakcie" },
                      { value: "zakonczona", label: "Zakończona" },
                      { value: "umorzona", label: "Umorzona" },
                    ]}
                    value={watch("postepowanieOrganow.status")}
                    onValueChange={(value) => {
                      setValue("postepowanieOrganow.status", value as any);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Maszyny i urządzenia */}
            <div className="space-y-3">
              <Checkbox
                label="Wypadek powstał podczas obsługi maszyn lub urządzeń"
                checked={maszynyUrzadzenia}
                onCheckedChange={(checked) => {
                  setMaszynyUrzadzenia(checked || false);
                  setValue("maszynyUrzadzenia.dotyczy", checked || false);
                }}
              />
              {maszynyUrzadzenia && (
                <div className="ml-7 space-y-3">
                  <Input
                    label="Nazwa maszyny/urządzenia"
                    {...register("maszynyUrzadzenia.nazwa")}
                  />
                  <Input
                    label="Typ urządzenia"
                    {...register("maszynyUrzadzenia.typ")}
                  />
                  <Input
                    label="Data produkcji"
                    type="date"
                    {...register("maszynyUrzadzenia.dataProdukcji")}
                  />
                  <Checkbox
                    label="Maszyna/urządzenie było sprawne"
                    checked={watch("maszynyUrzadzenia.sprawne") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.sprawne", checked || false);
                    }}
                  />
                  <Checkbox
                    label="Maszyna/urządzenie było używane zgodnie z zasadami producenta"
                    checked={watch("maszynyUrzadzenia.zgodneZProducentem") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.zgodneZProducentem", checked || false);
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sposób użycia
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      {...register("maszynyUrzadzenia.sposobUzycia")}
                    />
                  </div>
                  <Checkbox
                    label="Maszyna/urządzenie posiadało atest"
                    checked={watch("maszynyUrzadzenia.atest") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.atest", checked || false);
                    }}
                  />
                  <Checkbox
                    label="Maszyna/urządzenie posiadało deklarację zgodności"
                    checked={watch("maszynyUrzadzenia.deklaracjaZgodnosci") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.deklaracjaZgodnosci", checked || false);
                    }}
                  />
                  <Checkbox
                    label="Maszyna/urządzenie zostało wpisane do ewidencji środków trwałych"
                    checked={watch("maszynyUrzadzenia.wEwidencjiSrodkowTrwalych") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.wEwidencjiSrodkowTrwalych", checked || false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          ← Wstecz
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Dalej →
        </Button>
      </div>
    </form>
  );
});

Krok4DaneOWypadku.displayName = "Krok4DaneOWypadku";

