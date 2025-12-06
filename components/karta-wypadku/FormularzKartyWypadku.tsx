"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { KartaWypadku } from "@/types/karta-wypadku";

interface FormularzKartyWypadkuProps {
  initialData?: Partial<KartaWypadku>;
  onSubmit?: (data: KartaWypadku) => void;
  onSave?: (data: Partial<KartaWypadku>) => void;
}

export const FormularzKartyWypadku: React.FC<FormularzKartyWypadkuProps> = ({
  initialData,
  onSubmit,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<KartaWypadku>>({
    nazwaIAdresPodmiotuSporzadzajacego: "",
    daneIdentyfikacyjnePlatnika: {
      imieNazwiskoLubNazwa: "",
      adresSiedziby: "",
      nip: "",
      regon: "",
      pesel: "",
      dokumentTozsamosci: {
        rodzaj: "",
        seria: "",
        numer: "",
      },
    },
    daneIdentyfikacyjnePoszkodowanego: {
      imieNazwisko: "",
      pesel: "",
      dokumentTozsamosci: {
        rodzaj: "",
        seria: "",
        numer: "",
      },
      dataUrodzenia: "",
      miejsceUrodzenia: "",
      adresZamieszkania: "",
      tytulUbezpieczeniaWypadkowego: "",
    },
    informacjeOWypadku: {
      dataZgloszenia: "",
      imieNazwiskoOsobyZglaszajacej: "",
      informacjeOWypadku: "",
      swiadkowie: [
        { imieNazwisko: "", miejsceZamieszkania: "" },
        { imieNazwisko: "", miejsceZamieszkania: "" },
      ],
      czyJestWypadkiemPrzyPracy: "jest",
      art3Ust3Pkt: "",
      czyArt3a: false,
      uzasadnienieNieUznano: "",
      wykluczajacaPrzyczynaNaruszenie: "",
      przyczynienieSieNietrzezwosc: "",
    },
    pozostaleInformacje: {
      zapoznanieZTrecia: {
        imieNazwisko: "",
        data: "",
        podpis: "",
      },
      dataSporzadzenia: "",
      nazwaPodmiotuSporzadzajacego: "",
      dodatkowePole: "",
      przeszkodyTrudnosci: "",
      dataOdbioru: "",
      podpisUprawnionego: "",
      zalaczniki: [],
    },
    ...initialData,
  });

  const updateField = (path: string[], value: any) => {
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
      
      // Auto-save
      if (onSave) {
        onSave(newData);
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData as KartaWypadku);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Nagłówek */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <label className="block text-base font-bold text-slate-800">
            Nazwa i adres podmiotu sporządzającego kartę wypadku
          </label>
        </div>
        <textarea
          value={formData.nazwaIAdresPodmiotuSporzadzajacego || ""}
          onChange={(e) =>
            updateField(["nazwaIAdresPodmiotuSporzadzajacego"], e.target.value)
          }
          className="w-full px-5 py-3.5 border-2 border-blue-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-blue-300"
          rows={2}
          placeholder="Wprowadź nazwę i adres..."
        />
      </div>

      {/* I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK
            </h2>
          </div>
        </div>
        <div className="p-7 bg-white">
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-800 font-medium">
              Nie wypełniają podmioty niebędące płatnikami składek na ubezpieczenie wypadkowe.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            label="1. Imię i nazwisko lub nazwa"
            value={formData.daneIdentyfikacyjnePlatnika?.imieNazwiskoLubNazwa || ""}
            onChange={(e) =>
              updateField(
                ["daneIdentyfikacyjnePlatnika", "imieNazwiskoLubNazwa"],
                e.target.value
              )
            }
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              2. Adres siedziby
            </label>
            <textarea
              value={formData.daneIdentyfikacyjnePlatnika?.adresSiedziby || ""}
              onChange={(e) =>
                updateField(
                  ["daneIdentyfikacyjnePlatnika", "adresSiedziby"],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              3. NIP REGON PESEL
            </label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="NIP"
                value={formData.daneIdentyfikacyjnePlatnika?.nip || ""}
                onChange={(e) =>
                  updateField(
                    ["daneIdentyfikacyjnePlatnika", "nip"],
                    e.target.value
                  )
                }
              />
              <Input
                placeholder="REGON"
                value={formData.daneIdentyfikacyjnePlatnika?.regon || ""}
                onChange={(e) =>
                  updateField(
                    ["daneIdentyfikacyjnePlatnika", "regon"],
                    e.target.value
                  )
                }
              />
              <Input
                placeholder="PESEL"
                value={formData.daneIdentyfikacyjnePlatnika?.pesel || ""}
                onChange={(e) =>
                  updateField(
                    ["daneIdentyfikacyjnePlatnika", "pesel"],
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Dokument tożsamości (dowód osobisty lub paszport)
            </label>
            <div className="space-y-2">
              <Input
                placeholder="rodzaj dokumentu"
                value={
                  formData.daneIdentyfikacyjnePlatnika?.dokumentTozsamosci
                    ?.rodzaj || ""
                }
                onChange={(e) =>
                  updateField(
                    [
                      "daneIdentyfikacyjnePlatnika",
                      "dokumentTozsamosci",
                      "rodzaj",
                    ],
                    e.target.value
                  )
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="seria"
                  value={
                    formData.daneIdentyfikacyjnePlatnika?.dokumentTozsamosci
                      ?.seria || ""
                  }
                  onChange={(e) =>
                    updateField(
                      [
                        "daneIdentyfikacyjnePlatnika",
                        "dokumentTozsamosci",
                        "seria",
                      ],
                      e.target.value
                    )
                  }
                />
                <Input
                  placeholder="numer"
                  value={
                    formData.daneIdentyfikacyjnePlatnika?.dokumentTozsamosci
                      ?.numer || ""
                  }
                  onChange={(e) =>
                    updateField(
                      [
                        "daneIdentyfikacyjnePlatnika",
                        "dokumentTozsamosci",
                        "numer",
                      ],
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* II. DANE IDENTYFIKACYJNE POSZKODOWANEGO */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              DANE IDENTYFIKACYJNE POSZKODOWANEGO
            </h2>
          </div>
        </div>
        <div className="p-7 bg-white">

        <div className="space-y-5">
          <Input
            label="1. Imię i nazwisko poszkodowanego"
            value={
              formData.daneIdentyfikacyjnePoszkodowanego?.imieNazwisko || ""
            }
            onChange={(e) =>
              updateField(
                ["daneIdentyfikacyjnePoszkodowanego", "imieNazwisko"],
                e.target.value
              )
            }
            required
          />

          <Input
            label="2. PESEL"
            value={formData.daneIdentyfikacyjnePoszkodowanego?.pesel || ""}
            onChange={(e) =>
              updateField(
                ["daneIdentyfikacyjnePoszkodowanego", "pesel"],
                e.target.value
              )
            }
            required
          />

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Dokument tożsamości (dowód osobisty lub paszport)
            </label>
            <div className="space-y-2">
              <Input
                placeholder="rodzaj dokumentu"
                value={
                  formData.daneIdentyfikacyjnePoszkodowanego?.dokumentTozsamosci
                    ?.rodzaj || ""
                }
                onChange={(e) =>
                  updateField(
                    [
                      "daneIdentyfikacyjnePoszkodowanego",
                      "dokumentTozsamosci",
                      "rodzaj",
                    ],
                    e.target.value
                  )
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="seria"
                  value={
                    formData.daneIdentyfikacyjnePoszkodowanego
                      ?.dokumentTozsamosci?.seria || ""
                  }
                  onChange={(e) =>
                    updateField(
                      [
                        "daneIdentyfikacyjnePoszkodowanego",
                        "dokumentTozsamosci",
                        "seria",
                      ],
                      e.target.value
                    )
                  }
                />
                <Input
                  placeholder="numer"
                  value={
                    formData.daneIdentyfikacyjnePoszkodowanego
                      ?.dokumentTozsamosci?.numer || ""
                  }
                  onChange={(e) =>
                    updateField(
                      [
                        "daneIdentyfikacyjnePoszkodowanego",
                        "dokumentTozsamosci",
                        "numer",
                      ],
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="3. Data urodzenia"
              type="date"
              value={
                formData.daneIdentyfikacyjnePoszkodowanego?.dataUrodzenia || ""
              }
              onChange={(e) =>
                updateField(
                  ["daneIdentyfikacyjnePoszkodowanego", "dataUrodzenia"],
                  e.target.value
                )
              }
              required
            />
            <Input
              label="Miejsce urodzenia"
              value={
                formData.daneIdentyfikacyjnePoszkodowanego?.miejsceUrodzenia ||
                ""
              }
              onChange={(e) =>
                updateField(
                  ["daneIdentyfikacyjnePoszkodowanego", "miejsceUrodzenia"],
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              4. Adres zamieszkania
            </label>
            <textarea
              value={
                formData.daneIdentyfikacyjnePoszkodowanego?.adresZamieszkania ||
                ""
              }
              onChange={(e) =>
                updateField(
                  ["daneIdentyfikacyjnePoszkodowanego", "adresZamieszkania"],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              5. Tytuł ubezpieczenia wypadkowego
            </label>
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                <span className="font-bold">Uwaga:</span> Wymienić numer pozycji i pełny tytuł ubezpieczenia społecznego,
                zgodnie z art. 3 ust. 3 albo art. 3a ustawy z dnia 30 października
                2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i
                chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)
              </p>
            </div>
            <textarea
              value={
                formData.daneIdentyfikacyjnePoszkodowanego
                  ?.tytulUbezpieczeniaWypadkowego || ""
              }
              onChange={(e) =>
                updateField(
                  [
                    "daneIdentyfikacyjnePoszkodowanego",
                    "tytulUbezpieczeniaWypadkowego",
                  ],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={3}
              required
            />
          </div>
        </div>
        </div>
      </div>

      {/* III. INFORMACJE O WYPADKU */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">III</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              INFORMACJE O WYPADKU
            </h2>
          </div>
        </div>
        <div className="p-7 bg-white">

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="1. Data zgłoszenia"
              type="date"
              value={formData.informacjeOWypadku?.dataZgloszenia || ""}
              onChange={(e) =>
                updateField(
                  ["informacjeOWypadku", "dataZgloszenia"],
                  e.target.value
                )
              }
              required
            />
            <Input
              label="Imię i nazwisko osoby zgłaszającej wypadek"
              value={
                formData.informacjeOWypadku?.imieNazwiskoOsobyZglaszajacej || ""
              }
              onChange={(e) =>
                updateField(
                  ["informacjeOWypadku", "imieNazwiskoOsobyZglaszajacej"],
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              2. Informacje dotyczące okoliczności, przyczyn, czasu i miejsca
              wypadku, rodzaju i umiejscowienia urazu
            </label>
            <textarea
              value={formData.informacjeOWypadku?.informacjeOWypadku || ""}
              onChange={(e) =>
                updateField(
                  ["informacjeOWypadku", "informacjeOWypadku"],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={6}
              required
            />
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              3. Świadkowie wypadku:
            </label>
            {formData.informacjeOWypadku?.swiadkowie?.map((swiadek, index) => (
              <div key={index} className="mb-5 p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">Świadek {index + 1}</p>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="imię i nazwisko"
                    value={swiadek.imieNazwisko}
                    onChange={(e) => {
                      const newSwiadkowie = [
                        ...(formData.informacjeOWypadku?.swiadkowie || []),
                      ];
                      newSwiadkowie[index] = {
                        ...newSwiadkowie[index],
                        imieNazwisko: e.target.value,
                      };
                      updateField(
                        ["informacjeOWypadku", "swiadkowie"],
                        newSwiadkowie
                      );
                    }}
                  />
                  <Input
                    placeholder="miejsce zamieszkania"
                    value={swiadek.miejsceZamieszkania}
                    onChange={(e) => {
                      const newSwiadkowie = [
                        ...(formData.informacjeOWypadku?.swiadkowie || []),
                      ];
                      newSwiadkowie[index] = {
                        ...newSwiadkowie[index],
                        miejsceZamieszkania: e.target.value,
                      };
                      updateField(
                        ["informacjeOWypadku", "swiadkowie"],
                        newSwiadkowie
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              4. Wypadek jest / nie jest wypadkiem przy pracy określonym w art.
              3 ust. 3 pkt / albo art. 3a ustawy z dnia 30 października 2002 r.
              o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób
              zawodowych
            </label>
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
              <p className="text-xs text-blue-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Niepotrzebne skreślić.
              </p>
            </div>
            <div className="space-y-2">
              <Select
                options={[
                  { value: "jest", label: "jest" },
                  { value: "nie_jest", label: "nie jest" },
                ]}
                value={formData.informacjeOWypadku?.czyJestWypadkiemPrzyPracy}
                onValueChange={(value) =>
                  updateField(
                    ["informacjeOWypadku", "czyJestWypadkiemPrzyPracy"],
                    value
                  )
                }
                placeholder="Wybierz..."
              />
              {formData.informacjeOWypadku?.czyJestWypadkiemPrzyPracy ===
                "jest" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="art. 3 ust. 3 pkt (numer punktu)"
                    value={formData.informacjeOWypadku?.art3Ust3Pkt || ""}
                    onChange={(e) =>
                      updateField(
                        ["informacjeOWypadku", "art3Ust3Pkt"],
                        e.target.value
                      )
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.informacjeOWypadku?.czyArt3a || false}
                      onCheckedChange={(checked) =>
                        updateField(
                          ["informacjeOWypadku", "czyArt3a"],
                          checked
                        )
                      }
                      label="/ albo art. 3a"
                    />
                  </div>
                </div>
              )}
              {formData.informacjeOWypadku?.czyJestWypadkiemPrzyPracy ===
                "nie_jest" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Uzasadnienie i wskazanie dowodów, jeżeli zdarzenia nie
                    uznano za wypadek przy pracy
                  </label>
                  <textarea
                    value={
                      formData.informacjeOWypadku?.uzasadnienieNieUznano || ""
                    }
                    onChange={(e) =>
                      updateField(
                        ["informacjeOWypadku", "uzasadnienieNieUznano"],
                        e.target.value
                      )
                    }
                    className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              5. Stwierdzono, że wyłączną przyczyną wypadku było udowodnione
              naruszenie przez poszkodowanego przepisów dotyczących ochrony
              życia i zdrowia, spowodowane przez niego umyślnie lub wskutek
              rażącego niedbalstwa (wskazać dowody)
            </label>
            <textarea
              value={
                formData.informacjeOWypadku?.wykluczajacaPrzyczynaNaruszenie ||
                ""
              }
              onChange={(e) =>
                updateField(
                  [
                    "informacjeOWypadku",
                    "wykluczajacaPrzyczynaNaruszenie",
                  ],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={4}
            />
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              6. Stwierdzono, że poszkodowany, będąc w stanie nietrzeźwości lub
              pod wpływem środków odurzających lub substancji psychotropowych,
              przyczynił się w znacznym stopniu do spowodowania wypadku (wskazać
              dowody, a w przypadku odmowy przez poszkodowanego poddania się
              badaniu na zawartość tych substancji w organizmie - zamieścić
              informację o tym fakcie)
            </label>
            <textarea
              value={
                formData.informacjeOWypadku?.przyczynienieSieNietrzezwosc || ""
              }
              onChange={(e) =>
                updateField(
                  ["informacjeOWypadku", "przyczynienieSieNietrzezwosc"],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={4}
            />
          </div>
        </div>
        </div>
      </div>

      {/* IV. POZOSTAŁE INFORMACJE */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">IV</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              POZOSTAŁE INFORMACJE
            </h2>
          </div>
        </div>
        <div className="p-7 bg-white">

        <div className="space-y-5">
          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              1. Poszkodowanego (członka rodziny) zapoznano z treścią karty
              wypadku i pouczono o prawie zgłaszania uwag i zastrzeżeń do
              ustaleń zawartych w karcie wypadku
            </label>
            <div className="space-y-2">
              <Input
                placeholder="imię i nazwisko poszkodowanego (członka rodziny)"
                value={
                  formData.pozostaleInformacje?.zapoznanieZTrecia
                    ?.imieNazwisko || ""
                }
                onChange={(e) =>
                  updateField(
                    [
                      "pozostaleInformacje",
                      "zapoznanieZTrecia",
                      "imieNazwisko",
                    ],
                    e.target.value
                  )
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="data"
                  type="date"
                  value={
                    formData.pozostaleInformacje?.zapoznanieZTrecia?.data || ""
                  }
                  onChange={(e) =>
                    updateField(
                      ["pozostaleInformacje", "zapoznanieZTrecia", "data"],
                      e.target.value
                    )
                  }
                />
                <Input
                  placeholder="podpis"
                  value={
                    formData.pozostaleInformacje?.zapoznanieZTrecia?.podpis ||
                    ""
                  }
                  onChange={(e) =>
                    updateField(
                      [
                        "pozostaleInformacje",
                        "zapoznanieZTrecia",
                        "podpis",
                      ],
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              2. Kartę wypadku sporządzono w dniu
            </label>
            <div className="space-y-2">
              <Input
                type="date"
                value={formData.pozostaleInformacje?.dataSporzadzenia || ""}
                onChange={(e) =>
                  updateField(
                    ["pozostaleInformacje", "dataSporzadzenia"],
                    e.target.value
                  )
                }
              />
              <Input
                placeholder="1) nazwa podmiotu obowiązanego do sporządzenia karty wypadku"
                value={
                  formData.pozostaleInformacje?.nazwaPodmiotuSporzadzajacego ||
                  ""
                }
                onChange={(e) =>
                  updateField(
                    [
                      "pozostaleInformacje",
                      "nazwaPodmiotuSporzadzajacego",
                    ],
                    e.target.value
                  )
                }
              />
              <Input
                placeholder="2)"
                value={formData.pozostaleInformacje?.dodatkowePole || ""}
                onChange={(e) =>
                  updateField(
                    ["pozostaleInformacje", "dodatkowePole"],
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              3. Przeszkody i trudności uniemożliwiające sporządzenie karty
              wypadku w wymaganym terminie 14 dni
            </label>
            <textarea
              value={formData.pozostaleInformacje?.przeszkodyTrudnosci || ""}
              onChange={(e) =>
                updateField(
                  ["pozostaleInformacje", "przeszkodyTrudnosci"],
                  e.target.value
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={3}
            />
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              4. Kartę wypadku odebrano w dniu
            </label>
            <div className="space-y-2">
              <Input
                type="date"
                value={formData.pozostaleInformacje?.dataOdbioru || ""}
                onChange={(e) =>
                  updateField(
                    ["pozostaleInformacje", "dataOdbioru"],
                    e.target.value
                  )
                }
              />
              <Input
                placeholder="podpis uprawnionego"
                value={
                  formData.pozostaleInformacje?.podpisUprawnionego || ""
                }
                onChange={(e) =>
                  updateField(
                    ["pozostaleInformacje", "podpisUprawnionego"],
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              5. Załączniki:
            </label>
            <textarea
              value={
                formData.pozostaleInformacje?.zalaczniki?.join("\n") || ""
              }
              onChange={(e) =>
                updateField(
                  ["pozostaleInformacje", "zalaczniki"],
                  e.target.value.split("\n").filter((line) => line.trim())
                )
              }
              className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-slate-700 shadow-sm hover:border-slate-400 hover:shadow-md"
              rows={3}
              placeholder="Wpisz załączniki, każdy w osobnej linii"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex justify-end gap-4 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg border border-slate-200/60 px-8">
        <Button 
          type="button" 
          variant="outline" 
          className="px-8 py-3 rounded-xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Zapisz jako szkic
        </Button>
        <Button 
          type="submit" 
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl font-semibold text-white transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Zapisz i wygeneruj dokument
        </Button>
      </div>
    </form>
  );
};

