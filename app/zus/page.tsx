"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UploadedDocument } from "@/types";

type ViewMode = "upload" | "documents";

export default function ZUSPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<UploadedDocument[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    // Poll for updates when documents are processing
    const interval = setInterval(() => {
      if (documentsRef.current.some((doc) => doc.status === "processing")) {
        fetchDocuments();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

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

      // Refresh document list
      await fetchDocuments();
      setViewMode("documents");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: UploadedDocument["status"]) => {
    const styles = {
      pending: "bg-gray-100 text-gray-700",
      processing: "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      error: "bg-red-100 text-red-700",
    };
    const labels = {
      pending: "Oczekuje",
      processing: "Przetwarzanie...",
      completed: "Zakończono",
      error: "Błąd",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Moduł ZUS - Analiza Dokumentacji
            </h1>
            <p className="text-slate-600">
              Wgraj dokumenty do analizy lub przeglądaj już przetworzone pliki
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode("upload")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Wgraj dokument
            </button>
            <button
              onClick={() => setViewMode("documents")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "documents"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Dokumenty ({documents.length})
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {viewMode === "upload" ? (
              <div className="p-8">
                {/* Upload Area */}
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
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center gap-4">
                    {/* Upload Icon */}
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>

                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-600">
                          Przesyłanie pliku...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-lg font-medium text-slate-700">
                            Przeciągnij i upuść plik tutaj
                          </p>
                          <p className="text-slate-500 mt-1">
                            lub kliknij, aby wybrać plik
                          </p>
                        </div>
                        <p className="text-sm text-slate-400">
                          Obsługiwane formaty: PDF, JPEG, PNG, WEBP, DOC, DOCX
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
            ) : (
              <div className="p-6">
                {documents.length === 0 ? (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 mb-2">Brak dokumentów</p>
                    <p className="text-slate-400 text-sm">
                      Wgraj pierwszy dokument, aby rozpocząć analizę
                    </p>
                    <button
                      onClick={() => setViewMode("upload")}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Wgraj dokument
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {/* File Icon */}
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
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
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatFileSize(doc.fileSize)} •{" "}
                            {new Date(doc.uploadedAt).toLocaleString("pl-PL")}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex-shrink-0">
                          {getStatusBadge(doc.status)}
                        </div>

                        {/* AI Result Preview */}
                        {doc.status === "completed" && doc.aiResult && (
                          <button
                            onClick={() =>
                              console.log("AI Result:", doc.aiResult)
                            }
                            className="flex-shrink-0 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Zobacz wynik
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
