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
  subject: Subject;
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
                      {caseData.subject.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Nazwisko
                    </p>
                    <p className="text-slate-900 font-medium">
                      {caseData.subject.surname}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      PESEL
                    </p>
                    <p className="text-slate-900 font-medium">
                      {caseData.subject.pesel}
                    </p>
                  </div>
                </div>
              </div>

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

