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
  CompanyVerification,
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
 * Creates injury verification result based on AI analysis
 */
function createInjuryVerification(
  hasInjury: boolean,
  injuryDescription?: string
): InjuryVerification {
  if (hasInjury) {
    return {
      hasInjury: true,
      injuryDescription:
        injuryDescription || "Uraz zidentyfikowany w dokumentach",
      requiresMedicalDocumentation: true,
      message:
        "⚠️ UWAGA: Z analizy dokumentów wynika, że ubezpieczony doznał urazu. Wymagane jest dołączenie dokumentacji medycznej potwierdzającej rodzaj i zakres obrażeń.",
    };
  }

  return {
    hasInjury: false,
    requiresMedicalDocumentation: false,
    message: "Nie stwierdzono urazu na podstawie dostarczonych dokumentów.",
  };
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
      model: "gpt-4o-mini",
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

    if (nip) {
      try {
        company = await getCompanyDetailsByNip(nip);
        console.log(
          "Company details response:",
          JSON.stringify(company, null, 2)
        );

        if (company) {
          // Map company name from various possible field names
          const companyName =
            company.name ||
            company.companyName ||
            company.fullName ||
            company.firma ||
            company.nazwaPelna ||
            company.company?.name;

          // Map PKD from various possible field names/structures
          let pkd: string | undefined;
          if (company.pkd) {
            pkd =
              typeof company.pkd === "string"
                ? company.pkd
                : company.pkd?.code || company.pkd?.kod;
          } else if (company.mainPkd) {
            pkd =
              typeof company.mainPkd === "string"
                ? company.mainPkd
                : company.mainPkd?.code || company.mainPkd?.kod;
          } else if (company.przewazajacePKD) {
            pkd =
              typeof company.przewazajacePKD === "string"
                ? company.przewazajacePKD
                : company.przewazajacePKD?.code || company.przewazajacePKD?.kod;
          } else if (company.pkdList && company.pkdList.length > 0) {
            const mainPkd =
              company.pkdList.find((p: any) => p.main || p.przewazajace) ||
              company.pkdList[0];
            pkd = mainPkd?.code || mainPkd?.kod || mainPkd;
          }

          companyVerification = {
            verified: true,
            companyName: companyName,
            pkd: pkd,
            message: `Dane działalności zweryfikowane pomyślnie dla NIP: ${nip}`,
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
      parsedExtractionData.date ||
      new Date().toISOString().split("T")[0];
    const country = parsedExtractionData.country || "Polska";
    const hasInjury = parsedExtractionData.hasInjury ?? false;
    const injuryDescription = parsedExtractionData.injuryDescription;

    console.log("=== Running verification steps ===");
    console.log(`Accident date: ${accidentDate}`);
    console.log(`Country: ${country}`);
    console.log(`Has injury: ${hasInjury}`);

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

    // Step 3: Create injury verification
    const injuryVerification = createInjuryVerification(
      hasInjury,
      injuryDescription ?? undefined
    );
    console.log("Injury verification:", injuryVerification);

    // Build verification results
    const verificationResults: VerificationResults = {
      insuranceVerification,
      injuryVerification,
      companyVerification,
      ...(a1FormVerification && { a1FormVerification }),
    };

    // Determine final decision - override to NEED_MORE_INFORMATION if company verification failed
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
