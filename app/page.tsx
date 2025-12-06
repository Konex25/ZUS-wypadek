import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ZANT
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              ZUS Accident Notification Tool
            </p>
            <p className="text-lg text-gray-600">
              System wspierania zgłoszeń i decyzji ZUS w sprawie uznania zdarzeń za wypadki przy pracy
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Moduł 1: Wirtualny Asystent */}
            <Link
              href="/asystent"
              className="block bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Wirtualny Asystent
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Pomoc w zgłoszeniu wypadku przy pracy. Asystent pomoże Ci wypełnić wszystkie wymagane pola i zasugeruje uzupełnienia.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ Przyjazny interfejs</li>
                <li>✓ Wskazanie brakujących elementów</li>
                <li>✓ Sugestie uzupełnień</li>
              </ul>
            </Link>

            {/* Moduł 2: Model Wspierający Decyzję */}
            <Link
              href="/zus"
              className="block bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-indigo-500"
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
                  Moduł ZUS
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Analiza dokumentacji wypadku i wsparcie w podejmowaniu decyzji. Automatyczna analiza PDF i generowanie karty wypadku.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ Analiza dokumentów PDF</li>
                <li>✓ Rekomendacja decyzji</li>
                <li>✓ Generowanie karty wypadku</li>
              </ul>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>System wspierający procesy ZUS w zakresie wypadków przy pracy</p>
          </div>
        </div>
      </div>
    </main>
  );
}

