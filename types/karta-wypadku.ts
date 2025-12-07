/**
 * TypeScript interface dla formularza "KARTA WYPADKU"
 * Zgodny z oficjalnym wzorem ZUS
 */

/**
 * I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK
 */
export interface DaneIdentyfikacyjnePlatnikaSkladek {
  /** 1. Imię i nazwisko lub nazwa */
  imieNazwiskoLubNazwa: string;
  
  /** 2. Adres siedziby */
  adresSiedziby: string;
  
  /** 3. NIP */
  nip?: string;
  
  /** 3. REGON */
  regon?: string;
  
  /** 3. PESEL */
  pesel?: string;
  
  /** Dokument tożsamości (dowód osobisty lub paszport) */
  dokumentTozsamosci?: {
    /** rodzaj dokumentu */
    rodzaj: string;
    /** seria */
    seria?: string;
    /** numer */
    numer: string;
  };
}

/**
 * II. DANE IDENTYFIKACYJNE POSZKODOWANEGO
 */
export interface DaneIdentyfikacyjnePoszkodowanego {
  /** 1. Imię i nazwisko poszkodowanego */
  imieNazwisko: string;
  
  /** 2. PESEL */
  pesel: string;
  
  /** Dokument tożsamości (dowód osobisty lub paszport) */
  dokumentTozsamosci: {
    /** rodzaj dokumentu */
    rodzaj: string;
    /** seria */
    seria?: string;
    /** numer */
    numer: string;
  };
  
  /** 3. Data i miejsce urodzenia */
  dataUrodzenia: string;
  miejsceUrodzenia: string;
  
  /** 4. Adres zamieszkania */
  adresZamieszkania: string;
  
  /** 5. Tytuł ubezpieczenia wypadkowego */
  tytulUbezpieczeniaWypadkowego: string;
}

/**
 * Świadek wypadku
 */
export interface SwiadekWypadku {
  /** imię i nazwisko */
  imieNazwisko: string;
  /** miejsce zamieszkania */
  miejsceZamieszkania: string;
}

/**
 * III. INFORMACJE O WYPADKU
 */
export interface InformacjeOWypadku {
  /** 1. Data zgłoszenia oraz imię i nazwisko osoby zgłaszającej wypadek */
  dataZgloszenia: string;
  imieNazwiskoOsobyZglaszajacej: string;
  
  /** 2. Informacje dotyczące okoliczności, przyczyn, czasu i miejsca wypadku, rodzaju i umiejscowienia urazu */
  informacjeOWypadku: string;
  
  /** 3. Świadkowie wypadku */
  swiadkowie?: SwiadekWypadku[];
  
  /** 4. Wypadek jest / nie jest wypadkiem przy pracy */
  czyJestWypadkiemPrzyPracy: "jest" | "nie_jest";
  
  /** art. 3 ust. 3 pkt (numer punktu) */
  art3Ust3Pkt?: string;
  
  /** / albo art. 3a */
  czyArt3a: boolean;
  
  /** Uzasadnienie i wskazanie dowodów, jeżeli zdarzenia nie uznano za wypadek przy pracy */
  uzasadnienieNieUznano?: string;
  
  /** 5. Stwierdzono, że wyłączną przyczyną wypadku było udowodnione naruszenie przez poszkodowanego przepisów dotyczących ochrony życia i zdrowia */
  wykluczajacaPrzyczynaNaruszenie?: string;
  
  /** 6. Stwierdzono, że poszkodowany, będąc w stanie nietrzeźwości lub pod wpływem środków odurzających, przyczynił się w znacznym stopniu do spowodowania wypadku */
  przyczynienieSieNietrzezwosc?: string;
}

/**
 * IV. POZOSTAŁE INFORMACJE
 */
export interface PozostaleInformacje {
  /** 1. Poszkodowanego (członka rodziny) zapoznano z treścią karty wypadku */
  zapoznanieZTrecia: {
    /** imię i nazwisko poszkodowanego (członka rodziny) */
    imieNazwisko: string;
    /** data */
    data: string;
    /** podpis */
    podpis?: string;
  };
  
  /** 2. Kartę wypadku sporządzono w dniu */
  dataSporzadzenia: string;
  
  /** 1) nazwa podmiotu obowiązanego do sporządzenia karty wypadku */
  nazwaPodmiotuSporzadzajacego: string;
  
  /** 2) dodatkowe pole */
  dodatkowePole?: string;
  
  /** 3. Przeszkody i trudności uniemożliwiające sporządzenie karty wypadku w wymaganym terminie 14 dni */
  przeszkodyTrudnosci?: string;
  
  /** 4. Kartę wypadku odebrano w dniu */
  dataOdbioru?: string;
  
  /** podpis uprawnionego */
  podpisUprawnionego?: string;
  
  /** 5. Załączniki */
  zalaczniki?: string[];
}

/**
 * Główny interfejs dla Karty Wypadku
 */
export interface KartaWypadku {
  /** Nazwa i adres podmiotu sporządzającego kartę wypadku */
  nazwaIAdresPodmiotuSporzadzajacego: string;
  
  /** I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK */
  daneIdentyfikacyjnePlatnika: DaneIdentyfikacyjnePlatnikaSkladek;
  
  /** II. DANE IDENTYFIKACYJNE POSZKODOWANEGO */
  daneIdentyfikacyjnePoszkodowanego: DaneIdentyfikacyjnePoszkodowanego;
  
  /** III. INFORMACJE O WYPADKU */
  informacjeOWypadku: InformacjeOWypadku;
  
  /** IV. POZOSTAŁE INFORMACJE */
  pozostaleInformacje: PozostaleInformacje;
}



