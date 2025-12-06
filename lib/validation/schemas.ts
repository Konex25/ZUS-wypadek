import { z } from "zod";

// Schemat dla wyboru rodzaju zgłoszenia
export const rodzajZgloszeniaSchema = z.object({
  rodzajZgloszenia: z.enum(["zawiadomienie", "wyjasnienia", "oba"]).optional().refine(
    (val) => val !== undefined,
    { message: "Wybierz rodzaj zgłoszenia" }
  ),
});

// Schemat dla danych osobowych poszkodowanego
export const daneOsoboweSchema = z.object({
  pesel: z.string()
    .min(11, "PESEL musi mieć 11 cyfr")
    .max(11, "PESEL musi mieć 11 cyfr")
    .regex(/^\d{11}$/, "PESEL musi składać się tylko z cyfr"),
  dokumentTozsamosci: z.object({
    rodzaj: z.enum(["dowód osobisty", "paszport", "inny"]),
    seria: z.string().optional(),
    numer: z.string().min(1, "Numer dokumentu jest wymagany"),
  }),
  imie: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  nazwisko: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  dataUrodzenia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data musi być w formacie YYYY-MM-DD"),
  miejsceUrodzenia: z.string().min(2, "Miejsce urodzenia jest wymagane"),
  telefon: z.string().regex(/^[0-9+\-\s()]+$/, "Nieprawidłowy format numeru telefonu"),
  email: z.string().email("Nieprawidłowy adres email").optional().or(z.literal("")),
  // Opcjonalne: dane osoby zawiadamiającej
  innaOsobaZawiadamia: z.boolean().optional(),
  osobaZawiadamiajaca: z.object({
    pesel: z.string().optional(),
    dokumentTozsamosci: z.object({
      rodzaj: z.enum(["dowód osobisty", "paszport", "inny"]),
      seria: z.string().optional(),
      numer: z.string().min(1, "Numer dokumentu jest wymagany"),
    }).optional(),
    imie: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
    nazwisko: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
    dataUrodzenia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data musi być w formacie YYYY-MM-DD"),
    telefon: z.string().regex(/^[0-9+\-\s()]+$/, "Nieprawidłowy format numeru telefonu").optional(),
    adresZamieszkania: z.object({
      ulica: z.string().min(1, "Ulica jest wymagana"),
      numerDomu: z.string().min(1, "Numer domu jest wymagany"),
      numerLokalu: z.string().optional(),
      kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
      miejscowosc: z.string().min(2, "Miejscowość jest wymagana"),
      panstwo: z.string().optional(),
    }).optional(),
  }).optional(),
}).refine((data) => {
  // Jeśli zaznaczono "inna osoba zawiadamia", wymagaj danych osoby zawiadamiającej
  if (data.innaOsobaZawiadamia && !data.osobaZawiadamiajaca) {
    return false;
  }
  return true;
}, {
  message: "Wypełnij dane osoby zawiadamiającej",
  path: ["osobaZawiadamiajaca"],
});

// Schemat dla adresu
export const adresSchema = z.object({
  ulica: z.string().min(1, "Ulica jest wymagana"),
  numerDomu: z.string().min(1, "Numer domu jest wymagany"),
  numerLokalu: z.string().optional(),
  kodPocztowy: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
  miejscowosc: z.string().min(2, "Miejscowość jest wymagana"),
  panstwo: z.string().optional(),
  telefon: z.string().optional(),
});

// Schemat dla danych o wypadku
export const daneWypadkuSchema = z.object({
  dataWypadku: z.string().min(1, "Data wypadku jest wymagana"),
  godzinaWypadku: z.string().regex(/^\d{2}:\d{2}$/, "Godzina musi być w formacie HH:MM"),
  miejsceWypadku: z.string().min(1, "Miejsce wypadku jest wymagane"),
  planowanaGodzinaRozpoczecia: z.string().regex(/^\d{2}:\d{2}$/, "Godzina musi być w formacie HH:MM"),
  planowanaGodzinaZakonczenia: z.string().regex(/^\d{2}:\d{2}$/, "Godzina musi być w formacie HH:MM"),
  rodzajUrazow: z.string().min(1, "Rodzaj urazów jest wymagany"),
  szczegolowyOpisOkolicznosci: z.string().min(10, "Opis okoliczności musi mieć co najmniej 10 znaków"),
  szczegolowyOpisPrzyczyn: z.string().min(10, "Opis przyczyn musi mieć co najmniej 10 znaków"),
  miejsceWypadkuSzczegoly: z.string().min(1, "Szczegóły miejsca wypadku są wymagane"),
  
  // Elementy definicji wypadku
  naglosc: z.object({
    potwierdzona: z.boolean(),
    opis: z.string().min(1, "Opis nagłości jest wymagany"),
    czasTrwania: z.string().optional(),
  }),
  przyczynaZewnetrzna: z.object({
    potwierdzona: z.boolean(),
    typ: z.enum(["maszyny", "energia", "temperatura", "chemikalia", "sily_natury", "warunki_pracy", "inne"]),
    opis: z.string().min(1, "Opis przyczyny zewnętrznej jest wymagany"),
  }),
  uraz: z.object({
    potwierdzony: z.boolean(),
    rodzaj: z.string().min(1, "Rodzaj urazu jest wymagany"),
    lokalizacja: z.string().min(1, "Lokalizacja urazu jest wymagana"),
    dokumentacjaMedyczna: z.boolean().optional(),
  }),
  zwiazekZPraca: z.object({
    przyczynowy: z.boolean(),
    czasowy: z.boolean(),
    miejscowy: z.boolean(),
    funkcjonalny: z.boolean(),
    opis: z.string().min(1, "Opis związku z pracą jest wymagany"),
  }),
  
  // Dodatkowe informacje
  pierwszaPomoc: z.object({
    udzielona: z.boolean(),
    nazwaPlacowki: z.string().optional(),
    adresPlacowki: z.string().optional(),
  }).optional(),
  postepowanieOrganow: z.object({
    prowadzone: z.boolean(),
    nazwaOrganu: z.string().optional(),
    adres: z.string().optional(),
    numerSprawy: z.string().optional(),
    status: z.enum(["zakonczona", "w_trakcie", "umorzona"]).optional(),
  }).optional(),
  maszynyUrzadzenia: z.object({
    dotyczy: z.boolean(),
    nazwa: z.string().optional(),
    typ: z.string().optional(),
    dataProdukcji: z.string().optional(),
    sprawne: z.boolean().optional(),
    zgodneZProducentem: z.boolean().optional(),
    sposobUzycia: z.string().optional(),
    atest: z.boolean().optional(),
    deklaracjaZgodnosci: z.boolean().optional(),
    wEwidencjiSrodkowTrwalych: z.boolean().optional(),
  }).optional(),
});

// Schemat dla wyjaśnień poszkodowanego
export const wyjasnieniaSchema = z.object({
  rodzajCzynnosciPrzedWypadkiem: z.string().min(10, "Opis czynności musi mieć co najmniej 10 znaków"),
  okolicznosciWypadku: z.string().min(10, "Opis okoliczności musi mieć co najmniej 10 znaków"),
  przyczynyWypadku: z.string().min(10, "Opis przyczyn musi mieć co najmniej 10 znaków"),
  
  maszynyNarzedzia: z.object({
    dotyczy: z.boolean(),
    nazwa: z.string().optional(),
    typ: z.string().optional(),
    dataProdukcji: z.string().optional(),
    sprawne: z.boolean().optional(),
    zgodneZProducentem: z.boolean().optional(),
    sposobUzycia: z.string().optional(),
  }).optional(),
  
  srodkiOchrony: z.object({
    stosowane: z.boolean(),
    rodzaj: z.array(z.string()).optional(),
    wlasciwe: z.boolean().optional(),
    sprawne: z.boolean().optional(),
  }).optional(),
  
  asekuracja: z.object({
    stosowana: z.boolean(),
    opis: z.string().optional(),
  }).optional(),
  
  wymaganaLiczbaOsob: z.object({
    samodzielnie: z.boolean(),
    wymaganeDwieOsoby: z.boolean().optional(),
  }).optional(),
  
  bhp: z.object({
    przestrzegane: z.boolean(),
    przygotowanie: z.boolean().optional(),
    szkoleniaBHP: z.boolean().optional(),
    ocenaRyzykaZawodowego: z.boolean().optional(),
    srodkiZmniejszajaceRyzyko: z.string().optional(),
  }).optional(),
  
  stanTrzezwosci: z.object({
    nietrzezwosc: z.boolean(),
    srodkiOdurzajace: z.boolean(),
    badanieWymienDnia: z.object({
      przeprowadzone: z.boolean(),
      przezKogo: z.string().optional(),
    }).optional(),
  }).optional(),
  
  organyKontroli: z.object({
    podjeteCzynnosci: z.boolean(),
    nazwaOrganu: z.string().optional(),
    adres: z.string().optional(),
    numerSprawy: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  
  pierwszaPomoc: z.object({
    udzielona: z.boolean(),
    kiedy: z.string().optional(),
    gdzie: z.string().optional(),
    nazwaPlacowki: z.string().optional(),
    okresHospitalizacji: z.string().optional(),
    miejsceHospitalizacji: z.string().optional(),
    urazRozpoznany: z.string().optional(),
    okresNiezdolnosci: z.string().optional(),
  }).optional(),
  
  zwolnienieLekarskie: z.object({
    wDniuWypadku: z.boolean(),
    opis: z.string().optional(),
  }).optional(),
});

// Schemat dla świadka
export const swiadekSchema = z.object({
  imie: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  nazwisko: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  ulica: z.string().optional(),
  numerDomu: z.string().optional(),
  numerLokalu: z.string().optional(),
  kodPocztowy: z.string().optional(),
  miejscowosc: z.string().optional(),
  panstwo: z.string().optional(),
  telefon: z.string().optional(),
});

// Schemat dla listy świadków (opcjonalnie)
export const swiadkowieSchema = z.object({
  swiadkowie: z.array(swiadekSchema).optional(),
});

// Eksport typu dla rodzaju zgłoszenia
export type RodzajZgloszeniaForm = z.infer<typeof rodzajZgloszeniaSchema>;
export type DaneOsoboweForm = z.infer<typeof daneOsoboweSchema>;
export type AdresForm = z.infer<typeof adresSchema>;
export type DaneWypadkuForm = z.infer<typeof daneWypadkuSchema>;
export type WyjasnieniaForm = z.infer<typeof wyjasnieniaSchema>;
export type SwiadekForm = z.infer<typeof swiadekSchema>;
export type SwiadkowieForm = z.infer<typeof swiadkowieSchema>;
