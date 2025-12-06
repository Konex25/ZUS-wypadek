"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adresSchema, AdresForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

// Schemat dla wszystkich adresów
const adresySchema = z.object({
  adresZamieszkania: adresSchema,
  adresOstatniegoZamieszkaniaWPolsce: adresSchema.optional(),
  adresDoKorespondencji: z.object({
    typ: z.enum(["adres", "poste_restante", "skrytka"]).optional(),
    adres: adresSchema.optional(),
    posteRestante: z.object({
      kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
      nazwaPlacowki: z.string().min(1, "Nazwa placówki jest wymagana"),
    }).optional(),
    skrytka: z.object({
      numer: z.string().min(1, "Numer skrytki jest wymagany"),
      kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
      nazwaPlacowki: z.string().min(1, "Nazwa placówki jest wymagana"),
    }).optional(),
  }).optional(),
  adresDzialalnosci: adresSchema,
  mieszkaZaGranica: z.boolean().optional(),
  adresDoKorespondencjiInny: z.boolean().optional(),
});

type AdresyForm = z.infer<typeof adresySchema>;

interface Krok2AdresyProps {
  onNext: (data: AdresyForm) => void;
  onPrevious: () => void;
  initialData?: Partial<AdresyForm>;
}

export const Krok2Adresy: React.FC<Krok2AdresyProps> = React.memo(({
  onNext,
  onPrevious,
  initialData,
}) => {
  const [mieszkaZaGranica, setMieszkaZaGranica] = useState(
    initialData?.mieszkaZaGranica || false
  );
  const [adresDoKorespondencjiInny, setAdresDoKorespondencjiInny] = useState(
    initialData?.adresDoKorespondencjiInny || false
  );
  const [typAdresuKorespondencji, setTypAdresuKorespondencji] = useState<
    "adres" | "poste_restante" | "skrytka" | undefined
  >(initialData?.adresDoKorespondencji?.typ);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdresyForm>({
    resolver: zodResolver(adresySchema),
    defaultValues: initialData || {
      mieszkaZaGranica: false,
      adresDoKorespondencjiInny: false,
    },
  });

  const onSubmit = (data: AdresyForm) => {
    onNext(data);
  };

  const getError = (path: string): string | undefined => {
    const pathParts = path.split(".");
    let error: any = errors;
    for (const part of pathParts) {
      if (error && typeof error === "object" && part in error) {
        error = error[part];
      } else {
        return undefined;
      }
    }
    return error?.message;
  };

  const renderAdresFields = (
    prefix: string,
    label: string,
    required = true
  ) => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{label}</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Ulica"
          required={required}
          error={getError(`${prefix}.ulica`)}
          {...register(`${prefix}.ulica` as any)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Numer domu"
            required={required}
            error={getError(`${prefix}.numerDomu`)}
            {...register(`${prefix}.numerDomu` as any)}
          />
          <Input
            label="Numer lokalu"
            error={getError(`${prefix}.numerLokalu`)}
            {...register(`${prefix}.numerLokalu` as any)}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Kod pocztowy"
          required={required}
          error={getError(`${prefix}.kodPocztowy`)}
          helperText="Format: XX-XXX"
          {...register(`${prefix}.kodPocztowy` as any)}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 2) {
              value = value.slice(0, 2) + "-" + value.slice(2, 5);
            }
            setValue(`${prefix}.kodPocztowy` as any, value);
          }}
        />
        <Input
          label="Miejscowość"
          required={required}
          error={getError(`${prefix}.miejscowosc`)}
          {...register(`${prefix}.miejscowosc` as any)}
        />
      </div>
      {prefix === "adresDzialalnosci" && (
        <Input
          label="Telefon (opcjonalnie)"
          type="tel"
          error={getError(`${prefix}.telefon`)}
          {...register(`${prefix}.telefon` as any)}
        />
      )}
      {prefix.includes("Zamieszkania") && (
        <Input
          label="Państwo (jeśli za granicą)"
          error={getError(`${prefix}.panstwo`)}
          {...register(`${prefix}.panstwo` as any)}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Adresy
        </h3>

        {/* Adres zamieszkania */}
        <Card>
          {renderAdresFields("adresZamieszkania", "Adres zamieszkania")}
        </Card>

        {/* Mieszka za granicą */}
        <Card>
          <Checkbox
            label="Mieszkam obecnie za granicą"
            checked={mieszkaZaGranica}
            onCheckedChange={(checked) => {
              setMieszkaZaGranica(checked || false);
              setValue("mieszkaZaGranica", checked || false);
            }}
          />
        </Card>

        {/* Adres ostatniego zamieszkania w Polsce */}
        {mieszkaZaGranica && (
          <Card>
            {renderAdresFields(
              "adresOstatniegoZamieszkaniaWPolsce",
              "Adres ostatniego zamieszkania w Polsce"
            )}
          </Card>
        )}

        {/* Adres do korespondencji */}
        <Card>
          <Checkbox
            label="Adres do korespondencji jest inny niż adres zamieszkania"
            checked={adresDoKorespondencjiInny}
            onCheckedChange={(checked) => {
              setAdresDoKorespondencjiInny(checked || false);
              setValue("adresDoKorespondencjiInny", checked || false);
            }}
          />
        </Card>

        {adresDoKorespondencjiInny && (
          <Card>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Adres do korespondencji</h4>
              <Select
                label="Typ adresu do korespondencji"
                options={[
                  { value: "adres", label: "Adres" },
                  { value: "poste_restante", label: "Poste restante" },
                  { value: "skrytka", label: "Skrytka pocztowa" },
                ]}
                value={typAdresuKorespondencji}
                onValueChange={(value) => {
                  setTypAdresuKorespondencji(value as "adres" | "poste_restante" | "skrytka");
                  setValue("adresDoKorespondencji.typ", value as any);
                }}
              />

              {typAdresuKorespondencji === "adres" && (
                <div className="mt-4">
                  {renderAdresFields("adresDoKorespondencji.adres", "Adres do korespondencji")}
                </div>
              )}

              {typAdresuKorespondencji === "poste_restante" && (
                <div className="mt-4 space-y-4">
                  <Input
                    label="Kod pocztowy placówki"
                    required
                    error={errors.adresDoKorespondencji?.posteRestante?.kodPocztowy?.message}
                    helperText="Format: XX-XXX"
                    {...register("adresDoKorespondencji.posteRestante.kodPocztowy" as any)}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 2) {
                        value = value.slice(0, 2) + "-" + value.slice(2, 5);
                      }
                      setValue("adresDoKorespondencji.posteRestante.kodPocztowy" as any, value);
                    }}
                  />
                  <Input
                    label="Nazwa placówki pocztowej"
                    required
                    error={errors.adresDoKorespondencji?.posteRestante?.nazwaPlacowki?.message}
                    {...register("adresDoKorespondencji.posteRestante.nazwaPlacowki" as any)}
                  />
                </div>
              )}

              {typAdresuKorespondencji === "skrytka" && (
                <div className="mt-4 space-y-4">
                  <Input
                    label="Numer skrytki/przegródki"
                    required
                    error={errors.adresDoKorespondencji?.skrytka?.numer?.message}
                    {...register("adresDoKorespondencji.skrytka.numer" as any)}
                  />
                  <Input
                    label="Kod pocztowy placówki"
                    required
                    error={errors.adresDoKorespondencji?.skrytka?.kodPocztowy?.message}
                    helperText="Format: XX-XXX"
                    {...register("adresDoKorespondencji.skrytka.kodPocztowy" as any)}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 2) {
                        value = value.slice(0, 2) + "-" + value.slice(2, 5);
                      }
                      setValue("adresDoKorespondencji.skrytka.kodPocztowy" as any, value);
                    }}
                  />
                  <Input
                    label="Nazwa placówki pocztowej"
                    required
                    error={errors.adresDoKorespondencji?.skrytka?.nazwaPlacowki?.message}
                    {...register("adresDoKorespondencji.skrytka.nazwaPlacowki" as any)}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Adres działalności gospodarczej */}
        <Card>
          {renderAdresFields("adresDzialalnosci", "Adres działalności gospodarczej")}
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
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.initialData) === JSON.stringify(nextProps.initialData);
});

Krok2Adresy.displayName = "Krok2Adresy";

