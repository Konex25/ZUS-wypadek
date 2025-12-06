"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { swiadkowieSchema, SwiadkowieForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";

interface Krok7SwiadkowieProps {
  onNext: (data: SwiadkowieForm) => void;
  onPrevious: () => void;
  initialData?: Partial<SwiadkowieForm>;
}

export const Krok7Swiadkowie: React.FC<Krok7SwiadkowieProps> = React.memo(({
  onNext,
  onPrevious,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SwiadkowieForm>({
    resolver: zodResolver(swiadkowieSchema),
    defaultValues: initialData || {
      swiadkowie: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "swiadkowie",
  });

  const onSubmit = (data: SwiadkowieForm) => {
    onNext(data);
  };

  const fillExampleData = () => {
    if (fields.length === 0) {
      append({
        imie: "Anna",
        nazwisko: "Nowak",
        ulica: "ul. Przykładowa",
        numerDomu: "15",
        kodPocztowy: "00-001",
        miejscowosc: "Warszawa",
        telefon: "+48 111 222 333",
      });
    }
  };

  const addWitness = () => {
    append({
      imie: "",
      nazwisko: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <ExampleDataButton onFill={fillExampleData} />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Świadkowie wypadku (opcjonalnie)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Jeśli były świadkowie wypadku, możesz dodać ich dane. To pole jest opcjonalne.
          </p>
        </div>

        {fields.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">Nie dodano jeszcze żadnych świadków.</p>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={addWitness}
            >
              + Dodaj świadka
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">
                    Świadek {index + 1}
                  </h4>
                  {fields.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Usuń
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Imię *"
                    {...register(`swiadkowie.${index}.imie`)}
                    error={errors.swiadkowie?.[index]?.imie?.message}
                  />
                  <Input
                    label="Nazwisko *"
                    {...register(`swiadkowie.${index}.nazwisko`)}
                    error={errors.swiadkowie?.[index]?.nazwisko?.message}
                  />
                  <Input
                    label="Ulica"
                    {...register(`swiadkowie.${index}.ulica`)}
                    error={errors.swiadkowie?.[index]?.ulica?.message}
                  />
                  <Input
                    label="Numer domu"
                    {...register(`swiadkowie.${index}.numerDomu`)}
                    error={errors.swiadkowie?.[index]?.numerDomu?.message}
                  />
                  <Input
                    label="Numer lokalu"
                    {...register(`swiadkowie.${index}.numerLokalu`)}
                    error={errors.swiadkowie?.[index]?.numerLokalu?.message}
                  />
                  <Input
                    label="Kod pocztowy"
                    {...register(`swiadkowie.${index}.kodPocztowy`)}
                    error={errors.swiadkowie?.[index]?.kodPocztowy?.message}
                  />
                  <Input
                    label="Miejscowość"
                    {...register(`swiadkowie.${index}.miejscowosc`)}
                    error={errors.swiadkowie?.[index]?.miejscowosc?.message}
                  />
                  <Input
                    label="Państwo"
                    {...register(`swiadkowie.${index}.panstwo`)}
                    error={errors.swiadkowie?.[index]?.panstwo?.message}
                  />
                  <Input
                    label="Telefon"
                    {...register(`swiadkowie.${index}.telefon`)}
                    error={errors.swiadkowie?.[index]?.telefon?.message}
                  />
                </div>
              </Card>
            ))}

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={addWitness}
            >
              + Dodaj kolejnego świadka
            </Button>
          </div>
        )}

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">Informacja</p>
              <p className="text-sm text-blue-800">
                Jeśli nie było świadków wypadku, możesz pominąć ten krok i przejść dalej.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="secondary" size="lg" type="button" onClick={onPrevious}>
          ← Wstecz
        </Button>
        <Button variant="primary" size="lg" type="submit">
          Dalej →
        </Button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.initialData) === JSON.stringify(nextProps.initialData) &&
    prevProps.onNext === nextProps.onNext &&
    prevProps.onPrevious === nextProps.onPrevious
  );
});

Krok7Swiadkowie.displayName = "Krok7Swiadkowie";

