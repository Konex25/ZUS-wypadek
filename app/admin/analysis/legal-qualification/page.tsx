"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginModal } from "@/components/admin/LoginModal";
import { AccidentReport } from "@/types";

function LegalQualificationPageContent() {
  const router = useRouter();
  const { isAuthenticated, login, isMounted } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualificationResult, setQualificationResult] = useState<{
    shouldAccept: boolean;
    shortExplanation: string;
    pkdProbability: number;
    detailedJustification: string;
    notes: string;
  } | null>(null);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isMounted, isAuthenticated]);

  const handleLogin = (password: string) => {
    const success = login(password);
    if (success) {
      setShowLoginModal(false);
    }
    return success;
  };

  // Load form data and opinion data from sessionStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const formDataStr = sessionStorage.getItem("formDataFromAnalysis");
      if (formDataStr) {
        const data = JSON.parse(formDataStr);
        setFormData(data);
      }

      // Load existing qualification result if available
      const qualificationStr = sessionStorage.getItem("legalQualification");
      if (qualificationStr) {
        const qualification = JSON.parse(qualificationStr);
        setQualificationResult(qualification);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handlePerformLegalQualification = async () => {
    setIsAnalyzing(true);

    try {
      // Load opinion data
      const opinionDataStr = sessionStorage.getItem("opinionData");
      let doctorOpinion = undefined;
      if (opinionDataStr) {
        const opinionData = JSON.parse(opinionDataStr);
        if (opinionData.injuriesMatchDefinition !== null) {
          doctorOpinion = {
            injuriesMatchDefinition: opinionData.injuriesMatchDefinition,
            comment: opinionData.injuriesMatchDefinitionComment || undefined,
          };
        }
      }

      // Prepare data for legal qualification
      const accidentDescription =
        formData.accidentData?.detailedCircumstancesDescription ||
        formData.accidentData?.accidentPlace ||
        "";
      const activitiesPerformed =
        (formData.accidentData?.workRelation as any)?.description || "";
      const pkdCodes = formData.businessData?.pkdCodes || [];

      const requestBody = {
        accidentDescription,
        activitiesPerformed,
        pkdCodes,
        doctorOpinion,
      };

      const response = await fetch("/api/analysis/legal-qualification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Nie udało się przeprowadzić kwalifikacji prawnej");
      }

      const result = await response.json();
      setQualificationResult(result);

      // Save qualification result to sessionStorage
      sessionStorage.setItem("legalQualification", JSON.stringify(result));
    } catch (error: any) {
      console.error("Error performing legal qualification:", error);
      alert(error.message || "Nie udało się przeprowadzić kwalifikacji prawnej");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueToForm = () => {
    if (!qualificationResult) {
      alert("Proszę najpierw przeprowadzić kwalifikację prawną");
      return;
    }

    // Redirect to form
    router.push("/asystent");
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
        onClose={() => router.push("/")}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Wróć
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Prawna kwalifikacja wypadku
              </h1>
              <p className="text-slate-600">
                Na podstawie całego zebranego materiału dowodowego dokonujemy prawnej
                kwalifikacji wypadku. Polega ona na ocenie, czy zdarzenie spełnia łącznie
                wszystkie warunki podane w definicji wypadku przy pracy.
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Warunki definicji wypadku przy pracy
            </h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>
                  <strong>Zdarzenie nagłe</strong> - wypadek był nagły (nastąpił nagle, nie
                  był długotrwałym procesem)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>
                  <strong>Przyczyna zewnętrzna</strong> - wypadek został spowodowany przez
                  przyczynę zewnętrzną (działanie siły zewnętrznej, czynnika zewnętrznego)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>
                  <strong>Uraz</strong> - doprowadziło do urazu (uszkodzenia ciała, choroby)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>
                  <strong>Okres ubezpieczenia</strong> - nastąpiło w okresie ubezpieczenia
                  wypadkowego z tytułu prowadzenia działalności pozarolniczej
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">5.</span>
                <span>
                  <strong>Zwykłe czynności</strong> - nastąpiło podczas wykonywania zwykłych
                  czynności związanych z działalnością
                </span>
              </li>
            </ul>
          </div>

          {/* Data Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Zebrane dane do analizy
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Opis wypadku:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.accidentData?.detailedCircumstancesDescription ||
                    formData.accidentData?.accidentPlace ||
                    "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Czynności wykonywane:
                </span>
                <p className="text-slate-900 mt-1">
                  {(formData.accidentData?.workRelation as any)?.description || "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Kody PKD:</span>
                <div className="mt-1">
                  {formData.businessData?.pkdCodes && formData.businessData.pkdCodes.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {formData.businessData.pkdCodes.map((pkd, index) => (
                        <li key={index} className="text-slate-900">
                          {pkd.code}
                          {pkd.description ? ` - ${pkd.description}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-900">Brak danych</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Qualification Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Przeprowadź kwalifikację prawną
            </h2>
            <p className="text-slate-600 mb-6">
              System przeanalizuje wszystkie zebrane dane i oceni, czy zdarzenie spełnia
              wszystkie warunki definicji wypadku przy pracy.
            </p>

            <button
              onClick={handlePerformLegalQualification}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analizowanie...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Przeprowadź kwalifikację prawną
                </>
              )}
            </button>

            {qualificationResult && (
              <div className="mt-6 space-y-4">
                {/* Result Summary */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    qualificationResult.shouldAccept
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        qualificationResult.shouldAccept
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {qualificationResult.shouldAccept ? (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg mb-2 ${
                          qualificationResult.shouldAccept
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        {qualificationResult.shouldAccept
                          ? "Wniosek powinien zostać przyjęty"
                          : "Wniosek nie powinien zostać przyjęty"}
                      </h3>
                      <p
                        className={`text-sm ${
                          qualificationResult.shouldAccept
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {qualificationResult.shortExplanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PKD Probability */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Prawdopodobieństwo zgodności z PKD
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {qualificationResult.pkdProbability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        qualificationResult.pkdProbability >= 70
                          ? "bg-green-500"
                          : qualificationResult.pkdProbability >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${qualificationResult.pkdProbability}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Justification */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Szczegółowe uzasadnienie
                  </h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {qualificationResult.detailedJustification}
                  </p>
                </div>

                {/* Notes */}
                {qualificationResult.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Uwagi i rekomendacje
                    </h4>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">
                      {qualificationResult.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Wróć
            </button>
            <button
              onClick={handleContinueToForm}
              disabled={!qualificationResult}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Przejdź do formularza
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LegalQualificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LegalQualificationPageContent />
    </Suspense>
  );
}

