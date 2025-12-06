"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Case, UploadedDocument, Differences } from "@/types";
import { Input } from "@/components/ui/input";

type ViewMode = "upload" | "cases" | "case-detail";

export default function ZUSPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("cases");
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nip, setNip] = useState("");
  const [isCheckingDifferences, setIsCheckingDifferences] = useState(false);
  const [differencesError, setDifferencesError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const casesRef = useRef<Case[]>([]);

  useEffect(() => {
    casesRef.current = cases;
  }, [cases]);

  const fetchCases = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  }, []);

  const fetchCase = useCallback(async (caseId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${caseId}`);
      const data = await response.json();
      if (data.case) {
        setSelectedCase(data.case);
        // Update case in list
        setCases((prev) => prev.map((c) => (c.id === caseId ? data.case : c)));
      }
    } catch (error) {
      console.error("Error fetching case:", error);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    const interval = setInterval(() => {
      if (casesRef.current.some((c) => c.status === "processing")) {
        fetchCases();
      }
      if (selectedCase?.status === "processing") {
        fetchCase(selectedCase.id);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchCases, fetchCase, selectedCase?.id, selectedCase?.status]);

  const handleFilesUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate NIP - must be exactly 10 digits
    if (!nip || nip.length !== 10) {
      setUploadError("NIP jest wymagany i musi zawierać dokładnie 10 cyfr");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("nip", nip.trim());

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setUploadError(result.error || "Upload failed");
        return;
      }

      await fetchCases();
      if (result.case) {
        setSelectedCase(result.case);
        setViewMode("case-detail");
      }
      setNip(""); // Clear NIP after successful upload
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadError("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFilesUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFilesUpload(files);
    e.target.value = "";
  };

  const openCase = (caseData: Case) => {
    setSelectedCase(caseData);
    setViewMode("case-detail");
    setDifferencesError(null);
  };

  const checkDifferences = async () => {
    if (!selectedCase) return;

    setIsCheckingDifferences(true);
    setDifferencesError(null);

    try {
      const response = await fetch("/api/documents/differences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: selectedCase.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        setDifferencesError(result.error || "Nie udało się sprawdzić różnic");
        return;
      }

      // Update the selected case with differences
      const updatedCase = { ...selectedCase, differences: result.differences };
      setSelectedCase(updatedCase);
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? updatedCase : c))
      );
    } catch (error) {
      console.error("Error checking differences:", error);
      setDifferencesError("Wystąpił błąd podczas sprawdzania różnic");
    } finally {
      setIsCheckingDifferences(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: Case["status"]) => {
    const styles = {
      pending: "bg-gray-100 text-gray-700",
      processing: "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      error: "bg-red-100 text-red-700",
    };
    const labels = {
      pending: "Oczekuje",
      processing: "Analizowanie...",
      completed: "Zakończono",
      error: "Błąd",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Moduł ZUS - Analiza Wypadków
            </h1>
            <p className="text-slate-600">
              Dodaj nową sprawę lub przeglądaj istniejące analizy
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode("upload")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              + Nowa sprawa
            </button>
            <button
              onClick={() => {
                setViewMode("cases");
                setSelectedCase(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "cases"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Sprawy ({cases.length})
            </button>
            {viewMode === "case-detail" && selectedCase && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
                <span className="text-slate-400">→</span>
                {selectedCase.id}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {viewMode === "upload" && (
              <div className="p-8">
                <div className="mb-6">
                  <Input
                    label="NIP *"
                    type="text"
                    placeholder="Wprowadź NIP (10 cyfr)"
                    value={nip}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Tylko cyfry
                      if (value.length <= 10) {
                        setNip(value);
                      }
                    }}
                    helperText={
                      nip.length > 0 && nip.length !== 10
                        ? `${nip.length}/10 cyfr`
                        : "Wymagane - 10 cyfr"
                    }
                    disabled={isUploading}
                    className={
                      nip.length > 0 && nip.length !== 10
                        ? "border-amber-400"
                        : nip.length === 10
                        ? "border-emerald-400"
                        : ""
                    }
                  />
                </div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                  } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/*,application/pdf"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-600">
                          Tworzenie sprawy...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-lg font-medium text-slate-700">
                            Dodaj dokumenty do nowej sprawy
                          </p>
                          <p className="text-slate-500 mt-1">
                            Przeciągnij pliki lub kliknij aby wybrać
                          </p>
                        </div>
                        <p className="text-sm text-slate-400">
                          Obsługiwane formaty: JPEG, PNG, WEBP, GIF, PDF
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {uploadError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {uploadError}
                  </div>
                )}
              </div>
            )}

            {viewMode === "cases" && (
              <div className="p-6">
                {cases.length > 0 && (
                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Szukaj sprawy..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                )}
                {cases.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 mb-2">Brak spraw</p>
                    <p className="text-slate-400 text-sm">
                      Dodaj pierwszą sprawę, aby rozpocząć analizę
                    </p>
                    <button
                      onClick={() => setViewMode("upload")}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Nowa sprawa
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filteredCases = cases.filter((caseData) => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          caseData.id.toLowerCase().includes(query) ||
                          caseData.documents.some((doc) =>
                            doc.fileName.toLowerCase().includes(query)
                          )
                        );
                      });

                      if (filteredCases.length === 0 && cases.length > 0) {
                        return (
                          <div className="text-center py-8 text-slate-500">
                            Brak wyników wyszukiwania
                          </div>
                        );
                      }

                      return filteredCases.map((caseData) => (
                        <div
                          key={caseData.id}
                          onClick={() => openCase(caseData)}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-blue-600"
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
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">
                              {caseData.id}
                            </p>
                            <p className="text-sm text-slate-500">
                              {caseData.documents.length}{" "}
                              {caseData.documents.length === 1
                                ? "dokument"
                                : "dokumentów"}{" "}
                              •{" "}
                              {new Date(caseData.createdAt).toLocaleString(
                                "pl-PL"
                              )}
                            </p>
                          </div>
                          {getStatusBadge(caseData.status)}
                          <svg
                            className="w-5 h-5 text-slate-400"
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
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {viewMode === "case-detail" && selectedCase && (
              <div className="divide-y divide-slate-200">
                {/* Case Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedCase.id}
                      </h2>
                      <p className="text-sm text-slate-500">
                        Utworzono:{" "}
                        {new Date(selectedCase.createdAt).toLocaleString(
                          "pl-PL"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedCase.status === "completed" && (
                        <button
                          onClick={checkDifferences}
                          disabled={isCheckingDifferences}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isCheckingDifferences ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sprawdzanie...
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
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                              </svg>
                              Sprawdź spójność dokumentów
                            </>
                          )}
                        </button>
                      )}
                      {getStatusBadge(selectedCase.status)}
                    </div>
                  </div>

                  {/* Differences Error */}
                  {differencesError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                      {differencesError}
                    </div>
                  )}

                  {/* Differences Results */}
                  {selectedCase.differences && (
                    <div className="mt-4 space-y-4">
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          selectedCase.differences.isInGeneralConsistent
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {selectedCase.differences.isInGeneralConsistent
                              ? "✅"
                              : "⚠️"}
                          </span>
                          <div>
                            <p
                              className={`text-lg font-bold ${
                                selectedCase.differences.isInGeneralConsistent
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {selectedCase.differences.isInGeneralConsistent
                                ? "Dokumenty są spójne"
                                : "Wykryto niespójności w dokumentach"}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {selectedCase.differences.summary}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Individual differences */}
                      {selectedCase.differences.differences.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Szczegóły różnic ({selectedCase.differences.differences.length})
                          </p>
                          {selectedCase.differences.differences.map(
                            (diff, index) => (
                              <div
                                key={index}
                                className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                              >
                                <p className="font-semibold text-amber-900 capitalize">
                                  {diff.field.charAt(0).toUpperCase() + diff.field.slice(1)}
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                  {diff.details}
                                </p>
                                {diff.documents.length > 0 && (
                                  <p className="text-xs text-amber-600 mt-2">
                                    <strong>Dotyczy dokumentów:</strong>{" "}
                                    {diff.documents.join(", ")}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Consistency flags */}
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-lg ${
                            selectedCase.differences.allDatesConsistent
                              ? "bg-emerald-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold ${
                              selectedCase.differences.allDatesConsistent
                                ? "text-emerald-900"
                                : "text-red-900"
                            }`}
                          >
                            {selectedCase.differences.allDatesConsistent
                              ? "✅"
                              : "❌"}{" "}
                            Daty
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              selectedCase.differences.allDatesConsistent
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {selectedCase.differences.allDatesConsistent
                              ? "Spójne"
                              : "Niespójne"}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            selectedCase.differences.allStatementsConsistent
                              ? "bg-emerald-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold ${
                              selectedCase.differences.allStatementsConsistent
                                ? "text-emerald-900"
                                : "text-red-900"
                            }`}
                          >
                            {selectedCase.differences.allStatementsConsistent
                              ? "✅"
                              : "❌"}{" "}
                            Zeznania
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              selectedCase.differences.allStatementsConsistent
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {selectedCase.differences.allStatementsConsistent
                              ? "Spójne"
                              : "Niespójne"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    Dokumenty ({selectedCase.documents.length})
                  </h3>
                  <div className="grid gap-2">
                    {selectedCase.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {doc.mimeType.startsWith("image/") ? (
                            <svg
                              className="w-4 h-4 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-slate-600"
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
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opinion Section */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    Opinia AI
                  </h3>

                  {selectedCase.status === "processing" ? (
                    <div className="flex items-center gap-3 p-8 bg-amber-50 rounded-lg">
                      <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-amber-700">
                        Analizowanie dokumentów...
                      </span>
                    </div>
                  ) : selectedCase.status === "error" ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <p className="font-medium">
                        Wystąpił błąd podczas analizy
                      </p>
                      {selectedCase.error && (
                        <p className="text-sm mt-1">{selectedCase.error}</p>
                      )}
                    </div>
                  ) : selectedCase.aiOpinion ? (
                    <div className="space-y-6">
                      {/* Decision Banner */}
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          selectedCase.aiOpinion.decision === "ACCEPTED"
                            ? "bg-emerald-50 border-emerald-200"
                            : selectedCase.aiOpinion.decision === "REJECTED"
                            ? "bg-red-50 border-red-200"
                            : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {selectedCase.aiOpinion.decision === "ACCEPTED"
                              ? "✅"
                              : selectedCase.aiOpinion.decision === "REJECTED"
                              ? "❌"
                              : "⚠️"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Proponowana decyzja
                            </p>
                            <p
                              className={`text-xl font-bold ${
                                selectedCase.aiOpinion.decision === "ACCEPTED"
                                  ? "text-emerald-700"
                                  : selectedCase.aiOpinion.decision ===
                                    "REJECTED"
                                  ? "text-red-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {selectedCase.aiOpinion.decision === "ACCEPTED"
                                ? "Uznać za wypadek przy pracy"
                                : selectedCase.aiOpinion.decision === "REJECTED"
                                ? "Nie uznać za wypadek przy pracy"
                                : "Wymaga dodatkowych wyjaśnień"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Results Section */}
                      {selectedCase.aiOpinion.verificationResults && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Weryfikacje systemowe
                          </p>

                          {/* Insurance Verification */}
                          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="flex items-start gap-3">
                              <span className="text-xl">✅</span>
                              <div>
                                <p className="font-semibold text-emerald-900">
                                  Weryfikacja ubezpieczenia wypadkowego
                                </p>
                                <p className="text-sm text-emerald-700 mt-1">
                                  {
                                    selectedCase.aiOpinion.verificationResults
                                      .insuranceVerification.message
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Company Verification */}
                          {selectedCase.aiOpinion.verificationResults
                            .companyVerification && (
                            <div
                              className={`p-4 rounded-lg border ${
                                selectedCase.aiOpinion.verificationResults
                                  .companyVerification.verified
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-amber-50 border-amber-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">
                                  {selectedCase.aiOpinion.verificationResults
                                    .companyVerification.verified
                                    ? "✅"
                                    : "⚠️"}
                                </span>
                                <div>
                                  <p
                                    className={`font-semibold ${
                                      selectedCase.aiOpinion.verificationResults
                                        .companyVerification.verified
                                        ? "text-emerald-900"
                                        : "text-amber-900"
                                    }`}
                                  >
                                    Weryfikacja danych działalności gospodarczej
                                  </p>
                                  <p
                                    className={`text-sm mt-1 ${
                                      selectedCase.aiOpinion.verificationResults
                                        .companyVerification.verified
                                        ? "text-emerald-700"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {
                                      selectedCase.aiOpinion.verificationResults
                                        .companyVerification.message
                                    }
                                  </p>
                                  {selectedCase.aiOpinion.verificationResults
                                    .companyVerification.companyName && (
                                    <p className="text-sm text-emerald-600 mt-1">
                                      <strong>Firma:</strong>{" "}
                                      {
                                        selectedCase.aiOpinion
                                          .verificationResults
                                          .companyVerification.companyName
                                      }
                                    </p>
                                  )}
                                  {selectedCase.aiOpinion.verificationResults
                                    .companyVerification.pkd && (
                                    <p className="text-sm text-emerald-600 mt-1">
                                      <strong>PKD:</strong>{" "}
                                      {
                                        selectedCase.aiOpinion
                                          .verificationResults
                                          .companyVerification.pkd
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* A1 Form Verification (if applicable) */}
                          {selectedCase.aiOpinion.verificationResults
                            .a1FormVerification && (
                            <div
                              className={`p-4 rounded-lg border ${
                                selectedCase.aiOpinion.verificationResults
                                  .a1FormVerification.hasA1Form
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-amber-50 border-amber-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">
                                  {selectedCase.aiOpinion.verificationResults
                                    .a1FormVerification.hasA1Form
                                    ? "✅"
                                    : "⚠️"}
                                </span>
                                <div>
                                  <p
                                    className={`font-semibold ${
                                      selectedCase.aiOpinion.verificationResults
                                        .a1FormVerification.hasA1Form
                                        ? "text-emerald-900"
                                        : "text-amber-900"
                                    }`}
                                  >
                                    Weryfikacja formularza A1 (wypadek w UE)
                                  </p>
                                  <p
                                    className={`text-sm mt-1 ${
                                      selectedCase.aiOpinion.verificationResults
                                        .a1FormVerification.hasA1Form
                                        ? "text-emerald-700"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {
                                      selectedCase.aiOpinion.verificationResults
                                        .a1FormVerification.message
                                    }
                                  </p>
                                  {selectedCase.aiOpinion.verificationResults
                                    .a1FormVerification
                                    .applicableLegislation && (
                                    <p className="text-sm text-emerald-600 mt-1">
                                      <strong>Właściwe ustawodawstwo:</strong>{" "}
                                      {
                                        selectedCase.aiOpinion
                                          .verificationResults
                                          .a1FormVerification
                                          .applicableLegislation
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Injury Verification - Medical Documentation Notice */}
                          {selectedCase.aiOpinion.verificationResults
                            .injuryVerification.hasInjury && (
                            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                              <div className="flex items-start gap-3">
                                <span className="text-xl">📋</span>
                                <div>
                                  <p className="font-semibold text-amber-900">
                                    Wymagana dokumentacja medyczna
                                  </p>
                                  <p className="text-sm text-amber-700 mt-1">
                                    {
                                      selectedCase.aiOpinion.verificationResults
                                        .injuryVerification.message
                                    }
                                  </p>
                                  {selectedCase.aiOpinion.verificationResults
                                    .injuryVerification.injuryDescription && (
                                    <p className="text-sm text-amber-800 mt-2">
                                      <strong>Stwierdzony uraz:</strong>{" "}
                                      {
                                        selectedCase.aiOpinion
                                          .verificationResults
                                          .injuryVerification.injuryDescription
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Data wypadku
                          </p>
                          <p className="text-slate-900 font-medium">
                            {selectedCase.aiOpinion.date || "—"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Miejsce wypadku
                          </p>
                          <p className="text-slate-900 font-medium">
                            {selectedCase.aiOpinion.place || "—"}
                            {selectedCase.aiOpinion.country &&
                              selectedCase.aiOpinion.country.toLowerCase() !==
                                "polska" && (
                                <span className="ml-2 text-blue-600">
                                  ({selectedCase.aiOpinion.country})
                                </span>
                              )}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Opis okoliczności
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {selectedCase.aiOpinion.description || "—"}
                        </p>
                      </div>

                      {/* Causes */}
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Przyczyny wypadku
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {selectedCase.aiOpinion.causes || "—"}
                        </p>
                      </div>

                      {/* Justifications */}
                      {selectedCase.aiOpinion.justifications?.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Uzasadnienie prawne
                          </p>
                          {selectedCase.aiOpinion.justifications.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                              >
                                <p className="font-semibold text-blue-900 mb-2">
                                  {item.title}
                                </p>
                                <p className="text-slate-700 leading-relaxed">
                                  {item.justification}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center">
                      Brak opinii
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
