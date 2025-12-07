"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AttachmentInfo } from "@/types";

interface Krok9ZalacznikiProps {
  onNext: (
    attachments: AttachmentInfo[], 
    responseDeliveryMethod: "zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona", 
    signatureDate: string,
    documentCommitments?: string[],
    documentCommitmentDate?: string
  ) => void;
  onPrevious: () => void;
  initialAttachments?: AttachmentInfo[];
  initialResponseDeliveryMethod?: "zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona";
  initialSignatureDate?: string;
  initialDocumentCommitments?: string[];
  initialDocumentCommitmentDate?: string;
  isWyjasnienia?: boolean; // Flaga wskazująca, czy to formularz wyjaśnień
}

export const Krok9Zalaczniki: React.FC<Krok9ZalacznikiProps> = React.memo(({
  onNext,
  onPrevious,
  initialAttachments = [],
  initialResponseDeliveryMethod,
  initialSignatureDate,
  initialDocumentCommitments,
  initialDocumentCommitmentDate,
  isWyjasnienia = false,
}) => {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>(initialAttachments);
  const [responseDeliveryMethod, setResponseDeliveryMethod] = useState<"zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona" | undefined>(
    initialResponseDeliveryMethod
  );
  const [signatureDate, setSignatureDate] = useState(
    initialSignatureDate || new Date().toISOString().split('T')[0]
  );
  const [otherDescription, setOtherDescription] = useState(
    initialAttachments.find(a => a.type === "other")?.description || ""
  );
  // Zobowiązanie do dostarczenia dokumentów - dynamiczne pola tekstowe (max 8)
  const [documentCommitments, setDocumentCommitments] = useState<string[]>(
    initialDocumentCommitments || []
  );
  const [documentCommitmentDate, setDocumentCommitmentDate] = useState(
    initialDocumentCommitmentDate || ""
  );

  const handleAttachmentChange = (type: AttachmentInfo["type"], checked: boolean) => {
    if (checked) {
      // Dodaj załącznik jeśli nie istnieje
      if (!attachments.find(a => a.type === type)) {
        setAttachments([...attachments, { type, description: type === "other" ? otherDescription : undefined }]);
      }
    } else {
      // Usuń załącznik
      setAttachments(attachments.filter(a => a.type !== type));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zaktualizuj opis dla "other" jeśli jest zaznaczone
    const updatedAttachments = attachments.map(a => 
      a.type === "other" ? { ...a, description: otherDescription } : a
    );
    
    if (!responseDeliveryMethod) {
      alert("Wybierz sposób odbioru odpowiedzi");
      return;
    }
    
    // Przekaż pełną tablicę (max 8 elementów), zachowując indeksy dla mapowania do PDF
    // Wypełnij do 8 elementów pustymi stringami jeśli potrzeba
    const fullCommitments = [...documentCommitments];
    while (fullCommitments.length < 8) {
      fullCommitments.push("");
    }
    // Obetnij do 8 elementów jeśli jest więcej
    const finalCommitments = fullCommitments.slice(0, 8);
    
    console.log("Przekazywane documentCommitments:", finalCommitments);
    onNext(updatedAttachments, responseDeliveryMethod, signatureDate, finalCommitments, documentCommitmentDate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Załączniki i sposób odbioru odpowiedzi
        </h3>

        {/* Załączniki */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">
              {isWyjasnienia ? "Załączniki do zapisu wyjaśnień" : "Załączniki do zawiadomienia"}
            </h4>
            <p className="text-sm text-gray-600">
              {isWyjasnienia 
                ? "Jeśli masz dodatkowe dokumenty związane z wyjaśnieniami, możesz je tutaj opisać"
                : "Zaznacz, które dokumenty dołączasz do zawiadomienia o wypadku"}
            </p>

            <div className="space-y-3">
              {!isWyjasnienia && (
                <>
                  <div className="w-full">
                    <Checkbox
                      label="Kserokopia karty informacyjnej ze szpitala / zaświadczenia o udzieleniu pierwszej pomocy z pogotowia ratunkowego wraz z wywiadem"
                      checked={attachments.some(a => a.type === "hospital_card")}
                      onCheckedChange={(checked) => handleAttachmentChange("hospital_card", checked || false)}
                    />
                  </div>
                  
                  <div className="w-full">
                    <Checkbox
                      label="Kserokopia postanowienia prokuratury o wszczęciu postępowania karnego lub zawieszeniu/umorzeniu postępowania"
                      checked={attachments.some(a => a.type === "prosecutor_decision")}
                      onCheckedChange={(checked) => handleAttachmentChange("prosecutor_decision", checked || false)}
                    />
                  </div>
                  
                  <div className="w-full">
                    <Checkbox
                      label="Kserokopia statystycznej karty zgonu lub zaświadczenie lekarskie stwierdzające przyczynę zgonu, skrócony odpis aktu zgonu (w przypadku wypadku ze skutkiem śmiertelnym)"
                      checked={attachments.some(a => a.type === "death_certificate")}
                      onCheckedChange={(checked) => handleAttachmentChange("death_certificate", checked || false)}
                    />
                  </div>
                  
                  <div className="w-full">
                    <Checkbox
                      label="Dokumenty potwierdzające prawo do wydania karty wypadku osobie innej niż poszkodowany (m.in. skrócony odpis aktu urodzenia, skrócony odpis aktu małżeństwa, pełnomocnictwo)"
                      checked={attachments.some(a => a.type === "power_of_attorney")}
                      onCheckedChange={(checked) => handleAttachmentChange("power_of_attorney", checked || false)}
                    />
                  </div>
                </>
              )}
              
              <div className="w-full space-y-2">
                <Checkbox
                  label="Inne dokumenty"
                  checked={attachments.some(a => a.type === "other")}
                  onCheckedChange={(checked) => {
                    handleAttachmentChange("other", checked || false);
                  }}
                />
                {attachments.some(a => a.type === "other") && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opisz, jakie dokumenty dołączasz
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={isWyjasnienia 
                        ? "Np. dokumenty medyczne, notatki, zdjęcia, inne dokumenty związane z wyjaśnieniami dotyczącymi wypadku"
                        : "Np. dokumenty dotyczące udzielonej pomocy medycznej, umowa na wykonywaną usługę, faktura, rachunek, notatka z policji, ksero mandatu karnego itp."}
                      value={otherDescription}
                      onChange={(e) => {
                        setOtherDescription(e.target.value);
                        // Zaktualizuj opis w attachments
                        setAttachments(attachments.map(a => 
                          a.type === "other" ? { ...a, description: e.target.value } : a
                        ));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Zobowiązanie do dostarczenia dokumentów */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Zobowiązanie do dostarczenia dokumentów</h4>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Do</span>
              <div className="flex-1 max-w-xs">
                <Input
                  type="date"
                  value={documentCommitmentDate}
                  onChange={(e) => setDocumentCommitmentDate(e.target.value)}
                />
              </div>
              <span className="text-sm text-gray-600">
                zobowiązuję się dostarczyć następujące dokumenty:
              </span>
            </div>

            {documentCommitments.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Kliknij "Dodaj pozycję", aby dodać dokumenty, które zobowiązujesz się dostarczyć
              </p>
            )}
            <div className="space-y-3">
              {documentCommitments.map((text, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <Input
                      label={`Pozycja ${index + 1}`}
                      value={text}
                      onChange={(e) => {
                        const updated = [...documentCommitments];
                        updated[index] = e.target.value;
                        setDocumentCommitments(updated);
                      }}
                      placeholder="Wpisz nazwę dokumentu, który zobowiązujesz się dostarczyć"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = documentCommitments.filter((_, i) => i !== index);
                      setDocumentCommitments(updated);
                    }}
                    className="flex-shrink-0 mt-7"
                  >
                    Usuń
                  </Button>
                </div>
              ))}

              {documentCommitments.length < 8 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDocumentCommitments([...documentCommitments, ""]);
                  }}
                  className="w-full"
                >
                  + Dodaj pozycję
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Sposób odbioru odpowiedzi */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Sposób odbioru odpowiedzi</h4>
            <p className="text-sm text-gray-600">
              Wybierz, w jaki sposób chcesz otrzymać odpowiedź od ZUS
            </p>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="responseDeliveryMethod"
                  value="zus_office"
                  checked={responseDeliveryMethod === "zus_office"}
                  onChange={(e) => setResponseDeliveryMethod(e.target.value as "zus_office")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  w placówce ZUS (osobiście lub przez osobę upoważnioną)
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="responseDeliveryMethod"
                  value="poczta"
                  checked={responseDeliveryMethod === "poczta"}
                  onChange={(e) => setResponseDeliveryMethod(e.target.value as "poczta")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  pocztą na adres wskazany we wniosku
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="responseDeliveryMethod"
                  value="pue_zus"
                  checked={responseDeliveryMethod === "pue_zus"}
                  onChange={(e) => setResponseDeliveryMethod(e.target.value as "pue_zus")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  na moim koncie na Platformie Usług Elektronicznych (PUE ZUS)
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Data podpisu */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Data podpisu</h4>
            <p className="text-sm text-gray-600">
              Data złożenia zawiadomienia (domyślnie dzisiejsza data)
            </p>
            
            <Input
              label="Data"
              type="date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              required
            />
            
            <p className="text-xs text-gray-500">
              Oświadczam, że dane zawarte w zawiadomieniu podaję zgodnie z prawdą, co potwierdzam złożonym podpisem.
            </p>
          </div>
        </Card>
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          ← Wstecz
        </Button>
        <Button type="submit" variant="primary">
          Dalej →
        </Button>
      </div>
    </form>
  );
});

Krok9Zalaczniki.displayName = "Krok9Zalaczniki";

