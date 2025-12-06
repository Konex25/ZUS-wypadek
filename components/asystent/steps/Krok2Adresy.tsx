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
import { ExampleDataButton } from "@/components/asystent/ExampleDataButton";
import { z } from "zod";
import axios from "axios";

// Schemat dla wszystkich adresów
const adresySchema = z.object({
  adresZamieszkania: adresSchema,
  adresOstatniegoZamieszkaniaWPolsce: adresSchema.optional(),
  adresDoKorespondencji: z.object({
    typ: z.enum(["adres", "poste_restante", "skrytka", "przegrodka"]).optional(),
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
    przegrodka: z.object({
      numer: z.string().min(1, "Numer przegródki jest wymagany"),
      kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
      nazwaPlacowki: z.string().min(1, "Nazwa placówki jest wymagana"),
    }).optional(),
  }).optional(),
  adresDzialalnosci: adresSchema,
  mieszkaZaGranica: z.boolean().optional(),
  adresDoKorespondencjiInny: z.boolean().optional(),
  // Dane z CEIDG
  nip: z.string().optional(),
  regon: z.string().optional(),
  pkdCode: z.string().optional(),
  businessScope: z.string().optional(),
  // Opcjonalne: Adres sprawowania opieki nad dzieckiem (dla niań)
  opiekaNadDzieckiem: z.boolean().optional(),
  adresOpiekiNadDzieckiem: adresSchema.optional(),
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
  const [opiekaNadDzieckiem, setOpiekaNadDzieckiem] = useState(
    initialData?.opiekaNadDzieckiem || false
  );
  const [typAdresuKorespondencji, setTypAdresuKorespondencji] = useState<
    "adres" | "poste_restante" | "skrytka" | "przegrodka" | undefined
  >(initialData?.adresDoKorespondencji?.typ);
  
  // CEIDG integration
  const [nip, setNip] = useState("");
  const [regon, setRegon] = useState("");
  const [isLoadingCEIDG, setIsLoadingCEIDG] = useState(false);
  const [ceidgError, setCeidgError] = useState<string | null>(null);

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

  const fillExampleData = () => {
    // Adres zamieszkania
    setValue("adresZamieszkania.ulica", "ul. Przykładowa");
    setValue("adresZamieszkania.numerDomu", "10");
    setValue("adresZamieszkania.numerLokalu", "5");
    setValue("adresZamieszkania.kodPocztowy", "00-001");
    setValue("adresZamieszkania.miejscowosc", "Warszawa");
    
    // Adres działalności
    setValue("adresDzialalnosci.ulica", "ul. Biznesowa");
    setValue("adresDzialalnosci.numerDomu", "20");
    setValue("adresDzialalnosci.kodPocztowy", "00-002");
    setValue("adresDzialalnosci.miejscowosc", "Warszawa");
    setValue("adresDzialalnosci.telefon", "+48 987 654 321");
    
    // Opcjonalnie: adres opieki nad dzieckiem (nie wypełniaj domyślnie)
    setOpiekaNadDzieckiem(false);
    setValue("opiekaNadDzieckiem", false);
  };

  const fetchCEIDGData = async () => {
    if (!nip && !regon) {
      setCeidgError("Wprowadź NIP lub REGON");
      return;
    }

    setIsLoadingCEIDG(true);
    setCeidgError(null);

    try {
      const params = new URLSearchParams();
      if (nip) params.append("nip", nip);
      if (regon) params.append("regon", regon);

      const response = await axios.get(`/api/ceidg?${params.toString()}`);
      const data = response.data;

      // Debug: loguj pełną odpowiedź API
      console.log("CEIDG API Response (full):", JSON.stringify(data, null, 2));

      // API zwraca: basicData, correspondenceAddress, pkdCodes
      // correspondenceAddress to adres korespondencyjny firmy (działalności)
      let address = null;
      
      if (data.correspondenceAddress) {
        // correspondenceAddress może być obiektem z zagnieżdżonymi polami
        if (typeof data.correspondenceAddress === "object" && !Array.isArray(data.correspondenceAddress)) {
          // Sprawdź czy ma bezpośrednie pola adresu
          if (data.correspondenceAddress.street || data.correspondenceAddress.city) {
            address = data.correspondenceAddress;
          } 
          // Może być zagnieżdżony w polu "address"
          else if (data.correspondenceAddress.address) {
            address = data.correspondenceAddress.address;
          }
          // Może być w innych polach
          else {
            address = data.correspondenceAddress;
          }
        } else {
          address = data.correspondenceAddress;
        }
        console.log("Using correspondenceAddress:", JSON.stringify(address, null, 2));
      } else if (data.address) {
        address = data.address;
        console.log("Using address field:", JSON.stringify(address, null, 2));
      } else if (data.businessAddress) {
        address = data.businessAddress;
        console.log("Using businessAddress field:", JSON.stringify(address, null, 2));
      }
      
      if (address) {
        
        // Parsowanie adresu - może być w różnych formatach
        // Często adres jest w formacie "ul. Nazwa 123" lub "Nazwa 123"
        let streetName = "";
        let houseNumber = "";
        
        // Sprawdź różne możliwe nazwy pól dla ulicy
        const street = address.street || address.streetName || address.ulica || address.streetAddress || "";
        console.log("Street field value:", street);
        
        if (street) {
          const streetParts = street.trim().split(/\s+/);
          // Ostatni element to zazwyczaj numer domu
          if (streetParts.length > 1 && /^\d+/.test(streetParts[streetParts.length - 1])) {
            houseNumber = streetParts[streetParts.length - 1];
            streetName = streetParts.slice(0, -1).join(" ");
          } else {
            streetName = street;
          }
        }

        // Sprawdź różne możliwe nazwy pól dla numeru domu (priorytet dla osobnego pola)
        if (!houseNumber) {
          // Przeszukaj wszystkie możliwe nazwy pól
          const possibleHouseNumberFields = [
            "houseNumber", "buildingNumber", "numerDomu", "number", "buildingNo", 
            "houseNo", "building", "no", "numer", "nr", "house"
          ];
          
          for (const field of possibleHouseNumberFields) {
            if (address[field]) {
              houseNumber = String(address[field]);
              console.log(`Found house number in field "${field}":`, houseNumber);
              break;
            }
          }
          
          // Jeśli nie znaleziono, przeszukaj wszystkie klucze
          if (!houseNumber) {
            for (const key of Object.keys(address)) {
              const lowerKey = key.toLowerCase();
              if ((lowerKey.includes("number") || lowerKey.includes("numer") || lowerKey.includes("nr") || lowerKey.includes("no")) && 
                  address[key] && 
                  (typeof address[key] === "string" || typeof address[key] === "number")) {
                houseNumber = String(address[key]);
                console.log(`Found house number in key "${key}":`, houseNumber);
                break;
              }
            }
          }
        }
        console.log("Parsed houseNumber:", houseNumber, "from address keys:", Object.keys(address));

        setValue("adresDzialalnosci.ulica", streetName);
        setValue("adresDzialalnosci.numerDomu", houseNumber);
        
        // Sprawdź różne możliwe nazwy pól dla numeru lokalu
        const apartmentNumber = address.apartmentNumber || address.localNumber || address.numerLokalu || address.flatNumber || address.flatNo || "";
        setValue("adresDzialalnosci.numerLokalu", apartmentNumber);
        
        // Formatowanie kodu pocztowego - sprawdź różne możliwe nazwy pól
        // Funkcja pomocnicza do znajdowania kodu pocztowego w obiekcie
        const findPostalCode = (obj: any, depth = 0): string => {
          if (depth > 2 || !obj || typeof obj !== "object") return "";
          
          // Sprawdź wszystkie możliwe nazwy pól dla kodu pocztowego
          const possibleFields = [
            "postalCode", "postCode", "kodPocztowy", "zipCode", "postal", "zip",
            "postal_code", "post_code", "kod", "code", "postalCodeValue"
          ];
          
          for (const field of possibleFields) {
            if (obj[field]) {
              const value = obj[field];
              if (typeof value === "string" && value.trim().length > 0) {
                return value;
              } else if (typeof value === "number" && value > 0) {
                return String(value);
              }
            }
          }
          
          // Przeszukaj wszystkie klucze obiektu
          for (const key of Object.keys(obj)) {
            const lowerKey = key.toLowerCase();
            if ((lowerKey.includes("post") || lowerKey.includes("zip") || lowerKey.includes("kod") || lowerKey.includes("code")) && 
                obj[key] && 
                (typeof obj[key] === "string" || typeof obj[key] === "number")) {
              const value = obj[key];
              if (typeof value === "string" && value.trim().length > 0) {
                return value;
              } else if (typeof value === "number" && value > 0) {
                return String(value);
              }
            }
            // Rekurencyjnie przeszukaj zagnieżdżone obiekty
            if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
              const nested = findPostalCode(obj[key], depth + 1);
              if (nested) return nested;
            }
          }
          
          return "";
        };
        
        let postalCode = findPostalCode(address);
        console.log("Postal code found:", postalCode, "from address:", JSON.stringify(address, null, 2));
        
        // Jeśli nie znaleziono w address, sprawdź w głównym obiekcie data
        if (!postalCode) {
          postalCode = findPostalCode(data);
          console.log("Postal code found in data:", postalCode);
        }
        
        // Formatowanie kodu pocztowego
        if (postalCode) {
          // Jeśli to string, usuń wszystkie znaki niebędące cyframi
          if (typeof postalCode === "string") {
            const cleaned = postalCode.replace(/\D/g, "");
            console.log("Postal code cleaned:", cleaned);
            // Formatuj do XX-XXX jeśli ma 5 cyfr
            if (cleaned.length === 5) {
              postalCode = cleaned.replace(/(\d{2})(\d{3})/, "$1-$2");
            } else if (cleaned.length > 0) {
              postalCode = cleaned;
            } else {
              postalCode = "";
            }
          } else if (typeof postalCode === "number") {
            // Jeśli to liczba, sformatuj do stringa
            const codeStr = String(postalCode);
            if (codeStr.length === 5) {
              postalCode = codeStr.replace(/(\d{2})(\d{3})/, "$1-$2");
            } else {
              postalCode = codeStr;
            }
          }
        }
        
        console.log("Postal code final:", postalCode);
        setValue("adresDzialalnosci.kodPocztowy", postalCode || "");
        
        // Sprawdź różne możliwe nazwy pól dla miasta
        const city = address.city || address.miejscowosc || address.town || address.locality || address.municipality || "";
        setValue("adresDzialalnosci.miejscowosc", city);
        
        console.log("Final form values:", {
          ulica: streetName,
          numerDomu: houseNumber,
          kodPocztowy: postalCode,
          miejscowosc: city
        });

        // Zapisz również NIP, REGON i PKD
        // API zwraca basicData z NIP/REGON oraz pkdCodes
        if (data.nip) setValue("nip", String(data.nip));
        if (data.regon) setValue("regon", String(data.regon));
        
        // pkdCodes może być tablicą obiektów lub stringów
        if (data.pkdCodes) {
          if (Array.isArray(data.pkdCodes) && data.pkdCodes.length > 0) {
            const mainPkd = data.pkdCodes[0];
            // Sprawdź czy to obiekt z kodem i opisem, czy string
            if (typeof mainPkd === "object" && mainPkd.code) {
              setValue("pkdCode", mainPkd.code);
              if (mainPkd.description) {
                setValue("businessScope", mainPkd.description);
              }
            } else if (typeof mainPkd === "string") {
              setValue("pkdCode", mainPkd);
            }
          } else if (typeof data.pkdCodes === "string") {
            setValue("pkdCode", data.pkdCodes);
          }
        }
      } else {
        // Jeśli brak correspondenceAddress, spróbuj użyć innych pól z odpowiedzi
        console.log("No correspondenceAddress, trying alternative fields:", data);
        
        // Może adres jest bezpośrednio w odpowiedzi lub w innych polach
        const alternativeAddress = data.address || data.businessAddress || data.registeredAddress;
        if (alternativeAddress) {
          console.log("Using alternative address:", JSON.stringify(alternativeAddress, null, 2));
          
          const altStreet = alternativeAddress.street || alternativeAddress.streetName || "";
          let altHouseNumber = alternativeAddress.houseNumber || alternativeAddress.buildingNumber || alternativeAddress.number || "";
          
          // Jeśli ulica zawiera numer, wyodrębnij go
          if (altStreet && !altHouseNumber) {
            const streetParts = altStreet.trim().split(/\s+/);
            if (streetParts.length > 1 && /^\d+/.test(streetParts[streetParts.length - 1])) {
              altHouseNumber = streetParts[streetParts.length - 1];
            }
          }
          
          setValue("adresDzialalnosci.ulica", altStreet);
          setValue("adresDzialalnosci.numerDomu", altHouseNumber);
          setValue("adresDzialalnosci.numerLokalu", alternativeAddress.apartmentNumber || alternativeAddress.localNumber || "");
          
          // Szukaj kodu pocztowego w alternatywnym adresie
          let pc = "";
          const possibleFields = ["postalCode", "postCode", "kodPocztowy", "zipCode", "postal", "zip"];
          for (const field of possibleFields) {
            if (alternativeAddress[field]) {
              pc = alternativeAddress[field];
              break;
            }
          }
          
          // Jeśli nie znaleziono, przeszukaj wszystkie klucze
          if (!pc) {
            for (const key of Object.keys(alternativeAddress)) {
              const lowerKey = key.toLowerCase();
              if ((lowerKey.includes("post") || lowerKey.includes("zip") || lowerKey.includes("kod") || lowerKey.includes("code")) && 
                  alternativeAddress[key] && 
                  typeof alternativeAddress[key] === "string" && 
                  alternativeAddress[key].trim().length > 0) {
                pc = alternativeAddress[key];
                break;
              }
            }
          }
          
          if (pc) {
            if (typeof pc === "string") {
              pc = pc.replace(/\D/g, "");
              if (pc.length === 5) {
                pc = pc.replace(/(\d{2})(\d{3})/, "$1-$2");
              }
            } else if (typeof pc === "number") {
              const codeStr = String(pc);
              if (codeStr.length === 5) {
                pc = codeStr.replace(/(\d{2})(\d{3})/, "$1-$2");
              } else {
                pc = codeStr;
              }
            }
          }
          setValue("adresDzialalnosci.kodPocztowy", pc || "");
          setValue("adresDzialalnosci.miejscowosc", alternativeAddress.city || alternativeAddress.town || "");
        } else {
          console.error("No address found in any field. Full response:", JSON.stringify(data, null, 2));
          setCeidgError("Nie znaleziono adresu działalności w danych CEIDG. Sprawdź konsolę przeglądarki dla szczegółów.");
        }
      }

    } catch (error: any) {
      console.error("Error fetching CEIDG data:", error);
      setCeidgError(
        error.response?.data?.error || 
        "Nie udało się pobrać danych z CEIDG. Sprawdź poprawność NIP/REGON."
      );
    } finally {
      setIsLoadingCEIDG(false);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <ExampleDataButton onFill={fillExampleData} />
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Adresy
        </h3>

        {/* Adres zamieszkania */}
        <Card>
          {renderAdresFields("adresZamieszkania", "Adres zamieszkania")}
        </Card>

        {/* Adres działalności z integracją CEIDG */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Adres działalności gospodarczej</h4>
            
            {/* Sekcja CEIDG */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">
                Pobierz dane z CEIDG (opcjonalnie)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="NIP"
                  placeholder="1234567890"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value.replace(/\D/g, ""));
                    setRegon(""); // Wyczyść REGON jeśli wprowadzono NIP
                  }}
                  error={ceidgError && nip ? ceidgError : undefined}
                />
                <Input
                  label="REGON"
                  placeholder="123456789"
                  value={regon}
                  onChange={(e) => {
                    setRegon(e.target.value.replace(/\D/g, ""));
                    setNip(""); // Wyczyść NIP jeśli wprowadzono REGON
                  }}
                  error={ceidgError && regon ? ceidgError : undefined}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={fetchCEIDGData}
                disabled={isLoadingCEIDG || (!nip && !regon)}
              >
                {isLoadingCEIDG ? "Pobieranie..." : "Pobierz dane z CEIDG"}
              </Button>
              {ceidgError && (
                <p className="text-sm text-red-600">{ceidgError}</p>
              )}
            </div>

            {/* Pola adresu działalności */}
            <div className="mt-4">
              {renderAdresFields("adresDzialalnosci", "Adres działalności")}
            </div>
          </div>
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
                  { value: "przegrodka", label: "Przegródka pocztowa" },
                ]}
                value={typAdresuKorespondencji}
                onValueChange={(value) => {
                  setTypAdresuKorespondencji(value as "adres" | "poste_restante" | "skrytka" | "przegrodka");
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
                    label="Numer skrytki"
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

              {typAdresuKorespondencji === "przegrodka" && (
                <div className="mt-4 space-y-4">
                  <Input
                    label="Numer przegródki"
                    required
                    error={errors.adresDoKorespondencji?.przegrodka?.numer?.message}
                    {...register("adresDoKorespondencji.przegrodka.numer" as any)}
                  />
                  <Input
                    label="Kod pocztowy placówki"
                    required
                    error={errors.adresDoKorespondencji?.przegrodka?.kodPocztowy?.message}
                    helperText="Format: XX-XXX"
                    {...register("adresDoKorespondencji.przegrodka.kodPocztowy" as any)}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 2) {
                        value = value.slice(0, 2) + "-" + value.slice(2, 5);
                      }
                      setValue("adresDoKorespondencji.przegrodka.kodPocztowy" as any, value);
                    }}
                  />
                  <Input
                    label="Nazwa placówki pocztowej"
                    required
                    error={errors.adresDoKorespondencji?.przegrodka?.nazwaPlacowki?.message}
                    {...register("adresDoKorespondencji.przegrodka.nazwaPlacowki" as any)}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

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

Krok2Adresy.displayName = "Krok2Adresy";

