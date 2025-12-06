"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wyjasnieniaSchema, WyjasnieniaForm } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";

interface Krok6WyjasnieniaProps {
  onNext: (data: WyjasnieniaForm) => void;
  onPrevious: () => void;
  initialData?: Partial<WyjasnieniaForm>;
}

export const Krok6Wyjasnienia: React.FC<Krok6WyjasnieniaProps> = React.memo(({
  onNext,
  onPrevious,
  initialData,
}) => {
  const [machineryTools, setMachineryTools] = useState(
    initialData?.maszynyNarzedzia?.dotyczy || false
  );
  const [protectiveMeasures, setProtectiveMeasures] = useState(
    initialData?.srodkiOchrony?.stosowane || false
  );
  const [safetyMeasures, setSafetyMeasures] = useState(
    initialData?.asekuracja?.stosowana || false
  );
  const [healthAndSafety, setHealthAndSafety] = useState(
    initialData?.bhp?.przestrzegane || false
  );
  const [sobrietyState, setSobrietyState] = useState(
    initialData?.stanTrzezwosci?.nietrzezwosc || initialData?.stanTrzezwosci?.srodkiOdurzajace || false
  );
  const [controlAuthorities, setControlAuthorities] = useState(
    initialData?.organyKontroli?.podjeteCzynnosci || false
  );
  const [firstAid, setFirstAid] = useState(
    initialData?.pierwszaPomoc?.udzielona || false
  );
  const [sickLeave, setSickLeave] = useState(
    initialData?.zwolnienieLekarskie?.wDniuWypadku || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WyjasnieniaForm>({
    resolver: zodResolver(wyjasnieniaSchema),
    defaultValues: initialData || {
      rodzajCzynnosciPrzedWypadkiem: "",
      okolicznosciWypadku: "",
      przyczynyWypadku: "",
    },
  });

  const onSubmit = (data: WyjasnieniaForm) => {
    onNext(data);
  };

  const fillExampleData = () => {
    setValue("rodzajCzynnosciPrzedWypadkiem", 
      "Wykonywałem prace remontowe - cięcie materiału za pomocą piły tarczowej. " +
      "Była to standardowa czynność związana z prowadzoną działalnością gospodarczą."
    );
    setValue("okolicznosciWypadku",
      "Podczas cięcia materiału, doszło do poślizgnięcia się materiału. " +
      "W wyniku tego moja lewa dłoń znalazła się w kontakcie z ostrą krawędzią piły tarczowej. " +
      "Zdarzenie nastąpiło natychmiastowo."
    );
    setValue("przyczynyWypadku",
      "Główną przyczyną było nieprawidłowe zabezpieczenie materiału podczas cięcia. " +
      "Materiał nie był właściwie zamocowany, co doprowadziło do jego poślizgnięcia się."
    );
    
    setMachineryTools(true);
    setValue("maszynyNarzedzia.dotyczy", true);
    setValue("maszynyNarzedzia.nazwa", "Piła tarczowa");
    setValue("maszynyNarzedzia.typ", "Elektryczna");
    setValue("maszynyNarzedzia.sprawne", true);
    setValue("maszynyNarzedzia.zgodneZProducentem", true);
    
    setProtectiveMeasures(true);
    setValue("srodkiOchrony.stosowane", true);
    setValue("srodkiOchrony.rodzaj", ["Rękawice ochronne"]);
    setValue("srodkiOchrony.wlasciwe", true);
    setValue("srodkiOchrony.sprawne", true);
    
    setHealthAndSafety(true);
    setValue("bhp.przestrzegane", true);
    setValue("bhp.przygotowanie", true);
    setValue("bhp.szkoleniaBHP", true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <ExampleDataButton onFill={fillExampleData} />
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Szczegółowe wyjaśnienia poszkodowanego
        </h3>

        {/* Podstawowe informacje */}
        <Card className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Podstawowe informacje</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rodzaj czynności przed wypadkiem <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
                placeholder="Opisz, jakie czynności wykonywałeś przed wypadkiem..."
                {...register("rodzajCzynnosciPrzedWypadkiem")}
              />
              {errors.rodzajCzynnosciPrzedWypadkiem && (
                <p className="mt-1 text-sm text-red-600">{errors.rodzajCzynnosciPrzedWypadkiem.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Okoliczności wypadku <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
                placeholder="Opisz dokładnie okoliczności, w których doszło do wypadku..."
                {...register("okolicznosciWypadku")}
              />
              {errors.okolicznosciWypadku && (
                <p className="mt-1 text-sm text-red-600">{errors.okolicznosciWypadku.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Przyczyny wypadku <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
                placeholder="Opisz przyczyny, które doprowadziły do wypadku..."
                {...register("przyczynyWypadku")}
              />
              {errors.przyczynyWypadku && (
                <p className="mt-1 text-sm text-red-600">{errors.przyczynyWypadku.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Maszyny i narzędzia */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={machineryTools}
              onCheckedChange={(checked) => {
                setMachineryTools(checked as boolean);
                setValue("maszynyNarzedzia.dotyczy", checked as boolean);
              }}
            />
            <h4 className="text-md font-semibold text-gray-900">
              Maszyny i narzędzia
            </h4>
          </div>

          {machineryTools && (
            <div className="space-y-4 mt-4">
              <Input
                label="Nazwa maszyny/narzędzia"
                {...register("maszynyNarzedzia.nazwa")}
                error={errors.maszynyNarzedzia?.nazwa?.message}
              />
              <Input
                label="Typ"
                {...register("maszynyNarzedzia.typ")}
                error={errors.maszynyNarzedzia?.typ?.message}
              />
              <Input
                label="Data produkcji"
                type="date"
                {...register("maszynyNarzedzia.dataProdukcji")}
                error={errors.maszynyNarzedzia?.dataProdukcji?.message}
              />
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("maszynyNarzedzia.sprawne") || false}
                  onCheckedChange={(checked) => setValue("maszynyNarzedzia.sprawne", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Maszyna/narzędzie było sprawne</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("maszynyNarzedzia.zgodneZProducentem") || false}
                  onCheckedChange={(checked) => setValue("maszynyNarzedzia.zgodneZProducentem", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Użytkowane zgodnie z zasadami producenta</label>
              </div>
              <Input
                label="Sposób użycia"
                {...register("maszynyNarzedzia.sposobUzycia")}
                error={errors.maszynyNarzedzia?.sposobUzycia?.message}
              />
            </div>
          )}
        </Card>

        {/* Środki ochrony */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={protectiveMeasures}
              onCheckedChange={(checked) => {
                setProtectiveMeasures(checked as boolean);
                setValue("srodkiOchrony.stosowane", checked as boolean);
              }}
            />
            <h4 className="text-md font-semibold text-gray-900">
              Środki ochrony
            </h4>
          </div>

          {protectiveMeasures && (
            <div className="space-y-4 mt-4">
              <Input
                label="Rodzaj środków ochrony (np. buty, kask, odzież)"
                {...register("srodkiOchrony.rodzaj.0")}
                error={errors.srodkiOchrony?.rodzaj?.message}
              />
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("srodkiOchrony.wlasciwe") || false}
                  onCheckedChange={(checked) => setValue("srodkiOchrony.wlasciwe", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Środki były właściwe</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("srodkiOchrony.sprawne") || false}
                  onCheckedChange={(checked) => setValue("srodkiOchrony.sprawne", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Środki były sprawne</label>
              </div>
            </div>
          )}
        </Card>

        {/* BHP */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={healthAndSafety}
              onCheckedChange={(checked) => {
                setHealthAndSafety(checked as boolean);
                setValue("bhp.przestrzegane", checked as boolean);
              }}
            />
            <h4 className="text-md font-semibold text-gray-900">
              Przestrzeganie zasad BHP
            </h4>
          </div>

          {healthAndSafety && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("bhp.przygotowanie") || false}
                  onCheckedChange={(checked) => setValue("bhp.przygotowanie", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Posiadasz przygotowanie do wykonywania zadań</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("bhp.szkoleniaBHP") || false}
                  onCheckedChange={(checked) => setValue("bhp.szkoleniaBHP", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Posiadasz szkolenia BHP</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("bhp.ocenaRyzykaZawodowego") || false}
                  onCheckedChange={(checked) => setValue("bhp.ocenaRyzykaZawodowego", checked as boolean)}
                />
                <label className="text-sm text-gray-700">Posiadasz ocenę ryzyka zawodowego</label>
              </div>
              <Input
                label="Środki zmniejszające ryzyko"
                {...register("bhp.srodkiZmniejszajaceRyzyko")}
                error={errors.bhp?.srodkiZmniejszajaceRyzyko?.message}
              />
            </div>
          )}
        </Card>

        {/* Pierwsza pomoc */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={firstAid}
              onCheckedChange={(checked) => {
                setFirstAid(checked as boolean);
                setValue("pierwszaPomoc.udzielona", checked as boolean);
              }}
            />
            <h4 className="text-md font-semibold text-gray-900">
              Pierwsza pomoc
            </h4>
          </div>

          {firstAid && (
            <div className="space-y-4 mt-4">
              <Input
                label="Kiedy udzielono pierwszej pomocy"
                {...register("pierwszaPomoc.kiedy")}
                error={errors.pierwszaPomoc?.kiedy?.message}
              />
              <Input
                label="Gdzie udzielono pierwszej pomocy"
                {...register("pierwszaPomoc.gdzie")}
                error={errors.pierwszaPomoc?.gdzie?.message}
              />
              <Input
                label="Nazwa placówki"
                {...register("pierwszaPomoc.nazwaPlacowki")}
                error={errors.pierwszaPomoc?.nazwaPlacowki?.message}
              />
              <Input
                label="Okres hospitalizacji"
                {...register("pierwszaPomoc.okresHospitalizacji")}
                error={errors.pierwszaPomoc?.okresHospitalizacji?.message}
              />
              <Input
                label="Uraz rozpoznany"
                {...register("pierwszaPomoc.urazRozpoznany")}
                error={errors.pierwszaPomoc?.urazRozpoznany?.message}
              />
            </div>
          )}
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

Krok6Wyjasnienia.displayName = "Krok6Wyjasnienia";

