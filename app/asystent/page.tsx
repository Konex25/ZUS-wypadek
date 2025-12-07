"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AsystentPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Formularze ZUS
            </h1>
            <p className="text-lg text-gray-600">
              Wybierz typ formularza, który chcesz wypełnić
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Zawiadomienie o wypadku (EWYP) */}
            <Card className="p-8 hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="flex items-start mb-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Zawiadomienie o wypadku
                    </h2>
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      EWYP
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Podstawowe zgłoszenie wypadku przy pracy. Zawiera dane osobowe, 
                    informacje o wypadku oraz okolicznościach zdarzenia.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Dane osobowe poszkodowanego</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Informacje o wypadku</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Opis okoliczności i przyczyn</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Weryfikacja elementów definicji</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href="/asystent/ewyp" className="block mt-auto">
                <Button variant="primary" size="lg" className="w-full">
                  Rozpocznij wypełnianie EWYP →
                </Button>
              </Link>
            </Card>

            {/* Zapis wyjaśnień poszkodowanego */}
            <Card className="p-8 hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="flex items-start mb-4 flex-1">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    Zapis wyjaśnień poszkodowanego
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Szczegółowe wyjaśnienia dotyczące wypadku. Zawiera informacje 
                    o czynnościach przed wypadkiem, środkach ochrony, BHP i innych szczegółach.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Szczegółowy opis zdarzenia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Informacje o BHP i środkach ochrony</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Informacje o maszynach i urządzeniach</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Szczegółowe wyjaśnienia poszkodowanego</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href="/asystent/wyjasnienia" className="block mt-auto">
                <Button variant="primary" size="lg" className="w-full">
                  Rozpocznij wypełnianie wyjaśnień →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
