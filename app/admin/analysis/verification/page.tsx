"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginModal } from "@/components/admin/LoginModal";
import { AccidentReport } from "@/types";

function VerificationPageContent() {
  const router = useRouter();
  const { isAuthenticated, login, isMounted } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [loading, setLoading] = useState(true);
  const [isVerifyingInsurance, setIsVerifyingInsurance] = useState(false);
  const [isVerifyingLegislation, setIsVerifyingLegislation] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [legislationVerified, setLegislationVerified] = useState(false);
  const [accidentCountry, setAccidentCountry] = useState<string>("Polska");

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

  // Load form data from sessionStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const formDataStr = sessionStorage.getItem("formDataFromAnalysis");
      const analysisResultStr = sessionStorage.getItem("analysisResult");
      
      if (formDataStr) {
        const data = JSON.parse(formDataStr);
        setFormData(data);
      }
      
      // Extract accident country from form data or analysis result
      if (formData.accidentData && (formData.accidentData as any).country) {
        setAccidentCountry((formData.accidentData as any).country);
      } else if (analysisResultStr) {
        try {
          const analysisResult = JSON.parse(analysisResultStr);
          if (Array.isArray(analysisResult) && analysisResult.length > 0) {
            // Parse data from files
            const parsedDataArray = analysisResult
              .map((file: any) => {
                try {
                  if (typeof file.data === "string") {
                    return JSON.parse(file.data);
                  }
                  return file.data;
                } catch (e) {
                  return null;
                }
              })
              .filter(Boolean);
            
            // Merge data and extract country
            const mergedData = parsedDataArray.reduce((acc: any, curr: any) => {
              return { ...acc, ...curr };
            }, {});
            
            if (mergedData.country) {
              setAccidentCountry(mergedData.country);
            }
          }
        } catch (e) {
          console.error("Error parsing analysis result:", e);
        }
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleVerifyInsurance = async () => {
    setIsVerifyingInsurance(true);
    
    // Mock verification - always returns success after 1-2 seconds
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setInsuranceVerified(true);
    setIsVerifyingInsurance(false);
  };

  const handleVerifyLegislation = async () => {
    setIsVerifyingLegislation(true);
    
    // Mock verification - always returns success after 1-2 seconds
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLegislationVerified(true);
    setIsVerifyingLegislation(false);
  };

  const handleContinueToForm = () => {
    // Redirect to form
    router.push("/asystent");
  };

  const isEUMemberState = (country: string): boolean => {
    const euCountries = [
      "Polska",
      "Niemcy",
      "Francja",
      "Włochy",
      "Hiszpania",
      "Holandia",
      "Belgia",
      "Austria",
      "Czechy",
      "Słowacja",
      "Węgry",
      "Rumunia",
      "Bułgaria",
      "Grecja",
      "Portugalia",
      "Szwecja",
      "Dania",
      "Finlandia",
      "Irlandia",
      "Litwa",
      "Łotwa",
      "Estonia",
      "Słowenia",
      "Chorwacja",
      "Malta",
      "Cypr",
      "Luksemburg",
    ];
    return euCountries.some(
      (eu) => country.toLowerCase().includes(eu.toLowerCase()) || eu.toLowerCase().includes(country.toLowerCase())
    );
  };

  const isOtherEUCountry = accidentCountry !== "Polska" && isEUMemberState(accidentCountry);

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
                Weryfikacja ubezpieczenia
              </h1>
              <p className="text-slate-600">
                Sprawdź czy poszkodowany podlegał ubezpieczeniu wypadkowemu w
                dniu wypadku
              </p>
            </div>
          </div>

          {/* Accident Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Informacje o wypadku
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Poszkodowany:
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
            </div>
          </div>

          {/* Insurance Verification Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Weryfikacja ubezpieczenia wypadkowego
            </h2>
            <div className="mb-4">
              <p className="text-slate-600 mb-4">
                Sprawdzamy czy w dniu wypadku ({formData.accidentData?.accidentDate || "brak daty"}) poszkodowany podlegał ubezpieczeniu wypadkowemu.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleVerifyInsurance}
                disabled={isVerifyingInsurance || insuranceVerified}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  insuranceVerified
                    ? "bg-green-600 text-white cursor-default"
                    : isVerifyingInsurance
                    ? "bg-blue-600 text-white cursor-wait"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isVerifyingInsurance ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sprawdzanie...
                  </>
                ) : insuranceVerified ? (
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
                    Zweryfikowano - podlega ubezpieczeniu
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
                    Zweryfikuj ubezpieczenie
                  </>
                )}
              </button>
              {insuranceVerified && (
                <div className="flex items-center gap-2 text-green-600">
                  <svg
                    className="w-6 h-6"
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
                  <span className="font-medium">Zweryfikowano pozytywnie</span>
                </div>
              )}
            </div>
          </div>

          {/* EU Legislation Verification (if accident in other EU country) */}
          {isOtherEUCountry && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Weryfikacja ustawodawstwa (wypadek w państwie członkowskim UE)
              </h2>
              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Wypadek wydarzył się w państwie członkowskim UE ({accidentCountry}).
                </p>
                <p className="text-slate-600 mb-4">
                  Sprawdzamy zawiadomienie o ustawodawstwie dotyczącym zabezpieczenia społecznego mającym zastosowanie do osoby prawnej oraz jakiemu ustawodawstwu podlega.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleVerifyLegislation}
                  disabled={isVerifyingLegislation || legislationVerified}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    legislationVerified
                      ? "bg-green-600 text-white cursor-default"
                      : isVerifyingLegislation
                      ? "bg-blue-600 text-white cursor-wait"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isVerifyingLegislation ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sprawdzanie...
                    </>
                  ) : legislationVerified ? (
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
                      Zweryfikowano - podlega ustawodawstwu
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
                      Zweryfikuj ustawodawstwo
                    </>
                  )}
                </button>
                {legislationVerified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg
                      className="w-6 h-6"
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
                    <span className="font-medium">Zweryfikowano pozytywnie</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push("/admin/analysis")}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Wróć
            </button>
            <button
              onClick={handleContinueToForm}
              disabled={!insuranceVerified || (isOtherEUCountry && !legislationVerified)}
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

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <VerificationPageContent />
    </Suspense>
  );
}

