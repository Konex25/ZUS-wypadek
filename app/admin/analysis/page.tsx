"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginModal } from "@/components/admin/LoginModal";
import { AccidentReport, Address } from "@/types";

// Helper function to parse address string to Address object
function parseAddressString(addressStr: string): Partial<Address> {
  if (!addressStr) return {};

  // Try to parse common address formats
  const parts = addressStr.split(",").map((p) => p.trim());
  const result: Partial<Address> = {};

  // Simple parsing - can be improved
  if (parts.length >= 2) {
    const streetPart = parts[0];
    const streetMatch = streetPart.match(/(.+?)\s+(\d+[a-zA-Z]?)(?:\/(\d+))?/);
    if (streetMatch) {
      result.street = streetMatch[1].trim();
      result.houseNumber = streetMatch[2];
      if (streetMatch[3]) result.apartmentNumber = streetMatch[3];
    } else {
      result.street = streetPart;
    }

    const cityPart = parts[parts.length - 1];
    const cityMatch = cityPart.match(/(\d{2}-\d{3})\s+(.+)/);
    if (cityMatch) {
      result.postalCode = cityMatch[1];
      result.city = cityMatch[2];
    } else {
      result.city = cityPart;
    }
  } else {
    result.street = addressStr;
  }

  return result;
}

function AnalysisPageContent() {
  const router = useRouter();
  const { isAuthenticated, login, isMounted } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<AccidentReport>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["section1", "section3"])
  );
  const [isLoadingCEIDG, setIsLoadingCEIDG] = useState(false);
  const [ceidgError, setCeidgError] = useState<string | null>(null);
  const [pkdCodes, setPkdCodes] = useState<
    Array<{ code: string; description?: string }>
  >([]);
  const [expandedPkdCodes, setExpandedPkdCodes] = useState(false);

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

  // Load analysis result from sessionStorage and map to form data
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const analysisResultStr = sessionStorage.getItem("analysisResult");
      if (analysisResultStr) {
        const result = JSON.parse(analysisResultStr);
        setAnalysisResult(result);

        // Map analysis result to form data structure
        // result is an array of files, each with data field that is a JSON string
        if (Array.isArray(result) && result.length > 0) {
          // Parse data from all files and merge them
          const parsedDataArray = result
            .map((file: any) => {
              try {
                if (typeof file.data === "string") {
                  return JSON.parse(file.data);
                }
                return file.data;
              } catch (e) {
                console.error("Error parsing file data:", e);
                return null;
              }
            })
            .filter(Boolean);

          // Merge data from all files
          const mergedData = parsedDataArray.reduce((acc: any, curr: any) => {
            return { ...acc, ...curr };
          }, {});

          if (mergedData && Object.keys(mergedData).length > 0) {
            const mappedData: Partial<AccidentReport> = {};

            // Map personal data (new format from extraction.ts)
            if (mergedData.name || mergedData.surname || mergedData.pesel) {
              mappedData.personalData = {
                firstName: mergedData.name || "",
                lastName: mergedData.surname || "",
                pesel: mergedData.pesel || "",
                dateOfBirth: mergedData.birthDate || "",
                placeOfBirth: mergedData.birthPlace || "",
                phone: mergedData.phoneNumber || "",
                email: mergedData.email || "",
                idDocument:
                  mergedData.documentType && mergedData.documentId
                    ? {
                        type: mergedData.documentType,
                        number: mergedData.documentId,
                        series: mergedData.documentId.split(" ")[0] || "",
                      }
                    : {
                        type: "dowód osobisty",
                        number: "",
                      },
              };
            }

            // Map addresses
            if (
              mergedData.address ||
              mergedData.businessAddress ||
              mergedData.correspondenceAddress
            ) {
              mappedData.addresses = {
                residentialAddress: mergedData.address
                  ? typeof mergedData.address === "string"
                    ? parseAddressString(mergedData.address)
                    : mergedData.address
                  : {
                      street: "",
                      houseNumber: "",
                      postalCode: "",
                      city: "",
                    },
                businessAddress: mergedData.businessAddress
                  ? typeof mergedData.businessAddress === "string"
                    ? parseAddressString(mergedData.businessAddress)
                    : mergedData.businessAddress
                  : {
                      street: "",
                      houseNumber: "",
                      postalCode: "",
                      city: "",
                    },
                correspondenceAddress: mergedData.correspondenceAddress
                  ? {
                      type: "adres",
                      address:
                        typeof mergedData.correspondenceAddress === "string"
                          ? parseAddressString(mergedData.correspondenceAddress)
                          : mergedData.correspondenceAddress,
                    }
                  : undefined,
                lastResidentialAddressInPoland: mergedData.lastAddress
                  ? typeof mergedData.lastAddress === "string"
                    ? parseAddressString(mergedData.lastAddress)
                    : mergedData.lastAddress
                  : undefined,
              };
            }

            // Map notifier data (if exists and different from victim)
            if (
              mergedData.notifier &&
              (mergedData.notifier.name !== mergedData.name ||
                mergedData.notifier.surname !== mergedData.surname)
            ) {
              mappedData.representativeData = {
                firstName: mergedData.notifier.name || "",
                lastName: mergedData.notifier.surname || "",
                pesel: mergedData.notifier.pesel || "",
                dateOfBirth: "",
                phone: mergedData.notifier.phoneNumber || "",
                addresses: {
                  residentialAddress: mergedData.notifier.address
                    ? typeof mergedData.notifier.address === "string"
                      ? parseAddressString(mergedData.notifier.address)
                      : mergedData.notifier.address
                    : {
                        street: "",
                        houseNumber: "",
                        postalCode: "",
                        city: "",
                      },
                  businessAddress: {
                    street: "",
                    houseNumber: "",
                    postalCode: "",
                    city: "",
                  },
                  lastResidentialAddressInPoland: mergedData.notifier
                    .lastAddress
                    ? typeof mergedData.notifier.lastAddress === "string"
                      ? parseAddressString(mergedData.notifier.lastAddress)
                      : mergedData.notifier.lastAddress
                    : undefined,
                  correspondenceAddress: mergedData.notifier
                    .correspondenceAddress
                    ? {
                        type: "adres",
                        address:
                          typeof mergedData.notifier.correspondenceAddress ===
                          "string"
                            ? parseAddressString(
                                mergedData.notifier.correspondenceAddress
                              )
                            : mergedData.notifier.correspondenceAddress,
                      }
                    : undefined,
                },
                powerOfAttorneyProvided: false,
                idDocument:
                  mergedData.notifier.documentType &&
                  mergedData.notifier.documentId
                    ? {
                        type: mergedData.notifier.documentType,
                        number: mergedData.notifier.documentId,
                        series:
                          mergedData.notifier.documentId.split(" ")[0] || "",
                      }
                    : undefined,
              };
            }

            // Map accident data
            if (
              mergedData.date ||
              mergedData.time ||
              mergedData.place ||
              mergedData.descriptionOfAccident
            ) {
              mappedData.accidentData = {
                accidentDate: mergedData.date || "",
                accidentTime: mergedData.time || "",
                accidentPlace: mergedData.place || "",
                accidentPlaceDetails: mergedData.place || "",
                detailedCircumstancesDescription:
                  mergedData.descriptionOfAccident || "",
                detailedCausesDescription: mergedData.causes || "",
                plannedStartTime: "",
                plannedEndTime: "",
                injuryType: mergedData.injuryType || "",
                suddenness: {
                  confirmed: true,
                  description: "",
                },
                externalCause: {
                  confirmed: false,
                  type: "inne",
                  description: "",
                },
                injury: {
                  confirmed: mergedData.hasInjury || false,
                  type: mergedData.injuryType || "",
                  location: mergedData.injuryDescription || "",
                  medicalDocumentation:
                    mergedData.hasDocumentedMedicalEvidence || false,
                },
                workRelation: {
                  causal: true,
                  temporal: true,
                  spatial: true,
                  functional: true,
                  description: mergedData.activitiesPerformed || "",
                },
                firstAid: mergedData.medicalHelpProvided
                  ? {
                      provided: true,
                      facilityName: "",
                      facilityAddress: "",
                    }
                  : undefined,
                // Store country for verification page
                country: mergedData.country || "Polska",
              } as any;
            }

            // Map business data (NIP/REGON)
            if (mergedData.nip || mergedData.regon) {
              mappedData.businessData = {
                nip: mergedData.nip || "",
                regon: mergedData.regon || "",
                pkdCode: "",
                businessScope: "",
              };
            }

            if (Object.keys(mappedData).length > 0) {
              setFormData(mappedData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading analysis result:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const validateForm = (): string | null => {
    // Validate personal data
    if (!formData.personalData?.firstName?.trim()) {
      return "Imię jest wymagane";
    }
    if (!formData.personalData?.lastName?.trim()) {
      return "Nazwisko jest wymagane";
    }
    if (!formData.personalData?.pesel?.trim()) {
      return "PESEL jest wymagany";
    }
    if (!formData.personalData?.dateOfBirth?.trim()) {
      return "Data urodzenia jest wymagana";
    }
    if (!formData.personalData?.phone?.trim()) {
      return "Telefon jest wymagany";
    }

    // Validate addresses
    if (!formData.addresses?.residentialAddress?.street?.trim()) {
      return "Ulica w adresie zamieszkania jest wymagana";
    }
    if (!formData.addresses?.residentialAddress?.houseNumber?.trim()) {
      return "Numer domu w adresie zamieszkania jest wymagany";
    }
    if (!formData.addresses?.residentialAddress?.postalCode?.trim()) {
      return "Kod pocztowy w adresie zamieszkania jest wymagany";
    }
    if (!formData.addresses?.residentialAddress?.city?.trim()) {
      return "Miejscowość w adresie zamieszkania jest wymagana";
    }
    if (!formData.addresses?.businessAddress?.street?.trim()) {
      return "Ulica w adresie działalności jest wymagana";
    }
    if (!formData.addresses?.businessAddress?.houseNumber?.trim()) {
      return "Numer domu w adresie działalności jest wymagany";
    }
    if (!formData.addresses?.businessAddress?.postalCode?.trim()) {
      return "Kod pocztowy w adresie działalności jest wymagany";
    }
    if (!formData.addresses?.businessAddress?.city?.trim()) {
      return "Miejscowość w adresie działalności jest wymagana";
    }

    // Validate accident data
    if (!formData.accidentData?.accidentDate?.trim()) {
      return "Data wypadku jest wymagana";
    }
    if (!formData.accidentData?.accidentPlace?.trim()) {
      return "Miejsce wypadku jest wymagane";
    }
    if (!formData.accidentData?.detailedCircumstancesDescription?.trim()) {
      return "Opis okoliczności wypadku jest wymagany";
    }
    if (!formData.accidentData?.detailedCausesDescription?.trim()) {
      return "Przyczyny wypadku są wymagane";
    }
    if (!(formData.accidentData?.workRelation as any)?.description?.trim()) {
      return "Czynności wykonywane w momencie wypadku są wymagane";
    }

    // Validate business data
    if (!formData.businessData?.nip?.trim()) {
      return "NIP jest wymagany";
    }
    if (!formData.businessData?.pkdCode?.trim()) {
      return "Kod PKD jest wymagany";
    }

    return null;
  };

  const handleContinueToVerification = () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    // Prepare final JSON object for backend communication
    const finalData = {
      personalData: formData.personalData,
      representativeData: formData.representativeData,
      addresses: formData.addresses,
      businessData: {
        ...formData.businessData,
        pkdCodes: pkdCodes, // Include all PKD codes
      },
      accidentData: formData.accidentData,
      victimStatement: formData.victimStatement,
      witnesses: formData.witnesses,
      notificationType: formData.notificationType,
    };

    // Save mapped form data to sessionStorage
    if (Object.keys(finalData).length > 0) {
      sessionStorage.setItem("formDataFromAnalysis", JSON.stringify(finalData));
    }
    // Save analysis result for verification page
    sessionStorage.setItem("analysisResult", JSON.stringify(analysisResult));
    // Redirect to verification page
    router.push("/admin/analysis/verification");
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isSectionExpanded = (sectionId: string) => {
    return expandedSections.has(sectionId);
  };

  const updateFormData = (path: string[], value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const fetchCEIDGData = async () => {
    const nip = formData.businessData?.nip || "";
    const regon = formData.businessData?.regon || "";

    if (!nip && !regon) {
      setCeidgError("Wprowadź NIP lub REGON");
      return;
    }

    setIsLoadingCEIDG(true);
    setCeidgError(null);

    try {
      const params = new URLSearchParams();
      if (nip) params.append("nip", nip);
      if (regon) params.append("regon", regon);

      const response = await fetch(`/api/ceidg?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się pobrać danych");
      }

      // Parse PKD codes from response - check multiple possible fields
      const parsedPkdCodes: Array<{ code: string; description?: string }> = [];

      // Helper function to extract description from PKD object
      const extractDescription = (pkd: any): string | undefined => {
        return (
          pkd.description ||
          pkd.name ||
          pkd.nazwa ||
          pkd.opis ||
          pkd.title ||
          pkd.tytul ||
          pkd.businessScope ||
          pkd.scope ||
          pkd.aktywnosc ||
          pkd.activity
        );
      };

      // Check pkdCodes array first
      if (data.pkdCodes) {
        if (Array.isArray(data.pkdCodes)) {
          data.pkdCodes.forEach((pkd: any) => {
            if (typeof pkd === "object" && pkd.code) {
              parsedPkdCodes.push({
                code: pkd.code,
                description: extractDescription(pkd),
              });
            } else if (typeof pkd === "string") {
              parsedPkdCodes.push({ code: pkd });
            }
          });
        } else if (typeof data.pkdCodes === "string") {
          parsedPkdCodes.push({ code: data.pkdCodes });
        }
      }

      // Check pkdList or PKDList
      const pkdList = data.pkdList || data.PKDList || data.listaPkd;
      if (Array.isArray(pkdList) && parsedPkdCodes.length === 0) {
        pkdList.forEach((pkd: any) => {
          if (typeof pkd === "object" && (pkd.code || pkd.kod || pkd.pkdkod)) {
            parsedPkdCodes.push({
              code: pkd.code || pkd.kod || pkd.pkdkod,
              description: extractDescription(pkd),
            });
          } else if (typeof pkd === "string") {
            parsedPkdCodes.push({ code: pkd });
          }
        });
      }

      // Also check for other PKD fields (main PKD)
      if (parsedPkdCodes.length === 0) {
        const pkdCode =
          data.pkdCode ||
          data.pkd ||
          data.przewazajacePKD ||
          data.mainPkd ||
          data.pkdkod ||
          data.pkdkodGlowny;
        if (pkdCode) {
          if (typeof pkdCode === "object" && (pkdCode.code || pkdCode.kod)) {
            parsedPkdCodes.push({
              code: pkdCode.code || pkdCode.kod,
              description: extractDescription(pkdCode),
            });
          } else if (typeof pkdCode === "string") {
            parsedPkdCodes.push({ code: pkdCode });
          }
        }
      }

      setPkdCodes(parsedPkdCodes);

      // Update business data with CEIDG response
      setFormData((prev) => ({
        ...prev,
        businessData: {
          ...prev.businessData,
          nip: data.nip || prev.businessData?.nip || "",
          regon: data.regon || prev.businessData?.regon || "",
          pkdCode:
            parsedPkdCodes.length > 0
              ? parsedPkdCodes[0].code
              : prev.businessData?.pkdCode || "",
          businessScope:
            parsedPkdCodes.length > 0
              ? parsedPkdCodes[0].description
              : prev.businessData?.businessScope || "",
          address:
            data.correspondenceAddress ||
            data.address ||
            data.businessAddress ||
            prev.businessData?.address,
        },
      }));
    } catch (error: any) {
      console.error("Error fetching CEIDG data:", error);
      setCeidgError(
        error.message ||
          "Nie udało się pobrać danych z CEIDG. Sprawdź poprawność NIP/REGON."
      );
    } finally {
      setIsLoadingCEIDG(false);
    }
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
          <p className="text-slate-600">Ładowanie wyników analizy...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
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
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Brak danych analizy
          </h2>
          <p className="text-slate-600 mb-6">
            Nie znaleziono wyników analizy. Wróć do uploadu i przeanalizuj
            dokumenty.
          </p>
          <button
            onClick={() => router.push("/admin/case?view=upload")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Wróć do uploadu
          </button>
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
                Weryfikacja i edycja danych
              </h1>
              <p className="text-slate-600">
                Sprawdź i popraw wyekstrahowane dane przed przejściem do
                formularza
              </p>
            </div>
          </div>

          {/* Section 1: Personal Data and Addresses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
            <button
              onClick={() => toggleSection("section1")}
              className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-semibold text-slate-900">
                  Sekcja 1: Dane osobowe i adresy osoby poszkodowanej
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-slate-600 transition-transform ${
                  isSectionExpanded("section1") ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isSectionExpanded("section1") && (
              <div className="p-6 space-y-6">
                {/* Personal Data */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    Dane osobowe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Imię <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personalData?.firstName || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "firstName"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nazwisko <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personalData?.lastName || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "lastName"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        PESEL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personalData?.pesel || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "pesel"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Data urodzenia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.personalData?.dateOfBirth || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "dateOfBirth"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Miejsce urodzenia
                      </label>
                      <input
                        type="text"
                        value={formData.personalData?.placeOfBirth || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "placeOfBirth"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Telefon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.personalData?.phone || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "phone"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.personalData?.email || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["personalData", "email"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    Adresy
                  </h3>
                  <div className="space-y-4">
                    {/* Residential Address */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-600 mb-2">
                        Adres zamieszkania
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Ulica <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ulica"
                            value={
                              formData.addresses?.residentialAddress?.street ||
                              ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "residentialAddress", "street"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nr domu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nr domu"
                            value={
                              formData.addresses?.residentialAddress
                                ?.houseNumber || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                [
                                  "addresses",
                                  "residentialAddress",
                                  "houseNumber",
                                ],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nr lokalu
                          </label>
                          <input
                            type="text"
                            placeholder="Nr lokalu"
                            value={
                              formData.addresses?.residentialAddress
                                ?.apartmentNumber || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                [
                                  "addresses",
                                  "residentialAddress",
                                  "apartmentNumber",
                                ],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Kod pocztowy <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Kod pocztowy"
                            value={
                              formData.addresses?.residentialAddress
                                ?.postalCode || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                [
                                  "addresses",
                                  "residentialAddress",
                                  "postalCode",
                                ],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Miejscowość <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Miejscowość"
                            value={
                              formData.addresses?.residentialAddress?.city || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "residentialAddress", "city"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Address */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-600 mb-2">
                        Adres działalności
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Ulica <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ulica"
                            value={
                              formData.addresses?.businessAddress?.street || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "businessAddress", "street"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nr domu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nr domu"
                            value={
                              formData.addresses?.businessAddress
                                ?.houseNumber || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "businessAddress", "houseNumber"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nr lokalu
                          </label>
                          <input
                            type="text"
                            placeholder="Nr lokalu"
                            value={
                              formData.addresses?.businessAddress
                                ?.apartmentNumber || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                [
                                  "addresses",
                                  "businessAddress",
                                  "apartmentNumber",
                                ],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Kod pocztowy <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Kod pocztowy"
                            value={
                              formData.addresses?.businessAddress?.postalCode ||
                              ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "businessAddress", "postalCode"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Miejscowość <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Miejscowość"
                            value={
                              formData.addresses?.businessAddress?.city || ""
                            }
                            onChange={(e) =>
                              updateFormData(
                                ["addresses", "businessAddress", "city"],
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Notifier Data (if exists) */}
          {formData.representativeData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
              <button
                onClick={() => toggleSection("section2")}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-semibold text-slate-900">
                    Sekcja 2: Dane osoby zgłaszającej
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-600 transition-transform ${
                    isSectionExpanded("section2") ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isSectionExpanded("section2") && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Imię *
                      </label>
                      <input
                        type="text"
                        value={formData.representativeData?.firstName || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["representativeData", "firstName"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        value={formData.representativeData?.lastName || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["representativeData", "lastName"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        PESEL
                      </label>
                      <input
                        type="text"
                        value={formData.representativeData?.pesel || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["representativeData", "pesel"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.representativeData?.phone || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["representativeData", "phone"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Accident Data */}
          {formData.accidentData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
              <button
                onClick={() => toggleSection("section3")}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold text-slate-900">
                    Sekcja 3: Dane wypadku
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-600 transition-transform ${
                    isSectionExpanded("section3") ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isSectionExpanded("section3") && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Data wypadku <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.accidentData?.accidentDate || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["accidentData", "accidentDate"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Godzina wypadku
                      </label>
                      <input
                        type="time"
                        value={formData.accidentData?.accidentTime || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["accidentData", "accidentTime"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Miejsce wypadku <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.accidentData?.accidentPlace || ""}
                        onChange={(e) =>
                          updateFormData(
                            ["accidentData", "accidentPlace"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Opis okoliczności wypadku{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={
                          formData.accidentData
                            ?.detailedCircumstancesDescription || ""
                        }
                        onChange={(e) =>
                          updateFormData(
                            [
                              "accidentData",
                              "detailedCircumstancesDescription",
                            ],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Przyczyny wypadku{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={
                          formData.accidentData?.detailedCausesDescription || ""
                        }
                        onChange={(e) =>
                          updateFormData(
                            ["accidentData", "detailedCausesDescription"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Czynności wykonywane w momencie wypadku{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={
                          (formData.accidentData?.workRelation as any)
                            ?.description || ""
                        }
                        onChange={(e) =>
                          updateFormData(
                            ["accidentData", "workRelation", "description"],
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Business Data with CEIDG */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
            <button
              onClick={() => toggleSection("section4")}
              className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="font-semibold text-slate-900">
                  Sekcja 4: Dane działalności gospodarczej
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-slate-600 transition-transform ${
                  isSectionExpanded("section4") ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isSectionExpanded("section4") && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      NIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessData?.nip || ""}
                      onChange={(e) =>
                        updateFormData(
                          ["businessData", "nip"],
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      REGON
                    </label>
                    <input
                      type="text"
                      value={formData.businessData?.regon || ""}
                      onChange={(e) =>
                        updateFormData(
                          ["businessData", "regon"],
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={fetchCEIDGData}
                      disabled={
                        isLoadingCEIDG ||
                        (!formData.businessData?.nip &&
                          !formData.businessData?.regon)
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingCEIDG ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Pobieranie...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Pobierz dane z CEIDG
                        </>
                      )}
                    </button>
                    {ceidgError && (
                      <p className="mt-2 text-sm text-red-600">{ceidgError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Główny kod PKD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessData?.pkdCode || ""}
                      onChange={(e) =>
                        updateFormData(
                          ["businessData", "pkdCode"],
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                    />
                    {formData.businessData?.businessScope && (
                      <p className="mt-1 text-xs text-slate-500">
                        {formData.businessData.businessScope}
                      </p>
                    )}
                  </div>

                  {/* PKD Codes List */}
                  {pkdCodes.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedPkdCodes(!expandedPkdCodes)}
                          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <span className="font-medium text-slate-900">
                              Kody PKD ({pkdCodes.length})
                            </span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-slate-600 transition-transform ${
                              expandedPkdCodes ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {expandedPkdCodes && (
                          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                            {pkdCodes.map((pkd, index) => (
                              <div
                                key={index}
                                className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-slate-900 text-base">
                                        {pkd.code}
                                      </span>
                                      {index === 0 && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                          Główny
                                        </span>
                                      )}
                                    </div>
                                    {pkd.description ? (
                                      <div className="text-sm text-slate-700 mt-1 leading-relaxed">
                                        {pkd.description}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-slate-400 italic mt-1">
                                        Brak opisu dla tego kodu PKD
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push("/admin/case?view=upload")}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleContinueToVerification}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Zweryfikuj ubezpieczenie
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

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <AnalysisPageContent />
    </Suspense>
  );
}
