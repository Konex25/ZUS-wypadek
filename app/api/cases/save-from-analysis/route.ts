import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database/database";
import { casesTable, subjectsTable, addressesTable, fileTable, NewCase, NewSubject } from "@/db/schema";
import { v4 } from "uuid";
import { AccidentReport } from "@/types";
import { eq, inArray } from "drizzle-orm";

interface SaveCaseRequest {
  formData: Partial<AccidentReport>;
  analysisResult?: any;
  legalQualification?: any;
  documentDifferences?: any;
  opinionData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveCaseRequest = await request.json();

    if (!body.formData) {
      return NextResponse.json(
        { error: "Brakuje wymaganych danych" },
        { status: 400 }
      );
    }

    const formData = body.formData;

    // Create addresses
    const mainAddressId = formData.addresses?.residentialAddress
      ? v4()
      : undefined;
    const correspondenceAddressId = formData.addresses?.correspondenceAddress
      ? v4()
      : undefined;
    const businessAddressId = formData.addresses?.businessAddress
      ? v4()
      : undefined;

    // Insert addresses
    if (mainAddressId && formData.addresses?.residentialAddress) {
      await database.insert(addressesTable).values({
        id: mainAddressId,
        street: formData.addresses.residentialAddress.street || "",
        houseNumber: formData.addresses.residentialAddress.houseNumber || "",
        apartmentNumber: formData.addresses.residentialAddress.apartmentNumber || undefined,
        city: formData.addresses.residentialAddress.city || "",
        postalCode: formData.addresses.residentialAddress.postalCode || "",
        country: formData.addresses.residentialAddress.country || "Polska",
      }).execute();
    }

    if (correspondenceAddressId && formData.addresses?.correspondenceAddress) {
      await database.insert(addressesTable).values({
        id: correspondenceAddressId,
        street: formData.addresses.correspondenceAddress.street || "",
        houseNumber: formData.addresses.correspondenceAddress.houseNumber || "",
        apartmentNumber: formData.addresses.correspondenceAddress.apartmentNumber || undefined,
        city: formData.addresses.correspondenceAddress.city || "",
        postalCode: formData.addresses.correspondenceAddress.postalCode || "",
        country: formData.addresses.correspondenceAddress.country || "Polska",
      }).execute();
    }

    if (businessAddressId && formData.addresses?.businessAddress) {
      await database.insert(addressesTable).values({
        id: businessAddressId,
        street: formData.addresses.businessAddress.street || "",
        houseNumber: formData.addresses.businessAddress.houseNumber || "",
        apartmentNumber: formData.addresses.businessAddress.apartmentNumber || undefined,
        city: formData.addresses.businessAddress.city || "",
        postalCode: formData.addresses.businessAddress.postalCode || "",
        country: formData.addresses.businessAddress.country || "Polska",
      }).execute();
    }

    // Create subject
    const subjectId = formData.personalData?.pesel || v4();
    const nip = formData.businessData?.nip || "";
    
    if (!nip) {
      return NextResponse.json(
        { error: "NIP jest wymagany do utworzenia sprawy" },
        { status: 400 }
      );
    }
    
    const newSubject: NewSubject = {
      id: subjectId,
      name: formData.personalData?.firstName || "",
      surname: formData.personalData?.lastName || "",
      nip: nip,
      regon: formData.businessData?.regon || undefined,
      documentId: formData.personalData?.idDocument?.number || undefined,
      documentType: formData.personalData?.idDocument?.type || undefined,
      mainAddressId: mainAddressId || undefined,
      correspondenceAddressId: correspondenceAddressId || undefined,
      businessAddressId: businessAddressId || undefined,
      pkd: formData.businessData?.pkdCodes?.map((pkd) => pkd.code) || undefined,
    };

    // Check if subject exists, if not insert, if yes update
    try {
      const existingSubject = await database
        .select()
        .from(subjectsTable)
        .where(eq(subjectsTable.id, subjectId))
        .execute();

      if (existingSubject.length > 0) {
        // Subject exists, update it
        console.log("Subject already exists, updating:", { id: subjectId, nip });
        await database
          .update(subjectsTable)
          .set({
            name: newSubject.name,
            surname: newSubject.surname,
            nip: newSubject.nip,
            regon: newSubject.regon,
            documentId: newSubject.documentId,
            documentType: newSubject.documentType,
            mainAddressId: newSubject.mainAddressId,
            correspondenceAddressId: newSubject.correspondenceAddressId,
            businessAddressId: newSubject.businessAddressId,
            pkd: newSubject.pkd,
          })
          .where(eq(subjectsTable.id, subjectId))
          .execute();
        console.log("Subject updated successfully:", subjectId);
      } else {
        // Subject doesn't exist, insert it
        console.log("Inserting new subject:", { id: subjectId, nip });
        await database.insert(subjectsTable).values(newSubject).execute();
        console.log("Subject inserted successfully:", subjectId);
      }
    } catch (error: any) {
      console.error("Error handling subject:", error);
      throw error;
    }

    // Get file IDs from analysis result
    // analysisResult is an array of NewFile objects with id field
    const fileIds: string[] = [];
    if (body.analysisResult && Array.isArray(body.analysisResult)) {
      console.log("Analysis result is array with length:", body.analysisResult.length);
      body.analysisResult.forEach((file: any, index: number) => {
        console.log(`File ${index}:`, {
          hasId: !!file.id,
          idType: typeof file.id,
          idValue: file.id,
          hasName: !!file.name,
          name: file.name,
        });
        if (file.id && typeof file.id === "string") {
          fileIds.push(file.id);
        }
      });
    } else {
      console.log("Analysis result is not an array:", typeof body.analysisResult, body.analysisResult);
    }
    
    console.log("File IDs extracted:", fileIds);
    
    // Verify that files exist in database
    if (fileIds.length > 0) {
      const existingFiles = await database
        .select({ id: fileTable.id })
        .from(fileTable)
        .where(inArray(fileTable.id, fileIds))
        .execute();
      
      const existingFileIds = existingFiles.map(f => f.id);
      const missingFileIds = fileIds.filter(id => !existingFileIds.includes(id));
      
      console.log("Files found in database:", existingFileIds.length, "out of", fileIds.length);
      if (missingFileIds.length > 0) {
        console.warn("Missing file IDs in database:", missingFileIds);
        // Use only files that exist in database
        fileIds.splice(0, fileIds.length, ...existingFileIds);
      }
    }
    
    console.log("Final file IDs to save:", fileIds);

    // Create case
    const caseId = v4();
    const newCase: NewCase = {
      id: caseId,
      subjectId: subjectId,
      status: "PROCESSING",
      fileIds: fileIds.length > 0 ? fileIds : undefined,
      aiResponse: body.analysisResult || null,
      aiDecision: body.legalQualification || null,
      aiJustifications: body.documentDifferences || null,
      workerJustifications: body.opinionData || null,
      finalDecision: null,
    };

    console.log("Inserting case:", {
      id: caseId,
      subjectId: subjectId,
      fileIdsCount: fileIds.length,
      hasFileIds: fileIds.length > 0,
    });

    await database.insert(casesTable).values(newCase).execute();
    
    console.log("Case inserted successfully:", caseId);

    return NextResponse.json({
      success: true,
      caseId: caseId,
      subjectId: subjectId,
    });
  } catch (error: any) {
    console.error("Error saving case:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas zapisywania sprawy" },
      { status: 500 }
    );
  }
}

