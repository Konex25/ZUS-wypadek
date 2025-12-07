"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginModal } from "@/components/admin/LoginModal";
import { AccidentReport } from "@/types";

function SummaryPageContent() {
  const router = useRouter();
  const { isAuthenticated, login, isMounted } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [legalQualification, setLegalQualification] = useState<any>(null);
  const [documentDifferences, setDocumentDifferences] = useState<any>(null);
  const [opinionData, setOpinionData] = useState<any>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

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
  }; // Load all data from sessionStorage and save case
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAndSaveCase = async () => {
      try {
        // Load all data
        const formDataStr = sessionStorage.getItem("formDataFromAnalysis");
        if (formDataStr) {
          const data = JSON.parse(formDataStr);
          setFormData(data);
        }

        const analysisResultStr = sessionStorage.getItem("analysisResult");
        if (analysisResultStr) {
          const result = JSON.parse(analysisResultStr);
          setAnalysisResult(result);
        }

        const qualificationStr = sessionStorage.getItem("legalQualification");
        if (qualificationStr) {
          const qualification = JSON.parse(qualificationStr);
          setLegalQualification(qualification);
        }

        const differencesStr = sessionStorage.getItem("documentDifferences");
        if (differencesStr) {
          const differences = JSON.parse(differencesStr);
          setDocumentDifferences(differences);
        }

        const opinionDataStr = sessionStorage.getItem("opinionData");
        if (opinionDataStr) {
          const opinion = JSON.parse(opinionDataStr);
          setOpinionData(opinion);
        } // Check if case already exists
        const existingCaseId = sessionStorage.getItem("currentCaseId");
        if (existingCaseId) {
          setCaseId(existingCaseId);
          setLoading(false);
          return;
        }

        // Save case to backend
        setSaving(true);
        const response = await fetch("/api/cases/save-from-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: formDataStr ? JSON.parse(formDataStr) : {},
            analysisResult: analysisResultStr
              ? JSON.parse(analysisResultStr)
              : null,
            legalQualification: qualificationStr
              ? JSON.parse(qualificationStr)
              : null,
            documentDifferences: differencesStr
              ? JSON.parse(differencesStr)
              : null,
            opinionData: opinionDataStr ? JSON.parse(opinionDataStr) : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Nie udało się zapisać sprawy");
        }

        const result = await response.json();
        setCaseId(result.caseId);
        sessionStorage.setItem("currentCaseId", result.caseId);
      } catch (error: any) {
        console.error("Error loading/saving case:", error);
        alert(error.message || "Nie udało się zapisać sprawy");
      } finally {
        setSaving(false);
        setLoading(false);
      }
    };

    loadAndSaveCase();
  }, [isAuthenticated]);

  const handleDecision = async (
    decision: "ACCEPTED" | "FAILED" | "NEED_MORE_INFO"
  ) => {
    if (!caseId) {
      alert("Brak ID sprawy");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Nie udało się zaktualizować decyzji"
        );
      } // Redirect to cases list
      router.push("/admin");
    } catch (error: any) {
      console.error("Error updating decision:", error);
      alert(error.message || "Nie udało się zaktualizować decyzji");
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateCard = () => {
    if (!caseId) {
      alert("Brak ID sprawy");
      return;
    }

    // Redirect to karta-wypadku page with caseId
    router.push(`/karta-wypadku?caseId=${caseId}`);
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

  if (loading || saving) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">
            {saving ? "Zapisywanie sprawy..." : "Ładowanie danych..."}
          </p>
        </div>    </div>
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
                Podsumowanie sprawy
              </h1>
              <p className="text-slate-600">
                Przejrzyj wszystkie zebrane dane i podejmij decyzję dotyczącą
                sprawy
              </p>
              {caseId && (
                <p className="text-sm text-blue-600 mt-2">
                  ID sprawy: {caseId}
                </p>
              )}
            </div>
          </div>

          {/* Personal Data Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Dane osobowe poszkodowanego
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Imię i nazwisko:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.personalData?.firstName}{" "}
                  {formData.personalData?.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  PESEL:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.personalData?.pesel || "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Data urodzenia:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.personalData?.dateOfBirth || "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Telefon:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.personalData?.phone || "Brak danych"}
                </p>
              </div>
            </div>{" "}
          </div>

          {/* Accident Data Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Dane o wypadku
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Data wypadku:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.accidentData?.accidentDate || "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Miejsce wypadku:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.accidentData?.accidentPlace || "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Opis okoliczności:
                </span>
                <p className="text-slate-900 mt-1">
                  {formData.accidentData?.detailedCircumstancesDescription ||
                    formData.accidentData?.accidentPlace ||
                    "Brak danych"}
                </p>
              </div>
            </div>
          </div>

          {/* Business Data Summary */}
          {formData.businessData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Dane działalności{" "}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.businessData.nip && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">
                      NIP:
                    </span>
                    <p className="text-slate-900 mt-1">
                      {formData.businessData.nip}
                    </p>
                  </div>
                )}
                {formData.businessData.regon && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">
                      REGON:
                    </span>
                    <p className="text-slate-900 mt-1">
                      {formData.businessData.regon}
                    </p>
                  </div>
                )}
                {formData.businessData.pkdCodes &&
                  formData.businessData.pkdCodes.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-slate-600">
                        Kody PKD:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {formData.businessData.pkdCodes.map((pkd, index) => (
                          <li key={index} className="text-slate-900">
                            {pkd.code}
                            {pkd.description ? ` - ${pkd.description}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}
          {/* Legal Qualification Summary */}
          {legalQualification && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Kwalifikacja prawna
              </h2>
              <div
                className={`p-4 rounded-lg border-2 mb-4 ${
                  legalQualification.shouldAccept
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={`font-semibold ${
                    legalQualification.shouldAccept
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {legalQualification.shouldAccept
                    ? "Wniosek powinien zostać przyjęty"
                    : "Wniosek nie powinien zostać przyjęty"}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    legalQualification.shouldAccept
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {legalQualification.shortExplanation}
                </p>
              </div>
              <div>
                {" "}
                <span className="text-sm font-medium text-slate-600">
                  Prawdopodobieństwo zgodności z PKD:
                </span>
                <p className="text-slate-900 mt-1">
                  {Math.min(
                    legalQualification.pkdProbability > 1
                      ? legalQualification.pkdProbability
                      : legalQualification.pkdProbability * 100,
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          )}

          {/* Document Differences Summary */}
          {documentDifferences &&
            documentDifferences.differences &&
            documentDifferences.differences.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Różnice w dokumentach
                </h2>
                <div
                  className={`p-4 rounded-lg border-2 mb-4 ${
                    documentDifferences.isInGeneralConsistent
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      documentDifferences.isInGeneralConsistent
                        ? "text-green-900"
                        : "text-amber-900"
                    }`}
                  >
                    {documentDifferences.isInGeneralConsistent
                      ? "Dokumenty są spójne"
                      : "Wykryto niespójności w dokumentach"}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      documentDifferences.isInGeneralConsistent
                        ? "text-green-800"
                        : "text-amber-800"
                    }`}
                  >
                    {documentDifferences.summary}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">
                    Liczba wykrytych różnic:
                  </span>
                  <p className="text-slate-900 mt-1">
                    {documentDifferences.differences.length}
                  </p>
                </div>
              </div>
            )}

          {/* Decision Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Podejmij decyzję
            </h2>
            <p className="text-slate-600 mb-6">
              Na podstawie zebranych danych i analizy, podejmij decyzję
              dotyczącą sprawy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleDecision("ACCEPTED")}
                disabled={updating || !caseId}
                className="px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Zapisuję...
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Potwierdź
                  </>
                )}
              </button>

              <button
                onClick={() => handleDecision("FAILED")}
                disabled={updating || !caseId}
                className="px-6 py-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Zapisuję...
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Odrzuć
                  </>
                )}
              </button>

              <button
                onClick={() => handleDecision("NEED_MORE_INFO")}
                disabled={updating || !caseId}
                className="px-6 py-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Zapisuję...
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Potrzeba więcej informacji
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleGenerateCard}
              disabled={!caseId || isGeneratingCard}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGeneratingCard ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generowanie...
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generuj kartę wypadku
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={  <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }
  >
    <SummaryPageContent />
  </Suspense>
);
}