"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daneOsoboweSchema, DaneOsoboweForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [innaOsobaZawiadamia, setInnaOsobaZawiadamia] = useState(
    initialData?.innaOsobaZawiadamia || false
  );
  const [mieszkaZaGranicaOsobaZawiadamiajaca, setMieszkaZaGranicaOsobaZawiadamiajaca] = useState(
    initialData?.osobaZawiadamiajaca?.mieszkaZaGranica || false
  );
  const [adresDoKorespondencjiInny, setAdresDoKorespondencjiInny] = useState(
    initialData?.osobaZawiadamiajaca?.adresDoKorespondencjiInny || false
  );

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
    
    // Opcjonalnie: dane osoby zawiadamiającej (nie wypełniaj domyślnie)
    setInnaOsobaZawiadamia(false);
    setValue("innaOsobaZawiadamia", false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative" style={{ zIndex: 1, position: 'relative' }}>
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
              setValue(
                "dokumentTozsamosci.rodzaj",
                value as "dowód osobisty" | "paszport" | "inny"
              );
            }}
          />

          <Input
            label="Seria dokumentu"
            type="text"
            maxLength={3}
            required
            error={errors.dokumentTozsamosci?.seria?.message}
            helperText="3 litery (np. ABC) - wymagane"
            {...register("dokumentTozsamosci.seria")}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
              setValue("dokumentTozsamosci.seria", value);
            }}
          />

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

        {/* Telefon */}
        <Input
          label="Numer telefonu"
          type="tel"
          required
          error={errors.telefon?.message}
          helperText="Format: +48 123 456 789 lub 123-456-789"
          {...register("telefon")}
        />
      </div>

      {/* Opcjonalne: Dane osoby zawiadamiającej */}
      <Card>
        <div className="space-y-4">
          <Checkbox
            label="Zawiadomienie składa osoba inna niż poszkodowany"
            checked={innaOsobaZawiadamia}
            onCheckedChange={(checked) => {
              setInnaOsobaZawiadamia(checked || false);
              setValue("innaOsobaZawiadamia", checked || false);
              if (!checked) {
                // Wyczyść dane osoby zawiadamiającej
                setValue("osobaZawiadamiajaca", undefined);
              }
            }}
          />

          {innaOsobaZawiadamia && (
            <div className="ml-7 space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-bold text-gray-900">
                Dane osoby zawiadamiającej
              </h4>

              {/* PESEL (opcjonalny) */}
              <Input
                label="PESEL (opcjonalnie, jeśli posiada)"
                type="text"
                maxLength={11}
                error={errors.osobaZawiadamiajaca?.pesel?.message}
                helperText="11 cyfr (opcjonalnie)"
                {...register("osobaZawiadamiajaca.pesel")}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setValue("osobaZawiadamiajaca.pesel", value);
                }}
              />

              {/* Dokument tożsamości */}
              <div className="space-y-4">
                <Select
                  label="Rodzaj dokumentu tożsamości"
                  required={innaOsobaZawiadamia}
                  error={
                    errors.osobaZawiadamiajaca?.dokumentTozsamosci?.rodzaj
                      ?.message
                  }
                  options={[
                    { value: "dowód osobisty", label: "Dowód osobisty" },
                    { value: "paszport", label: "Paszport" },
                    { value: "inny", label: "Inny dokument" },
                  ]}
                  value={watch("osobaZawiadamiajaca.dokumentTozsamosci.rodzaj")}
                  onValueChange={(value) => {
                    setValue(
                      "osobaZawiadamiajaca.dokumentTozsamosci.rodzaj",
                      value as "dowód osobisty" | "paszport" | "inny"
                    );
                  }}
                />

                {watch("osobaZawiadamiajaca.dokumentTozsamosci.rodzaj") ===
                  "dowód osobisty" && (
                  <Input
                    label="Seria dokumentu"
                    type="text"
                    maxLength={3}
                    error={
                      errors.osobaZawiadamiajaca?.dokumentTozsamosci?.seria
                        ?.message
                    }
                    helperText="3 litery (np. ABC)"
                    {...register(
                      "osobaZawiadamiajaca.dokumentTozsamosci.seria"
                    )}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "");
                      setValue(
                        "osobaZawiadamiajaca.dokumentTozsamosci.seria",
                        value
                      );
                    }}
                  />
                )}

                <Input
                  label="Numer dokumentu"
                  type="text"
                  required={innaOsobaZawiadamia}
                  error={
                    errors.osobaZawiadamiajaca?.dokumentTozsamosci?.numer
                      ?.message
                  }
                  {...register("osobaZawiadamiajaca.dokumentTozsamosci.numer")}
                />
              </div>

              {/* Imię i nazwisko */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Imię"
                  type="text"
                  required={innaOsobaZawiadamia}
                  error={errors.osobaZawiadamiajaca?.imie?.message}
                  {...register("osobaZawiadamiajaca.imie")}
                />
                <Input
                  label="Nazwisko"
                  type="text"
                  required={innaOsobaZawiadamia}
                  error={errors.osobaZawiadamiajaca?.nazwisko?.message}
                  {...register("osobaZawiadamiajaca.nazwisko")}
                />
              </div>

              {/* Data urodzenia i telefon */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Data urodzenia"
                  type="date"
                  required={innaOsobaZawiadamia}
                  error={errors.osobaZawiadamiajaca?.dataUrodzenia?.message}
                  {...register("osobaZawiadamiajaca.dataUrodzenia")}
                />
                <Input
                  label="Numer telefonu (opcjonalnie)"
                  type="tel"
                  error={errors.osobaZawiadamiajaca?.telefon?.message}
                  helperText="Format: +48 123 456 789"
                  {...register("osobaZawiadamiajaca.telefon")}
                />
              </div>

              {/* Adres zamieszkania osoby zawiadamiającej */}
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-bold text-gray-900 mb-4">
                  Adres zamieszkania osoby zawiadamiającej
                </h5>
                <div className="space-y-4">
                  <Checkbox
                    label="Osoba zawiadamiająca mieszka obecnie za granicą"
                    checked={mieszkaZaGranicaOsobaZawiadamiajaca}
                    onCheckedChange={(checked) => {
                      setMieszkaZaGranicaOsobaZawiadamiajaca(checked || false);
                      setValue(
                        "osobaZawiadamiajaca.mieszkaZaGranica",
                        checked || false
                      );
                    }}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Ulica"
                      type="text"
                      required={innaOsobaZawiadamia}
                      error={
                        errors.osobaZawiadamiajaca?.adresZamieszkania?.ulica
                          ?.message
                      }
                      {...register(
                        "osobaZawiadamiajaca.adresZamieszkania.ulica"
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Numer domu"
                        type="text"
                        required={innaOsobaZawiadamia}
                        error={
                          errors.osobaZawiadamiajaca?.adresZamieszkania
                            ?.numerDomu?.message
                        }
                        {...register(
                          "osobaZawiadamiajaca.adresZamieszkania.numerDomu"
                        )}
                      />
                      <Input
                        label="Numer lokalu"
                        type="text"
                        error={
                          errors.osobaZawiadamiajaca?.adresZamieszkania
                            ?.numerLokalu?.message
                        }
                        {...register(
                          "osobaZawiadamiajaca.adresZamieszkania.numerLokalu"
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Kod pocztowy"
                      type="text"
                      required={innaOsobaZawiadamia}
                      error={
                        errors.osobaZawiadamiajaca?.adresZamieszkania
                          ?.kodPocztowy?.message
                      }
                      helperText="Format: XX-XXX"
                      {...register(
                        "osobaZawiadamiajaca.adresZamieszkania.kodPocztowy"
                      )}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 5) {
                          const formatted =
                            value.length > 2
                              ? `${value.slice(0, 2)}-${value.slice(2)}`
                              : value;
                          setValue(
                            "osobaZawiadamiajaca.adresZamieszkania.kodPocztowy",
                            formatted
                          );
                        }
                      }}
                    />
                    <Input
                      label="Miejscowość"
                      type="text"
                      required={innaOsobaZawiadamia}
                      error={
                        errors.osobaZawiadamiajaca?.adresZamieszkania
                          ?.miejscowosc?.message
                      }
                      {...register(
                        "osobaZawiadamiajaca.adresZamieszkania.miejscowosc"
                      )}
                    />
                  </div>
                  <Input
                    label="Nazwa państwa (jeśli inna niż Polska)"
                    type="text"
                    error={
                      errors.osobaZawiadamiajaca?.adresZamieszkania?.panstwo
                        ?.message
                    }
                    {...register(
                      "osobaZawiadamiajaca.adresZamieszkania.panstwo"
                    )}
                  />

                  {/* Adres ostatniego zamieszkania w Polsce dla osoby zawiadamiającej */}
                  {mieszkaZaGranicaOsobaZawiadamiajaca && (
                    <div className="pt-4 border-t border-gray-200">
                      <h6 className="text-sm font-bold text-gray-900 mb-4">
                        Adres ostatniego miejsca zamieszkania w Polsce / adres
                        miejsca pobytu
                      </h6>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Ulica"
                          type="text"
                          error={
                            errors.osobaZawiadamiajaca
                              ?.adresOstatniegoZamieszkaniaWPolsce?.ulica
                              ?.message
                          }
                          {...register(
                            "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.ulica"
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Numer domu"
                            type="text"
                            error={
                              errors.osobaZawiadamiajaca
                                ?.adresOstatniegoZamieszkaniaWPolsce?.numerDomu
                                ?.message
                            }
                            {...register(
                              "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.numerDomu"
                            )}
                          />
                          <Input
                            label="Numer lokalu"
                            type="text"
                            error={
                              errors.osobaZawiadamiajaca
                                ?.adresOstatniegoZamieszkaniaWPolsce
                                ?.numerLokalu?.message
                            }
                            {...register(
                              "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.numerLokalu"
                            )}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Kod pocztowy"
                          type="text"
                          error={
                            errors.osobaZawiadamiajaca
                              ?.adresOstatniegoZamieszkaniaWPolsce?.kodPocztowy
                              ?.message
                          }
                          helperText="Format: XX-XXX"
                          {...register(
                            "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy"
                          )}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 5) {
                              const formatted =
                                value.length > 2
                                  ? `${value.slice(0, 2)}-${value.slice(2)}`
                                  : value;
                              setValue(
                                "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.kodPocztowy",
                                formatted
                              );
                            }
                          }}
                        />
                        <Input
                          label="Miejscowość"
                          type="text"
                          error={
                            errors.osobaZawiadamiajaca
                              ?.adresOstatniegoZamieszkaniaWPolsce?.miejscowosc
                              ?.message
                          }
                          {...register(
                            "osobaZawiadamiajaca.adresOstatniegoZamieszkaniaWPolsce.miejscowosc"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Adres do korespondencji osoby zawiadamiającej */}
              <div className="pt-4 border-t border-gray-200">
                <Checkbox
                  label="Adres do korespondencji jest inny niż adres zamieszkania / adres ostatniego miejsca zamieszkania w Polsce / adres miejsca pobytu"
                  checked={adresDoKorespondencjiInny}
                  onCheckedChange={(checked) => {
                    setAdresDoKorespondencjiInny(checked || false);
                    setValue(
                      "osobaZawiadamiajaca.adresDoKorespondencjiInny",
                      checked || false
                    );
                    if (!checked) {
                      setValue(
                        "osobaZawiadamiajaca.adresDoKorespondencji",
                        undefined
                      );
                    }
                  }}
                />
                {adresDoKorespondencjiInny && (
                  <div className="mt-4 space-y-4">
                    <h5 className="text-sm font-bold text-gray-900 mb-4">
                      Adres do korespondencji osoby zawiadamiającej
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Ulica"
                        type="text"
                        required={adresDoKorespondencjiInny}
                        error={
                          errors.osobaZawiadamiajaca?.adresDoKorespondencji
                            ?.ulica?.message
                        }
                        {...register(
                          "osobaZawiadamiajaca.adresDoKorespondencji.ulica"
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Numer domu"
                          type="text"
                          required={adresDoKorespondencjiInny}
                          error={
                            errors.osobaZawiadamiajaca?.adresDoKorespondencji
                              ?.numerDomu?.message
                          }
                          {...register(
                            "osobaZawiadamiajaca.adresDoKorespondencji.numerDomu"
                          )}
                        />
                        <Input
                          label="Numer lokalu"
                          type="text"
                          error={
                            errors.osobaZawiadamiajaca?.adresDoKorespondencji
                              ?.numerLokalu?.message
                          }
                          {...register(
                            "osobaZawiadamiajaca.adresDoKorespondencji.numerLokalu"
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Kod pocztowy"
                        type="text"
                        required={adresDoKorespondencjiInny}
                        error={
                          errors.osobaZawiadamiajaca?.adresDoKorespondencji
                            ?.kodPocztowy?.message
                        }
                        helperText="Format: XX-XXX"
                        {...register(
                          "osobaZawiadamiajaca.adresDoKorespondencji.kodPocztowy"
                        )}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 5) {
                            const formatted =
                              value.length > 2
                                ? `${value.slice(0, 2)}-${value.slice(2)}`
                                : value;
                            setValue(
                              "osobaZawiadamiajaca.adresDoKorespondencji.kodPocztowy",
                              formatted
                            );
                          }
                        }}
                      />
                      <Input
                        label="Miejscowość"
                        type="text"
                        required={adresDoKorespondencjiInny}
                        error={
                          errors.osobaZawiadamiajaca?.adresDoKorespondencji
                            ?.miejscowosc?.message
                        }
                        {...register(
                          "osobaZawiadamiajaca.adresDoKorespondencji.miejscowosc"
                        )}
                      />
                    </div>
                    <Input
                      label="Nazwa państwa (jeśli inna niż Polska)"
                      type="text"
                      error={
                        errors.osobaZawiadamiajaca?.adresDoKorespondencji
                          ?.panstwo?.message
                      }
                      {...register(
                        "osobaZawiadamiajaca.adresDoKorespondencji.panstwo"
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Błędy formularza */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            Proszę poprawić następujące błędy:
          </p>
          <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
            {errors.pesel && <li>PESEL: {errors.pesel.message}</li>}
            {errors.dokumentTozsamosci?.rodzaj && (
              <li>
                Rodzaj dokumentu: {errors.dokumentTozsamosci.rodzaj.message}
              </li>
            )}
            {errors.dokumentTozsamosci?.numer && (
              <li>
                Numer dokumentu: {errors.dokumentTozsamosci.numer.message}
              </li>
            )}
            {errors.imie && <li>Imię: {errors.imie.message}</li>}
            {errors.nazwisko && <li>Nazwisko: {errors.nazwisko.message}</li>}
            {errors.dataUrodzenia && (
              <li>Data urodzenia: {errors.dataUrodzenia.message}</li>
            )}
            {errors.miejsceUrodzenia && (
              <li>Miejsce urodzenia: {errors.miejsceUrodzenia.message}</li>
            )}
            {errors.telefon && <li>Telefon: {errors.telefon.message}</li>}
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
});

Krok1DaneOsobowe.displayName = "Krok1DaneOsobowe";

