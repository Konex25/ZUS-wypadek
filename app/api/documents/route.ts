import { NextRequest, NextResponse } from "next/server";
import {
  getCases,
  getCaseById,
  addCase,
  updateCase,
  generateCaseId,
  generateDocumentId,
} from "@/lib/store/cases";
import {
  Case,
  UploadedDocument,
  CaseUploadResponse,
  AIOpinion,
  InsuranceVerification,
  A1FormVerification,
  InjuryVerification,
  InjuryType,
  CompanyVerification,
  PKDCompatibility,
  VerificationResults,
} from "@/types";
import openai from "@/lib/openai/openai";
import { DECISION_PROMPT } from "./prompt";
import { EXTRACTION_PROMPT } from "./extraction-prompt";
import { getCompanyDetailsByNip } from "@/backend";

// List of EU member states (excluding Poland)
const EU_MEMBER_STATES = [
  "Austria",
  "Belgia",
  "Bułgaria",
  "Chorwacja",
  "Cypr",
  "Czechy",
  "Dania",
  "Estonia",
  "Finlandia",
  "Francja",
  "Grecja",
  "Hiszpania",
  "Holandia",
  "Irlandia",
  "Litwa",
  "Luksemburg",
  "Łotwa",
  "Malta",
  "Niemcy",
  "Portugalia",
  "Rumunia",
  "Słowacja",
  "Słowenia",
  "Szwecja",
  "Węgry",
  "Włochy",
  // English names as well
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Greece",
  "Portugal",
  "Sweden",
  "Austria",
  "Denmark",
  "Finland",
  "Ireland",
  "Czech Republic",
  "Romania",
  "Hungary",
  "Slovakia",
  "Bulgaria",
  "Croatia",
  "Slovenia",
  "Lithuania",
  "Latvia",
  "Estonia",
  "Cyprus",
  "Luxembourg",
  "Malta",
];

/**
 * Mock function that verifies if the person was covered by accident insurance
 * on the day of the accident. Always returns true (as per requirements).
 */
function verifyAccidentInsurance(accidentDate: string): InsuranceVerification {
  return {
    hasAccidentInsurance: true,
    verificationDate: accidentDate,
    message:
      "Weryfikacja ZUS: Ubezpieczony podlegał ubezpieczeniu wypadkowemu w dniu wypadku.",
  };
}

/**
 * Mock function that verifies A1 form for accidents in EU member states.
 * Always returns that the person has valid A1 form and is insured in Poland.
 */
function verifyA1Form(country: string): A1FormVerification {
  const isEUCountry = EU_MEMBER_STATES.some(
    (eu) => eu.toLowerCase() === country.toLowerCase()
  );

  if (!isEUCountry) {
    return {
      isRequired: false,
      hasA1Form: false,
      message:
        "Weryfikacja formularza A1 nie jest wymagana - wypadek nie wydarzył się w państwie członkowskim UE.",
    };
  }

  return {
    isRequired: true,
    hasA1Form: true,
    applicableLegislation: "Polska",
    message: `Weryfikacja formularza A1: Ubezpieczony posiada formularz A1 potwierdzający podleganie polskiemu ustawodawstwu w zakresie zabezpieczenia społecznego. Wypadek w ${country} podlega polskim przepisom.`,
  };
}

/**
 * Injury types that require Chief Medical Examiner opinion (GLO ZUS)
 * because they may not meet the legal definition of "injury" (uraz)
 */
const INJURY_TYPES_REQUIRING_GLO_OPINION: InjuryType[] = [
  "psychological", // Urazy psychiczne - wątpliwe czy spełniają definicję
  "disease_aggravation", // Zaostrzenie choroby - wątpliwy związek przyczynowy
  "pain_only", // Tylko ból - brak uszkodzenia tkanek
  "unknown", // Nieznany typ - wymaga oceny medycznej
];

/**
 * Creates injury verification result based on AI analysis
 * Detects cases requiring Chief Medical Examiner opinion (GLO ZUS)
 */
function createInjuryVerification(
  hasInjury: boolean,
  injuryDescription?: string,
  injuryType?: InjuryType,
  hasDocumentedMedicalEvidence?: boolean
): InjuryVerification {
  if (!hasInjury) {
    return {
      hasInjury: false,
      requiresMedicalDocumentation: false,
      requiresChiefMedicalExaminerOpinion: false,
      message: "Nie stwierdzono urazu na podstawie dostarczonych dokumentów.",
    };
  }

  // Check if injury type requires GLO ZUS opinion
  const requiresGLOOpinion = injuryType
    ? INJURY_TYPES_REQUIRING_GLO_OPINION.includes(injuryType)
    : false;

  // Build list of doubts about injury definition
  const injuryDefinitionDoubts: string[] = [];
  let chiefMedicalExaminerOpinionReason: string | undefined;

  if (injuryType === "psychological") {
    injuryDefinitionDoubts.push(
      "Uraz psychiczny (np. szok, trauma) - wymaga oceny, czy spełnia definicję urazu jako uszkodzenia tkanek ciała lub narządów"
    );
    chiefMedicalExaminerOpinionReason =
      "Zgłoszony uraz ma charakter psychiczny. Zgodnie z art. 2 pkt 13 ustawy wypadkowej, urazem jest uszkodzenie tkanek ciała lub narządów wskutek działania czynnika zewnętrznego. Wymagana jest opinia Głównego Lekarza Orzecznika ZUS w celu oceny, czy zgłoszony stan spełnia tę definicję.";
  }

  if (injuryType === "disease_aggravation") {
    injuryDefinitionDoubts.push(
      "Zaostrzenie istniejącej choroby - wymaga oceny związku przyczynowego z czynnikiem zewnętrznym"
    );
    chiefMedicalExaminerOpinionReason =
      "Zdarzenie mogło spowodować zaostrzenie istniejącej choroby. Wymagana jest opinia Głównego Lekarza Orzecznika ZUS w celu ustalenia, czy zaostrzenie choroby nastąpiło wskutek działania czynnika zewnętrznego i czy może być uznane za uraz w rozumieniu ustawy wypadkowej.";
  }

  if (injuryType === "pain_only") {
    injuryDefinitionDoubts.push(
      "Zgłoszono tylko dolegliwości bólowe bez udokumentowanego uszkodzenia tkanek"
    );
    chiefMedicalExaminerOpinionReason =
      "Poszkodowany zgłasza dolegliwości bólowe, jednak brak jest udokumentowanego uszkodzenia tkanek ciała lub narządów. Wymagana jest opinia Głównego Lekarza Orzecznika ZUS w celu oceny, czy zgłoszone dolegliwości stanowią uraz w rozumieniu art. 2 pkt 13 ustawy wypadkowej.";
  }

  if (injuryType === "unknown" || !injuryType) {
    injuryDefinitionDoubts.push(
      "Typ urazu nie został jednoznacznie określony w dokumentacji"
    );
    if (!hasDocumentedMedicalEvidence) {
      chiefMedicalExaminerOpinionReason =
        "Brak wystarczającej dokumentacji medycznej potwierdzającej rodzaj i charakter urazu. Wymagana jest opinia Głównego Lekarza Orzecznika ZUS.";
    }
  }

  // Check if medical evidence is missing
  if (!hasDocumentedMedicalEvidence && !requiresGLOOpinion) {
    injuryDefinitionDoubts.push(
      "Brak dokumentacji medycznej potwierdzającej uraz"
    );
  }

  // Determine the message based on whether GLO opinion is required
  let message: string;
  if (requiresGLOOpinion) {
    message = `⚠️ WYMAGA OPINII GŁÓWNEGO LEKARZA ORZECZNIKA ZUS: ${chiefMedicalExaminerOpinionReason}`;
  } else {
    message =
      "⚠️ UWAGA: Z analizy dokumentów wynika, że ubezpieczony doznał urazu. Wymagane jest dołączenie dokumentacji medycznej potwierdzającej rodzaj i zakres obrażeń.";
  }

  return {
    hasInjury: true,
    injuryDescription:
      injuryDescription || "Uraz zidentyfikowany w dokumentach",
    injuryType,
    requiresMedicalDocumentation: true,
    requiresChiefMedicalExaminerOpinion: requiresGLOOpinion,
    chiefMedicalExaminerOpinionReason,
    injuryDefinitionDoubts:
      injuryDefinitionDoubts.length > 0 ? injuryDefinitionDoubts : undefined,
    message,
  };
}

/**
 * Common PKD codes dictionary for reference
 */
const PKD_DICTIONARY: Record<string, string> = {
  // IT / Software
  "62.01.Z": "Działalność związana z oprogramowaniem",
  "62.02.Z": "Działalność związana z doradztwem w zakresie informatyki",
  "62.03.Z": "Działalność związana z zarządzaniem urządzeniami informatycznymi",
  "62.09.Z":
    "Pozostała działalność usługowa w zakresie technologii informatycznych",
  "63.11.Z": "Przetwarzanie danych; zarządzanie stronami internetowymi",
  "63.12.Z": "Działalność portali internetowych",
  // Transport
  "49.41.Z": "Transport drogowy towarów",
  "49.42.Z": "Usługi związane z przeprowadzkami",
  "52.29.C": "Działalność pozostałych agencji transportowych",
  // Construction
  "41.20.Z": "Roboty budowlane związane ze wznoszeniem budynków",
  "43.91.Z": "Wykonywanie konstrukcji i pokryć dachowych",
  "43.99.Z": "Pozostałe specjalistyczne roboty budowlane",
  // Legal/Consulting
  "69.10.Z": "Działalność prawnicza",
  "69.20.Z": "Działalność rachunkowo-księgowa",
  "70.22.Z":
    "Pozostałe doradztwo w zakresie prowadzenia działalności gospodarczej",
};

/**
 * PKD Compatibility verification prompt - STRICT version
 */
const PKD_COMPATIBILITY_PROMPT = (
  pkdCode: string,
  pkdDescription: string,
  activitiesPerformed: string,
  accidentDescription: string
) => `
Jesteś SUROWYM ekspertem ds. klasyfikacji PKD i analizy wypadków przy pracy.
Twoim zadaniem jest RYGORYSTYCZNIE ocenić, czy wykonywane czynności są zgodne z zarejestrowaną działalnością.

## WAŻNE ZASADY:
1. Działalność informatyczna (PKD 62.xx, 63.xx) NIE obejmuje pracy fizycznej przy pojazdach, transporcie, budowie
2. Działalność prawnicza/księgowa NIE obejmuje pracy fizycznej
3. Jeśli ktoś ma PKD informatyczne, a wypadek był przy transporcie/budowie - to jest NIEZGODNE
4. Bądź SUROWY - w razie wątpliwości oznacz jako NIEZGODNE

## Słownik PKD (dla referencji):
- 62.01.Z = Działalność związana z oprogramowaniem (programowanie, IT)
- 62.02.Z = Doradztwo informatyczne
- 62.09.Z = Usługi IT
- 63.11.Z = Przetwarzanie danych, hosting
- 49.41.Z = Transport drogowy towarów
- 43.91.Z = Roboty dekarskie
- 41.20.Z = Budownictwo

## Dane do analizy:
- **Kod PKD działalności:** ${pkdCode}
- **Opis PKD:** ${pkdDescription || "Sprawdź w słowniku powyżej"}
- **Czynności wykonywane podczas wypadku:** ${activitiesPerformed}
- **Okoliczności wypadku:** ${accidentDescription}

## PRZYKŁADY OCENY:

### ZGODNE:
- PKD 43.91.Z (Roboty dekarskie) + "spadł z drabiny podczas naprawy dachu" = ZGODNE (95%)
- PKD 49.41.Z (Transport drogowy) + "wypadek przy rozładunku towaru" = ZGODNE (95%)
- PKD 62.01.Z (IT) + "uraz nadgarstka przy programowaniu" = ZGODNE (85%)
- PKD 62.01.Z (IT) + "wypadek w drodze do klienta na spotkanie" = ZGODNE (70%)

### NIEZGODNE - KLUCZOWE PRZYKŁADY:
- PKD 62.01.Z (IT/oprogramowanie) + "wypadek na bazie transportowej przy pojeździe HDS" = NIEZGODNE (5%)
- PKD 62.01.Z (IT) + "spadł z drabiny na budowie" = NIEZGODNE (5%)
- PKD 62.01.Z (IT) + "praca przy rozładunku towarów" = NIEZGODNE (5%)
- PKD 69.10.Z (Prawnicza) + "wypadek przy obsłudze maszyny" = NIEZGODNE (5%)
- PKD 70.22.Z (Doradztwo) + "wypadek na placu budowy" = NIEZGODNE (5%)

## Twoja ocena:
Przeanalizuj czy czynności "${activitiesPerformed}" mogą być wykonywane w ramach działalności z PKD ${pkdCode}.

Jeśli PKD jest informatyczne (62.xx, 63.xx) a czynności dotyczą:
- transportu, pojazdów, HDS → NIEZGODNE
- budowy, pracy fizycznej na wysokości → NIEZGODNE
- obsługi maszyn przemysłowych → NIEZGODNE

## Format odpowiedzi JSON:
{
  "isCompatible": true/false,
  "confidence": 0-100,
  "pkdCategory": "IT/Transport/Budownictwo/Prawnicze/Inne",
  "activitiesCategory": "IT/Transport/Budownictwo/Praca fizyczna/Biurowa/Inne",
  "compatibilityReasoning": "SZCZEGÓŁOWE uzasadnienie - wyjaśnij DLACZEGO czynności są lub nie są zgodne z PKD",
  "doubts": ["lista konkretnych wątpliwości"]
}

PAMIĘTAJ: Bądź SUROWY. Lepiej oznaczyć jako NIEZGODNE i wymagać wyjaśnień niż przepuścić niezgodność.
`;

/**
 * Verifies PKD compatibility with accident circumstances using AI
 */
async function verifyPKDCompatibility(
  pkdCode: string,
  pkdDescription: string | undefined,
  activitiesPerformed: string,
  accidentDescription: string
): Promise<PKDCompatibility> {
  // Use dictionary description if not provided
  const effectivePkdDescription =
    pkdDescription || PKD_DICTIONARY[pkdCode] || "";

  console.log("=== PKD Compatibility Verification Start ===");
  console.log(`Input PKD code: ${pkdCode}`);
  console.log(`Input PKD description: ${pkdDescription || "NONE"}`);
  console.log(
    `Effective PKD description: ${effectivePkdDescription || "NONE"}`
  );
  console.log(`Activities: ${activitiesPerformed}`);

  if (!openai) {
    console.error("OpenAI client not available");
    return {
      isCompatible: false,
      confidence: 0,
      pkdCode,
      pkdDescription: effectivePkdDescription,
      accidentActivities: activitiesPerformed,
      compatibilityReasoning: "Nie można zweryfikować - brak połączenia z AI",
      doubts: ["Weryfikacja PKD niemożliwa"],
    };
  }

  // Quick pre-check for obvious incompatibilities
  const isITPKD = pkdCode.startsWith("62.") || pkdCode.startsWith("63.");
  const hasPhysicalWorkKeywords =
    /transport|hds|pojazd|budow|dach|drabina|maszyn|rozładunk|załadunk|magazyn|baza transportowa/i.test(
      activitiesPerformed
    );

  console.log(`Is IT PKD (62.xx or 63.xx): ${isITPKD}`);
  console.log(`Has physical work keywords: ${hasPhysicalWorkKeywords}`);

  // If IT company doing physical transport work - this is clearly incompatible
  if (isITPKD && hasPhysicalWorkKeywords) {
    console.log(
      "⚠️ PRE-CHECK FAILED: IT PKD with physical/transport work detected!"
    );
  }

  try {
    const prompt = PKD_COMPATIBILITY_PROMPT(
      pkdCode,
      effectivePkdDescription,
      activitiesPerformed,
      accidentDescription
    );

    console.log("Sending PKD compatibility prompt to AI...");

    const response = await openai.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You are a STRICT expert analyzing PKD (Polish business classification) compatibility. " +
            "You must respond with pure JSON only. Begin your response with {. " +
            "Be VERY STRICT - if an IT company (PKD 62.xx) has an accident during physical/transport work, " +
            "this is CLEARLY INCOMPATIBLE (isCompatible: false, confidence: 5-10).",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = response.output_text || "";
    console.log("AI Response (raw):", responseText.substring(0, 500));

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log("Parsed AI response:", JSON.stringify(parsed, null, 2));

    // Override AI decision if pre-check detected clear incompatibility
    let finalIsCompatible = parsed.isCompatible ?? false;
    let finalConfidence = parsed.confidence ?? 0;
    let finalReasoning = parsed.compatibilityReasoning || "Brak uzasadnienia";
    const finalDoubts = parsed.doubts || [];

    if (isITPKD && hasPhysicalWorkKeywords && finalIsCompatible) {
      console.log(
        "⚠️ OVERRIDE: AI said compatible but pre-check detected IT PKD with physical work"
      );
      finalIsCompatible = false;
      finalConfidence = Math.min(finalConfidence, 15);
      finalReasoning =
        `NIEZGODNOŚĆ: Zarejestrowana działalność (PKD ${pkdCode} - ${
          effectivePkdDescription || "IT/informatyka"
        }) ` +
        `nie obejmuje pracy fizycznej przy transporcie, pojazdach czy obsłudze urządzeń HDS. ` +
        `Czynności wykonywane podczas wypadku (${activitiesPerformed.substring(
          0,
          100
        )}...) ` +
        `są charakterystyczne dla działalności transportowej (PKD 49.xx) lub logistycznej, ` +
        `a nie dla działalności informatycznej.`;
      finalDoubts.push(
        "Działalność informatyczna nie obejmuje pracy przy transporcie i pojazdach"
      );
    }

    const result: PKDCompatibility = {
      isCompatible: finalIsCompatible,
      confidence: finalConfidence,
      pkdCode,
      pkdDescription: effectivePkdDescription,
      accidentActivities: activitiesPerformed,
      compatibilityReasoning: finalReasoning,
      doubts: finalDoubts,
    };

    console.log(
      "Final PKD compatibility result:",
      JSON.stringify(result, null, 2)
    );

    return result;
  } catch (error) {
    console.error("Error verifying PKD compatibility:", error);
    return {
      isCompatible: false,
      confidence: 0,
      pkdCode,
      pkdDescription: effectivePkdDescription,
      accidentActivities: activitiesPerformed,
      compatibilityReasoning: "Błąd podczas weryfikacji zgodności PKD",
      doubts: ["Wystąpił błąd podczas automatycznej weryfikacji"],
    };
  }
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("id");

  if (caseId) {
    const caseData = getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    return NextResponse.json({ case: caseData });
  }

  const cases = getCases();
  return NextResponse.json({ cases });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const nip = formData.get("nip") as string;

    // Fallback for single file upload (backwards compatibility)
    const singleFile = formData.get("file") as File | null;
    if (singleFile && files.length === 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json<CaseUploadResponse>(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate all file types
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json<CaseUploadResponse>(
          {
            success: false,
            error: `Invalid file type: ${file.type} (${file.name}). Allowed: JPEG, PNG, WEBP, GIF, PDF`,
          },
          { status: 400 }
        );
      }
    }

    // Create document entries for all files
    const documents: UploadedDocument[] = files.map((file) => ({
      id: generateDocumentId(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    // Create case with documents
    const newCase: Case = {
      id: generateCaseId(),
      createdAt: new Date().toISOString(),
      status: "processing",
      documents,
      fileIds: [],
    };

    addCase(newCase);

    // Process case with AI in background
    processCaseWithAI(newCase.id, files, nip);

    return NextResponse.json<CaseUploadResponse>({
      success: true,
      case: newCase,
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json<CaseUploadResponse>(
      { success: false, error: "Failed to create case" },
      { status: 500 }
    );
  }
}

// Parse AI response JSON with fallback
function parseAIResponse(responseText: string): Partial<AIOpinion> | null {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error);
    return null;
  }
}

// Process case documents with OpenAI
async function processCaseWithAI(caseId: string, files: File[], nip: string) {
  try {
    if (!openai) {
      throw new Error("OpenAI client not initialized");
    }

    // Upload all files to OpenAI
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const createdFile = await openai!.files.create({
          file,
          purpose: "assistants",
        });
        return createdFile;
      })
    );

    console.log(
      "Uploaded files to OpenAI:",
      uploadedFiles.map((f) => ({ id: f.id, filename: f.filename }))
    );

    const fileIds = uploadedFiles.map((f) => f.id);
    updateCase(caseId, { fileIds });

    const extractionData = await openai.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You are part of a bigger system, and you must always respond with a pure JSON response. The system will break if you don't.",
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: EXTRACTION_PROMPT },
            ...uploadedFiles.map((file) => ({
              type: "input_file" as const,
              file_id: file.id,
            })),
          ],
        },
      ],
    });

    console.log("Extraction data:", extractionData.output_text);
    const parsedExtractionData = parseAIResponse(extractionData.output_text);

    if (!parsedExtractionData) {
      throw new Error("Failed to parse extraction data as JSON");
    }

    // Fetch company data with error handling
    let company = null;
    let companyVerification: CompanyVerification;
    let pkd: string | undefined;
    let pkdDescription: string | undefined;

    if (nip) {
      try {
        company = await getCompanyDetailsByNip(nip);
        console.log(
          "Company details response:",
          JSON.stringify(company, null, 2)
        );

        if (company) {
          // Debug: log all top-level keys
          console.log("=== Company object keys ===");
          console.log("Top-level keys:", Object.keys(company));

          // Map company name from various possible field names
          const companyName =
            company.name ||
            company.companyName ||
            company.fullName ||
            company.firma ||
            company.nazwaPelna ||
            company.company?.name ||
            company.companyDetails?.name ||
            company.companyDetails?.firma;

          // Helper function to recursively search for PKD in object
          function findPKD(
            obj: any,
            path: string = ""
          ): { code?: string; name?: string } | null {
            if (!obj || typeof obj !== "object") return null;

            // Check common PKD field names at this level
            const pkdFields = [
              "pkd",
              "PKD",
              "pkdCode",
              "pkdKod",
              "przewazajacePKD",
              "mainPkd",
              "pkdGlowne",
            ];
            for (const field of pkdFields) {
              if (obj[field]) {
                console.log(`Found PKD at ${path}.${field}:`, obj[field]);
                if (typeof obj[field] === "string") {
                  return { code: obj[field] };
                } else if (typeof obj[field] === "object") {
                  return {
                    code:
                      obj[field].code ||
                      obj[field].kod ||
                      obj[field].pkdCode ||
                      obj[field].pkdKod,
                    name:
                      obj[field].name ||
                      obj[field].nazwa ||
                      obj[field].description ||
                      obj[field].opis,
                  };
                }
              }
            }

            // Check for pkdList or similar arrays
            const listFields = [
              "pkdList",
              "PKDList",
              "pkdCodes",
              "listaPkd",
              "pkds",
            ];
            for (const field of listFields) {
              if (Array.isArray(obj[field]) && obj[field].length > 0) {
                console.log(`Found PKD list at ${path}.${field}:`, obj[field]);
                const main =
                  obj[field].find(
                    (p: any) => p.main || p.przewazajace || p.glowne || p.isMain
                  ) || obj[field][0];
                return {
                  code:
                    main?.code ||
                    main?.kod ||
                    main?.pkdCode ||
                    (typeof main === "string" ? main : null),
                  name:
                    main?.name ||
                    main?.nazwa ||
                    main?.description ||
                    main?.opis,
                };
              }
            }

            // Recursively search nested objects (but not too deep)
            if (path.split(".").length < 4) {
              for (const key of Object.keys(obj)) {
                if (
                  typeof obj[key] === "object" &&
                  obj[key] !== null &&
                  !Array.isArray(obj[key])
                ) {
                  const found = findPKD(obj[key], `${path}.${key}`);
                  if (found?.code) return found;
                }
              }
            }

            return null;
          }

          // Try to find PKD using the helper function
          const pkdResult = findPKD(company, "company");
          if (pkdResult?.code) {
            pkd = pkdResult.code;
            pkdDescription = pkdResult.name;
            console.log(`PKD found: ${pkd} - ${pkdDescription}`);
          } else {
            console.log("PKD NOT FOUND in company object!");
            console.log(
              "Full company object:",
              JSON.stringify(company, null, 2).substring(0, 2000)
            );
          }

          companyVerification = {
            verified: true,
            companyName: companyName,
            pkd: pkd,
            pkdDescription: pkdDescription,
            message: pkd
              ? `Dane działalności zweryfikowane pomyślnie dla NIP: ${nip}`
              : `⚠️ Dane firmy pobrane dla NIP: ${nip}, ale nie znaleziono kodu PKD w odpowiedzi CEIDG`,
          };
        } else {
          companyVerification = {
            verified: false,
            message: `⚠️ Nie znaleziono danych działalności dla NIP: ${nip}. Nie można zweryfikować zgodności PKD z okolicznościami wypadku.`,
          };
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        companyVerification = {
          verified: false,
          message: `⚠️ Nie udało się pobrać danych o działalności dla NIP: ${nip}. Weryfikacja PKD niemożliwa.`,
        };
      }
    } else {
      companyVerification = {
        verified: false,
        message:
          "⚠️ Nie podano NIP. Nie można zweryfikować danych o działalności gospodarczej.",
      };
    }

    console.log("Company:", company);
    console.log("Company verification:", companyVerification);

    // Step: Verify PKD compatibility with accident circumstances
    const activitiesPerformed =
      (parsedExtractionData as any).activitiesPerformed ||
      (parsedExtractionData as any).description ||
      "";
    const accidentDescription = (parsedExtractionData as any).description || "";

    console.log("=== PKD Compatibility Check Prerequisites ===");
    console.log(`Company verified: ${companyVerification.verified}`);
    console.log(`PKD code: ${pkd || "BRAK"}`);
    console.log(`PKD description: ${pkdDescription || "BRAK"}`);
    console.log(
      `Activities performed: ${activitiesPerformed.substring(0, 200)}...`
    );

    if (companyVerification.verified && pkd && activitiesPerformed) {
      console.log("=== Verifying PKD compatibility ===");
      console.log(`PKD: ${pkd}`);
      console.log(
        `PKD from dictionary: ${
          PKD_DICTIONARY[pkd] || "Nie znaleziono w słowniku"
        }`
      );
      console.log(`Activities: ${activitiesPerformed}`);

      const pkdCompatibility = await verifyPKDCompatibility(
        pkd,
        pkdDescription,
        activitiesPerformed,
        accidentDescription
      );

      console.log("PKD Compatibility result:", pkdCompatibility);

      // Update company verification with PKD compatibility
      companyVerification.pkdCompatibility = pkdCompatibility;

      // Update message based on compatibility
      if (!pkdCompatibility.isCompatible) {
        companyVerification.message =
          `⚠️ UWAGA: Czynności wykonywane podczas wypadku mogą nie być zgodne z zarejestrowaną działalnością (PKD: ${pkd}). ` +
          `Pewność: ${pkdCompatibility.confidence}%. ${pkdCompatibility.compatibilityReasoning}`;
      } else if (pkdCompatibility.confidence < 70) {
        companyVerification.message =
          `⚠️ Weryfikacja PKD: Umiarkowana zgodność (${pkdCompatibility.confidence}%). ` +
          `PKD: ${pkd}. ${pkdCompatibility.compatibilityReasoning}`;
      } else {
        companyVerification.message =
          `✅ Weryfikacja PKD: Czynności zgodne z działalnością (${pkdCompatibility.confidence}%). ` +
          `PKD: ${pkd}${pkdDescription ? ` - ${pkdDescription}` : ""}`;
      }
    }

    const decisionData = {
      ...parsedExtractionData,
      company,
    };

    console.log("Decision data:", decisionData);

    const response = await openai.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You are part of a bigger system, and you must always respond with a pure JSON response. The system will break if you don't.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: DECISION_PROMPT(decisionData),
            },
          ],
        },
      ],
    });

    const decisionResponse = response.output_text || "";
    console.log("AI Opinion (raw):", decisionResponse);

    // Parse the AI response
    const parsedOpinion = parseAIResponse(decisionResponse);

    if (!parsedOpinion) {
      throw new Error("Failed to parse AI opinion as JSON");
    }

    // Extract key data for verification (use extraction data for country/injury info)
    const accidentDate =
      parsedOpinion.date ||
      (parsedExtractionData as any).date ||
      new Date().toISOString().split("T")[0];
    const country = (parsedExtractionData as any).country || "Polska";
    const hasInjury = (parsedExtractionData as any).hasInjury ?? false;
    const injuryDescription = (parsedExtractionData as any).injuryDescription;
    const injuryType = (parsedExtractionData as any).injuryType as
      | InjuryType
      | undefined;
    const hasDocumentedMedicalEvidence =
      (parsedExtractionData as any).hasDocumentedMedicalEvidence ?? false;

    console.log("=== Running verification steps ===");
    console.log(`Accident date: ${accidentDate}`);
    console.log(`Country: ${country}`);
    console.log(`Has injury: ${hasInjury}`);
    console.log(`Injury type: ${injuryType}`);
    console.log(`Has medical evidence: ${hasDocumentedMedicalEvidence}`);

    // Step 1: Verify accident insurance coverage
    const insuranceVerification = verifyAccidentInsurance(accidentDate);
    console.log("Insurance verification:", insuranceVerification);

    // Step 2: Verify A1 form if accident happened in EU (outside Poland)
    const a1FormVerification =
      country.toLowerCase() !== "polska" && country.toLowerCase() !== "poland"
        ? verifyA1Form(country)
        : undefined;
    if (a1FormVerification) {
      console.log("A1 Form verification:", a1FormVerification);
    }

    // Step 3: Create injury verification with GLO ZUS detection
    const injuryVerification = createInjuryVerification(
      hasInjury,
      injuryDescription ?? undefined,
      injuryType,
      hasDocumentedMedicalEvidence
    );
    console.log("Injury verification:", injuryVerification);
    if (injuryVerification.requiresChiefMedicalExaminerOpinion) {
      console.log(
        "⚠️ GLO ZUS opinion required:",
        injuryVerification.chiefMedicalExaminerOpinionReason
      );
    }

    // Build verification results
    const verificationResults: VerificationResults = {
      insuranceVerification,
      injuryVerification,
      companyVerification,
      ...(a1FormVerification && { a1FormVerification }),
    };

    // Determine final decision - override based on verification results
    let finalDecision = parsedOpinion.decision || "NEED_MORE_INFORMATION";
    let finalJustifications = parsedOpinion.justifications || [];

    // If company/PKD verification failed, we cannot approve the request
    if (!companyVerification.verified && finalDecision === "ACCEPTED") {
      finalDecision = "NEED_MORE_INFORMATION";
      finalJustifications = [
        ...finalJustifications,
        {
          title: "Brak weryfikacji PKD",
          justification:
            "Nie udało się zweryfikować danych o działalności gospodarczej (NIP/PKD). " +
            "Przed podjęciem decyzji należy ręcznie sprawdzić, czy PKD ubezpieczonego " +
            "jest zgodne z okolicznościami wypadku i czy wypadek mógł wydarzyć się " +
            "w ramach prowadzonej działalności gospodarczej.",
        },
      ];
      console.log(
        "Decision overridden to NEED_MORE_INFORMATION due to failed company verification"
      );
    }

    // If PKD is not compatible with accident circumstances
    if (
      companyVerification.pkdCompatibility &&
      !companyVerification.pkdCompatibility.isCompatible &&
      finalDecision === "ACCEPTED"
    ) {
      finalDecision = "NEED_MORE_INFORMATION";
      finalJustifications = [
        ...finalJustifications,
        {
          title: "Niezgodność PKD z okolicznościami wypadku",
          justification:
            `Czynności wykonywane podczas wypadku (${companyVerification.pkdCompatibility.accidentActivities}) ` +
            `mogą nie być zgodne z zarejestrowaną działalnością gospodarczą (PKD: ${companyVerification.pkd}). ` +
            `${companyVerification.pkdCompatibility.compatibilityReasoning} ` +
            `Wymagane jest dodatkowe wyjaśnienie, w jaki sposób wypadek był związany z prowadzoną działalnością.`,
        },
      ];
      console.log(
        "Decision overridden to NEED_MORE_INFORMATION due to PKD incompatibility"
      );
    }

    // If PKD compatibility has low confidence, add a warning
    if (
      companyVerification.pkdCompatibility &&
      companyVerification.pkdCompatibility.isCompatible &&
      companyVerification.pkdCompatibility.confidence < 70
    ) {
      finalJustifications = [
        ...finalJustifications,
        {
          title: "Umiarkowana zgodność PKD",
          justification:
            `Zgodność czynności z PKD oceniono na ${companyVerification.pkdCompatibility.confidence}%. ` +
            `Zaleca się dodatkową weryfikację związku wypadku z prowadzoną działalnością. ` +
            `${companyVerification.pkdCompatibility.compatibilityReasoning}`,
        },
      ];
    }

    // If GLO ZUS opinion is required
    if (injuryVerification.requiresChiefMedicalExaminerOpinion) {
      if (finalDecision === "ACCEPTED") {
        finalDecision = "NEED_MORE_INFORMATION";
      }
      finalJustifications = [
        ...finalJustifications,
        {
          title: "Wymagana opinia Głównego Lekarza Orzecznika ZUS",
          justification:
            injuryVerification.chiefMedicalExaminerOpinionReason ||
            "Wymagana jest opinia Głównego Lekarza Orzecznika ZUS w celu oceny, czy zgłoszony uraz spełnia definicję ustawową.",
        },
      ];
      console.log("Decision requires GLO ZUS opinion");
    }

    // Build complete AI opinion with verification results
    const aiOpinion: AIOpinion = {
      date: parsedOpinion.date || "",
      place: parsedOpinion.place || "",
      country: country,
      description: parsedOpinion.description || "",
      causes: parsedOpinion.causes || "",
      decision: finalDecision,
      justifications: finalJustifications,
      hasInjury: hasInjury,
      injuryDescription: injuryDescription ?? undefined,
      verificationResults,
    };

    console.log("Final AI Opinion with verifications:", aiOpinion);

    // Update case with AI opinion
    updateCase(caseId, {
      status: "completed",
      aiOpinion,
    });
  } catch (error) {
    console.error("Error processing case with AI:", error);
    updateCase(caseId, {
      status: "error",
      error: error instanceof Error ? error.message : "AI processing failed",
    });
  }
}
