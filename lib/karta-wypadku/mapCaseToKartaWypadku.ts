import { Case } from "@/types";
import { KartaWypadku } from "@/types/karta-wypadku";

/**
 * Mapuje dane z Case (AI analysis) na strukturę KartaWypadku
 * Wypełnia dostępne pola, pozostawia puste te, które wymagają ręcznego uzupełnienia
 */
export function mapCaseToKartaWypadku(caseData: Case): Partial<KartaWypadku> {
  const opinion = caseData.aiOpinion;
  const today = new Date().toISOString().split("T")[0];

  // Pobierz dane firmy z verificationResults jeśli dostępne
  const companyVerification = opinion?.verificationResults?.companyVerification;
  const companyName = companyVerification?.companyName || "";
  // NIP i REGON nie są bezpośrednio dostępne w Case - wymagają ręcznego uzupełnienia
  // Można spróbować wyciągnąć z nazwy firmy lub innych źródeł, ale na razie zostawiamy puste
  const nip = ""; // Wymaga ręcznego uzupełnienia - nie ma w danych AI
  const regon = ""; // Wymaga ręcznego uzupełnienia - nie ma w danych AI

  // Określ czy wypadek jest wypadkiem przy pracy
  const czyJestWypadkiemPrzyPracy =
    opinion?.decision === "ACCEPTED" ? "jest" : "nie_jest";

  // Wyciągnij podstawę prawną z justifications
  let art3Ust3Pkt = "";
  let czyArt3a = false;
  if (opinion?.justifications && opinion.justifications.length > 0) {
    // Szukaj informacji o art. 3 ust. 3 pkt w justifications
    const justificationText = opinion.justifications
      .map((j) => j.justification)
      .join(" ");
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

  // Utwórz informacje o wypadku łącząc description i causes
  const informacjeOWypadku = [
    opinion?.description || "",
    opinion?.causes || "",
    opinion?.injuryDescription || "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Uzasadnienie jeśli nie uznano
  const uzasadnienieNieUznano =
    czyJestWypadkiemPrzyPracy === "nie_jest"
      ? opinion?.justifications
          ?.map((j) => `${j.title}: ${j.justification}`)
          .join("\n\n") || ""
      : "";

  // Tytuł ubezpieczenia wypadkowego
  const tytulUbezpieczeniaWypadkowego = czyArt3a
    ? "art. 3a ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)"
    : art3Ust3Pkt
    ? `art. 3 ust. 3 pkt ${art3Ust3Pkt} ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)`
    : "art. 3 ust. 3 pkt 8 ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)";

  // Lista załączników
  const zalaczniki = caseData.documents.map((doc) => doc.fileName);

  return {
    nazwaIAdresPodmiotuSporzadzajacego: companyName || "",
    daneIdentyfikacyjnePlatnika: {
      imieNazwiskoLubNazwa: companyName || "",
      adresSiedziby: "", // Wymaga ręcznego uzupełnienia
      nip: nip || "",
      regon: regon || "",
      pesel: "", // Wymaga ręcznego uzupełnienia
    },
    daneIdentyfikacyjnePoszkodowanego: {
      imieNazwisko: "", // Wymaga ręcznego uzupełnienia - nie ma w AI
      pesel: "", // Wymaga ręcznego uzupełnienia - nie ma w AI
      dokumentTozsamosci: {
        rodzaj: "",
        seria: "",
        numer: "",
      },
      dataUrodzenia: "", // Wymaga ręcznego uzupełnienia
      miejsceUrodzenia: "", // Wymaga ręcznego uzupełnienia
      adresZamieszkania: "", // Wymaga ręcznego uzupełnienia
      tytulUbezpieczeniaWypadkowego: tytulUbezpieczeniaWypadkowego,
    },
    informacjeOWypadku: {
      dataZgloszenia: caseData.createdAt.split("T")[0],
      imieNazwiskoOsobyZglaszajacej: "", // Wymaga ręcznego uzupełnienia
      informacjeOWypadku: informacjeOWypadku,
      swiadkowie: [
        { imieNazwisko: "", miejsceZamieszkania: "" },
        { imieNazwisko: "", miejsceZamieszkania: "" },
      ],
      czyJestWypadkiemPrzyPracy: czyJestWypadkiemPrzyPracy as "jest" | "nie_jest",
      art3Ust3Pkt: art3Ust3Pkt,
      czyArt3a: czyArt3a,
      uzasadnienieNieUznano: uzasadnienieNieUznano,
      wykluczajacaPrzyczynaNaruszenie: "", // Wymaga ręcznego uzupełnienia jeśli dotyczy
      przyczynienieSieNietrzezwosc: "", // Wymaga ręcznego uzupełnienia jeśli dotyczy
    },
    pozostaleInformacje: {
      zapoznanieZTrecia: {
        imieNazwisko: "",
        data: "",
        podpis: "",
      },
      dataSporzadzenia: today,
      nazwaPodmiotuSporzadzajacego: companyName || "",
      dodatkowePole: "",
      przeszkodyTrudnosci: "",
      dataOdbioru: "",
      podpisUprawnionego: "",
      zalaczniki: zalaczniki,
    },
  };
}

