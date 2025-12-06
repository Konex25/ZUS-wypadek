"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daneOsoboweSchema, DaneOsoboweForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";
import { validatePESEL } from "@/lib/utils";

interface Krok1DaneOsoboweProps {
  onNext: (data: DaneOsoboweForm) => void;
  onPrevious: () => void;
  initialData?: Partial<DaneOsoboweForm>;
}

export const Krok1DaneOsobowe: React.FC<Krok1DaneOsoboweProps> = React.memo(({
  onNext,
  onPrevious,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DaneOsoboweForm>({
    resolver: zodResolver(daneOsoboweSchema),
    defaultValues: initialData || {},
  });

  const peselValue = watch("pesel");

  // Walidacja PESEL w czasie rzeczywistym
  React.useEffect(() => {
    if (peselValue && peselValue.length === 11) {
      const isValid = validatePESEL(peselValue);
      if (!isValid && !errors.pesel) {
        // PESEL jest nieprawidłowy, ale błąd zostanie pokazany przez Zod
      }
    }
  }, [peselValue, errors.pesel]);

  const onSubmit = (data: DaneOsoboweForm) => {
    onNext(data);
  };

  const fillExampleData = () => {
    setValue("pesel", "85010112345");
    setValue("dokumentTozsamosci.rodzaj", "dowód osobisty");
    setValue("dokumentTozsamosci.seria", "ABC");
    setValue("dokumentTozsamosci.numer", "123456");
    setValue("imie", "Jan");
    setValue("nazwisko", "Kowalski");
    setValue("dataUrodzenia", "1985-01-01");
    setValue("miejsceUrodzenia", "Warszawa");
    setValue("telefon", "+48 123 456 789");
    setValue("email", "jan.kowalski@example.com");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <ExampleDataButton onFill={fillExampleData} />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dane osobowe poszkodowanego
        </h3>

        {/* PESEL */}
        <Input
          label="PESEL"
          type="text"
          maxLength={11}
          required
          error={errors.pesel?.message}
          helperText="11 cyfr"
          {...register("pesel")}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Tylko cyfry
            setValue("pesel", value, { shouldValidate: true });
          }}
        />

        {/* Dokument tożsamości */}
        <div className="space-y-4">
          <Select
            label="Rodzaj dokumentu tożsamości"
            required
            error={errors.dokumentTozsamosci?.rodzaj?.message}
            options={[
              { value: "dowód osobisty", label: "Dowód osobisty" },
              { value: "paszport", label: "Paszport" },
              { value: "inny", label: "Inny dokument" },
            ]}
            value={watch("dokumentTozsamosci.rodzaj")}
            onValueChange={(value) => {
              setValue("dokumentTozsamosci.rodzaj", value as "dowód osobisty" | "paszport" | "inny");
            }}
          />

          {watch("dokumentTozsamosci.rodzaj") === "dowód osobisty" && (
            <Input
              label="Seria dokumentu"
              type="text"
              maxLength={3}
              error={errors.dokumentTozsamosci?.seria?.message}
              helperText="3 litery (np. ABC)"
              {...register("dokumentTozsamosci.seria")}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                setValue("dokumentTozsamosci.seria", value);
              }}
            />
          )}

          <Input
            label="Numer dokumentu"
            type="text"
            required
            error={errors.dokumentTozsamosci?.numer?.message}
            {...register("dokumentTozsamosci.numer")}
          />
        </div>

        {/* Imię i nazwisko */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Imię"
            type="text"
            required
            error={errors.imie?.message}
            {...register("imie")}
          />
          <Input
            label="Nazwisko"
            type="text"
            required
            error={errors.nazwisko?.message}
            {...register("nazwisko")}
          />
        </div>

        {/* Data i miejsce urodzenia */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Data urodzenia"
            type="date"
            required
            error={errors.dataUrodzenia?.message}
            helperText="Format: RRRR-MM-DD"
            {...register("dataUrodzenia")}
          />
          <Input
            label="Miejsce urodzenia"
            type="text"
            required
            error={errors.miejsceUrodzenia?.message}
            {...register("miejsceUrodzenia")}
          />
        </div>

        {/* Telefon i email */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Numer telefonu"
            type="tel"
            required
            error={errors.telefon?.message}
            helperText="Format: +48 123 456 789 lub 123-456-789"
            {...register("telefon")}
          />
          <Input
            label="Adres email (opcjonalnie)"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
      </div>

      {/* Błędy formularza */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            Proszę poprawić następujące błędy:
          </p>
          <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
            {errors.pesel && <li>PESEL: {errors.pesel.message}</li>}
            {errors.dokumentTozsamosci?.rodzaj && (
              <li>Rodzaj dokumentu: {errors.dokumentTozsamosci.rodzaj.message}</li>
            )}
            {errors.dokumentTozsamosci?.numer && (
              <li>Numer dokumentu: {errors.dokumentTozsamosci.numer.message}</li>
            )}
            {errors.imie && <li>Imię: {errors.imie.message}</li>}
            {errors.nazwisko && <li>Nazwisko: {errors.nazwisko.message}</li>}
            {errors.dataUrodzenia && <li>Data urodzenia: {errors.dataUrodzenia.message}</li>}
            {errors.miejsceUrodzenia && (
              <li>Miejsce urodzenia: {errors.miejsceUrodzenia.message}</li>
            )}
            {errors.telefon && <li>Telefon: {errors.telefon.message}</li>}
            {errors.email && <li>Email: {errors.email.message}</li>}
          </ul>
        </div>
      )}

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
}, (prevProps, nextProps) => {
  // Porównaj wszystkie props, które mogą wpływać na renderowanie
  return (
    JSON.stringify(prevProps.initialData) === JSON.stringify(nextProps.initialData) &&
    prevProps.onNext === nextProps.onNext &&
    prevProps.onPrevious === nextProps.onPrevious
  );
});

Krok1DaneOsobowe.displayName = "Krok1DaneOsobowe";

