import { PDFDocument, rgb, PDFPage, PDFFont, StandardFonts } from "pdf-lib";
import { Case } from "@/types";

/**
 * Transliterate Polish characters to ASCII and remove all non-ASCII characters
 * This function ensures compatibility with WinAnsi encoding
 */
function toAscii(text: string): string {
  if (!text) return '';
  
  return text
    // First, normalize Unicode (decompose characters, e.g., é -> e + ́)
    .normalize('NFD')
    // Remove combining diacritical marks (accents, etc.) - Unicode range 0x0300-0x036F
    .replace(/[\u0300-\u036F]/g, '')
    // Remove control characters (newlines, tabs, etc.) - replace with space
    .replace(/[\r\n\t]/g, ' ')
    // Remove other control characters (0x00-0x1F, 0x7F)
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Polish characters - transliterate to ASCII
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    // Special dashes
    .replace(/[\u2011\u2013\u2014\u2212]/g, '-')
    // Special quotes
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Special spaces
    .replace(/[\u00A0\u202F]/g, ' ')
    // Ellipsis
    .replace(/\u2026/g, '...')
    // Remove any remaining non-ASCII characters (keep only 0x20-0x7E)
    .replace(/[^\x20-\x7E]/g, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Word wrap text to fit within a given width
 */
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text) return [];
  
  const safeText = toAscii(text);
  const words = safeText.split(" ").filter(w => w.length > 0);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    // Double-check that testLine is safe (extra safety)
    const safeTestLine = toAscii(testLine);
    
    try {
      const testWidth = font.widthOfTextAtSize(safeTestLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = safeTestLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = toAscii(word);
      }
    } catch (error) {
      // If there's still an encoding error, skip this word
      console.warn(`Skipping word due to encoding error: ${word}`, error);
      continue;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Draw section header
 */
function drawSectionHeader(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  boldFont: PDFFont
): number {
  const margin = 50;
  const pageWidth = page.getWidth();

  page.drawRectangle({
    x: margin,
    y: y - 5,
    width: pageWidth - margin * 2,
    height: 20,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(toAscii(text), {
    x: margin + 5,
    y: y,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  return y - 25;
}

/**
 * Draw labeled field
 */
function drawField(
  page: PDFPage,
  label: string,
  value: string,
  y: number,
  font: PDFFont,
  boldFont: PDFFont,
  options?: { indent?: number; multiline?: boolean }
): number {
  const margin = 50;
  const pageWidth = page.getWidth();
  const indent = options?.indent || 0;
  const maxWidth = pageWidth - margin * 2 - indent - 10;

  page.drawText(toAscii(label), {
    x: margin + indent,
    y,
    size: 9,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  const valueText = toAscii(value || "-");
  
  if (options?.multiline) {
    const lines = wrapText(valueText, font, 10, maxWidth);
    let currentY = y - 12;
    
    for (const line of lines) {
      page.drawText(line, {
        x: margin + indent,
        y: currentY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      currentY -= 14;
    }
    
    return currentY - 5;
  } else {
    page.drawText(valueText, {
      x: margin + indent,
      y: y - 12,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    return y - 30;
  }
}

/**
 * Generate accident card number
 */
function generateCardNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KW/${year}/${month}/${random}`;
}

/**
 * Format date to Polish format
 */
function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate accident card PDF from case data
 */
export async function generateAccidentCard(caseData: Case): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Use standard fonts (ASCII only)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595; // A4
  const pageHeight = 842;
  const margin = 50;

  const opinion = caseData.aiOpinion;
  const cardNumber = generateCardNumber();
  const today = new Date().toISOString().split("T")[0];

  // ========== PAGE 1 ==========
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  page.drawText("KARTA WYPADKU", {
    x: pageWidth / 2 - 80,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText(toAscii("(wzor zgodny z rozporzadzeniem Ministra Rodziny i Polityki Spolecznej"), {
    x: pageWidth / 2 - 200,
    y,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 10;
  page.drawText("z dnia 23 stycznia 2022 r., Dz. U. z 2022 r. poz. 223)", {
    x: pageWidth / 2 - 140,
    y,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 25;

  // Card number and date
  page.drawText(`Nr karty: ${cardNumber}`, {
    x: margin,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText(toAscii(`Data sporzadzenia: ${formatDate(today)}`), {
    x: pageWidth - margin - 180,
    y,
    size: 10,
    font,
  });
  y -= 30;

  // Section I - Payer data
  y = drawSectionHeader(page, "I. DANE IDENTYFIKACYJNE PLATNIKA SKLADEK", y, font, boldFont);
  
  y = drawField(page, "1. Imie i nazwisko lub nazwa:", "Zaklad Ubezpieczen Spolecznych", y, font, boldFont);
  y = drawField(page, "2. Adres siedziby:", "ul. Szamocka 3, 5, 01-748 Warszawa", y, font, boldFont);
  y = drawField(page, "3. NIP / REGON / PESEL:", "521-301-72-28 / 017756865", y, font, boldFont);
  y -= 10;

  // Section II - Victim data
  y = drawSectionHeader(page, "II. DANE IDENTYFIKACYJNE POSZKODOWANEGO", y, font, boldFont);
  
  y = drawField(page, "1. Imie i nazwisko:", opinion?.description ? "Dane z dokumentow" : "-", y, font, boldFont);
  y = drawField(page, "2. PESEL:", "-", y, font, boldFont);
  y = drawField(page, "3. Data i miejsce urodzenia:", "-", y, font, boldFont);
  y = drawField(page, "4. Adres zamieszkania:", "-", y, font, boldFont);
  y = drawField(page, "5. Tytul ubezpieczenia wypadkowego:", 
    "art. 3 ust. 3 pkt 8 ustawy - osoba prowadzaca pozarolnicza dzialalnosc gospodarcza", 
    y, font, boldFont, { multiline: true });
  y -= 10;

  // Section III - Accident information
  y = drawSectionHeader(page, "III. INFORMACJE O WYPADKU", y, font, boldFont);

  y = drawField(page, "1. Data zgloszenia wypadku:", formatDate(caseData.createdAt), y, font, boldFont);
  y = drawField(page, "2. Okolicznosci i przyczyny wypadku:", "", y, font, boldFont);
  
  // Detailed description
  if (opinion?.description) {
    const descLines = wrapText(opinion.description, font, 9, pageWidth - margin * 2 - 20);
    for (const line of descLines) {
      if (y < 100) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, {
        x: margin + 10,
        y,
        size: 9,
        font,
      });
      y -= 12;
    }
  }
  y -= 10;

  // Check if we need a new page
  if (y < 300) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  y = drawField(page, "3. Przyczyny wypadku:", "", y, font, boldFont);
  if (opinion?.causes) {
    const causeLines = wrapText(opinion.causes, font, 9, pageWidth - margin * 2 - 20);
    for (const line of causeLines) {
      if (y < 100) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, {
        x: margin + 10,
        y,
        size: 9,
        font,
      });
      y -= 12;
    }
  }
  y -= 10;

  y = drawField(page, "4. Czas wypadku:", opinion?.date ? formatDate(opinion.date) : "-", y, font, boldFont);
  y = drawField(page, "5. Miejsce wypadku:", opinion?.place || "-", y, font, boldFont);
  
  // Check if we need a new page
  if (y < 250) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  // Witnesses
  y = drawField(page, "6. Swiadkowie wypadku:", "Brak informacji o swiadkach w dokumentacji", y, font, boldFont);
  y -= 10;

  // Decision section
  y = drawSectionHeader(page, "KWALIFIKACJA PRAWNA ZDARZENIA", y, font, boldFont);

  const isAccident = opinion?.decision === "ACCEPTED";
  const decisionText = isAccident 
    ? "TAK - zdarzenie jest wypadkiem przy pracy"
    : opinion?.decision === "REJECTED"
    ? "NIE - zdarzenie nie jest wypadkiem przy pracy"
    : "WYMAGA DODATKOWYCH WYJASNIEN";

  y = drawField(page, "Czy wypadek jest wypadkiem przy pracy?", decisionText, y, font, boldFont);

  if (isAccident) {
    y = drawField(page, "Podstawa prawna:", 
      "art. 3 ust. 3 pkt 8 ustawy z dnia 30 pazdziernika 2002 r. o ubezpieczeniu spolecznym z tytulu wypadkow przy pracy i chorob zawodowych", 
      y, font, boldFont, { multiline: true });
  }
  y -= 10;

  // Check if we need a new page for justifications
  if (y < 300) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  // Justifications
  y = drawSectionHeader(page, "UZASADNIENIE", y, font, boldFont);

  if (opinion?.justifications && opinion.justifications.length > 0) {
    for (const justification of opinion.justifications) {
      if (y < 150) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      // Title
      page.drawText(toAscii(justification.title), {
        x: margin,
        y,
        size: 10,
        font: boldFont,
      });
      y -= 15;

      // Content
      const justLines = wrapText(justification.justification, font, 9, pageWidth - margin * 2);
      for (const line of justLines) {
        if (y < 80) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, {
          x: margin,
          y,
          size: 9,
          font,
        });
        y -= 12;
      }
      y -= 15;
    }
  }

  // ========== FINAL PAGE - Signatures ==========
  if (y < 200) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  y = drawSectionHeader(page, "IV. POZOSTALE INFORMACJE", y, font, boldFont);

  y = drawField(page, "1. Potwierdzenie zapoznania sie z trescia karty przez poszkodowanego:", "", y, font, boldFont);
  y = drawField(page, "   Imie i nazwisko:", "........................................", y, font, boldFont);
  y = drawField(page, "   Data:", "........................................", y, font, boldFont);
  y = drawField(page, "   Podpis:", "........................................", y, font, boldFont);
  y -= 20;

  y = drawField(page, "2. Karta wypadku sporzadzona w dniu:", formatDate(today), y, font, boldFont);
  y = drawField(page, "   Nazwa podmiotu sporzadzajacego:", "Zaklad Ubezpieczen Spolecznych", y, font, boldFont);
  y = drawField(page, "   Imie i nazwisko sporzadzajacego:", "........................................", y, font, boldFont);
  y = drawField(page, "   Podpis:", "........................................", y, font, boldFont);
  y -= 20;

  y = drawField(page, "3. Przeszkody w sporzadzeniu karty w terminie 14 dni:", 
    caseData.status === "error" ? "Wystapily bledy podczas przetwarzania dokumentow" : "Nie wystapily", 
    y, font, boldFont);
  y -= 20;

  y = drawField(page, "4. Data odbioru karty przez uprawnionego:", "........................................", y, font, boldFont);
  y = drawField(page, "   Podpis:", "........................................", y, font, boldFont);
  y -= 20;

  y = drawField(page, "5. Zalaczniki:", toAscii(`Dokumenty sprawy: ${caseData.documents.map(d => d.fileName).join(", ")}`), y, font, boldFont, { multiline: true });

  // Footer
  const footerY = 30;
  page.drawLine({
    start: { x: margin, y: footerY + 10 },
    end: { x: pageWidth - margin, y: footerY + 10 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  
  page.drawText(toAscii(`Karta wypadku nr ${cardNumber} | Wygenerowano: ${new Date().toLocaleString("pl-PL")}`), {
    x: margin,
    y: footerY,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(`Strona ${pdfDoc.getPageCount()} z ${pdfDoc.getPageCount()}`, {
    x: pageWidth - margin - 80,
    y: footerY,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
