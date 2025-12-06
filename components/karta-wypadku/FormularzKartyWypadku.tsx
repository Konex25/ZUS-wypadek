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
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nazwa i adres podmiotu sporządzającego kartę wypadku
        </label>
        <textarea
          value={formData.nazwaIAdresPodmiotuSporzadzajacego || ""}
          onChange={(e) =>
            updateField(["nazwaIAdresPodmiotuSporzadzajacego"], e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 bg-gray-100 p-2 rounded">
          I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK
        </h2>
        <p className="text-xs text-gray-600 mb-4 italic">
          Nie wypełniają podmioty niebędące płatnikami składek na ubezpieczenie wypadkowe.
        </p>

        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* II. DANE IDENTYFIKACYJNE POSZKODOWANEGO */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 bg-gray-100 p-2 rounded">
          II. DANE IDENTYFIKACYJNE POSZKODOWANEGO
        </h2>

        <div className="space-y-4">
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              5. Tytuł ubezpieczenia wypadkowego
            </label>
            <p className="text-xs text-gray-600 mb-2 italic">
              Wymienić numer pozycji i pełny tytuł ubezpieczenia społecznego,
              zgodnie z art. 3 ust. 3 albo art. 3a ustawy z dnia 30 października
              2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i
              chorób zawodowych (Dz. U. z 2019 r. poz. 1205, z późn. zm.)
            </p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* III. INFORMACJE O WYPADKU */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 bg-gray-100 p-2 rounded">
          III. INFORMACJE O WYPADKU
        </h2>

        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              required
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Świadkowie wypadku:
            </label>
            {formData.informacjeOWypadku?.swiadkowie?.map((swiadek, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Świadek {index + 1}</p>
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4. Wypadek jest / nie jest wypadkiem przy pracy określonym w art.
              3 ust. 3 pkt / albo art. 3a ustawy z dnia 30 października 2002 r.
              o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób
              zawodowych
            </label>
            <p className="text-xs text-gray-600 mb-2 italic">
              Niepotrzebne skreślić.
            </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* IV. POZOSTAŁE INFORMACJE */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 bg-gray-100 p-2 rounded">
          IV. POZOSTAŁE INFORMACJE
        </h2>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Wpisz załączniki, każdy w osobnej linii"
            />
          </div>
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Zapisz jako szkic
        </Button>
        <Button type="submit">Zapisz i wygeneruj dokument</Button>
      </div>
    </form>
  );
};

