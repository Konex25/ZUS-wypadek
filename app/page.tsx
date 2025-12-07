import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Wirtualny Asystent */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                ZANT
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-semibold">
                ZUS Accident Notification Tool
              </p>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                System wspierania zgłoszeń i decyzji ZUS w sprawie uznania
                zdarzeń za wypadki przy pracy
              </p>
            </div>

            {/* Główna karta Wirtualnego Asystenta */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12 border-2 border-blue-100">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-full p-6">
                    <svg
                      className="w-16 h-16 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Wirtualny Asystent
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Pomoc w zgłoszeniu wypadku przy pracy. Asystent pomoże Ci
                    wypełnić wszystkie wymagane pola, wskaże brakujące elementy
                    i zasugeruje uzupełnienia zgodnie z wymogami ZUS.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
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
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Przyjazny interfejs
                        </h3>
                        <p className="text-sm text-gray-600">
                          Intuicyjny formularz krok po kroku
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
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
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Wskazanie brakujących elementów
                        </h3>
                        <p className="text-sm text-gray-600">
                          Automatyczna weryfikacja kompletności
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
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
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Sugestie uzupełnień
                        </h3>
                        <p className="text-sm text-gray-600">
                          Inteligentne podpowiedzi i przykłady
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
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
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Zgodność z przepisami
                        </h3>
                        <p className="text-sm text-gray-600">
                          Zgodność z wymogami ZUS
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/asystent"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Rozpocznij zgłoszenie →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja: W jakich przypadkach wypełnia się dokumenty */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              W jakich przypadkach wypełnia się dokumenty?
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Zawiadomienie o wypadku przy pracy należy złożyć w następujących
              sytuacjach:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Karta 1 */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-100">
                <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Wypadek podczas pracy
                </h3>
                <p className="text-gray-700">
                  Gdy doznałeś urazu podczas wykonywania zwykłych czynności
                  związanych z prowadzoną działalnością gospodarczą.
                </p>
              </div>

              {/* Karta 2 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-100">
                <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-amber-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Wypadek w drodze do/z pracy
                </h3>
                <p className="text-gray-700">
                  Gdy wypadek nastąpił podczas podróży związanej z wykonywaniem
                  działalności gospodarczej.
                </p>
              </div>

              {/* Karta 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Wypadek podczas delegacji
                </h3>
                <p className="text-gray-700">
                  Gdy wypadek nastąpił podczas wykonywania zadań związanych z
                  działalnością poza miejscem jej prowadzenia.
                </p>
              </div>

              {/* Karta 4 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Wypadek podczas szkolenia
                </h3>
                <p className="text-gray-700">
                  Gdy wypadek nastąpił podczas szkolenia związanego z wykonywaną
                  działalnością gospodarczą.
                </p>
              </div>

              {/* Karta 5 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Wypadek podczas obsługi klienta
                </h3>
                <p className="text-gray-700">
                  Gdy wypadek nastąpił podczas bezpośredniej obsługi klienta w
                  ramach prowadzonej działalności.
                </p>
              </div>

              {/* Karta 6 */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-100">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Inne sytuacje zawodowe
                </h3>
                <p className="text-gray-700">
                  Wszystkie inne sytuacje, gdy wypadek nastąpił w związku z
                  wykonywaną działalnością gospodarczą.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja informacyjna z linkami do ustaw i ZUS */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              Podstawa prawna
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Informacje o ubezpieczeniu wypadkowym i przepisach regulujących
              zgłoszenia wypadków przy pracy
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-gray-200">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Zakład Ubezpieczeń Społecznych (ZUS) jest instytucją, która
                  przede wszystkim gromadzi składki na ubezpieczenia społeczne,
                  przyznaje i wypłaca świadczenia. Ubezpieczenia społeczne
                  obejmują ubezpieczenia:
                </p>

                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>emerytalne,</li>
                  <li>rentowe,</li>
                  <li>chorobowe,</li>
                  <li>wypadkowe.</li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
                  <p className="text-gray-800 leading-relaxed">
                    <strong className="text-blue-900">
                      Każde z tych ubezpieczeń chroni nas przed innym rodzajem
                      ryzyka.
                    </strong>{" "}
                    Ubezpieczenie wypadkowe chroni przed ryzykiem wypadku przy
                    pracy, o którym mowa w{" "}
                    <a
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20021671340"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      ustawie z 30 października 2002 r. o ubezpieczeniu
                      społecznym z tytułu wypadków przy pracy i chorób
                      zawodowych
                    </a>
                    .
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  <strong>ZUS</strong> – na podstawie tych przepisów, a także{" "}
                  <a
                    href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220000255"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    rozporządzenia Ministra Rodziny i Polityki Społecznej z 23
                    stycznia 2022 r.
                  </a>{" "}
                  – obsługuje między innymi zawiadomienia o wypadku przy pracy,
                  osób które prowadzą pozarolniczą działalność gospodarczą.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                      Przepisy prawne
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="hhttps://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20021991673/U/D20021673Lj.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">📄</span>
                          <span>
                            Ustawa z 30 października 2002 r. o ubezpieczeniu
                            społecznym z tytułu wypadków przy pracy i chorób
                            zawodowych
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220000223"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">📄</span>
                          <span>
                            Rozporządzenie Ministra Rodziny i Polityki
                            Społecznej z 23 stycznia 2022 r.
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Strony ZUS
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="https://www.zus.pl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">🌐</span>
                          <span>Strona główna ZUS</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.zus.pl/baza-wiedzy/poradniki-i-publikacje"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">📚</span>
                          <span>Baza wiedzy ZUS</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.zus.pl/platnicy/elektroniczny-zus"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">💻</span>
                          <span>Platforma PUE/eZUS</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.zus.pl/kontakt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline flex items-start gap-2"
                        >
                          <span className="flex-shrink-0">📞</span>
                          <span>Kontakt z ZUS</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja z Modułem ZUS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/admin/case"
              className="block bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-8 h-8 text-indigo-600"
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Moduł ZUS - Analiza Wypadków
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Analiza dokumentacji wypadku i wsparcie w podejmowaniu decyzji.
                Automatyczna analiza PDF i generowanie karty wypadku.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ Analiza dokumentów PDF</li>
                <li>✓ Rekomendacja decyzji</li>
                <li>✓ Generowanie karty wypadku</li>
              </ul>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
