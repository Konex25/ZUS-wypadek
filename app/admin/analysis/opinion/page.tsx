"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginModal } from "@/components/admin/LoginModal";
import { AccidentReport } from "@/types";

interface OpinionData {
  injuriesMatchDefinition: boolean | null;
  injuriesMatchDefinitionComment: string;
  inspectionRequired: boolean;
  inspectionItems: {
    accidentPlace: boolean;
    machineryTechnicalState: boolean;
    protectiveDevices: boolean;
    workingConditions: boolean;
    otherCircumstances: boolean;
  };
  inspectionComment: string;
}

function OpinionPageContent() {
  const router = useRouter();
  const { isAuthenticated, login, isMounted } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [loading, setLoading] = useState(true);
  const [opinionData, setOpinionData] = useState<OpinionData>({
    injuriesMatchDefinition: null,
    injuriesMatchDefinitionComment: "",
    inspectionRequired: false,
    inspectionItems: {
      accidentPlace: false,
      machineryTechnicalState: false,
      protectiveDevices: false,
      workingConditions: false,
      otherCircumstances: false,
    },
    inspectionComment: "",
  });

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
      if (formDataStr) {
        const data = JSON.parse(formDataStr);
        setFormData(data);
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleInjuriesMatchChange = (value: boolean) => {
    setOpinionData((prev) => ({
      ...prev,
      injuriesMatchDefinition: value,
    }));
  };

  const handleInspectionRequiredChange = (value: boolean) => {
    setOpinionData((prev) => ({
      ...prev,
      inspectionRequired: value,
      // Reset inspection items if inspection not required
      inspectionItems: value
        ? prev.inspectionItems
        : {
            accidentPlace: false,
            machineryTechnicalState: false,
            protectiveDevices: false,
            workingConditions: false,
            otherCircumstances: false,
          },
    }));
  };

  const handleInspectionItemChange = (item: keyof OpinionData["inspectionItems"], value: boolean) => {
    setOpinionData((prev) => ({
      ...prev,
      inspectionItems: {
        ...prev.inspectionItems,
        [item]: value,
      },
    }));
  };

  const handleContinueToLegalQualification = () => {
    // Validate form
    if (opinionData.injuriesMatchDefinition === null) {
      alert("Proszę określić czy obrażenia wpisują się w definicję wypadku przy pracy");
      return;
    }

    if (opinionData.inspectionRequired) {
      const hasAnyInspectionItem = Object.values(opinionData.inspectionItems).some(
        (value) => value === true
      );
      if (!hasAnyInspectionItem) {
        alert("Proszę wybrać przynajmniej jeden element do oględzin");
        return;
      }
    }

    // Save opinion data to sessionStorage
    sessionStorage.setItem("opinionData", JSON.stringify(opinionData));

    // Redirect to legal qualification page
    router.push("/admin/analysis/legal-qualification");
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
                Opinia i oględziny
              </h1>
              <p className="text-slate-600">
                Pozyskaj opinię Głównego Lekarza Orzecznika ZUS i określ potrzebę
                oględzin miejsca wypadku
              </p>
            </div>
          </div>

          {/* Opinion Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Opinia Głównego Lekarza Orzecznika ZUS
            </h2>
            <p className="text-slate-600 mb-6">
              Określ czy obrażenia, których doznał poszkodowany w związku z wypadkiem
              są urazami wpisującymi się w definicję wypadku przy pracy.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Czy obrażenia wpisują się w definicję wypadku przy pracy?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleInjuriesMatchChange(true)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors border-2 ${
                      opinionData.injuriesMatchDefinition === true
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-slate-300 text-slate-700 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {opinionData.injuriesMatchDefinition === true && (
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
                      )}
                      Tak
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjuriesMatchChange(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors border-2 ${
                      opinionData.injuriesMatchDefinition === false
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "bg-white border-slate-300 text-slate-700 hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {opinionData.injuriesMatchDefinition === false && (
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
                      )}
                      Nie
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Komentarz / Uzasadnienie
                </label>
                <textarea
                  rows={4}
                  value={opinionData.injuriesMatchDefinitionComment}
                  onChange={(e) =>
                    setOpinionData((prev) => ({
                      ...prev,
                      injuriesMatchDefinitionComment: e.target.value,
                    }))
                  }
                  placeholder="Wprowadź komentarz lub uzasadnienie opinii..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Inspection Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Oględziny miejsca wypadku
            </h2>
            <p className="text-slate-600 mb-6">
              Jeśli zachodzi taka potrzeba, określ które elementy wymagają oględzin:
              miejsca wypadku, stanu technicznego maszyn i innych urządzeń technicznych,
              stanu urządzeń ochronnych oraz warunków wykonywania pracy i innych
              okoliczności, które mogły mieć wpływ na powstanie wypadku.
            </p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opinionData.inspectionRequired}
                    onChange={(e) =>
                      handleInspectionRequiredChange(e.target.checked)
                    }
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Wymagane są oględziny miejsca wypadku
                  </span>
                </label>
              </div>

              {opinionData.inspectionRequired && (
                <div className="ml-8 space-y-3 border-l-2 border-slate-200 pl-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opinionData.inspectionItems.accidentPlace}
                        onChange={(e) =>
                          handleInspectionItemChange(
                            "accidentPlace",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        Oględziny miejsca wypadku
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opinionData.inspectionItems.machineryTechnicalState}
                        onChange={(e) =>
                          handleInspectionItemChange(
                            "machineryTechnicalState",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        Stan techniczny maszyn i innych urządzeń technicznych
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opinionData.inspectionItems.protectiveDevices}
                        onChange={(e) =>
                          handleInspectionItemChange(
                            "protectiveDevices",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        Stan urządzeń ochronnych
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opinionData.inspectionItems.workingConditions}
                        onChange={(e) =>
                          handleInspectionItemChange(
                            "workingConditions",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        Warunki wykonywania pracy
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opinionData.inspectionItems.otherCircumstances}
                        onChange={(e) =>
                          handleInspectionItemChange(
                            "otherCircumstances",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        Inne okoliczności, które mogły mieć wpływ na powstanie
                        wypadku
                      </span>
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dodatkowe uwagi dotyczące oględzin
                    </label>
                    <textarea
                      rows={3}
                      value={opinionData.inspectionComment}
                      onChange={(e) =>
                        setOpinionData((prev) => ({
                          ...prev,
                          inspectionComment: e.target.value,
                        }))
                      }
                      placeholder="Wprowadź dodatkowe uwagi..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>
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
              onClick={handleContinueToLegalQualification}
              disabled={opinionData.injuriesMatchDefinition === null}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Przejdź do kwalifikacji prawnej
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

export default function OpinionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <OpinionPageContent />
    </Suspense>
  );
}

