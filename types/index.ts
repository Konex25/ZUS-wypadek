// Typy dla aplikacji ZANT

export interface ZgloszenieWypadku {
  daneOsobowe: DaneOsobowe;
  opisZdarzenia: string;
  okolicznosci: string;
  przyczyny: string;
  dataWypadku: string;
  miejsceWypadku: string;
  swiadkowie?: Swiadek[];
  dokumenty?: File[];
}

export interface DaneOsobowe {
  imie: string;
  nazwisko: string;
  pesel?: string;
  telefon: string;
  email: string;
  adres: string;
  numerZus?: string;
}

export interface Swiadek {
  imie: string;
  nazwisko: string;
  telefon?: string;
}

export interface AnalizaDokumentu {
  daneOsobowe?: DaneOsobowe;
  opisZdarzenia?: string;
  okolicznosci?: string;
  przyczyny?: string;
  daneMedyczne?: string;
  swiadkowie?: Swiadek[];
  wyekstrahowaneDane: Record<string, any>;
}

export interface Rekomendacja {
  decyzja: "UZNAĆ" | "NIE UZNAĆ" | "WYMAGA_DODATKOWEJ_ANALIZY";
  uzasadnienie: string;
  pewnosc: number; // 0-100
  brakujaceElementy?: string[];
  sugestie?: string[];
}

export interface KartaWypadku {
  numerKarty: string;
  dataUtworzenia: string;
  danePoszkodowanego: DaneOsobowe;
  opisZdarzenia: string;
  okolicznosci: string;
  przyczyny: string;
  decyzja: string;
  uzasadnienie: string;
  dataWypadku: string;
  miejsceWypadku: string;
}

