// pomocniczne typy
export type CountryCode = string; // np. "PL", "DE" — możesz zamienić na enum jeśli chcesz

export interface Address {
  street: string;
  buildingNumber: string;
  localNumber?: string;
  postalCode: string;
  city: string;
  country?: CountryCode; // jeśli nie podano - domyślnie "PL"
}

export type IdentityDocType = "DOWOD" | "PASZPORT" | "INNE";

export interface IdentityDocument {
  type: IdentityDocType;
  series?: string; // np. seria dowodu
  number: string; // numer dokumentu
  issuedBy?: string; // organ wydający (opcjonalnie)
  issueDate?: string; // YYYY-MM-DD (opcjonalnie)
}

// sposób wskazania adresu do korespondencji
export type CorrespondenceMode = "ADDRESS" | "POSTE_RESTANTE" | "PO_BOX";

export interface CorrespondenceAddress {
  mode: CorrespondenceMode;
  address?: Address; // jeśli mode === 'ADDRESS'
  posteRestantePostalCode?: string; // jeśli mode === 'POSTE_RESTANTE' -> kod placówki
  posteRestanteOfficeName?: string; // nazwa placówki
  poBoxNumber?: string; // jeśli mode === 'PO_BOX'
  country?: CountryCode;
}

// opis pliku / dokumentu przesyłanego
export interface UploadedDocument {
  id: string; // lokalne id pliku
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string; // ISO date
  docType?: string; // np. "UPOMNIENIE", "KARTA_WYPADKU", "PELNOMOCNICTWO"
}

/////////////////////////////////////////////////////////////
// 1) Informacje o potrzebnych danych osoby poszkodowanej
/////////////////////////////////////////////////////////////
export interface InjuredPerson {
  // dane identyfikacyjne
  pesel?: string; // wymagane jeśli posiada PESEL
  identityDocument?: IdentityDocument; // alternatywnie dokument bez peselu
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;

  // kontakt
  phone: string; // numer telefonu ułatwiający kontakt
  email?: string;

  // adresy
  residenceAddress: Address; // adres zamieszkania (jeśli w Polsce)
  lastResidenceInPoland?: Address; // jeśli obecnie za granicą lub brak adresu
  correspondenceAddress?: CorrespondenceAddress; // adres do korespondencji

  // dane działalności gospodarczej (opcjonalne, lecz przydatne)
  businessAddress?: Address; // adres prowadzenia działalności (ul., nr, itp.)
  nip?: string; // NIP działalności (opcjonalnie)
  regon?: string; // REGON (opcjonalnie)
  pkdCodes?: string[]; // pobrane z CEIDG / ewidencji, np. ["47.11.Z"]

  // dane zdarzenia (podstawowe pola — można rozwinąć oddzielnym typem)
  accidentDate?: string; // data wypadku YYYY-MM-DD
  accidentTime?: string; // hh:mm opcjonalnie
  accidentPlaceDescription?: string; // krótki opis miejsca
  plannedWorkStartTime?: string; // planowana godzina rozpoczęcia pracy (w dniu)
  plannedWorkEndTime?: string; // planowana godzina zakończenia pracy (w dniu)

  // obrażenia i pomoc medyczna
  injuryDescription?: string;
  firstAidProvidedAt?: string; // nazwa i adres placówki, jeśli udzielono pomocy
  hospitalisationPeriod?: { from: string; to?: string };

  // świadkowie (opcjonalne)
  witnesses?: Array<{
    firstName: string;
    lastName: string;
    address?: Address;
    phone?: string;
  }>;

  // dokumenty związane ze zgłoszeniem
  attachedDocuments?: UploadedDocument[]; // np. karta informacyjna ze szpitala, faktury, umowy

  // dodatkowe informacje wymagane w specyfikacji
  wasOperatingMachines?: boolean;
  machinesDescription?: string; // opis używanych maszyn/urzadzeń, typ, data produkcji
  machinesHaveCertificates?: boolean;
  usedProtectiveEquipment?: string; // opis stosowanych środków ochrony (buty, kask, itp.)
  bphTrainingCompleted?: boolean; // czy odbyto szkolenie BHP
  intoxicatedAtTime?: boolean; // czy poszkodowany był nietrzeźwy / pod wpływem
  intoxicationTestBy?: string; // kto badał (np. "policja") + data (opcjonalnie)

  // ewentualne postępowania/organ prowadzący sprawę
  externalProceedings?: Array<{
    authority: string; // np. "Policja", "Prokuratura"
    address?: string;
    caseNumber?: string;
    status?: "OPEN" | "CLOSED" | "DISMISSED" | "SUSPENDED";
  }>;
}

/////////////////////////////////////////////////////////////
// 2) Informacje o pełnomocniku
/////////////////////////////////////////////////////////////
export interface Representative {
  // dane identyfikacyjne pełnomocnika
  pesel?: string;
  identityDocument?: IdentityDocument; // jeśli brak peselu
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;

  // adresy
  residenceAddress?: Address;
  correspondenceAddress?: CorrespondenceAddress;

  // informacje dodatkowe wymagane przy zgłoszeniu przez pełnomocnika
  relationToInjured?: string; // np. "pe³nomocnik", "cz³onek rodziny"
  hasPolishPesel?: boolean;

  // pełnomocnictwo
  powerOfAttorneyProvided: boolean; // czy pełnomocnictwo zostało dołączone
  powerOfAttorneyDocuments?: UploadedDocument[]; // skan pełnomocnictwa (jeśli dotyczy)

  // jeżeli pełnomocnik zgłasza w imieniu poszkodowanego -> wskazanie danych poszkodowanego
  actingFor?: {
    firstName: string;
    lastName: string;
    pesel?: string;
    relation?: string;
  };

  // opcjonalne — dane do kontaktu przyspieszające komunikację
  preferredContactMethod?: "PHONE" | "EMAIL" | "POST";
}
