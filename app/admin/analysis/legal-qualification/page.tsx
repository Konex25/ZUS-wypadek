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
  const [isCheckingDifferences, setIsCheckingDifferences] = useState(false);
  const [differencesResult, setDifferencesResult] = useState<{
    differences: Array<{
      field: string;
      details: string;
      documents: string[];
      severity?: string;
    }>;
    allDatesConsistent: boolean;
    allStatementsConsistent: boolean;
    allTimesConsistent?: boolean;
    summary: string;
    isInGeneralConsistent: boolean;
  } | null>(null);
  const [differencesError, setDifferencesError] = useState<string | null>(null);
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

      // Check if this is a new case (no currentCaseId means new case)
      const currentCaseId = sessionStorage.getItem("currentCaseId");
      if (!currentCaseId) {
        // New case - clear previous qualification and differences
        setQualificationResult(null);
        setDifferencesResult(null);
        sessionStorage.removeItem("legalQualification");
        sessionStorage.removeItem("documentDifferences");
      } else {
        // Existing case - load saved data
        const qualificationStr = sessionStorage.getItem("legalQualification");
        if (qualificationStr) {
          const qualification = JSON.parse(qualificationStr);
          setQualificationResult(qualification);
        }

        const differencesStr = sessionStorage.getItem("documentDifferences");
        if (differencesStr) {
          const differences = JSON.parse(differencesStr);
          setDifferencesResult(differences);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCheckDifferences = async () => {
    setIsCheckingDifferences(true);
    setDifferencesError(null);

    try {
      // Load analysis result if available
      const analysisResultStr = sessionStorage.getItem("analysisResult");
      let analysisResult = null;
      if (analysisResultStr) {
        analysisResult = JSON.parse(analysisResultStr);
      }

      const requestBody = {
        formData,
        analysisResult,
      };

      const response = await fetch("/api/analysis/document-differences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Nie udało się sprawdzić różnic między dokumentami"
        );
      }

      const result = await response.json();
      setDifferencesResult(result);

      // Save differences result to sessionStorage
      sessionStorage.setItem("documentDifferences", JSON.stringify(result));
    } catch (error: any) {
      console.error("Error checking differences:", error);
      setDifferencesError(
        error.message || "Nie udało się sprawdzić różnic między dokumentami"
      );
    } finally {
      setIsCheckingDifferences(false);
    }
  };

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

      // Prepare data for legal qualification - clean up descriptions (remove parentheses with field names)
      let accidentDescription =
        formData.accidentData?.detailedCircumstancesDescription ||
        formData.accidentData?.accidentPlace ||
        "";
      // Remove patterns like "(businessAddress)" or "(fieldName)" from description
      accidentDescription = accidentDescription
        .replace(/\s*\([^)]+\)/g, "")
        .trim();

      let activitiesPerformed =
        (formData.accidentData?.workRelation as any)?.description || "";
      // Remove patterns like "(fieldName)" from activities
      activitiesPerformed = activitiesPerformed
        .replace(/\s*\([^)]+\)/g, "")
        .trim();

      const pkdCodes = formData.businessData?.pkdCodes || [];

      // Load differences if available
      const differencesStr = sessionStorage.getItem("documentDifferences");
      let documentDifferences = null;
      if (differencesStr) {
        try {
          documentDifferences = JSON.parse(differencesStr);
        } catch (e) {
          console.error("Error parsing document differences:", e);
        }
      }

      const requestBody = {
        accidentDescription,
        activitiesPerformed,
        pkdCodes,
        doctorOpinion,
        documentDifferences,
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
        throw new Error(
          errorData.error || "Nie udało się przeprowadzić kwalifikacji prawnej"
        );
      }

      const result = await response.json();
      setQualificationResult(result);

      // Save qualification result to sessionStorage
      sessionStorage.setItem("legalQualification", JSON.stringify(result));
    } catch (error: any) {
      console.error("Error performing legal qualification:", error);
      alert(
        error.message || "Nie udało się przeprowadzić kwalifikacji prawnej"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueToSummary = () => {
    if (!qualificationResult) {
      alert("Proszę najpierw przeprowadzić kwalifikację prawną");
      return;
    }

    // Redirect to summary
    router.push("/admin/analysis/summary");
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
                Na podstawie całego zebranego materiału dowodowego dokonujemy
                prawnej kwalifikacji wypadku. Polega ona na ocenie, czy
                zdarzenie spełnia łącznie wszystkie warunki podane w definicji
                wypadku przy pracy.
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
                  <strong>Zdarzenie nagłe</strong> - wypadek był nagły (nastąpił
                  nagle, nie był długotrwałym procesem)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>
                  <strong>Przyczyna zewnętrzna</strong> - wypadek został
                  spowodowany przez przyczynę zewnętrzną (działanie siły
                  zewnętrznej, czynnika zewnętrznego)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>
                  <strong>Uraz</strong> - doprowadziło do urazu (uszkodzenia
                  ciała, choroby)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>
                  <strong>Okres ubezpieczenia</strong> - nastąpiło w okresie
                  ubezpieczenia wypadkowego z tytułu prowadzenia działalności
                  pozarolniczej
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">5.</span>
                <span>
                  <strong>Zwykłe czynności</strong> - nastąpiło podczas
                  wykonywania zwykłych czynności związanych z działalnością
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
                  {(formData.accidentData?.workRelation as any)?.description ||
                    "Brak danych"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">
                  Kody PKD:
                </span>
                <div className="mt-1">
                  {formData.businessData?.pkdCodes &&
                  formData.businessData.pkdCodes.length > 0 ? (
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

          {/* Document Differences Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Sprawdź różnice między dokumentami
            </h2>
            <p className="text-slate-600 mb-6">
              Przeanalizuj dokumenty pod kątem niespójności w godzinach, datach,
              relacjach świadków oraz innych szczegółach dotyczących wypadku.
            </p>

            <button
              onClick={handleCheckDifferences}
              disabled={isCheckingDifferences}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCheckingDifferences ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analizowanie różnic...
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Sprawdź różnice między dokumentami
                </>
              )}
            </button>

            {differencesError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{differencesError}</p>
              </div>
            )}

            {differencesResult && (
              <div className="mt-6 space-y-4">
                {/* Summary */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    differencesResult.isInGeneralConsistent
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        differencesResult.isInGeneralConsistent
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    >
                      {differencesResult.isInGeneralConsistent ? (
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg mb-2 ${
                          differencesResult.isInGeneralConsistent
                            ? "text-green-900"
                            : "text-amber-900"
                        }`}
                      >
                        {differencesResult.isInGeneralConsistent
                          ? "Dokumenty są spójne"
                          : "Wykryto niespójności w dokumentach"}
                      </h3>
                      <p
                        className={`text-sm ${
                          differencesResult.isInGeneralConsistent
                            ? "text-green-800"
                            : "text-amber-800"
                        }`}
                      >
                        {differencesResult.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consistency Flags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    className={`p-3 rounded-lg border ${
                      differencesResult.allDatesConsistent
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {differencesResult.allDatesConsistent ? (
                        <svg
                          className="w-4 h-4 text-green-600"
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
                          className="w-4 h-4 text-red-600"
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
                      <span
                        className={`text-xs font-semibold ${
                          differencesResult.allDatesConsistent
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        Daty spójne
                      </span>
                    </div>
                  </div>
                  {differencesResult.allTimesConsistent !== undefined && (
                    <div
                      className={`p-3 rounded-lg border ${
                        differencesResult.allTimesConsistent
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {differencesResult.allTimesConsistent ? (
                          <svg
                            className="w-4 h-4 text-green-600"
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
                            className="w-4 h-4 text-red-600"
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
                        <span
                          className={`text-xs font-semibold ${
                            differencesResult.allTimesConsistent
                              ? "text-green-900"
                              : "text-red-900"
                          }`}
                        >
                          Godziny spójne
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg border ${
                      differencesResult.allStatementsConsistent
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {differencesResult.allStatementsConsistent ? (
                        <svg
                          className="w-4 h-4 text-green-600"
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
                          className="w-4 h-4 text-red-600"
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
                      <span
                        className={`text-xs font-semibold ${
                          differencesResult.allStatementsConsistent
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        Relacje spójne
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Differences */}
                {differencesResult.differences.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Szczegóły różnic ({differencesResult.differences.length})
                    </h4>
                    {differencesResult.differences.map((diff, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          diff.severity === "high"
                            ? "bg-red-50 border-red-200"
                            : diff.severity === "medium"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p
                            className={`font-semibold capitalize ${
                              diff.severity === "high"
                                ? "text-red-900"
                                : diff.severity === "medium"
                                ? "text-amber-900"
                                : "text-yellow-900"
                            }`}
                          >
                            {diff.field}
                          </p>
                          {diff.severity && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                diff.severity === "high"
                                  ? "bg-red-200 text-red-800"
                                  : diff.severity === "medium"
                                  ? "bg-amber-200 text-amber-800"
                                  : "bg-yellow-200 text-yellow-800"
                              }`}
                            >
                              {diff.severity === "high"
                                ? "Wysoka"
                                : diff.severity === "medium"
                                ? "Średnia"
                                : "Niska"}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            diff.severity === "high"
                              ? "text-red-800"
                              : diff.severity === "medium"
                              ? "text-amber-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {diff.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal Qualification Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Przeprowadź kwalifikację prawną
            </h2>
            <p className="text-slate-600 mb-6">
              System przeanalizuje wszystkie zebrane dane i oceni, czy zdarzenie
              spełnia wszystkie warunki definicji wypadku przy pracy.
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
                      {(() => {
                        const probability =
                          qualificationResult.pkdProbability > 1
                            ? qualificationResult.pkdProbability
                            : qualificationResult.pkdProbability * 100;
                        return Math.min(probability, 100).toFixed(1);
                      })()}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (() => {
                          const probability =
                            qualificationResult.pkdProbability > 1
                              ? qualificationResult.pkdProbability
                              : qualificationResult.pkdProbability * 100;
                          return Math.min(probability, 100);
                        })() >= 70
                          ? "bg-green-500"
                          : (() => {
                              const probability =
                                qualificationResult.pkdProbability > 1
                                  ? qualificationResult.pkdProbability
                                  : qualificationResult.pkdProbability * 100;
                              return Math.min(probability, 100);
                            })() >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          qualificationResult.pkdProbability > 1
                            ? qualificationResult.pkdProbability
                            : qualificationResult.pkdProbability * 100,
                          100
                        )}%`,
                      }}
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
              onClick={handleContinueToSummary}
              disabled={!qualificationResult}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Przejdź do podsumowania
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

