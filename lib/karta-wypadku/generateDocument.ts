import { KartaWypadku } from "@/types/karta-wypadku";

/**
 * Formatuje datę do formatu polskiego (DD.MM.YYYY)
 */
function formatDate(dateString: string): string {
  if (!dateString) return "";
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
 * Generuje dokument HTML zgodny z wzorem "KARTA WYPADKU"
 */
export function generateKartaWypadkuHTML(data: KartaWypadku): string {
  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KARTA WYPADKU</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 15px;
      padding: 5px;
      background-color: #f0f0f0;
      border: 1px solid #000;
    }
    
    .field {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    
    .field-label {
      font-weight: bold;
      margin-bottom: 3px;
    }
    
    .field-value {
      min-height: 20px;
      border-bottom: 1px solid #000;
      padding: 2px 0;
      margin-bottom: 8px;
    }
    
    .field-value-empty {
      min-height: 20px;
      border-bottom: 1px dotted #999;
      padding: 2px 0;
      margin-bottom: 8px;
    }
    
    .field-note {
      font-size: 9pt;
      font-style: italic;
      color: #666;
      margin-top: -5px;
      margin-bottom: 8px;
    }
    
    .inline-fields {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
    }
    
    .inline-field {
      flex: 1;
    }
    
    .witness-block {
      margin-left: 20px;
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #ddd;
    }
    
    .witness-number {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .multiline-field {
      min-height: 60px;
      border: 1px solid #000;
      padding: 5px;
      white-space: pre-wrap;
      margin-bottom: 8px;
    }
    
    .signature-line {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      margin-bottom: 10px;
    }
    
    .signature-field {
      flex: 1;
      border-bottom: 1px solid #000;
      min-height: 30px;
      margin: 0 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #666;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Nagłówek -->
  <div class="header">
    <div style="margin-bottom: 15px; text-align: left;">
      <div class="field-value" style="min-height: 40px;">
        ${data.nazwaIAdresPodmiotuSporzadzajacego || ""}
      </div>
    </div>
    <h1>KARTA WYPADKU</h1>
  </div>

  <!-- I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK -->
  <div class="section">
    <div class="section-title">I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK</div>
    <p class="field-note">
      Nie wypełniają podmioty niebędące płatnikami składek na ubezpieczenie wypadkowe.
    </p>
    
    <div class="field">
      <div class="field-label">1. Imię i nazwisko lub nazwa</div>
      <div class="field-value">${data.daneIdentyfikacyjnePlatnika.imieNazwiskoLubNazwa || ""}</div>
    </div>
    
    <div class="field">
      <div class="field-label">2. Adres siedziby</div>
      <div class="multiline-field">${data.daneIdentyfikacyjnePlatnika.adresSiedziby || ""}</div>
    </div>
    
    <div class="field">
      <div class="field-label">3. NIP REGON PESEL</div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.nip || ""}</div>
          <div class="field-note" style="font-size: 8pt;">NIP</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.regon || ""}</div>
          <div class="field-note" style="font-size: 8pt;">REGON</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.pesel || ""}</div>
          <div class="field-note" style="font-size: 8pt;">PESEL</div>
        </div>
      </div>
    </div>
    
    ${data.daneIdentyfikacyjnePlatnika.dokumentTozsamosci ? `
    <div class="field">
      <div class="field-label">Dokument tożsamości (dowód osobisty lub paszport)</div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.dokumentTozsamosci.rodzaj || ""}</div>
          <div class="field-note" style="font-size: 8pt;">rodzaj dokumentu</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.dokumentTozsamosci.seria || ""}</div>
          <div class="field-note" style="font-size: 8pt;">seria</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePlatnika.dokumentTozsamosci.numer || ""}</div>
          <div class="field-note" style="font-size: 8pt;">numer</div>
        </div>
      </div>
    </div>
    ` : ""}
  </div>

  <!-- II. DANE IDENTYFIKACYJNE POSZKODOWANEGO -->
  <div class="section">
    <div class="section-title">II. DANE IDENTYFIKACYJNE POSZKODOWANEGO</div>
    
    <div class="field">
      <div class="field-label">1. Imię i nazwisko poszkodowanego</div>
      <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.imieNazwisko || ""}</div>
    </div>
    
    <div class="field">
      <div class="field-label">2. PESEL</div>
      <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.pesel || ""}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Dokument tożsamości (dowód osobisty lub paszport)</div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.rodzaj || ""}</div>
          <div class="field-note" style="font-size: 8pt;">rodzaj dokumentu</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.seria || ""}</div>
          <div class="field-note" style="font-size: 8pt;">seria</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.numer || ""}</div>
          <div class="field-note" style="font-size: 8pt;">numer</div>
        </div>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">3. Data i miejsce urodzenia</div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${formatDate(data.daneIdentyfikacyjnePoszkodowanego.dataUrodzenia)}</div>
          <div class="field-note" style="font-size: 8pt;">data</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.daneIdentyfikacyjnePoszkodowanego.miejsceUrodzenia || ""}</div>
          <div class="field-note" style="font-size: 8pt;">miejsce</div>
        </div>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">4. Adres zamieszkania</div>
      <div class="multiline-field">${data.daneIdentyfikacyjnePoszkodowanego.adresZamieszkania || ""}</div>
    </div>
    
    <div class="field">
      <div class="field-label">5. Tytuł ubezpieczenia wypadkowego</div>
      <p class="field-note">
        Wymienić numer pozycji i pełny tytuł ubezpieczenia społecznego, zgodnie z art. 3 ust. 3 albo art. 3a ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)
      </p>
      <div class="multiline-field">${data.daneIdentyfikacyjnePoszkodowanego.tytulUbezpieczeniaWypadkowego || ""}</div>
    </div>
  </div>

  <!-- III. INFORMACJE O WYPADKU -->
  <div class="section">
    <div class="section-title">III. INFORMACJE O WYPADKU</div>
    
    <div class="field">
      <div class="field-label">1. Data zgłoszenia oraz imię i nazwisko osoby zgłaszającej wypadek</div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${formatDate(data.informacjeOWypadku.dataZgloszenia)}</div>
          <div class="field-note" style="font-size: 8pt;">data zgłoszenia</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${data.informacjeOWypadku.imieNazwiskoOsobyZglaszajacej || ""}</div>
          <div class="field-note" style="font-size: 8pt;">imię i nazwisko</div>
        </div>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">2. Informacje dotyczące okoliczności, przyczyn, czasu i miejsca wypadku, rodzaju i umiejscowienia urazu</div>
      <div class="multiline-field">${data.informacjeOWypadku.informacjeOWypadku || ""}</div>
    </div>
    
    ${data.informacjeOWypadku.swiadkowie && data.informacjeOWypadku.swiadkowie.length > 0 ? `
    <div class="field">
      <div class="field-label">3. Świadkowie wypadku:</div>
      ${data.informacjeOWypadku.swiadkowie.map((swiadek, index) => `
        <div class="witness-block">
          <div class="witness-number">${index + 1})</div>
          <div class="field">
            <div class="field-value">${swiadek.imieNazwisko || ""}</div>
            <div class="field-note" style="font-size: 8pt;">imię i nazwisko</div>
          </div>
          <div class="field">
            <div class="field-value">${swiadek.miejsceZamieszkania || ""}</div>
            <div class="field-note" style="font-size: 8pt;">miejsce zamieszkania</div>
          </div>
        </div>
      `).join("")}
    </div>
    ` : ""}
    
    <div class="field">
      <div class="field-label">
        4. Wypadek ${data.informacjeOWypadku.czyJestWypadkiemPrzyPracy === "jest" ? "<strong>jest</strong>" : "nie jest"} 
        ${data.informacjeOWypadku.czyJestWypadkiemPrzyPracy === "nie_jest" ? "<strong>nie jest</strong>" : ""} 
        wypadkiem przy pracy określonym w art. 3 ust. 3 pkt ${data.informacjeOWypadku.art3Ust3Pkt || "........."} 
        ${data.informacjeOWypadku.czyArt3a ? "/ albo art. 3a" : ""} 
        ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych
      </div>
      <p class="field-note">Niepotrzebne skreślić.</p>
      ${data.informacjeOWypadku.uzasadnienieNieUznano ? `
      <div class="multiline-field">${data.informacjeOWypadku.uzasadnienieNieUznano}</div>
      <p class="field-note">Uzasadnienie i wskazanie dowodów, jeżeli zdarzenia nie uznano za wypadek przy pracy</p>
      ` : ""}
    </div>
    
    ${data.informacjeOWypadku.wykluczajacaPrzyczynaNaruszenie ? `
    <div class="field">
      <div class="field-label">
        5. Stwierdzono, że wyłączną przyczyną wypadku było udowodnione naruszenie przez poszkodowanego przepisów dotyczących ochrony życia i zdrowia, spowodowane przez niego umyślnie lub wskutek rażącego niedbalstwa (wskazać dowody)
      </div>
      <div class="multiline-field">${data.informacjeOWypadku.wykluczajacaPrzyczynaNaruszenie}</div>
    </div>
    ` : ""}
    
    ${data.informacjeOWypadku.przyczynienieSieNietrzezwosc ? `
    <div class="field">
      <div class="field-label">
        6. Stwierdzono, że poszkodowany, będąc w stanie nietrzeźwości lub pod wpływem środków odurzających lub substancji psychotropowych, przyczynił się w znacznym stopniu do spowodowania wypadku (wskazać dowody, a w przypadku odmowy przez poszkodowanego poddania się badaniu na zawartość tych substancji w organizmie - zamieścić informację o tym fakcie)
      </div>
      <div class="multiline-field">${data.informacjeOWypadku.przyczynienieSieNietrzezwosc}</div>
    </div>
    ` : ""}
  </div>

  <!-- IV. POZOSTAŁE INFORMACJE -->
  <div class="section">
    <div class="section-title">IV. POZOSTAŁE INFORMACJE</div>
    
    <div class="field">
      <div class="field-label">
        1. Poszkodowanego (członka rodziny) zapoznano z treścią karty wypadku i pouczono o prawie zgłaszania uwag i zastrzeżeń do ustaleń zawartych w karcie wypadku
      </div>
      <div class="inline-fields">
        <div class="inline-field">
          <div class="field-value">${data.pozostaleInformacje.zapoznanieZTrecia.imieNazwisko || ""}</div>
          <div class="field-note" style="font-size: 8pt;">imię i nazwisko poszkodowanego (członka rodziny)</div>
        </div>
        <div class="inline-field">
          <div class="field-value">${formatDate(data.pozostaleInformacje.zapoznanieZTrecia.data)}</div>
          <div class="field-note" style="font-size: 8pt;">data</div>
        </div>
      </div>
      <div class="signature-line">
        <div class="signature-field">${data.pozostaleInformacje.zapoznanieZTrecia.podpis || ""}</div>
        <div style="font-size: 8pt; margin-top: 5px;">podpis</div>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">2. Kartę wypadku sporządzono w dniu</div>
      <div class="field-value">${formatDate(data.pozostaleInformacje.dataSporzadzenia)}</div>
      <div style="margin-top: 10px;">
        <div class="field-value" style="margin-bottom: 5px;">${data.pozostaleInformacje.nazwaPodmiotuSporzadzajacego || ""}</div>
        <div class="field-note" style="font-size: 8pt;">1) nazwa podmiotu obowiązanego do sporządzenia karty wypadku</div>
        ${data.pozostaleInformacje.dodatkowePole ? `
        <div class="field-value" style="margin-top: 10px; margin-bottom: 5px;">${data.pozostaleInformacje.dodatkowePole}</div>
        <div class="field-note" style="font-size: 8pt;">2)</div>
        ` : ""}
      </div>
    </div>
    
    ${data.pozostaleInformacje.przeszkodyTrudnosci ? `
    <div class="field">
      <div class="field-label">
        3. Przeszkody i trudności uniemożliwiające sporządzenie karty wypadku w wymaganym terminie 14 dni
      </div>
      <div class="multiline-field">${data.pozostaleInformacje.przeszkodyTrudnosci}</div>
    </div>
    ` : ""}
    
    ${data.pozostaleInformacje.dataOdbioru ? `
    <div class="field">
      <div class="field-label">4. Kartę wypadku odebrano w dniu</div>
      <div class="field-value">${formatDate(data.pozostaleInformacje.dataOdbioru)}</div>
      <div class="signature-line">
        <div class="signature-field">${data.pozostaleInformacje.podpisUprawnionego || ""}</div>
        <div style="font-size: 8pt; margin-top: 5px;">podpis uprawnionego</div>
      </div>
    </div>
    ` : ""}
    
    ${data.pozostaleInformacje.zalaczniki && data.pozostaleInformacje.zalaczniki.length > 0 ? `
    <div class="field">
      <div class="field-label">5. Załączniki:</div>
      <div class="multiline-field">${data.pozostaleInformacje.zalaczniki.join("\n")}</div>
    </div>
    ` : ""}
  </div>

  <div class="footer">
    <p>Dokument wygenerowany: ${new Date().toLocaleString("pl-PL")}</p>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generuje PDF z danych Karty Wypadku używając jsPDF i html2canvas
 * UWAGA: Ta funkcja działa tylko w przeglądarce (client-side)
 */
export async function generateKartaWypadkuPDF(
  data: KartaWypadku
): Promise<Blob> {
  // Dynamiczny import bibliotek (tylko w przeglądarce)
  if (typeof window === "undefined") {
    throw new Error("generateKartaWypadkuPDF może być wywołana tylko w przeglądarce");
  }

  const { default: jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const html = generateKartaWypadkuHTML(data);
  
  // Utwórz tymczasowy element w DOM
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.width = "210mm"; // A4 width
  document.body.appendChild(tempDiv);

  try {
    // Konwertuj HTML na canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794, // A4 width in pixels at 96 DPI
      windowWidth: 794,
    });

    // Utwórz PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Dodaj pierwszą stronę
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Dodaj kolejne strony jeśli potrzeba
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Usuń tymczasowy element
    document.body.removeChild(tempDiv);

    // Zwróć PDF jako Blob
    return pdf.output("blob");
  } catch (error) {
    // Usuń tymczasowy element w przypadku błędu
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    throw error;
  }
}

