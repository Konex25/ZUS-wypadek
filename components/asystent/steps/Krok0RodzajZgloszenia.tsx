"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rodzajZgloszeniaSchema, RodzajZgloszeniaForm } from "@/lib/validation/schemas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";

interface Krok0RodzajZgloszeniaProps {
  onNext: (data: RodzajZgloszeniaForm) => void;
  initialData?: RodzajZgloszeniaForm;
}

export const Krok0RodzajZgloszenia: React.FC<Krok0RodzajZgloszeniaProps> = React.memo(({
  onNext,
  initialData,
}) => {
  type FormData = {
    rodzajZgloszenia?: "zawiadomienie" | "wyjasnienia" | "oba";
  };

  const [selectedType, setSelectedType] = useState<"zawiadomienie" | "wyjasnienia" | "oba" | undefined>(
    initialData?.rodzajZgloszenia
  );

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(rodzajZgloszeniaSchema),
    defaultValues: initialData || {},
  });

  // Funkcja pomocnicza do aktualizacji zarówno state jak i formularza
  const updateSelection = useCallback((value: "zawiadomienie" | "wyjasnienia" | "oba" | undefined) => {
    setSelectedType((prev) => {
      // Jeśli wartość się nie zmieniła, nie aktualizuj
      if (prev === value) return prev;
      return value;
    });
    if (value !== undefined) {
      setValue("rodzajZgloszenia", value, { shouldValidate: false, shouldDirty: false });
    }
  }, [setValue]);

  const onSubmit = (data: FormData) => {
    if (data.rodzajZgloszenia) {
      onNext({ rodzajZgloszenia: data.rodzajZgloszenia });
    }
  };

  const fillExampleData = useCallback(() => {
    updateSelection("oba");
  }, [updateSelection]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <ExampleDataButton onFill={fillExampleData} />
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Wybór rodzaju zgłoszenia
        </h2>
        <p className="text-gray-600">
          Wybierz, co chcesz złożyć. Możesz wybrać jedno lub oba zgłoszenia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Zawiadomienie o wypadku */}
        <Card
          className={`
            transition-all duration-200 cursor-pointer
            ${selectedType === "zawiadomienie" || selectedType === "oba"
              ? "ring-4 ring-blue-500 border-blue-500 bg-blue-50"
              : "hover:shadow-lg hover:border-blue-300"
            }
          `}
          onClick={() => {
            if (selectedType === "zawiadomienie" || selectedType === "oba") {
              if (selectedType === "oba") {
                updateSelection("wyjasnienia");
              } else {
                updateSelection(undefined);
              }
            } else {
              updateSelection("zawiadomienie");
            }
          }}
        >
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedType === "zawiadomienie" || selectedType === "oba"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateSelection("zawiadomienie");
                    } else {
                      updateSelection(undefined);
                    }
                  }}
                />
              </div>
              <div className="flex-1 ml-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Zawiadomienie o wypadku
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Podstawowe zgłoszenie wypadku przy pracy. Zawiera dane osobowe, 
                  informacje o wypadku oraz okolicznościach zdarzenia.
                </p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 ml-7">
              <li>✓ Dane osobowe poszkodowanego</li>
              <li>✓ Informacje o wypadku</li>
              <li>✓ Opis okoliczności i przyczyn</li>
            </ul>
          </div>
        </Card>

        {/* Zapis wyjaśnień poszkodowanego */}
        <Card
          className={`
            transition-all duration-200 cursor-pointer
            ${selectedType === "wyjasnienia" || selectedType === "oba"
              ? "ring-4 ring-blue-500 border-blue-500 bg-blue-50"
              : "hover:shadow-lg hover:border-blue-300"
            }
          `}
          onClick={() => {
            if (selectedType === "wyjasnienia" || selectedType === "oba") {
              if (selectedType === "oba") {
                updateSelection("zawiadomienie");
              } else {
                updateSelection(undefined);
              }
            } else {
              if (selectedType === "zawiadomienie") {
                updateSelection("oba");
              } else {
                updateSelection("wyjasnienia");
              }
            }
          }}
        >
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedType === "wyjasnienia" || selectedType === "oba"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (selectedType === "zawiadomienie") {
                        updateSelection("oba");
                      } else {
                        updateSelection("wyjasnienia");
                      }
                    } else {
                      if (selectedType === "oba") {
                        updateSelection("zawiadomienie");
                      } else {
                        updateSelection(undefined);
                      }
                    }
                  }}
                />
              </div>
              <div className="flex-1 ml-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Zapis wyjaśnień poszkodowanego
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Szczegółowe wyjaśnienia dotyczące wypadku. Zawiera informacje 
                  o czynnościach przed wypadkiem, środkach ochrony, BHP i innych szczegółach.
                </p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 ml-7">
              <li>✓ Szczegółowy opis zdarzenia</li>
              <li>✓ Informacje o BHP i środkach ochrony</li>
              <li>✓ Informacje o maszynach i urządzeniach</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Opcja "Oba" */}
      <div className="flex justify-center">
        <Card
          className={`
            transition-all duration-200 w-full max-w-md cursor-pointer
            ${selectedType === "oba"
              ? "ring-4 ring-blue-500 border-blue-500 bg-blue-50"
              : "hover:shadow-lg hover:border-blue-300"
            }
          `}
          onClick={() => {
            updateSelection(selectedType === "oba" ? undefined : "oba");
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedType === "oba"}
                  onCheckedChange={(checked) => {
                    updateSelection(checked ? "oba" : undefined);
                  }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Złóż oba dokumenty
                </h3>
                <p className="text-sm text-gray-600">
                  Złóż zarówno zawiadomienie o wypadku, jak i zapis wyjaśnień poszkodowanego
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {errors.rodzajZgloszenia && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.rodzajZgloszenia.message}</p>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          variant="primary" 
          size="lg"
        >
          Dalej →
        </Button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  // Porównaj wszystkie props, które mogą wpływać na renderowanie
  return (
    prevProps.initialData?.rodzajZgloszenia === nextProps.initialData?.rodzajZgloszenia &&
    prevProps.onNext === nextProps.onNext
  );
});

Krok0RodzajZgloszenia.displayName = "Krok0RodzajZgloszenia";

