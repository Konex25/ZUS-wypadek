"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AttachmentInfo } from "@/types";

interface Krok9ZalacznikiProps {
  onNext: (
    attachments: AttachmentInfo[], 
    responseDeliveryMethod: "zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona", 
    signatureDate: string,
    documentCommitments?: boolean[]
  ) => void;
  onPrevious: () => void;
  initialAttachments?: AttachmentInfo[];
  initialResponseDeliveryMethod?: "zus_office" | "pue_zus" | "poczta" | "osoba_upowazniona";
  initialSignatureDate?: string;
  initialDocumentCommitments?: boolean[];
}

export const Krok9Zalaczniki: React.FC<Krok9ZalacznikiProps> = React.memo(({
  onNext,
  onPrevious,
  initialAttachments = [],
  initialResponseDeliveryMethod,
  initialSignatureDate,
  initialDocumentCommitments,
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
  // Zobowiązanie do dostarczenia dokumentów - 8 pozycji
  const [documentCommitments, setDocumentCommitments] = useState<boolean[]>(
    initialDocumentCommitments || [false, false, false, false, false, false, false, false]
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
    
    onNext(updatedAttachments, responseDeliveryMethod, signatureDate, documentCommitments);
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
            <h4 className="font-medium text-gray-900">Załączniki do zawiadomienia</h4>
            <p className="text-sm text-gray-600">
              Zaznacz, które dokumenty dołączasz do zawiadomienia o wypadku
            </p>

            <div className="space-y-3">
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
              
              <div className="space-y-2">
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
                      placeholder="Np. dokumenty dotyczące udzielonej pomocy medycznej, umowa na wykonywaną usługę, faktura, rachunek, notatka z policji, ksero mandatu karnego itp."
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
            <h4 className="font-medium text-gray-900">Zobowiązanie do dostarczenia dokumentów</h4>
            <p className="text-sm text-gray-600">
              Zaznacz dokumenty, które zobowiązujesz się dostarczyć
            </p>

            <div className="space-y-3">
              <Checkbox
                label="Pozycja 1: Kserokopia karty informacyjnej ze szpitala / dokumentów pierwszej pomocy"
                checked={documentCommitments[0]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[0] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 2: Dokumenty z prokuratury"
                checked={documentCommitments[1]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[1] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 3: Dokumenty dotyczące zgonu (jeśli dotyczy)"
                checked={documentCommitments[2]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[2] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 4: Dokumenty potwierdzające prawo do wydania karty wypadku innej osobie"
                checked={documentCommitments[3]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[3] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 5: Inne dokumenty"
                checked={documentCommitments[4]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[4] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 6: Dokumenty potwierdzające wykonywanie czynności związanych z działalnością"
                checked={documentCommitments[5]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[5] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 7: Kopia licencji lub koncesji (jeśli wymagana)"
                checked={documentCommitments[6]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[6] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
              <Checkbox
                label="Pozycja 8: Notatka służbowa policji drogowej (w przypadku wypadku komunikacyjnego)"
                checked={documentCommitments[7]}
                onCheckedChange={(checked) => {
                  const updated = [...documentCommitments];
                  updated[7] = checked || false;
                  setDocumentCommitments(updated);
                }}
              />
            </div>
          </div>
        </Card>

        {/* Sposób odbioru odpowiedzi */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sposób odbioru odpowiedzi</h4>
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
                  W placówce ZUS
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
                  Pocztą
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
                  Na adres z PUE
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="responseDeliveryMethod"
                  value="osoba_upowazniona"
                  checked={responseDeliveryMethod === "osoba_upowazniona"}
                  onChange={(e) => setResponseDeliveryMethod(e.target.value as "osoba_upowazniona")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  Przez osobę upoważnioną
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Data podpisu */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Data podpisu</h4>
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

