import { PDFDocument } from "pdf-lib";
import { AccidentReport } from "@/types";
import fs from "fs";
import path from "path";

/**
 * Konwertuje polskie znaki na ASCII (dla kompatybilności z WinAnsi)
 */
function transliteratePolish(text: string): string {
  const map: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  };
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => map[char] || char);
}

/**
 * Formatuje datę do formatu DDMMYYYY (8 znaków) dla PDF
 * PDF wymaga formatu DDMMYYYY (bez kropek)
 */
function formatDateForPDF(dateString: string): string {
  if (!dateString) return "";
  try {
    // Spróbuj sparsować jako Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()); // Pełny rok (4 cyfry)
    return `${day}${month}${year}`;
  } catch {
    // Jeśli nie można sparsować, spróbuj wyciągnąć datę z formatu YYYY-MM-DD
    const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}${month}${year}`;
    }
    // Jeśli to format DD.MM.YYYY, usuń kropki
    if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return dateString.replace(/\./g, '');
    }
    // Jeśli to format DDMMYYYY, zwróć jak jest
    if (dateString.match(/^\d{8}$/)) {
      return dateString;
    }
    return dateString.slice(0, 8); // Obetnij do 8 znaków jeśli nie można sparsować
  }
}

/**
 * Wypełnia szablon PDF danymi z formularza
 * @param templatePath - ścieżka do szablonu PDF (w public/templates/)
 * @param formData - dane z formularza
 * @returns Buffer z wypełnionym PDF
 */
export async function fillPDFTemplate(
  templatePath: string,
  formData: Partial<AccidentReport>
): Promise<Uint8Array> {
  // Wczytaj szablon PDF
  const templateBytes = await fs.promises.readFile(templatePath);
  
  // Załaduj dokument PDF
  const pdfDoc = await PDFDocument.load(templateBytes, {
    ignoreEncryption: false,
    updateMetadata: false,
  });
  
  // Pobierz formularz (AcroForm)
  const form = pdfDoc.getForm();
  
  // Pobierz wszystkie pola formularza
  const fields = form.getFields();
  
  // Mapowanie nazw pól z formularza do nazw pól w PDF ZUS
  // Nazwy pól w PDF mają format: topmostSubform[0].PageX[0].NazwaPola[0]
  const fieldMapping: Record<string, (data: Partial<AccidentReport>) => string> = {

    // ========== STRONA 1 - DANE OSOBOWE ==========
    // Dane osoby poszkodowanej 
    "topmostSubform[0].Page1[0].PESEL[0]": (d) => d.personalData?.pesel || "",
    "topmostSubform[0].Page1[0].Imię[0]": (d) => transliteratePolish(d.personalData?.firstName || ""),
    "topmostSubform[0].Page1[0].Nazwisko[0]": (d) => transliteratePolish(d.personalData?.lastName || ""),
    "topmostSubform[0].Page1[0].Dataurodzenia[0]": (d) => formatDateForPDF(d.personalData?.dateOfBirth || ""),
    "topmostSubform[0].Page1[0].Miejsceurodzenia[0]": (d) => transliteratePolish(d.personalData?.placeOfBirth || ""),
    "topmostSubform[0].Page1[0].Numertelefonu[0]": (d) => d.personalData?.phone || "",
    
    // Dokument tożsamości (połączone w jedno pole)
    "topmostSubform[0].Page1[0].Rodzajseriainumerdokumentu[0]": (d) => {
      const doc = d.personalData?.idDocument;
      if (!doc) return "";
      const type = doc.type === "dowód osobisty" ? "Dowod osobisty" : 
                   doc.type === "paszport" ? "Paszport" : 
                   doc.type === "inny" ? "Inny" : transliteratePolish(doc.type);
      const series = doc.series || "";
      const number = doc.number || "";
      return transliteratePolish(`${type}${series ? ` ${series}` : ""}${number ? ` ${number}` : ""}`.trim());
    },
    
    // Adres zamieszkania osoby poszkodowanej
    "topmostSubform[0].Page1[0].Ulica[0]": (d) => transliteratePolish(d.addresses?.residentialAddress?.street || ""),
    "topmostSubform[0].Page1[0].Numerdomu[0]": (d) => d.addresses?.residentialAddress?.houseNumber || "",
    "topmostSubform[0].Page1[0].Numerlokalu[0]": (d) => d.addresses?.residentialAddress?.apartmentNumber || "",
    "topmostSubform[0].Page1[0].Kodpocztowy[0]": (d) => d.addresses?.residentialAddress?.postalCode || "",
    "topmostSubform[0].Page1[0].Poczta[0]": (d) => transliteratePolish(d.addresses?.residentialAddress?.city || ""),
    "topmostSubform[0].Page1[0].Nazwapaństwa[0]": (d) => {
      const country = d.addresses?.residentialAddress?.country;
      return country ? transliteratePolish(country) : "";
    },
    
    // Adres ostatniego miejsca zamieszkania w Polsce / adres miejsca pobytu - Strona 1
    "topmostSubform[0].Page1[0].Ulica2A[0]": (d) => transliteratePolish(d.addresses?.lastResidentialAddressInPoland?.street || ""),
    "topmostSubform[0].Page1[0].Numerdomu2A[0]": (d) => d.addresses?.lastResidentialAddressInPoland?.houseNumber || "",
    "topmostSubform[0].Page1[0].Numerlokalu2A[0]": (d) => d.addresses?.lastResidentialAddressInPoland?.apartmentNumber || "",
    "topmostSubform[0].Page1[0].Kodpocztowy2A[0]": (d) => d.addresses?.lastResidentialAddressInPoland?.postalCode || "",
    "topmostSubform[0].Page1[0].Poczta2A[0]": (d) => transliteratePolish(d.addresses?.lastResidentialAddressInPoland?.city || ""),
    
    // ========== STRONA 2 - ADRES DO KORESPONDENCJI ==========
    // Dane osoby zawiadamiającej (Strona 2 - dół)
    "topmostSubform[0].Page2[0].PESEL[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      return d.representativeData.pesel || "";
    },
    "topmostSubform[0].Page2[0].Imię[0]": (d) => {
      if (!d.representativeData || !d.representativeData.firstName?.trim()) return "";
      return transliteratePolish(d.representativeData.firstName);
    },
    "topmostSubform[0].Page2[0].Nazwisko[0]": (d) => {
      if (!d.representativeData || !d.representativeData.lastName?.trim()) return "";
      return transliteratePolish(d.representativeData.lastName);
    },
    "topmostSubform[0].Page2[0].Rodzajseriainumerdokumentu[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const doc = d.representativeData.idDocument;
      if (!doc || !doc.number?.trim()) return "";
      const type = doc.type === "dowód osobisty" ? "Dowod osobisty" : 
                   doc.type === "paszport" ? "Paszport" : 
                   doc.type === "inny" ? "Inny" : transliteratePolish(doc.type);
      const series = doc.series || "";
      const number = doc.number || "";
      return transliteratePolish(`${type}${series ? ` ${series}` : ""}${number ? ` ${number}` : ""}`.trim());
    },
    
    // Adres do korespondencji - adres (tylko jeśli użytkownik wypełnił)
    "topmostSubform[0].Page2[0].Ulica[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.street) 
        ? transliteratePolish(corrAddr.address.street) 
        : "";
    },
    "topmostSubform[0].Page2[0].Numerdomu[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.houseNumber) 
        ? corrAddr.address.houseNumber 
        : "";
    },
    "topmostSubform[0].Page2[0].Numerlokalu[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.apartmentNumber) 
        ? corrAddr.address.apartmentNumber 
        : "";
    },
    "topmostSubform[0].Page2[0].Kodpocztowy[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.postalCode) 
        ? corrAddr.address.postalCode 
        : "";
    },
    "topmostSubform[0].Page2[0].Poczta[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.city) 
        ? transliteratePolish(corrAddr.address.city) 
        : "";
    },
    "topmostSubform[0].Page2[0].Numertelefonu[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.phone) 
        ? corrAddr.address.phone 
        : "";
    },
    "topmostSubform[0].Page2[0].Nazwapaństwa2[0]": (d) => {
      const corrAddr = d.addresses?.correspondenceAddress;
      return (corrAddr?.type === "adres" && corrAddr?.address?.country) 
        ? transliteratePolish(corrAddr.address.country) 
        : "";
    },
    
    // Adres do korespondencji - alternatywny (jeśli inny niż zamieszkania)
    // To pole w szablonie "Ulica2" na Stronie 2 oznacza "Adres miejsca prowadzenia pozarolniczej działalności"
    "topmostSubform[0].Page2[0].Ulica2[0]": (d) => transliteratePolish(d.addresses?.businessAddress?.street || ""),
    "topmostSubform[0].Page2[0].Numerdomu2[0]": (d) => d.addresses?.businessAddress?.houseNumber || "",
    "topmostSubform[0].Page2[0].Numerlokalu2[0]": (d) => d.addresses?.businessAddress?.apartmentNumber || "",
    "topmostSubform[0].Page2[0].Kodpocztowy2[0]": (d) => d.addresses?.businessAddress?.postalCode || "",
    "topmostSubform[0].Page2[0].Poczta2[0]": (d) => transliteratePolish(d.addresses?.businessAddress?.city || ""),
    "topmostSubform[0].Page2[0].Numertelefonu2[0]": (d) => d.addresses?.businessAddress?.phone || "",
    
    // Checkboxy dla adresu do korespondencji
    "topmostSubform[0].Page2[0].adres[0]": (d) => {
      const type = d.addresses?.correspondenceAddress?.type;
      return type === "adres" ? "true" : "";
    },
    "topmostSubform[0].Page2[0].posterestante[0]": (d) => {
      const type = d.addresses?.correspondenceAddress?.type;
      return type === "poste_restante" ? "true" : "";
    },
    "topmostSubform[0].Page2[0].skrytkapocztowa[0]": (d) => {
      const type = d.addresses?.correspondenceAddress?.type;
      return type === "skrytka" ? "true" : "";
    },
    "topmostSubform[0].Page2[0].przegrodkapocztowa[0]": (d) => {
      const type = d.addresses?.correspondenceAddress?.type;
      return type === "przegrodka" ? "true" : "";
    },
    
    // ========== STRONA 3 - DANE O WYPADKU ==========
    "topmostSubform[0].Page3[0].Datawyp[0]": (d) => formatDateForPDF(d.accidentData?.accidentDate || ""),
    "topmostSubform[0].Page3[0].Godzina[0]": (d) => d.accidentData?.accidentTime || "",
    "topmostSubform[0].Page3[0].Miejscewyp[0]": (d) => transliteratePolish(d.accidentData?.accidentPlace || ""),
    // Pole na stronie 3 jest w szablonie opisane dla osoby zawiadamiającej (bez sufiksu 2)
    // Wypełniamy tylko, gdy istnieje representativeData z datą urodzenia.
    "topmostSubform[0].Page3[0].Dataurodzenia[0]": (d) => {
      if (!d.representativeData || !d.representativeData.dateOfBirth?.trim()) return "";
      return formatDateForPDF(d.representativeData.dateOfBirth);
    },
    "topmostSubform[0].Page3[0].Godzina3A[0]": (d) => d.accidentData?.plannedStartTime || "",
    "topmostSubform[0].Page3[0].Godzina3B[0]": (d) => d.accidentData?.plannedEndTime || "",
    
    // Adres do korespondencji osoby zawiadamiającej - Strona 3
    "topmostSubform[0].Page3[0].Ulica3[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.correspondenceAddress;
      if (addr?.type !== "adres" || !addr.address || (!addr.address.street?.trim() && !addr.address.city?.trim())) return "";
      return transliteratePolish(addr.address.street || "");
    },
    "topmostSubform[0].Page3[0].Numerdomu3[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.correspondenceAddress;
      if (addr?.type !== "adres" || !addr.address || (!addr.address.street?.trim() && !addr.address.city?.trim())) return "";
      return addr.address.houseNumber || "";
    },
    "topmostSubform[0].Page3[0].Numerlokalu3[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.correspondenceAddress;
      if (addr?.type !== "adres" || !addr.address || (!addr.address.street?.trim() && !addr.address.city?.trim())) return "";
      return addr.address.apartmentNumber || "";
    },
    "topmostSubform[0].Page3[0].Kodpocztowy3[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.correspondenceAddress;
      if (addr?.type !== "adres" || !addr.address || (!addr.address.street?.trim() && !addr.address.city?.trim())) return "";
      return addr.address.postalCode || "";
    },
    "topmostSubform[0].Page3[0].Poczta3[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.correspondenceAddress;
      if (addr?.type !== "adres" || !addr.address || (!addr.address.street?.trim() && !addr.address.city?.trim())) return "";
      return transliteratePolish(addr.address.city || "");
    },
    // Numer telefonu — traktujemy jako pole osoby zawiadamiającej
    "topmostSubform[0].Page3[0].Numertelefonu3[0]": (d) => {
      if (!d.representativeData || !d.representativeData.phone?.trim()) return "";
      return d.representativeData.phone;
    },
    "topmostSubform[0].Page3[0].Nazwapaństwa3[0]": (d) => {
      const country = d.addresses?.businessAddress?.country;
      return country ? transliteratePolish(country) : "";
    },
    
    // Dane działalności gospodarczej (NIP, REGON, PKD) - Strona 3
    // Uwaga: Nazwy pól mogą się różnić - sprawdź używając /api/pdf/debug-fields
    "topmostSubform[0].Page3[0].NIP[0]": (d) => d.businessData?.nip || "",
    "topmostSubform[0].Page3[0].REGON[0]": (d) => d.businessData?.regon || "",
    "topmostSubform[0].Page3[0].PKD[0]": (d) => d.businessData?.pkdCode || "",
    "topmostSubform[0].Page3[0].ZakresDzialalnosci[0]": (d) => transliteratePolish(d.businessData?.businessScope || ""),
    
    // Adres sprawowania opieki nad dzieckiem (dla niań) - Strona 2
    // Uwaga: Nazwy pól mogą się różnić w rzeczywistym PDF - sprawdź używając /api/pdf/debug-fields
    "topmostSubform[0].Page2[0].Ulica4[0]": (d) => transliteratePolish(d.addresses?.childcareAddress?.street || ""),
    "topmostSubform[0].Page2[0].Numerdomu4[0]": (d) => d.addresses?.childcareAddress?.houseNumber || "",
    "topmostSubform[0].Page2[0].Numerlokalu4[0]": (d) => d.addresses?.childcareAddress?.apartmentNumber || "",
    "topmostSubform[0].Page2[0].Kodpocztowy4[0]": (d) => d.addresses?.childcareAddress?.postalCode || "",
    "topmostSubform[0].Page2[0].Poczta4[0]": (d) => transliteratePolish(d.addresses?.childcareAddress?.city || ""),
    "topmostSubform[0].Page2[0].Numertelefonu4[0]": (d) => d.addresses?.childcareAddress?.phone || "",
    
    // Dane osoby zawiadamiającej (tylko jeśli zawiadamia inna osoba niż poszkodowany) - Strona 2-3
    "topmostSubform[0].Page2[0].PESEL2[0]": (d) => {
      // Wypełnij tylko jeśli istnieje osoba zawiadamiająca I ma wypełnione dane
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      return d.representativeData.pesel || "";
    },
    "topmostSubform[0].Page2[0].Imię2[0]": (d) => {
      if (!d.representativeData || !d.representativeData.firstName?.trim()) return "";
      return transliteratePolish(d.representativeData.firstName);
    },
    "topmostSubform[0].Page2[0].Nazwisko2[0]": (d) => {
      if (!d.representativeData || !d.representativeData.lastName?.trim()) return "";
      return transliteratePolish(d.representativeData.lastName);
    },
    "topmostSubform[0].Page2[0].Rodzajseriainumerdokumentu2[0]": (d) => {
      // Wypełnij tylko jeśli istnieje osoba zawiadamiająca I ma wypełnione dane
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const doc = d.representativeData.idDocument;
      if (!doc || !doc.number?.trim()) return "";
      const type = doc.type === "dowód osobisty" ? "Dowod osobisty" : 
                   doc.type === "paszport" ? "Paszport" : 
                   doc.type === "inny" ? "Inny" : transliteratePolish(doc.type);
      const series = doc.series || "";
      const number = doc.number || "";
      return transliteratePolish(`${type}${series ? ` ${series}` : ""}${number ? ` ${number}` : ""}`.trim());
    },
    "topmostSubform[0].Page3[0].Dataurodzenia2[0]": (d) => {
      // Wypełnij tylko jeśli istnieje osoba zawiadamiająca I ma wypełnione podstawowe dane (imię lub nazwisko) I data jest wypełniona
      if (!d.representativeData || 
          (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim()) ||
          !d.representativeData.dateOfBirth || 
          !d.representativeData.dateOfBirth.trim()) return "";
      return formatDateForPDF(d.representativeData.dateOfBirth);
    },
    "topmostSubform[0].Page3[0].Numertelefonu2[0]": (d) => {
      // Wypełnij tylko jeśli istnieje osoba zawiadamiająca I ma wypełnione podstawowe dane (imię lub nazwisko) I telefon jest wypełniony
      if (!d.representativeData || 
          (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim()) ||
          !d.representativeData.phone || 
          !d.representativeData.phone.trim()) return "";
      return d.representativeData.phone;
    },
    
    // Adres zamieszkania osoby zawiadamiającej - Strona 3 (tylko jeśli zawiadamia inna osoba I adres jest wypełniony)
    "topmostSubform[0].Page3[0].Ulica4[0]": (d) => {
      // Sprawdź czy istnieje osoba zawiadamiająca I ma wypełnione podstawowe dane
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      // Sprawdź czy adres jest faktycznie wypełniony (ma przynajmniej ulicę lub miasto) - sprawdź czy nie są to puste stringi
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.street || "");
    },
    "topmostSubform[0].Page3[0].Numerdomu4[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.houseNumber || "";
    },
    "topmostSubform[0].Page3[0].Numerlokalu4[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.apartmentNumber || "";
    },
    "topmostSubform[0].Page3[0].Kodpocztowy4[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.postalCode || "";
    },
    "topmostSubform[0].Page3[0].Poczta4[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.city || "");
    },
    "topmostSubform[0].Page3[0].Nazwapaństwa4[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.country || "Polska");
    },
    
    // Adres ostatniego zamieszkania w Polsce osoby zawiadamiającej - Strona 3 (tylko jeśli zawiadamia inna osoba I adres jest wypełniony)
    "topmostSubform[0].Page3[0].Ulica5[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.street || "");
    },
    "topmostSubform[0].Page3[0].Numerdomu5[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.houseNumber || "";
    },
    "topmostSubform[0].Page3[0].Numerlokalu5[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.apartmentNumber || "";
    },
    "topmostSubform[0].Page3[0].Kodpocztowy5[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.postalCode || "";
    },
    "topmostSubform[0].Page3[0].Poczta5[0]": (d) => {
      if (!d.representativeData || (!d.representativeData.firstName?.trim() && !d.representativeData.lastName?.trim())) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.city || "");
    },
    
    // Adres działalności - alternatywny (Strona 3)
    // Ulica2/Numery/Kod/Poczta na stronie 3 — realnie używane w PDF dla osoby zawiadamiającej (bez sufiksu 2 w nazwie)
    "topmostSubform[0].Page3[0].Ulica2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.street || "");
    },
    "topmostSubform[0].Page3[0].Numerdomu2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.houseNumber || "";
    },
    "topmostSubform[0].Page3[0].Numerlokalu2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.apartmentNumber || "";
    },
    "topmostSubform[0].Page3[0].Kodpocztowy2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.postalCode || "";
    },
    "topmostSubform[0].Page3[0].Poczta2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.city || "");
    },
    "topmostSubform[0].Page3[0].Nazwapaństwa2[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.residentialAddress;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.country ? transliteratePolish(addr.country) : "";
    },
    
    // Adres działalności - dodatkowy (Strona 3)
    // Ulica2A/Numery2A/Kod2A/Poczta2A — w PDF to kolejne pola adresowe osoby zawiadamiającej
    "topmostSubform[0].Page3[0].Ulica2A[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.street || "");
    },
    "topmostSubform[0].Page3[0].Numerdomu2A[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.houseNumber || "";
    },
    "topmostSubform[0].Page3[0].Numerlokalu2A[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.apartmentNumber || "";
    },
    "topmostSubform[0].Page3[0].Kodpocztowy2A[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return addr.postalCode || "";
    },
    "topmostSubform[0].Page3[0].Poczta2A[0]": (d) => {
      if (!d.representativeData) return "";
      const addr = d.representativeData.addresses?.lastResidentialAddressInPoland;
      if (!addr || (!addr.street?.trim() && !addr.city?.trim())) return "";
      return transliteratePolish(addr.city || "");
    },
    
    // ========== STRONA 4 - OPISY I ELEMENTY DEFINICJI ==========
    "topmostSubform[0].Page4[0].Tekst4[0]": (d) => transliteratePolish(d.accidentData?.detailedCircumstancesDescription || ""),
    "topmostSubform[0].Page4[0].Tekst5[0]": (d) => transliteratePolish(d.accidentData?.detailedCausesDescription || ""),
    // Pierwsza pomoc – nazwa i adres placówki (główne pole opisu)
    "topmostSubform[0].Page4[0].Tekst6[0]": (d) => {
      const fa = d.accidentData?.firstAid;
      if (fa?.provided && (fa.facilityName || fa.facilityAddress)) {
        return transliteratePolish(
          [fa.facilityName, fa.facilityAddress].filter(Boolean).join(", ")
        );
      }
      return "";
    },
    "topmostSubform[0].Page4[0].Tekst7[0]": (d) => transliteratePolish(d.accidentData?.injuryType || ""),
    "topmostSubform[0].Page4[0].Tekst8[0]": (d) => transliteratePolish(d.accidentData?.accidentPlaceDetails || ""),
    
    // Punkt 6: Pierwsza pomoc medyczna
    "topmostSubform[0].Page4[0].TAK6[0]": (d) => d.accidentData?.firstAid?.provided ? "true" : "",
    "topmostSubform[0].Page4[0].NIE6[0]": (d) => d.accidentData?.firstAid?.provided === false ? "true" : "",
    "topmostSubform[0].Page4[0].Tekst6A[0]": (d) => {
      const fa = d.accidentData?.firstAid;
      if (fa?.provided && fa.facilityName && fa.facilityAddress) {
        return transliteratePolish(`${fa.facilityName}, ${fa.facilityAddress}`);
      }
      return "";
    },
    
    // Punkt 7: Organ prowadzący postępowanie
    "topmostSubform[0].Page4[0].Tekst7A[0]": (d) => {
      const ap = d.accidentData?.authorityProceedings;
      if (ap?.conducted && ap.authorityName && ap.address) {
        return transliteratePolish(`${ap.authorityName}, ${ap.address}`);
      }
      return "";
    },
    
    // Punkt 8: Czy wypadek powstał podczas obsługi maszyn/urządzeń
    "topmostSubform[0].Page4[0].TAK8[0]": (d) => d.accidentData?.machineryEquipment?.applicable ? "true" : "",
    "topmostSubform[0].Page4[0].NIE8[0]": (d) => d.accidentData?.machineryEquipment?.applicable === false ? "true" : "",
    "topmostSubform[0].Page4[0].Tekst8A[0]": (d) => {
      const me = d.accidentData?.machineryEquipment;
      if (me?.applicable) {
        const parts: string[] = [];
        if (me.name) parts.push(`Nazwa: ${me.name}`);
        if (me.type) parts.push(`Typ: ${me.type}`);
        if (me.operational !== undefined) parts.push(`Sprawna: ${me.operational ? "TAK" : "NIE"}`);
        if (me.compliantWithManufacturer !== undefined) parts.push(`Zgodna z zasadami producenta: ${me.compliantWithManufacturer ? "TAK" : "NIE"}`);
        if (me.usageMethod) parts.push(`Sposob uzycia: ${me.usageMethod}`);
        return transliteratePolish(parts.join(", "));
      }
      return "";
    },
    
    // Punkt 9: Czy maszyna ma atest/deklarację zgodności
    "topmostSubform[0].Page4[0].TAK9[0]": (d) => {
      const me = d.accidentData?.machineryEquipment;
      return (me?.certified || me?.conformityDeclaration) ? "true" : "";
    },
    "topmostSubform[0].Page4[0].NIE9[0]": (d) => {
      const me = d.accidentData?.machineryEquipment;
      return (me?.certified === false && me?.conformityDeclaration === false) ? "true" : "";
    },
    
    // Punkt 10: Czy maszyna jest w ewidencji środków trwałych
    "topmostSubform[0].Page4[0].TAK10[0]": (d) => d.accidentData?.machineryEquipment?.inFixedAssetsRegister ? "true" : "",
    "topmostSubform[0].Page4[0].NIE10[0]": (d) => d.accidentData?.machineryEquipment?.inFixedAssetsRegister === false ? "true" : "",
    
    // ========== STRONA 5 - ŚWIADKOWIE ==========
    // Świadek 1
    "topmostSubform[0].Page5[0].Imię[0]": (d) => transliteratePolish(d.witnesses?.[0]?.firstName || ""),
    "topmostSubform[0].Page5[0].Nazwisko[0]": (d) => transliteratePolish(d.witnesses?.[0]?.lastName || ""),
    "topmostSubform[0].Page5[0].Ulica[0]": (d) => transliteratePolish(d.witnesses?.[0]?.street || ""),
    "topmostSubform[0].Page5[0].Numerdomu[0]": (d) => d.witnesses?.[0]?.houseNumber || "",
    "topmostSubform[0].Page5[0].Numerlokalu[0]": (d) => d.witnesses?.[0]?.apartmentNumber || "",
    "topmostSubform[0].Page5[0].Kodpocztowy[0]": (d) => d.witnesses?.[0]?.postalCode || "",
    "topmostSubform[0].Page5[0].Poczta[0]": (d) => transliteratePolish(d.witnesses?.[0]?.city || ""),
    "topmostSubform[0].Page5[0].Nazwapaństwa[0]": (d) => {
      const country = d.witnesses?.[0]?.country;
      return country ? transliteratePolish(country) : "";
    },
    
    // Świadek 2
    "topmostSubform[0].Page5[0].Imię[1]": (d) => transliteratePolish(d.witnesses?.[1]?.firstName || ""),
    "topmostSubform[0].Page5[0].Nazwisko[1]": (d) => transliteratePolish(d.witnesses?.[1]?.lastName || ""),
    "topmostSubform[0].Page5[0].Ulica[1]": (d) => transliteratePolish(d.witnesses?.[1]?.street || ""),
    "topmostSubform[0].Page5[0].Numerdomu[1]": (d) => d.witnesses?.[1]?.houseNumber || "",
    "topmostSubform[0].Page5[0].Numerlokalu[1]": (d) => d.witnesses?.[1]?.apartmentNumber || "",
    "topmostSubform[0].Page5[0].Kodpocztowy[1]": (d) => d.witnesses?.[1]?.postalCode || "",
    "topmostSubform[0].Page5[0].Poczta[1]": (d) => transliteratePolish(d.witnesses?.[1]?.city || ""),
    "topmostSubform[0].Page5[0].Nazwapaństwa[1]": (d) => {
      const country = d.witnesses?.[1]?.country;
      return country ? transliteratePolish(country) : "";
    },
    
    // Świadek 3 (jeśli jest)
    "topmostSubform[0].Page5[0].Imię2[0]": (d) => transliteratePolish(d.witnesses?.[2]?.firstName || ""),
    "topmostSubform[0].Page5[0].Nazwisko2[0]": (d) => transliteratePolish(d.witnesses?.[2]?.lastName || ""),
    "topmostSubform[0].Page5[0].Ulica2[0]": (d) => transliteratePolish(d.witnesses?.[2]?.street || ""),
    "topmostSubform[0].Page5[0].Numerdomu2[0]": (d) => d.witnesses?.[2]?.houseNumber || "",
    "topmostSubform[0].Page5[0].Numerlokalu2[0]": (d) => d.witnesses?.[2]?.apartmentNumber || "",
    "topmostSubform[0].Page5[0].Kodpocztowy2[0]": (d) => d.witnesses?.[2]?.postalCode || "",
    "topmostSubform[0].Page5[0].Poczta2[0]": (d) => transliteratePolish(d.witnesses?.[2]?.city || ""),
    "topmostSubform[0].Page5[0].Nazwapaństwa2[0]": (d) => {
      const country = d.witnesses?.[2]?.country;
      return country ? transliteratePolish(country) : "";
    },
    
    // ========== STRONA 6 - ZAŁĄCZNIKI I PODPIS ==========
    // Załączniki (checkboxy)
    "topmostSubform[0].Page6[0].Załącznik1[0]": (d) => {
      const hasHospitalCard = d.attachments?.some(a => a.type === "hospital_card");
      return hasHospitalCard ? "true" : "";
    },
    "topmostSubform[0].Page6[0].Załącznik2[0]": (d) => {
      const hasProsecutor = d.attachments?.some(a => a.type === "prosecutor_decision");
      return hasProsecutor ? "true" : "";
    },
    "topmostSubform[0].Page6[0].Załącznik3[0]": (d) => {
      const hasDeathCert = d.attachments?.some(a => a.type === "death_certificate");
      return hasDeathCert ? "true" : "";
    },
    "topmostSubform[0].Page6[0].Załącznik4[0]": (d) => {
      const hasPowerOfAttorney = d.attachments?.some(a => a.type === "power_of_attorney");
      return hasPowerOfAttorney ? "true" : "";
    },
    "topmostSubform[0].Page6[0].Załącznik5[0]": (d) => {
      const hasOther = d.attachments?.some(a => a.type === "other");
      return hasOther ? "true" : "";
    },
    "topmostSubform[0].Page6[0].Załącznik5Opis[0]": (d) => {
      const otherAttachments = d.attachments?.filter(a => a.type === "other");
      if (otherAttachments && otherAttachments.length > 0) {
        return transliteratePolish(otherAttachments.map(a => a.description || "").join(", "));
      }
      return "";
    },
    
    // Sposób odbioru odpowiedzi
    "topmostSubform[0].Page6[0].wplacowce[0]": (d) => d.responseDeliveryMethod === "zus_office" ? "true" : "",
    "topmostSubform[0].Page6[0].poczta[0]": (d) => d.responseDeliveryMethod === "poczta" ? "true" : "",
    "topmostSubform[0].Page6[0].PUE[0]": (d) => d.responseDeliveryMethod === "pue_zus" ? "true" : "",
    "topmostSubform[0].Page6[0].osobaUpowazniona[0]": (d) => d.responseDeliveryMethod === "osoba_upowazniona" ? "true" : "",

    // Data zobowiązania dostarczenia dokumentów (sekcja "Do ... zobowiązuję się dostarczyć ...")
    "topmostSubform[0].Page6[0].Data[1]": (d) => formatDateForPDF(d.documentCommitmentDate || ""),
    
    // Data podpisu
    "topmostSubform[0].Page6[0].Data[0]": (d) => formatDateForPDF(d.signatureDate || new Date().toISOString().split('T')[0]),

    // Zobowiązanie do dostarczenia dokumentów (8 pozycji)
    "topmostSubform[0].Page6[0].Inne1[0]": (d) => transliteratePolish(d.documentCommitments?.[0] || ""),
    "topmostSubform[0].Page6[0].Inne2[0]": (d) => transliteratePolish(d.documentCommitments?.[1] || ""),
    "topmostSubform[0].Page6[0].Inne3[0]": (d) => transliteratePolish(d.documentCommitments?.[2] || ""),
    "topmostSubform[0].Page6[0].Inne4[0]": (d) => transliteratePolish(d.documentCommitments?.[3] || ""),
    "topmostSubform[0].Page6[0].Inne5[0]": (d) => transliteratePolish(d.documentCommitments?.[4] || ""),
    "topmostSubform[0].Page6[0].Inne6[0]": (d) => transliteratePolish(d.documentCommitments?.[5] || ""),
    "topmostSubform[0].Page6[0].Inne7[0]": (d) => transliteratePolish(d.documentCommitments?.[6] || ""),
    "topmostSubform[0].Page6[0].Inne8[0]": (d) => transliteratePolish(d.documentCommitments?.[7] || ""),
  };
  
  // Wypełnij pola formularza
  console.log("=== Rozpoczynam wypełnianie PDF ===");
  console.log("Liczba pól w formularzu:", fields.length);
  console.log("Liczba mapowań:", Object.keys(fieldMapping).length);
  console.log("Dane formularza:", JSON.stringify(formData, null, 2));
  console.log("documentCommitments:", formData.documentCommitments);
  console.log("documentCommitments length:", formData.documentCommitments?.length);
  
  // Wypisz wszystkie pola zawierające "Inne" (dla zobowiązań)
  const commitmentFields = fields.filter(f => {
    const name = f.getName().toLowerCase();
    return name.includes("inne") && /inne\d/.test(name);
  });
  if (commitmentFields.length > 0) {
    console.log("Znalezione pola związane z zobowiązaniami (Inne1-8):", commitmentFields.map(f => f.getName()));
  }
  
  let filledCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  // Utwórz mapę wszystkich nazw pól dla szybkiego wyszukiwania
  const allFieldNames = fields.map(f => f.getName());
  
  // Funkcja pomocnicza do znajdowania pól pasujących do wzorca
  const findMatchingField = (pattern: string): string | null => {
    const patternLower = pattern.toLowerCase();
    // Najpierw spróbuj dokładnego dopasowania
    if (allFieldNames.includes(pattern)) {
      return pattern;
    }
    // Spróbuj znaleźć pole zawierające wzorzec
    const matching = allFieldNames.find(name => 
      name.toLowerCase().includes(patternLower) || 
      patternLower.includes(name.toLowerCase())
    );
    return matching || null;
  };
  
  // Sprawdź, czy pola Inne1-8 istnieją w PDF
  for (let i = 1; i <= 8; i++) {
    const expectedName = `topmostSubform[0].Page6[0].Inne${i}[0]`;
    if (!allFieldNames.includes(expectedName)) {
      console.warn(`[WARN] Pole "${expectedName}" nie zostało znalezione w PDF. Sprawdź nazwę pola w szablonie.`);
    }
  }
  
  for (const field of fields) {
    const fieldName = field.getName();
    const fieldType = field.constructor.name;
    
    // Sprawdź czy pole jest w mapowaniu
    if (fieldMapping[fieldName]) {
      const value = fieldMapping[fieldName](formData);
      
      // Szczegółowe logowanie dla pól zobowiązań (Inne1-8)
      if (fieldName.toLowerCase().match(/inne\d/)) {
        console.log(`[DEBUG ZOBOWIAZANIE] Wypełnianie pola: "${fieldName}" (typ: ${fieldType}) = "${value}"`);
      }
      
      console.log(`Wypełnianie pola: "${fieldName}" (typ: ${fieldType}) = "${value}"`);
      
      try {
        // Sprawdź typ pola i wypełnij odpowiednio
        if (fieldType === "PDFTextField") {
          // Sprawdź maxLength pola i obetnij wartość jeśli potrzeba
          let maxLength: number | undefined;
          try {
            maxLength = (field as any).getMaxLength();
          } catch {
            // Niektóre pola mogą nie mieć maxLength
            maxLength = undefined;
          }
          
          let finalValue = value || "";
          
          if (maxLength && finalValue.length > maxLength) {
            console.warn(`[WARN] Wartosc dla pola "${fieldName}" jest za dluga (${finalValue.length} > ${maxLength}), obcinam...`);
            finalValue = finalValue.slice(0, maxLength);
          }
          
          // Upewnij się, że wartość nie zawiera polskich znaków (już powinna być przetworzona przez transliteratePolish)
          // Ale na wszelki wypadek sprawdź jeszcze raz
          try {
            (field as any).setText(finalValue);
            filledCount++;
            console.log(`[OK] Wypelniono pole tekstowe: "${fieldName}" = "${finalValue}"`);
          } catch (encodingError: any) {
            // Jeśli błąd kodowania, spróbuj jeszcze raz z transliteracją
            if (encodingError.message && encodingError.message.includes("cannot encode")) {
              console.warn(`[WARN] Blad kodowania dla pola "${fieldName}", probuje transliteracji...`);
              const transliterated = transliteratePolish(finalValue);
              try {
                (field as any).setText(transliterated);
                filledCount++;
                console.log(`[OK] Wypelniono pole tekstowe (po transliteracji): "${fieldName}" = "${transliterated}"`);
              } catch (retryError) {
                console.error(`[ERROR] Nie udalo sie wypelnic pola "${fieldName}" nawet po transliteracji:`, retryError);
                errorCount++;
              }
            } else {
              throw encodingError;
            }
          }
        } else if (fieldType === "PDFCheckBox") {
          // Dla checkboxów - zaznacz jeśli wartość to "true"
          if (value === "true") {
            (field as any).check();
            filledCount++;
            console.log(`[OK] Zaznaczono checkbox: "${fieldName}"`);
          } else {
            (field as any).uncheck();
            console.log(`[SKIP] Odznaczono checkbox: "${fieldName}"`);
          }
        } else if (fieldType === "PDFDropdown") {
          // Dla list rozwijanych - ustaw wartość
          try {
            (field as any).select(value);
            filledCount++;
            console.log(`[OK] Ustawiono dropdown: "${fieldName}"`);
          } catch (err) {
            console.warn(`[WARN] Nie mozna ustawic wartosci "${value}" dla pola "${fieldName}":`, err);
            errorCount++;
          }
        } else {
          console.warn(`[WARN] Nieznany typ pola: ${fieldType} dla "${fieldName}"`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`[ERROR] Blad podczas wypelniania pola "${fieldName}":`, error);
        errorCount++;
      }
    } else {
      skippedCount++;
      // Loguj wszystkie pola zawierające "Inne" (dla zobowiązań), nawet jeśli nie są w mapowaniu
      const fieldNameLower = fieldName.toLowerCase();
      if (fieldNameLower.match(/inne\d/)) {
        console.log(`[DEBUG] Pole związane z zobowiązaniami (nie w mapowaniu): "${fieldName}" (typ: ${fieldType})`);
      }
      // Loguj tylko pierwsze 10 nieznalezionych pól, żeby nie zaśmiecać konsoli
      if (skippedCount <= 10) {
        console.log(`[SKIP] Pominięto pole (brak w mapowaniu): "${fieldName}" (typ: ${fieldType})`);
      }
    }
  }
  
  console.log("=== Podsumowanie wypelniania ===");
  console.log(`Wypelniono: ${filledCount} pol`);
  console.log(`Pominięto: ${skippedCount} pol`);
  console.log(`Błędy: ${errorCount} pol`);
  
  // Zwróć wypełniony PDF jako Uint8Array
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Wypełnia szablon zawiadomienia o wypadku
 */
export async function fillNotificationTemplate(
  formData: Partial<AccidentReport>
): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), "public", "templates", "zawiadomienie-wypadek.pdf");
  return fillPDFTemplate(templatePath, formData);
}

/**
 * Wypełnia szablon zapisu wyjaśnień poszkodowanego
 * UWAGA: Plik nie jest jeszcze dostępny
 */
export async function fillStatementTemplate(
  formData: Partial<AccidentReport>
): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), "public", "templates", "zapis-wyjasnien.pdf");
  
  // Sprawdź czy plik istnieje
  try {
    await fs.promises.access(templatePath);
  } catch {
    throw new Error("Szablon zapisu wyjaśnień (zapis-wyjasnien.pdf) nie został jeszcze dodany do projektu. Umieść plik w folderze public/templates/");
  }
  
  return fillPDFTemplate(templatePath, formData);
}

/**
 * Pobiera listę dostępnych pól w szablonie PDF (do debugowania)
 */
export async function getPDFFormFields(templatePath: string): Promise<Array<{ name: string; type: string }>> {
  const templateBytes = await fs.promises.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  return fields.map((field) => ({
    name: field.getName(),
    type: field.constructor.name,
  }));
}

