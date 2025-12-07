"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Address {
  id: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string | null;
  city: string;
  postalCode: string;
  country?: string | null;
}

interface Subject {
  id: string;
  name: string;
  surname: string;
  pesel: string;
}

interface CaseDetail {
  id: string;
  mainAddress?: Address;
  correspondenceAddress?: Address;
  businessAddress?: Address;
  createdAt: string;
  updatedAt: string;
  status: string;
  resolvedAt?: string | null;
  subject: Subject | null;
  aiDecision?: any;
  aiJustifications?: any;
  workerJustifications?: any;
  finalDecision?: any;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cases/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Sprawa nie została znaleziona");
          } else {
            setError("Nie udało się pobrać danych sprawy");
          }
          return;
        }

        const data = await response.json();
        setCaseData(data.case);
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Wystąpił błąd podczas pobierania danych");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCase();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatAddress = (address?: Address) => {
    if (!address) return "—";
    const parts = [
      `${address.street} ${address.houseNumber}`,
      address.apartmentNumber && `/${address.apartmentNumber}`,
      address.postalCode && address.city
        ? `${address.postalCode} ${address.city}`
        : address.city || address.postalCode,
      address.country && address.country !== "Polska" && address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: "Oczekujące",
        className: "bg-yellow-100 text-yellow-800",
      },
      PROCESSING: {
        label: "W trakcie rozpatrywania",
        className: "bg-blue-100 text-blue-800",
      },
      ACCEPTED: {
        label: "Zaakceptowane",
        className: "bg-green-100 text-green-800",
      },
      FAILED: {
        label: "Odrzucone",
        className: "bg-red-100 text-red-800",
      },
      processing: {
        label: "Przetwarzanie",
        className: "bg-blue-100 text-blue-800",
      },
      completed: {
        label: "Zakończone",
        className: "bg-emerald-100 text-emerald-800",
      },
      error: {
        label: "Błąd",
        className: "bg-red-100 text-red-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.PENDING;

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Ładowanie danych sprawy...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Błąd</h2>
          <p className="text-slate-600 mb-6">{error || "Nie znaleziono sprawy"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Wróć
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Sprawa #{caseData.id}
                </h1>
                <p className="text-slate-600">
                  Szczegóły sprawy wypadkowej
                </p>
              </div>
              {getStatusBadge(caseData.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Information */}
              {caseData.subject && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    Dane osoby
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Imię
                      </p>
                      <p className="text-slate-900 font-medium">
                        {caseData.subject.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Nazwisko
                      </p>
                      <p className="text-slate-900 font-medium">
                        {caseData.subject.surname || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        PESEL
                      </p>
                      <p className="text-slate-900 font-medium">
                        {caseData.subject.pesel || caseData.subject.id || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Decision */}
              {caseData.finalDecision && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    Decyzja końcowa
                  </h2>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      caseData.finalDecision.decision === "ACCEPTED"
                        ? "bg-green-50 border-green-200"
                        : caseData.finalDecision.decision === "FAILED"
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                    }`}>
                      <p className={`font-semibold text-lg ${
                        caseData.finalDecision.decision === "ACCEPTED"
                          ? "text-green-900"
                          : caseData.finalDecision.decision === "FAILED"
                          ? "text-red-900"
                          : "text-amber-900"
                      }`}>
                        {caseData.finalDecision.decision === "ACCEPTED"
                          ? "Zaakceptowano"
                          : caseData.finalDecision.decision === "FAILED"
                          ? "Odrzucono"
                          : "Wymaga więcej informacji"}
                      </p>
                      {caseData.finalDecision.comment && (
                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                          {caseData.finalDecision.comment}
                        </p>
                      )}
                    </div>
                    {caseData.finalDecision.updatedAt && (
                      <p className="text-xs text-slate-500">
                        Data decyzji: {formatDate(caseData.finalDecision.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Decision / Legal Qualification */}
              {caseData.aiDecision && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Kwalifikacja prawna (AI)
                  </h2>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      caseData.aiDecision.shouldAccept
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <p className={`font-semibold text-lg ${
                        caseData.aiDecision.shouldAccept
                          ? "text-green-900"
                          : "text-red-900"
                      }`}>
                        {caseData.aiDecision.shouldAccept
                          ? "Wniosek powinien zostać przyjęty"
                          : "Wniosek nie powinien zostać przyjęty"}
                      </p>
                      {caseData.aiDecision.shortExplanation && (
                        <p className="text-sm text-slate-700 mt-2">
                          {caseData.aiDecision.shortExplanation}
                        </p>
                      )}
                      {caseData.aiDecision.pkdProbability !== undefined && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-slate-600">
                            Prawdopodobieństwo zgodności z PKD:{" "}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {Math.min(
                              caseData.aiDecision.pkdProbability > 1
                                ? caseData.aiDecision.pkdProbability
                                : caseData.aiDecision.pkdProbability * 100,
                              100
                            ).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {caseData.aiDecision.detailedJustification && (
                      <div>
                        <h3 className="font-medium text-slate-900 mb-2">Szczegółowe uzasadnienie</h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {caseData.aiDecision.detailedJustification}
                        </p>
                      </div>
                    )}
                    {caseData.aiDecision.notes && (
                      <div>
                        <h3 className="font-medium text-slate-900 mb-2">Uwagi</h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {caseData.aiDecision.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Differences */}
              {caseData.aiJustifications && caseData.aiJustifications.differences && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-orange-600"
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
                    Różnice w dokumentach
                  </h2>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      caseData.aiJustifications.isInGeneralConsistent
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                    }`}>
                      <p className={`font-semibold ${
                        caseData.aiJustifications.isInGeneralConsistent
                          ? "text-green-900"
                          : "text-amber-900"
                      }`}>
                        {caseData.aiJustifications.isInGeneralConsistent
                          ? "Dokumenty są spójne"
                          : "Wykryto niespójności w dokumentach"}
                      </p>
                      {caseData.aiJustifications.summary && (
                        <p className="text-sm text-slate-700 mt-2">
                          {caseData.aiJustifications.summary}
                        </p>
                      )}
                      {caseData.aiJustifications.differences && caseData.aiJustifications.differences.length > 0 && (
                        <p className="text-sm text-slate-600 mt-2">
                          Liczba wykrytych różnic: {caseData.aiJustifications.differences.length}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Worker Justifications / Opinion */}
              {caseData.workerJustifications && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    Opinia pracownika
                  </h2>
                  <div className="space-y-4">
                    {caseData.workerJustifications.injuriesMatchDefinition !== null && (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="font-medium text-slate-900 mb-2">
                          Obrażenia {caseData.workerJustifications.injuriesMatchDefinition
                            ? "wpisują się"
                            : "nie wpisują się"}{" "}
                          w definicję wypadku przy pracy
                        </p>
                        {caseData.workerJustifications.injuriesMatchDefinitionComment && (
                          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                            {caseData.workerJustifications.injuriesMatchDefinitionComment}
                          </p>
                        )}
                      </div>
                    )}
                    {caseData.workerJustifications.inspectionRequired && (
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="font-medium text-blue-900 mb-2">Wymagane oględziny</p>
                        {caseData.workerJustifications.inspectionComment && (
                          <p className="text-sm text-blue-700 mt-2 whitespace-pre-wrap">
                            {caseData.workerJustifications.inspectionComment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Adresy
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Adres zamieszkania
                    </p>
                    <p className="text-slate-900">
                      {formatAddress(caseData.mainAddress)}
                    </p>
                  </div>
                  {caseData.correspondenceAddress && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Adres korespondencyjny
                      </p>
                      <p className="text-slate-900">
                        {formatAddress(caseData.correspondenceAddress)}
                      </p>
                    </div>
                  )}
                  {caseData.businessAddress && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Adres działalności gospodarczej
                      </p>
                      <p className="text-slate-900">
                        {formatAddress(caseData.businessAddress)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Case Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  Informacje o sprawie
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      ID sprawy
                    </p>
                    <p className="text-slate-900 font-mono text-sm">
                      {caseData.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Data utworzenia
                    </p>
                    <p className="text-slate-900">
                      {formatDate(caseData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Ostatnia aktualizacja
                    </p>
                    <p className="text-slate-900">
                      {formatDate(caseData.updatedAt)}
                    </p>
                  </div>
                  {caseData.resolvedAt && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Data rozstrzygnięcia
                      </p>
                      <p className="text-slate-900">
                        {formatDate(caseData.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

