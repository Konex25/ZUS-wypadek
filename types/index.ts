// Types for ZANT application

// ========== STAGE I - VIRTUAL ASSISTANT ==========

export type NotificationType = "zawiadomienie" | "wyjasnienia" | "oba";

export interface AccidentReport {
  notificationType: NotificationType;
  personalData: VictimPersonalData;
  representativeData?: RepresentativeData;
  addresses: Addresses;
  businessData: BusinessData;
  accidentData: AccidentData;
  victimStatement?: VictimStatement;
  witnesses?: Witness[];
  documents?: File[];
  attachments?: AttachmentInfo[]; // Informacje o załącznikach
  responseDeliveryMethod?: "zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona"; // Sposób odbioru odpowiedzi
  signatureDate?: string; // Data podpisu
  documentCommitments?: boolean[]; // Zobowiązanie do dostarczenia dokumentów (8 pozycji)
}

export interface VictimPersonalData {
  pesel: string;
  idDocument: {
    type: string; // "dowód osobisty" | "paszport" | "inny"
    series?: string;
    number: string;
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  phone: string;
  email?: string;
}

export interface RepresentativeData {
  pesel?: string;
  idDocument?: {
    type: string;
    series?: string;
    number: string;
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  addresses: Addresses;
  powerOfAttorneyProvided: boolean;
}

export interface Addresses {
  residentialAddress: Address;
  lastResidentialAddressInPoland?: Address; // jeśli za granicą
  correspondenceAddress?: CorrespondenceAddress;
  businessAddress: Address;
  childcareAddress?: Address; // Adres sprawowania opieki nad dzieckiem (dla niań)
}

export interface Address {
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country?: string; // jeśli za granicą
  phone?: string; // dla adresu działalności
}

export type CorrespondenceAddressType = "adres" | "poste_restante" | "skrytka" | "przegrodka";

export interface CorrespondenceAddress {
  type: CorrespondenceAddressType;
  address?: Address;
  posteRestante?: {
    postalCode: string;
    postOfficeName: string;
  };
  postOfficeBox?: {
    number: string;
    postalCode: string;
    postOfficeName: string;
  };
  postOfficeBoxP?: {
    number: string;
    postalCode: string;
    postOfficeName: string;
  };
}

export interface BusinessData {
  nip?: string;
  regon?: string;
  pkdCode?: string; // automatycznie z CEIDG
  businessScope?: string; // automatycznie z CEIDG
  address?: Address; // automatycznie z CEIDG
}

export interface AccidentData {
  accidentDate: string;
  accidentTime: string;
  accidentPlace: string;
  plannedStartTime: string;
  plannedEndTime: string;
  injuryType: string;
  detailedCircumstancesDescription: string;
  detailedCausesDescription: string;
  accidentPlaceDetails: string;

  // Elementy definicji wypadku przy pracy
  suddenness: {
    confirmed: boolean;
    description: string;
    duration?: string; // jeśli nie natychmiastowe
  };
  externalCause: {
    confirmed: boolean;
    type: string; // "maszyny" | "energia" | "temperatura" | "chemikalia" | "sily_natury" | "warunki_pracy" | "inne"
    description: string;
  };
  injury: {
    confirmed: boolean;
    type: string;
    location: string;
    medicalDocumentation?: boolean;
  };
  workRelation: {
    causal: boolean;
    temporal: boolean; // w okresie ubezpieczenia
    spatial: boolean;
    functional: boolean; // zwykłe czynności związane z działalnością
    description: string;
  };

  // Dodatkowe informacje
  firstAid?: {
    provided: boolean;
    facilityName?: string;
    facilityAddress?: string;
  };
  authorityProceedings?: {
    conducted: boolean;
    authorityName?: string;
    address?: string;
    caseNumber?: string;
    status?: "zakonczona" | "w_trakcie" | "umorzona";
  };
  machineryEquipment?: {
    applicable: boolean;
    name?: string;
    type?: string;
    productionDate?: string;
    operational?: boolean;
    compliantWithManufacturer?: boolean;
    usageMethod?: string;
    certified?: boolean; // Czy maszyna ma atest
    conformityDeclaration?: boolean; // Czy maszyna ma deklarację zgodności
    inFixedAssetsRegister?: boolean; // Czy maszyna jest w ewidencji środków trwałych
  };
}

export interface AttachmentInfo {
  type:
    | "hospital_card"
    | "prosecutor_decision"
    | "death_certificate"
    | "power_of_attorney"
    | "other";
  description?: string; // Dla typu "other"
  file?: File; // Opcjonalny plik
}

export interface VictimStatement {
  activityTypeBeforeAccident: string;
  accidentCircumstances: string;
  accidentCauses: string;

  machineryTools?: {
    applicable: boolean;
    name?: string;
    type?: string;
    productionDate?: string;
    operational?: boolean;
    compliantWithManufacturer?: boolean;
    usageMethod?: string;
  };

  protectiveMeasures?: {
    used: boolean;
    type?: string[];
    appropriate?: boolean;
    operational?: boolean;
  };

  safetyMeasures?: {
    used: boolean;
    description?: string;
  };

  requiredNumberOfPeople?: {
    independently: boolean;
    twoPeopleRequired?: boolean;
  };

  healthAndSafety?: {
    complied: boolean;
    preparation?: boolean;
    healthAndSafetyTraining?: boolean;
    occupationalRiskAssessment?: boolean;
    riskReductionMeasures?: string;
  };

  sobrietyState?: {
    intoxication: boolean;
    drugs: boolean;
    examinationOnAccidentDay?: {
      conducted: boolean;
      byWhom?: string;
    };
  };

  controlAuthorities?: {
    actionsTaken: boolean;
    authorityName?: string;
    address?: string;
    caseNumber?: string;
    status?: string;
  };

  firstAid?: {
    provided: boolean;
    when?: string;
    where?: string;
    facilityName?: string;
    hospitalizationPeriod?: string;
    hospitalizationPlace?: string;
    recognizedInjury?: string;
    incapacityPeriod?: string;
  };

  sickLeave?: {
    onAccidentDay: boolean;
    description?: string;
  };
}

export interface Witness {
  firstName: string;
  lastName: string;
  street?: string;
  houseNumber?: string;
  apartmentNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string; // jeśli za granicą
  phone?: string;
}

// Cause tree
export interface CauseTreeNode {
  id: string;
  type: "zdarzenie" | "przyczyna" | "skutek";
  description: string;
  children?: CauseTreeNode[];
  order?: number;
}

export interface CauseTree {
  root: CauseTreeNode;
  eventSequence: string[];
}

// Analysis and suggestions
export interface ReportAnalysis {
  completeness: number; // 0-100
  missingElements: string[];
  missingDocuments: string[];
  ambiguities: string[];
  suggestions: string[];
  personalizedActionList: string[];
  recognitionProbability?: number; // 0-100
}

// ========== STAGE II - DECISION SUPPORT MODEL ==========

export interface DocumentAnalysis {
  documentType:
    | "zawiadomienie"
    | "wyjasnienia"
    | "opinia"
    | "karta_wypadku"
    | "medyczny"
    | "organ_kontroli"
    | "inny";
  personalData?: VictimPersonalData;
  accidentData?: AccidentData;
  victimStatement?: VictimStatement;
  medicalData?: MedicalData;
  witnesses?: Witness[];
  extractedData: Record<string, any>;
  extractionConfidence: number; // 0-100
}

export interface MedicalData {
  injury: string;
  diagnosis: string;
  incapacityPeriod?: string;
  hospitalization?: {
    period: string;
    place: string;
  };
  firstAid?: {
    date: string;
    place: string;
    description: string;
  };
}

export interface Discrepancies {
  accidentDate?: {
    inconsistent: boolean;
    values: string[];
    documents: string[];
  };
  accidentPlace?: {
    inconsistent: boolean;
    values: string[];
    documents: string[];
  };
  victimData?: {
    inconsistent: boolean;
    fields: string[];
    documents: string[];
  };
  witnessData?: {
    inconsistent: boolean;
    details: string[];
    documents: string[];
  };
  circumstancesDescription?: {
    inconsistent: boolean;
    discrepancies: string[];
    documents: string[];
  };
  causesDescription?: {
    inconsistent: boolean;
    discrepancies: string[];
    documents: string[];
  };
}

export interface DefinitionElementsVerification {
  suddenness: {
    fulfilled: boolean;
    confidence: number; // 0-100
    justification: string;
    doubts?: string[];
    requiredDocuments?: string[];
  };
  externalCause: {
    fulfilled: boolean;
    confidence: number;
    justification: string;
    doubts?: string[];
    requiredDocuments?: string[];
  };
  injury: {
    fulfilled: boolean;
    confidence: number;
    justification: string;
    doubts?: string[];
    doctorOpinionRequired?: boolean;
    requiredDocuments?: string[];
  };
  workRelation: {
    fulfilled: boolean;
    confidence: number;
    justification: string;
    causal: boolean;
    temporal: boolean;
    spatial: boolean;
    functional: boolean;
    doubts?: string[];
    requiredDocuments?: string[];
  };
}

export interface OpinionDraft {
  position: "UZNAĆ" | "NIE UZNAĆ" | "WYMAGA_DODATKOWEJ_ANALIZY";
  justification: string;
  elementsAnalysis: DefinitionElementsVerification;
  issuesToResolve?: string[];
  conclusion: string;
  conclusionJustification: string;
  confidence: number; // 0-100
  missingInformation?: string[];
  requiredDocuments?: string[];
  doctorOpinionRequired?: boolean;
}

export interface AccidentCard {
  cardNumber: string;
  creationDate: string;
  notificationReceivedDate: string;
  victimData: VictimPersonalData;
  businessData: BusinessData;
  accidentData: AccidentData;
  victimStatement?: VictimStatement;
  witnesses?: Witness[];
  decision: "UZNANO" | "NIE_UZNANO";
  justification: string;
  obstaclesDifficulties?: string; // jeśli opóźnienie
  withdrawal?: {
    reason: string;
    justification: string;
  };
  remarksReservations?: string;
}

// Helper types
export interface Recommendation {
  decision: "UZNAĆ" | "NIE UZNAĆ" | "WYMAGA_DODATKOWEJ_ANALIZY";
  justification: string;
  confidence: number; // 0-100
  missingElements?: string[];
  suggestions?: string[];
}

// Document upload types
export type DocumentStatus = "pending" | "processing" | "completed" | "error";

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// Case types
export type CaseStatus = "pending" | "processing" | "completed" | "error";

export type Decision = "ACCEPTED" | "REJECTED" | "NEED_MORE_INFORMATION";

export interface Justification {
  title: string;
  justification: string;
}

export interface InsuranceVerification {
  hasAccidentInsurance: boolean;
  verificationDate: string;
  message: string;
}

export interface A1FormVerification {
  isRequired: boolean; // true if accident happened outside Poland in EU
  hasA1Form: boolean;
  applicableLegislation?: string; // Which country's legislation applies
  message: string;
}

export type InjuryType =
  | "physical_visible" // Uraz fizyczny widoczny (złamanie, rana, stłuczenie)
  | "physical_internal" // Uraz fizyczny wewnętrzny (uszkodzenie narządów)
  | "psychological" // Uraz psychiczny (szok, trauma)
  | "disease_aggravation" // Zaostrzenie choroby (np. atak serca)
  | "pain_only" // Tylko ból bez widocznego uszkodzenia
  | "mixed" // Uraz mieszany
  | "unknown"; // Nieznany/nieokreślony

export interface InjuryVerification {
  hasInjury: boolean;
  injuryDescription?: string;
  injuryType?: InjuryType;
  requiresMedicalDocumentation: boolean;
  // Nowe pola dla opinii GLO ZUS
  requiresChiefMedicalExaminerOpinion: boolean;
  chiefMedicalExaminerOpinionReason?: string;
  injuryDefinitionDoubts?: string[];
  message: string;
}

export interface PKDCompatibility {
  isCompatible: boolean;
  confidence: number; // 0-100
  pkdCode: string;
  pkdDescription?: string;
  accidentActivities: string; // Czynności wykonywane podczas wypadku
  compatibilityReasoning: string;
  doubts?: string[];
}

export interface CompanyVerification {
  verified: boolean;
  companyName?: string;
  pkd?: string;
  pkdDescription?: string;
  message: string;
  // Nowe pole dla weryfikacji zgodności PKD z wypadkiem
  pkdCompatibility?: PKDCompatibility;
}

export interface VerificationResults {
  insuranceVerification: InsuranceVerification;
  a1FormVerification?: A1FormVerification;
  injuryVerification: InjuryVerification;
  companyVerification?: CompanyVerification;
}

export interface AIOpinion {
  date: string; // YYYY-MM-DD
  place: string;
  country?: string; // Country where accident happened
  description: string;
  causes: string;
  decision: Decision;
  justifications: Justification[];
  hasInjury: boolean;
  injuryDescription?: string;
  verificationResults?: VerificationResults;
}

export interface Difference {
  field: string;
  details: string;
  documents: string[];
}

export interface Differences {
  differences: Difference[];
  allDatesConsistent: boolean;
  allStatementsConsistent: boolean;
  summary: string;
  isInGeneralConsistent: boolean;
}

export interface Case {
  id: string;
  createdAt: string;
  status: CaseStatus;
  fileIds: string[];
  documents: UploadedDocument[];
  aiOpinion?: AIOpinion;
  error?: string;
  differences?: Differences;
}

export interface CaseUploadResponse {
  success: boolean;
  case?: Case;
  error?: string;
}
