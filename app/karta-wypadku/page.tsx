"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormularzKartyWypadku } from "@/components/karta-wypadku/FormularzKartyWypadku";
import { KartaWypadku } from "@/types/karta-wypadku";
import { Button } from "@/components/ui/button";

function KartaWypadkuContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [formData, setFormData] = useState<Partial<KartaWypadku>>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSubmit = async (data: KartaWypadku) => {
    setIsGenerating(true);
    try {
      // Opcja 1: Generuj HTML
      const response = await fetch("/api/karta-wypadku/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `karta-wypadku-${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Błąd podczas generowania dokumentu");
      }

      // Opcja 2: Generuj PDF (wymaga importu funkcji po stronie klienta)
      // const { generateKartaWypadkuPDF } = await import("@/lib/karta-wypadku/generateDocument");
      // const pdfBlob = await generateKartaWypadkuPDF(data);
      // const url = window.URL.createObjectURL(pdfBlob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = `karta-wypadku-${new Date().toISOString().split("T")[0]}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Wystąpił błąd podczas generowania dokumentu");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (data: Partial<KartaWypadku>) => {
    setFormData(data);
    // Można zapisać do localStorage lub wysłać do API
    localStorage.setItem("karta-wypadku-draft", JSON.stringify(data));
  };

  // Wczytaj dane z AI jeśli jest caseId
  useEffect(() => {
    const loadDataFromAI = async () => {
      if (caseId) {
        setIsLoading(true);
        setLoadError(null);
        try {
          const response = await fetch(`/api/karta-wypadku/get-data?caseId=${caseId}`);
          if (!response.ok) {
            const error = await response.json();
            setLoadError(error.error || "Nie udało się wczytać danych z AI");
            return;
          }
          const result = await response.json();
          if (result.success && result.data) {
            setFormData(result.data);
            // Zapisz do localStorage jako szkic
            localStorage.setItem("karta-wypadku-draft", JSON.stringify(result.data));
          }
        } catch (error) {
          console.error("Error loading data from AI:", error);
          setLoadError("Wystąpił błąd podczas wczytywania danych");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Wczytaj szkic z localStorage jeśli nie ma caseId
        const saved = localStorage.getItem("karta-wypadku-draft");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
          } catch (e) {
            console.error("Error loading draft:", e);
          }
        }
      }
    };

    loadDataFromAI();
  }, [caseId]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          KARTA WYPADKU
        </h1>
        <p className="text-gray-600">
          {caseId
            ? "Formularz wypełniony na podstawie analizy AI. Sprawdź i uzupełnij brakujące dane."
            : "Wypełnij formularz zgodnie z oficjalnym wzorem ZUS"}
        </p>
        {caseId && (
          <p className="text-sm text-blue-600 mt-1">
            Sprawa: {caseId}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-700">Wczytywanie danych z analizy AI...</p>
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{loadError}</p>
          <p className="text-sm text-red-600 mt-2">
            Możesz kontynuować wypełnianie formularza ręcznie.
          </p>
        </div>
      )}

      {!isLoading && (
        <FormularzKartyWypadku
          initialData={formData}
          onSubmit={handleSubmit}
          onSave={handleSave}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg">Generowanie dokumentu...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KartaWypadkuPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-700">Ładowanie...</p>
        </div>
      </div>
    }>
      <KartaWypadkuContent />
    </Suspense>
  );
}

