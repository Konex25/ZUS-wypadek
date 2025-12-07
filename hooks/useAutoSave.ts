"use client";

import { useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { AccidentReport } from "@/types";

const DEFAULT_STORAGE_KEY = "zus-wypadek-form-data";
const AUTO_SAVE_DELAY = 500; // ms

/**
 * Hook do automatycznego zapisywania danych formularza do localStorage
 * @param formData - Dane formularza do zapisania
 * @param enabled - Czy auto-save jest włączony (domyślnie true)
 * @param storageKey - Klucz w localStorage (opcjonalny, domyślnie "zus-wypadek-form-data")
 */
export function useAutoSave(
  formData: Partial<AccidentReport>,
  enabled: boolean = true,
  storageKey?: string
) {
  const key = storageKey || DEFAULT_STORAGE_KEY;
  const [savedData, setSavedData, clearSavedData] = useLocalStorage<Partial<AccidentReport>>(
    key,
    {}
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;

    // Serializuj dane do porównania
    const currentDataString = JSON.stringify(formData);

    // Jeśli dane się nie zmieniły, nie zapisuj
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Wyczyść poprzedni timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ustaw nowy timeout
    timeoutRef.current = setTimeout(() => {
      setSavedData(formData);
      lastSavedRef.current = currentDataString;
      console.log("Auto-saved form data to localStorage");
    }, AUTO_SAVE_DELAY);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, enabled, setSavedData]);

  // Funkcja do przywrócenia zapisanych danych
  const restoreData = (): Partial<AccidentReport> | null => {
    if (Object.keys(savedData).length === 0) {
      return null;
    }
    return savedData;
  };

  // Funkcja do wyczyszczenia zapisanych danych
  const clearData = () => {
    clearSavedData();
    lastSavedRef.current = "";
  };

  return {
    savedData,
    restoreData,
    clearData,
    hasSavedData: Object.keys(savedData).length > 0,
  };
}


