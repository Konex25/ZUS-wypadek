import { Case } from "@/types";
import { KartaWypadku } from "@/types/karta-wypadku";

/**
 * Mapuje dane z Case (AI analysis) na strukturę KartaWypadku
 * Wypełnia dostępne pola, pozostawia puste te, które wymagają ręcznego uzupełnienia
 */
export function mapCaseToKartaWypadku(caseData: any): Partial<KartaWypadku> {
  const today = new Date().toISOString().split("T")[0];

  // Get data from new case structure
  const aiDecision = caseData.aiDecision;
  const finalDecision = caseData.finalDecision;
  const aiResponse = caseData.aiResponse;
  const subject = caseData.subject;
  const formData = aiResponse?.[0]?.data ? (typeof aiResponse[0].data === 'string' ? JSON.parse(aiResponse[0].data) : aiResponse[0].data) : {};

  // Get business data
  const businessData = formData.businessData || {};
  const companyName = businessData.companyName || "";
  const nip = businessData.nip || "";
  const regon = businessData.regon || "";

  // Get personal data - try multiple sources
  const personalData = formData.personalData || {};
  const victimName = subject ? `${subject.name || ""} ${subject.surname || ""}`.trim() : (personalData.firstName && personalData.lastName ? `${personalData.firstName} ${personalData.lastName}`.trim() : "");
  const victimPesel = subject?.id || personalData.pesel || "";

  // Get date and place of birth from personalData
  const dateOfBirth = personalData.dateOfBirth || "";
  const placeOfBirth = personalData.placeOfBirth || "";

  // Get addresses
  const addresses = formData.addresses || {};
  const mainAddress = addresses.residentialAddress || caseData.mainAddress;
  const businessAddress = addresses.businessAddress || caseData.businessAddress;
  
  const formatAddress = (addr: any) => {
    if (!addr) return "";
    const parts = [
      addr.street,
      addr.houseNumber,
      addr.apartmentNumber ? `/${addr.apartmentNumber}` : "",
      addr.postalCode,
      addr.city,
    ].filter(Boolean);
    return parts.join(" ");
  };

  // Określ czy wypadek jest wypadkiem przy pracy
  const decision = finalDecision?.decision || aiDecision?.shouldAccept;
  const czyJestWypadkiemPrzyPracy =
    decision === "ACCEPTED" || decision === true ? "jest" : "nie_jest";

  // Wyciągnij podstawę prawną z justifications
  let art3Ust3Pkt = "";
  let czyArt3a = false;
  
  // Try to extract from aiDecision detailedJustification
  const justificationText = aiDecision?.detailedJustification || "";
  if (justificationText) {
    const art3Match = justificationText.match(/art\.\s*3\s*ust\.\s*3\s*pkt\s*(\d+)/i);
    if (art3Match) {
      art3Ust3Pkt = art3Match[1];
    }
    if (justificationText.includes("art. 3a") || justificationText.includes("art.3a")) {
      czyArt3a = true;
    }
  }

  // Jeśli nie znaleziono, użyj domyślnej wartości dla działalności gospodarczej
  if (!art3Ust3Pkt && czyJestWypadkiemPrzyPracy === "jest") {
    art3Ust3Pkt = "8"; // Domyślnie art. 3 ust. 3 pkt 8 dla działalności gospodarczej
  }

  // Utwórz informacje o wypadku z accidentData
  const accidentData = formData.accidentData || {};
  const informacjeOWypadku = [
    accidentData.detailedCircumstancesDescription || "",
    accidentData.accidentPlace || "",
    accidentData.accidentDate || "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Uzasadnienie jeśli nie uznano
  const uzasadnienieNieUznano =
    czyJestWypadkiemPrzyPracy === "nie_jest"
      ? aiDecision?.detailedJustification || finalDecision?.comment || ""
      : "";

  // Tytuł ubezpieczenia wypadkowego
  const tytulUbezpieczeniaWypadkowego = czyArt3a
    ? "art. 3a ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)"
    : art3Ust3Pkt
    ? `art. 3 ust. 3 pkt ${art3Ust3Pkt} ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)`
    : "art. 3 ust. 3 pkt 8 ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)";

  // Lista załączników - get from fileIds or aiResponse
  const zalaczniki: string[] = [];
  if (caseData.fileIds && Array.isArray(caseData.fileIds)) {
    // If we have file IDs, we can't get file names directly, so leave empty or fetch from fileTable
    zalaczniki.push(...caseData.fileIds.map((id: string) => `Plik ${id.substring(0, 8)}...`));
  }

  // Get witnesses from formData
  const witnesses = formData.witnesses || [];
  const swiadkowie = [
    witnesses[0] ? { imieNazwisko: `${witnesses[0].firstName || ""} ${witnesses[0].lastName || ""}`.trim(), miejsceZamieszkania: witnesses[0].address || "" } : { imieNazwisko: "", miejsceZamieszkania: "" },
    witnesses[1] ? { imieNazwisko: `${witnesses[1].firstName || ""} ${witnesses[1].lastName || ""}`.trim(), miejsceZamieszkania: witnesses[1].address || "" } : { imieNazwisko: "", miejsceZamieszkania: "" },
  ];

  // Get document info
  const idDocument = personalData.idDocument || {};

  // Get ZUS address (default ZUS address)
  const zusAddress = "ul. Szamocka 3, 5, 01-748 Warszawa";
  const zusName = "Zakład Ubezpieczeń Społecznych";
  const zusNip = "521-301-72-28";
  const zusRegon = "017756865";

  // Format full address with company name
  const fullCompanyAddress = companyName 
    ? `${companyName}, ${formatAddress(businessAddress)}`
    : formatAddress(businessAddress) || zusAddress;

  return {
    nazwaIAdresPodmiotuSporzadzajacego: fullCompanyAddress || zusAddress,
    daneIdentyfikacyjnePlatnika: {
      imieNazwiskoLubNazwa: companyName || zusName,
      adresSiedziby: formatAddress(businessAddress) || zusAddress,
      nip: nip || zusNip,
      regon: regon || zusRegon,
      pesel: "", // Usually not applicable for company
    },
    daneIdentyfikacyjnePoszkodowanego: {
      imieNazwisko: victimName || "",
      pesel: victimPesel || "",
      dokumentTozsamosci: {
        rodzaj: idDocument.type || "",
        seria: idDocument.series || "",
        numer: idDocument.number || "",
      },
      dataUrodzenia: dateOfBirth || "",
      miejsceUrodzenia: placeOfBirth || "",
      adresZamieszkania: formatAddress(mainAddress) || "",
      tytulUbezpieczeniaWypadkowego: tytulUbezpieczeniaWypadkowego,
    },
    informacjeOWypadku: {
      dataZgloszenia: caseData.createdAt ? (typeof caseData.createdAt === 'string' ? caseData.createdAt.split("T")[0] : new Date(caseData.createdAt).toISOString().split("T")[0]) : today,
      imieNazwiskoOsobyZglaszajacej: formData.representativeData ? `${formData.representativeData.firstName || ""} ${formData.representativeData.lastName || ""}`.trim() : "",
      informacjeOWypadku: informacjeOWypadku,
      swiadkowie: swiadkowie,
      czyJestWypadkiemPrzyPracy: czyJestWypadkiemPrzyPracy as "jest" | "nie_jest",
      art3Ust3Pkt: art3Ust3Pkt,
      czyArt3a: czyArt3a,
      uzasadnienieNieUznano: uzasadnienieNieUznano,
      wykluczajacaPrzyczynaNaruszenie: "", // Wymaga ręcznego uzupełnienia jeśli dotyczy
      przyczynienieSieNietrzezwosc: "", // Wymaga ręcznego uzupełnienia jeśli dotyczy
    },
    pozostaleInformacje: {
      zapoznanieZTrecia: {
        imieNazwisko: victimName || "",
        data: "",
        podpis: "",
      },
      dataSporzadzenia: today,
      nazwaPodmiotuSporzadzajacego: companyName || zusName,
      dodatkowePole: "",
      przeszkodyTrudnosci: "",
      dataOdbioru: "",
      podpisUprawnionego: "",
      zalaczniki: zalaczniki,
    },
  };
}

