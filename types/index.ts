// Typy dla aplikacji ZANT

// ========== I ETAP - WIRTUALNY ASYSTENT ==========

export type RodzajZgloszenia = "zawiadomienie" | "wyjasnienia" | "oba";

export interface ZgloszenieWypadku {
  rodzajZgloszenia: RodzajZgloszenia;
  daneOsobowe: DaneOsobowePoszkodowanego;
  danePelnomocnika?: DanePelnomocnika;
  adresy: Adresy;
  daneDzialalnosci: DaneDzialalnosci;
  daneWypadku: DaneWypadku;
  wyjasnienia?: WyjasnieniaPoszkodowanego;
  swiadkowie?: Swiadek[];
  dokumenty?: File[];
}

export interface DaneOsobowePoszkodowanego {
  pesel: string;
  dokumentTozsamosci: {
    rodzaj: string; // "dowód osobisty" | "paszport" | "inny"
    seria?: string;
    numer: string;
  };
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  miejsceUrodzenia: string;
  telefon: string;
  email?: string;
}

export interface DanePelnomocnika {
  pesel?: string;
  dokumentTozsamosci?: {
    rodzaj: string;
    seria?: string;
    numer: string;
  };
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  telefon?: string;
  adresy: Adresy;
  pelnomocnictwoDostarczone: boolean;
}

export interface Adresy {
  adresZamieszkania: Adres;
  adresOstatniegoZamieszkaniaWPolsce?: Adres; // jeśli za granicą
  adresDoKorespondencji?: AdresDoKorespondencji;
  adresDzialalnosci: Adres;
}

export interface Adres {
  ulica: string;
  numerDomu: string;
  numerLokalu?: string;
  kodPocztowy: string;
  miejscowosc: string;
  panstwo?: string; // jeśli za granicą
  telefon?: string; // dla adresu działalności
}

export type TypAdresuKorespondencji = "adres" | "poste_restante" | "skrytka";

export interface AdresDoKorespondencji {
  typ: TypAdresuKorespondencji;
  adres?: Adres;
  posteRestante?: {
    kodPocztowy: string;
    nazwaPlacowki: string;
  };
  skrytka?: {
    numer: string;
    kodPocztowy: string;
    nazwaPlacowki: string;
  };
}

export interface DaneDzialalnosci {
  nip?: string;
  regon?: string;
  kodPKD?: string; // automatycznie z CEIDG
  zakresDzialalnosci?: string; // automatycznie z CEIDG
  adres?: Adres; // automatycznie z CEIDG
}

export interface DaneWypadku {
  dataWypadku: string;
  godzinaWypadku: string;
  miejsceWypadku: string;
  planowanaGodzinaRozpoczecia: string;
  planowanaGodzinaZakonczenia: string;
  rodzajUrazow: string;
  szczegolowyOpisOkolicznosci: string;
  szczegolowyOpisPrzyczyn: string;
  miejsceWypadkuSzczegoly: string;
  
  // Elementy definicji wypadku przy pracy
  naglosc: {
    potwierdzona: boolean;
    opis: string;
    czasTrwania?: string; // jeśli nie natychmiastowe
  };
  przyczynaZewnetrzna: {
    potwierdzona: boolean;
    typ: string; // "maszyny" | "energia" | "temperatura" | "chemikalia" | "sily_natury" | "warunki_pracy" | "inne"
    opis: string;
  };
  uraz: {
    potwierdzony: boolean;
    rodzaj: string;
    lokalizacja: string;
    dokumentacjaMedyczna?: boolean;
  };
  zwiazekZPraca: {
    przyczynowy: boolean;
    czasowy: boolean; // w okresie ubezpieczenia
    miejscowy: boolean;
    funkcjonalny: boolean; // zwykłe czynności związane z działalnością
    opis: string;
  };
  
  // Dodatkowe informacje
  pierwszaPomoc?: {
    udzielona: boolean;
    nazwaPlacowki?: string;
    adresPlacowki?: string;
  };
  postepowanieOrganow?: {
    prowadzone: boolean;
    nazwaOrganu?: string;
    adres?: string;
    numerSprawy?: string;
    status?: "zakonczona" | "w_trakcie" | "umorzona";
  };
  maszynyUrzadzenia?: {
    dotyczy: boolean;
    nazwa?: string;
    typ?: string;
    dataProdukcji?: string;
    sprawne?: boolean;
    zgodneZProducentem?: boolean;
    sposobUzycia?: string;
    atest?: boolean;
    deklaracjaZgodnosci?: boolean;
    wEwidencjiSrodkowTrwalych?: boolean;
  };
}

export interface WyjasnieniaPoszkodowanego {
  rodzajCzynnosciPrzedWypadkiem: string;
  okolicznosciWypadku: string;
  przyczynyWypadku: string;
  
  maszynyNarzedzia?: {
    dotyczy: boolean;
    nazwa?: string;
    typ?: string;
    dataProdukcji?: string;
    sprawne?: boolean;
    zgodneZProducentem?: boolean;
    sposobUzycia?: string;
  };
  
  srodkiOchrony?: {
    stosowane: boolean;
    rodzaj?: string[];
    wlasciwe?: boolean;
    sprawne?: boolean;
  };
  
  asekuracja?: {
    stosowana: boolean;
    opis?: string;
  };
  
  wymaganaLiczbaOsob?: {
    samodzielnie: boolean;
    wymaganeDwieOsoby?: boolean;
  };
  
  bhp?: {
    przestrzegane: boolean;
    przygotowanie?: boolean;
    szkoleniaBHP?: boolean;
    ocenaRyzykaZawodowego?: boolean;
    srodkiZmniejszajaceRyzyko?: string;
  };
  
  stanTrzezwosci?: {
    nietrzezwosc: boolean;
    srodkiOdurzajace: boolean;
    badanieWymienDnia?: {
      przeprowadzone: boolean;
      przezKogo?: string;
    };
  };
  
  organyKontroli?: {
    podjeteCzynnosci: boolean;
    nazwaOrganu?: string;
    adres?: string;
    numerSprawy?: string;
    status?: string;
  };
  
  pierwszaPomoc?: {
    udzielona: boolean;
    kiedy?: string;
    gdzie?: string;
    nazwaPlacowki?: string;
    okresHospitalizacji?: string;
    miejsceHospitalizacji?: string;
    urazRozpoznany?: string;
    okresNiezdolnosci?: string;
  };
  
  zwolnienieLekarskie?: {
    wDniuWypadku: boolean;
    opis?: string;
  };
}

export interface Swiadek {
  imie: string;
  nazwisko: string;
  ulica?: string;
  numerDomu?: string;
  numerLokalu?: string;
  kodPocztowy?: string;
  miejscowosc?: string;
  panstwo?: string; // jeśli za granicą
  telefon?: string;
}

// Drzewo przyczyn
export interface WezelDrzewaPrzyczyn {
  id: string;
  typ: "zdarzenie" | "przyczyna" | "skutek";
  opis: string;
  dzieci?: WezelDrzewaPrzyczyn[];
  kolejnosc?: number;
}

export interface DrzewoPrzyczyn {
  korzen: WezelDrzewaPrzyczyn;
  sekwencjaZdarzen: string[];
}

// Analiza i sugestie
export interface AnalizaZgloszenia {
  kompletnosc: number; // 0-100
  brakujaceElementy: string[];
  brakujaceDokumenty: string[];
  niejasnosci: string[];
  sugestie: string[];
  spersonalizowanaListaCzynnosci: string[];
  prawdopodobienstwoUznania?: number; // 0-100
}

// ========== II ETAP - MODEL WSPIERAJĄCY DECYZJĘ ==========

export interface AnalizaDokumentu {
  typDokumentu: "zawiadomienie" | "wyjasnienia" | "opinia" | "karta_wypadku" | "medyczny" | "organ_kontroli" | "inny";
  daneOsobowe?: DaneOsobowePoszkodowanego;
  daneWypadku?: DaneWypadku;
  wyjasnienia?: WyjasnieniaPoszkodowanego;
  daneMedyczne?: DaneMedyczne;
  swiadkowie?: Swiadek[];
  wyekstrahowaneDane: Record<string, any>;
  pewnoscEkstrakcji: number; // 0-100
}

export interface DaneMedyczne {
  uraz: string;
  rozpoznanie: string;
  okresNiezdolnosci?: string;
  hospitalizacja?: {
    okres: string;
    miejsce: string;
  };
  pierwszaPomoc?: {
    data: string;
    miejsce: string;
    opis: string;
  };
}

export interface Rozbieznosci {
  dataWypadku?: {
    rozbiezne: boolean;
    wartosci: string[];
    dokumenty: string[];
  };
  miejsceWypadku?: {
    rozbiezne: boolean;
    wartosci: string[];
    dokumenty: string[];
  };
  danePoszkodowanego?: {
    rozbiezne: boolean;
    pola: string[];
    dokumenty: string[];
  };
  daneSwiadkow?: {
    rozbiezne: boolean;
    szczegoly: string[];
    dokumenty: string[];
  };
  opisOkolicznosci?: {
    rozbiezne: boolean;
    rozbieznosci: string[];
    dokumenty: string[];
  };
  opisPrzyczyn?: {
    rozbiezne: boolean;
    rozbieznosci: string[];
    dokumenty: string[];
  };
}

export interface WeryfikacjaElementowDefinicji {
  naglosc: {
    spełniony: boolean;
    pewnosc: number; // 0-100
    uzasadnienie: string;
    watpliwosci?: string[];
    wymaganeDokumenty?: string[];
  };
  przyczynaZewnetrzna: {
    spełniony: boolean;
    pewnosc: number;
    uzasadnienie: string;
    watpliwosci?: string[];
    wymaganeDokumenty?: string[];
  };
  uraz: {
    spełniony: boolean;
    pewnosc: number;
    uzasadnienie: string;
    watpliwosci?: string[];
    wymaganaOpiniaLekarza?: boolean;
    wymaganeDokumenty?: string[];
  };
  zwiazekZPraca: {
    spełniony: boolean;
    pewnosc: number;
    uzasadnienie: string;
    przyczynowy: boolean;
    czasowy: boolean;
    miejscowy: boolean;
    funkcjonalny: boolean;
    watpliwosci?: string[];
    wymaganeDokumenty?: string[];
  };
}

export interface ProjektOpinii {
  stanowisko: "UZNAĆ" | "NIE UZNAĆ" | "WYMAGA_DODATKOWEJ_ANALIZY";
  uzasadnienie: string;
  analizaElementow: WeryfikacjaElementowDefinicji;
  kwestieDoRozstrzygniecia?: string[];
  wniosek: string;
  uzasadnienieWniosku: string;
  pewnosc: number; // 0-100
  brakujaceInformacje?: string[];
  wymaganeDokumenty?: string[];
  wymaganaOpiniaLekarza?: boolean;
}

export interface KartaWypadku {
  numerKarty: string;
  dataUtworzenia: string;
  dataWplywuZawiadomienia: string;
  danePoszkodowanego: DaneOsobowePoszkodowanego;
  daneDzialalnosci: DaneDzialalnosci;
  daneWypadku: DaneWypadku;
  wyjasnienia?: WyjasnieniaPoszkodowanego;
  swiadkowie?: Swiadek[];
  decyzja: "UZNANO" | "NIE_UZNANO";
  uzasadnienie: string;
  przeszkodyTrudnosci?: string; // jeśli opóźnienie
  odstapienie?: {
    powod: string;
    uzasadnienie: string;
  };
  uwagiZastrzezenia?: string;
}

// Typy pomocnicze
export interface Rekomendacja {
  decyzja: "UZNAĆ" | "NIE UZNAĆ" | "WYMAGA_DODATKOWEJ_ANALIZY";
  uzasadnienie: string;
  pewnosc: number; // 0-100
  brakujaceElementy?: string[];
  sugestie?: string[];
}

// Document upload types
export type DocumentStatus = "pending" | "processing" | "completed" | "error";

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: DocumentStatus;
  aiResult?: Record<string, unknown>;
  error?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: UploadedDocument;
  error?: string;
}

