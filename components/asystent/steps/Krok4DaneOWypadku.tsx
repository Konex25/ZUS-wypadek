"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daneWypadkuSchema, DaneWypadkuForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
        potwierdzona: false,
        opis: "",
      },
      przyczynaZewnetrzna: {
        potwierdzona: false,
        typ: "inne",
        opis: "",
      },
      uraz: {
        potwierdzony: false,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dane o wypadku
        </h3>

        {/* Podstawowe informacje o wypadku */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Podstawowe informacje</h4>
            
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h4 className="font-medium text-gray-900">Szczegółowe opisy</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Szczegółowy opis okoliczności wypadku <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                required
                placeholder="Opisz dokładnie, co się stało i w jakich okolicznościach doszło do wypadku..."
                {...register("szczegolowyOpisOkolicznosci")}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                required
                placeholder="Opisz przyczyny, które doprowadziły do wypadku..."
                {...register("szczegolowyOpisPrzyczyn")}
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
            <h4 className="font-medium text-gray-900">
              Weryfikacja elementów definicji wypadku przy pracy
            </h4>
            <p className="text-sm text-gray-600">
              Aby zdarzenie mogło być uznane za wypadek przy pracy, muszą być spełnione wszystkie poniższe warunki.
            </p>

            {/* Nagłość */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={watch("naglosc.potwierdzona")}
                  onCheckedChange={(checked) => {
                    setValue("naglosc.potwierdzona", checked || false);
                  }}
                />
                <label className="font-medium text-gray-900">
                  Nagłość zdarzenia
                </label>
              </div>
              <p className="text-xs text-gray-600 ml-7">
                Zdarzenie nagłe to natychmiastowe ujawnienie się przyczyny zewnętrznej lub działanie tej przyczyny 
                przez pewien okres, ale nie dłużej niż przez jedną dniówkę roboczą.
              </p>
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis nagłości <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="Opisz, czy zdarzenie było nagłe (np. wybuch, upadek, zderzenie)..."
                  {...register("naglosc.opis")}
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={watch("przyczynaZewnetrzna.potwierdzona")}
                  onCheckedChange={(checked) => {
                    setValue("przyczynaZewnetrzna.potwierdzona", checked || false);
                  }}
                />
                <label className="font-medium text-gray-900">
                  Przyczyna zewnętrzna
                </label>
              </div>
              <p className="text-xs text-gray-600 ml-7">
                Przyczyna zewnętrzna to czynnik występujący poza organizmem człowieka, który spowodował uraz.
              </p>
              <div className="ml-7 space-y-3">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Opisz, jaki czynnik zewnętrzny spowodował uraz..."
                    {...register("przyczynaZewnetrzna.opis")}
                  />
                  {errors.przyczynaZewnetrzna?.opis && (
                    <p className="mt-1 text-sm text-red-600">{errors.przyczynaZewnetrzna.opis.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Uraz */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={watch("uraz.potwierdzony")}
                  onCheckedChange={(checked) => {
                    setValue("uraz.potwierdzony", checked || false);
                  }}
                />
                <label className="font-medium text-gray-900">
                  Uraz
                </label>
              </div>
              <p className="text-xs text-gray-600 ml-7">
                Uraz to uszkodzenie tkanek ciała lub narządów człowieka wskutek działania czynnika zewnętrznego.
              </p>
              <div className="ml-7 space-y-3">
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
              <div className="flex items-center space-x-2">
                <label className="font-medium text-gray-900">
                  Związek z pracą
                </label>
              </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Opisz, jak wypadek wiąże się z wykonywaną pracą..."
                    {...register("zwiazekZPraca.opis")}
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
            <h4 className="font-medium text-gray-900">Dodatkowe informacje</h4>

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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      {...register("maszynyUrzadzenia.sposobUzycia")}
                    />
                  </div>
                  <Checkbox
                    label="Maszyna/urządzenie posiadało atest / deklarację zgodności"
                    checked={watch("maszynyUrzadzenia.atest") || false}
                    onCheckedChange={(checked) => {
                      setValue("maszynyUrzadzenia.atest", checked || false);
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
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.initialData) === JSON.stringify(nextProps.initialData);
});

Krok4DaneOWypadku.displayName = "Krok4DaneOWypadku";

