import { AccidentReport, VictimStatement } from "@/types";

/**
 * Formatuje datę do formatu polskiego (DD.MM.YYYY)
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString || "";
  }
}

/**
 * Formatuje wartość boolean na tekst
 */
function formatBoolean(value: boolean | undefined): string {
  if (value === true) return "Tak";
  if (value === false) return "Nie";
  return "";
}

/**
 * Formatuje tablicę na tekst
 */
function formatArray(value: string[] | undefined): string {
  if (!value || value.length === 0) return "";
  return value.join(", ");
}

/**
 * Escapuje HTML, aby uniknąć problemów z bezpieczeństwem i formatowaniem
 */
function escapeHtml(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

/**
 * Generuje dokument HTML dla zapisu wyjaśnień poszkodowanego
 */
export function generateWyjasnieniaHTML(formData: Partial<AccidentReport>): string {
  const personalData = formData.personalData;
  const victimStatement = formData.victimStatement;
  const accidentData = formData.accidentData;
  
  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zapis wyjaśnień poszkodowanego</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.75;
      color: #1a1a1a;
      margin: 0;
      padding: 70px 60px;
      background-color: #ffffff;
      max-width: 100%;
    }
    
    .header {
      text-align: center;
      margin-bottom: 35px;
      margin-top: 20px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    }
    
    .header h1 {
      font-size: 20pt;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #1e293b;
    }
    
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 18px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left: 4px solid #2563eb;
      border-right: 1px solid #bfdbfe;
      border-top: 1px solid #bfdbfe;
      border-bottom: 1px solid #bfdbfe;
      text-align: center;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.12);
      border-radius: 3px;
      color: #1e40af;
    }
    
    .field {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .field-label {
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 11pt;
      color: #1e40af;
      display: block;
      letter-spacing: 0.2px;
    }
    
    .field-value {
      min-height: 28px;
      border-bottom: 2px solid #3b82f6;
      padding: 6px 0;
      margin-bottom: 10px;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #1e293b;
      font-size: 11pt;
    }
    
    .field-value-empty {
      min-height: 28px;
      border-bottom: 1px dotted #cbd5e1;
      padding: 6px 0;
      margin-bottom: 10px;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 8px,
        #f1f5f9 8px,
        #f1f5f9 16px
      );
    }
    
    .multiline-field {
      min-height: 100px;
      border: 2px solid #3b82f6;
      border-radius: 4px;
      padding: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 10px;
      background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
      color: #1e293b;
      line-height: 1.8;
      font-size: 11pt;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);
    }
    
    .inline-fields {
      display: flex;
      gap: 25px;
      margin-bottom: 15px;
    }
    
    .inline-field {
      flex: 1;
    }
    
    .field-note {
      font-size: 9.5pt;
      font-style: italic;
      color: #64748b;
      margin-top: -3px;
      margin-bottom: 10px;
    }
    
    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .checkbox-box {
      width: 16px;
      height: 16px;
      border: 2px solid #3b82f6;
      display: inline-block;
      text-align: center;
      line-height: 16px;
      font-weight: bold;
      border-radius: 2px;
      background-color: #eff6ff;
    }
    
    .signature-line {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      margin-bottom: 15px;
      align-items: flex-end;
      padding-top: 25px;
      border-top: 2px solid #e2e8f0;
    }
    
    .signature-field {
      flex: 1;
      border-bottom: 2px solid #3b82f6;
      min-height: 50px;
      margin: 0 25px;
      position: relative;
    }
    
    .signature-label {
      text-align: center;
      font-size: 9.5pt;
      margin-top: 8px;
      color: #475569;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .date-field {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5pt;
      color: #94a3b8;
      font-style: italic;
    }
    
    /* Ulepszenia dla lepszej czytelności */
    .section > .field:last-child {
      margin-bottom: 0;
    }
    
    .multiline-field strong {
      color: #1e40af;
      font-weight: 700;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 2px 5px;
      border-radius: 2px;
      display: inline-block;
      margin-right: 3px;
    }
    
    /* Lepsze formatowanie list i akapitów */
    .multiline-field br {
      line-height: 1.4;
    }
    
    /* Zapobieganie złamaniom w nieodpowiednich miejscach */
    .field-label,
    .section-title {
      page-break-after: avoid;
    }
    
    .multiline-field {
      page-break-inside: avoid;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .section {
        page-break-inside: avoid;
        orphans: 3;
        widows: 3;
      }
      
      .header {
        page-break-after: avoid;
      }
      
      .signature-line {
        page-break-inside: avoid;
        page-break-before: auto;
      }
      
      .field {
        orphans: 2;
        widows: 2;
      }
    }
  </style>
</head>
<body>
  <!-- Nagłówek -->
  <div class="header">
    <h1>Zapis wyjaśnień poszkodowanego</h1>
  </div>

  <!-- Dane poszkodowanego -->
  <div class="section">
    <div class="section-title">DANE POSZKODOWANEGO</div>
    
    <div class="field">
      <div class="field-label">Imię i nazwisko:</div>
      <div class="field-value">${personalData?.firstName && personalData?.lastName 
        ? `${personalData.firstName} ${personalData.lastName}` 
        : ""}</div>
    </div>
    
    <div class="inline-fields">
      <div class="inline-field">
        <div class="field-label">PESEL:</div>
        <div class="field-value">${personalData?.pesel || ""}</div>
      </div>
      <div class="inline-field">
        <div class="field-label">Data urodzenia:</div>
        <div class="field-value">${formatDate(personalData?.dateOfBirth)}</div>
      </div>
    </div>
    
    <div class="field">
      <div class="field-label">Miejsce urodzenia:</div>
      <div class="field-value">${personalData?.placeOfBirth || ""}</div>
    </div>
    
    ${formData.addresses?.residentialAddress ? `
    <div class="field">
      <div class="field-label">Adres zamieszkania:</div>
      <div class="field-value">${
        `${formData.addresses.residentialAddress.street || ""} ${formData.addresses.residentialAddress.houseNumber || ""}${formData.addresses.residentialAddress.apartmentNumber ? `/${formData.addresses.residentialAddress.apartmentNumber}` : ""}, ${formData.addresses.residentialAddress.postalCode || ""} ${formData.addresses.residentialAddress.city || ""}`.trim()
      }</div>
    </div>
    ` : ""}
    
    ${personalData?.phone ? `
    <div class="field">
      <div class="field-label">Numer telefonu:</div>
      <div class="field-value">${personalData.phone}</div>
    </div>
    ` : ""}
  </div>

  <!-- Informacje o wypadku -->
  ${accidentData ? `
  <div class="section">
    <div class="section-title">INFORMACJE O WYPADKU</div>
    
    <div class="inline-fields">
      <div class="inline-field">
        <div class="field-label">Data wypadku:</div>
        <div class="field-value">${formatDate(accidentData.accidentDate)}</div>
      </div>
      ${accidentData.accidentTime ? `
      <div class="inline-field">
        <div class="field-label">Godzina wypadku:</div>
        <div class="field-value">${accidentData.accidentTime}</div>
      </div>
      ` : ""}
    </div>
    
    ${accidentData.accidentPlace ? `
    <div class="field">
      <div class="field-label">Miejsce wypadku:</div>
      <div class="field-value">${accidentData.accidentPlace}</div>
    </div>
    ` : ""}
  </div>
  ` : ""}

  <!-- Wyjaśnienia poszkodowanego -->
  ${victimStatement ? `
  <div class="section">
    <div class="section-title">WYJAŚNIENIA POSZKODOWANEGO</div>
    
    ${victimStatement.activityTypeBeforeAccident ? `
    <div class="field">
      <div class="field-label">1. Rodzaj czynności przed wypadkiem:</div>
      <div class="multiline-field">${escapeHtml(victimStatement.activityTypeBeforeAccident)}</div>
    </div>
    ` : ""}
    
    ${victimStatement.accidentCircumstances ? `
    <div class="field">
      <div class="field-label">2. Okoliczności wypadku:</div>
      <div class="multiline-field">${escapeHtml(victimStatement.accidentCircumstances)}</div>
    </div>
    ` : ""}
    
    ${victimStatement.accidentCauses ? `
    <div class="field">
      <div class="field-label">3. Przyczyny wypadku:</div>
      <div class="multiline-field">${escapeHtml(victimStatement.accidentCauses)}</div>
    </div>
    ` : ""}
    
    <!-- Maszyny i narzędzia -->
    ${victimStatement.machineryTools ? `
    <div class="field">
      <div class="field-label">4. Maszyny i narzędzia używane podczas wypadku:</div>
      ${victimStatement.machineryTools.applicable ? `
      <div class="multiline-field">
        ${victimStatement.machineryTools.name ? `<strong>Nazwa:</strong> ${escapeHtml(victimStatement.machineryTools.name)}<br>` : ""}
        ${victimStatement.machineryTools.type ? `<strong>Typ:</strong> ${escapeHtml(victimStatement.machineryTools.type)}<br>` : ""}
        ${victimStatement.machineryTools.productionDate ? `<strong>Data produkcji:</strong> ${formatDate(victimStatement.machineryTools.productionDate)}<br>` : ""}
        ${victimStatement.machineryTools.operational !== undefined ? `<strong>Sprawne:</strong> ${formatBoolean(victimStatement.machineryTools.operational)}<br>` : ""}
        ${victimStatement.machineryTools.compliantWithManufacturer !== undefined ? `<strong>Zgodne z zasadami producenta:</strong> ${formatBoolean(victimStatement.machineryTools.compliantWithManufacturer)}<br>` : ""}
        ${victimStatement.machineryTools.usageMethod ? `<strong>Sposób użycia:</strong> ${escapeHtml(victimStatement.machineryTools.usageMethod)}` : ""}
      </div>
      ` : `
      <div class="field-value">Nie dotyczy</div>
      `}
    </div>
    ` : ""}
    
    <!-- Środki ochrony -->
    ${victimStatement.protectiveMeasures ? `
    <div class="field">
      <div class="field-label">5. Środki ochrony osobistej:</div>
      ${victimStatement.protectiveMeasures.used ? `
      <div class="multiline-field">
        ${victimStatement.protectiveMeasures.type ? `<strong>Rodzaj:</strong> ${escapeHtml(formatArray(victimStatement.protectiveMeasures.type))}<br>` : ""}
        ${victimStatement.protectiveMeasures.appropriate !== undefined ? `<strong>Właściwe:</strong> ${formatBoolean(victimStatement.protectiveMeasures.appropriate)}<br>` : ""}
        ${victimStatement.protectiveMeasures.operational !== undefined ? `<strong>Sprawne:</strong> ${formatBoolean(victimStatement.protectiveMeasures.operational)}` : ""}
      </div>
      ` : `
      <div class="field-value">Nie stosowane</div>
      `}
    </div>
    ` : ""}
    
    <!-- BHP -->
    ${victimStatement.healthAndSafety ? `
    <div class="field">
      <div class="field-label">6. Przestrzeganie zasad BHP:</div>
      ${victimStatement.healthAndSafety.complied ? `
      <div class="multiline-field">
        ${victimStatement.healthAndSafety.preparation !== undefined ? `<strong>Posiadałem przygotowanie do wykonywania zadań:</strong> ${formatBoolean(victimStatement.healthAndSafety.preparation)}<br>` : ""}
        ${victimStatement.healthAndSafety.healthAndSafetyTraining !== undefined ? `<strong>Posiadałem szkolenia BHP:</strong> ${formatBoolean(victimStatement.healthAndSafety.healthAndSafetyTraining)}<br>` : ""}
        ${victimStatement.healthAndSafety.occupationalRiskAssessment !== undefined ? `<strong>Posiadałem ocenę ryzyka zawodowego:</strong> ${formatBoolean(victimStatement.healthAndSafety.occupationalRiskAssessment)}<br>` : ""}
        ${victimStatement.healthAndSafety.riskReductionMeasures ? `<strong>Środki zmniejszające ryzyko:</strong> ${escapeHtml(victimStatement.healthAndSafety.riskReductionMeasures)}` : ""}
      </div>
      ` : `
      <div class="field-value">Nie przestrzegane</div>
      `}
    </div>
    ` : ""}
    
    <!-- Pierwsza pomoc -->
    ${victimStatement.firstAid ? `
    <div class="field">
      <div class="field-label">7. Pierwsza pomoc:</div>
      ${victimStatement.firstAid.provided ? `
      <div class="multiline-field">
        ${victimStatement.firstAid.when ? `<strong>Kiedy udzielono:</strong> ${escapeHtml(victimStatement.firstAid.when)}<br>` : ""}
        ${victimStatement.firstAid.where ? `<strong>Gdzie udzielono:</strong> ${escapeHtml(victimStatement.firstAid.where)}<br>` : ""}
        ${victimStatement.firstAid.facilityName ? `<strong>Nazwa placówki:</strong> ${escapeHtml(victimStatement.firstAid.facilityName)}<br>` : ""}
        ${victimStatement.firstAid.hospitalizationPeriod ? `<strong>Okres hospitalizacji:</strong> ${escapeHtml(victimStatement.firstAid.hospitalizationPeriod)}<br>` : ""}
        ${victimStatement.firstAid.hospitalizationPlace ? `<strong>Miejsce hospitalizacji:</strong> ${escapeHtml(victimStatement.firstAid.hospitalizationPlace)}<br>` : ""}
        ${victimStatement.firstAid.recognizedInjury ? `<strong>Uraz rozpoznany:</strong> ${escapeHtml(victimStatement.firstAid.recognizedInjury)}<br>` : ""}
        ${victimStatement.firstAid.incapacityPeriod ? `<strong>Okres niezdolności do pracy:</strong> ${escapeHtml(victimStatement.firstAid.incapacityPeriod)}` : ""}
      </div>
      ` : `
      <div class="field-value">Nie udzielono</div>
      `}
    </div>
    ` : ""}
    
    <!-- Zwolnienie lekarskie -->
    ${victimStatement.sickLeave ? `
    <div class="field">
      <div class="field-label">8. Zwolnienie lekarskie:</div>
      ${victimStatement.sickLeave.onAccidentDay ? `
      <div class="multiline-field">
        ${victimStatement.sickLeave.description ? `<strong>Opis:</strong> ${escapeHtml(victimStatement.sickLeave.description)}` : ""}
      </div>
      ` : `
      <div class="field-value">Nie przebywałem na zwolnieniu lekarskim w dniu wypadku</div>
      `}
    </div>
    ` : ""}
    
    <!-- Stan trzeźwości -->
    ${victimStatement.sobrietyState ? `
    <div class="field">
      <div class="field-label">9. Stan trzeźwości:</div>
      <div class="multiline-field">
        ${victimStatement.sobrietyState.intoxication !== undefined ? `<strong>Nietrzeźwość:</strong> ${formatBoolean(victimStatement.sobrietyState.intoxication)}\n` : ""}
        ${victimStatement.sobrietyState.drugs !== undefined ? `<strong>Środki odurzające:</strong> ${formatBoolean(victimStatement.sobrietyState.drugs)}\n` : ""}
        ${victimStatement.sobrietyState.examinationOnAccidentDay ? `
        ${victimStatement.sobrietyState.examinationOnAccidentDay.conducted !== undefined ? `<strong>Badanie przeprowadzone:</strong> ${formatBoolean(victimStatement.sobrietyState.examinationOnAccidentDay.conducted)}<br>` : ""}
        ${victimStatement.sobrietyState.examinationOnAccidentDay.byWhom ? `<strong>Przez kogo:</strong> ${escapeHtml(victimStatement.sobrietyState.examinationOnAccidentDay.byWhom)}` : ""}
        ` : ""}
      </div>
    </div>
    ` : ""}
    
    <!-- Organy kontroli -->
    ${victimStatement.controlAuthorities ? `
    <div class="field">
      <div class="field-label">10. Postępowanie organów kontroli:</div>
      ${victimStatement.controlAuthorities.actionsTaken ? `
      <div class="multiline-field">
        ${victimStatement.controlAuthorities.authorityName ? `<strong>Nazwa organu:</strong> ${escapeHtml(victimStatement.controlAuthorities.authorityName)}<br>` : ""}
        ${victimStatement.controlAuthorities.address ? `<strong>Adres:</strong> ${escapeHtml(victimStatement.controlAuthorities.address)}<br>` : ""}
        ${victimStatement.controlAuthorities.caseNumber ? `<strong>Numer sprawy:</strong> ${escapeHtml(victimStatement.controlAuthorities.caseNumber)}<br>` : ""}
        ${victimStatement.controlAuthorities.status ? `<strong>Status:</strong> ${escapeHtml(victimStatement.controlAuthorities.status)}` : ""}
      </div>
      ` : `
      <div class="field-value">Brak postępowania</div>
      `}
    </div>
    ` : ""}
  </div>
  ` : ""}

  <!-- Podpis -->
  <div class="signature-line">
    <div style="flex: 1;">
      <div class="signature-field"></div>
      <div class="signature-label">Podpis poszkodowanego</div>
    </div>
    <div style="flex: 1;">
      <div class="signature-field"></div>
      <div class="signature-label">Data</div>
    </div>
  </div>

  <div class="date-field" style="margin-top: 20px; font-size: 9pt; color: #666;">
    Dokument wygenerowany: ${new Date().toLocaleString("pl-PL")}
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generuje PDF z wyjaśnień poszkodowanego używając jsPDF i html2canvas
 * UWAGA: Ta funkcja działa tylko w przeglądarce (client-side)
 */
export async function generateWyjasnieniaPDF(
  formData: Partial<AccidentReport>
): Promise<Blob> {
  // Dynamiczny import bibliotek (tylko w przeglądarce)
  if (typeof window === "undefined") {
    throw new Error("generateWyjasnieniaPDF może być wywołana tylko w przeglądarce");
  }

  const { default: jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const html = generateWyjasnieniaHTML(formData);
  
  // Utwórz tymczasowy element w DOM
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.width = "210mm"; // A4 width
  tempDiv.style.backgroundColor = "#ffffff";
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
