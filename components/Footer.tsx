import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#007834] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Sekcja 1: O systemie */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">O systemie ZANT</h3>
            <p className="text-sm text-green-50 leading-relaxed mb-4">
              ZANT (ZUS Accident Notification Tool) to system wspierający procesy ZUS w zakresie wypadków przy pracy 
              dla osób prowadzących pozarolniczą działalność gospodarczą. Pomagamy w prawidłowym wypełnieniu 
              dokumentów i zgłoszeniu wypadku zgodnie z wymogami prawnymi.
            </p>
          </div>

          {/* Sekcja 2: Przydatne linki ZUS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Linki ZUS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.zus.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-50 hover:text-white transition-colors underline inline-flex items-center gap-1"
                >
                  <span>Strona główna ZUS</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.zus.pl/baza-wiedzy/poradniki-i-publikacje"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-50 hover:text-white transition-colors underline inline-flex items-center gap-1"
                >
                  <span>Baza wiedzy ZUS</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.zus.pl/platnicy/elektroniczny-zus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-50 hover:text-white transition-colors underline inline-flex items-center gap-1"
                >
                  <span>Platforma PUE/eZUS</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sekcja 3: Kontakt */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Kontakt</h3>
            <p className="text-sm text-green-50 mb-3 leading-relaxed">
              W sprawach dotyczących wypadków przy pracy skontaktuj się z najbliższą placówką ZUS.
            </p>
            <Link
              href="https://www.zus.pl/kontakt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-50 hover:text-white transition-colors underline inline-flex items-center gap-1 font-semibold"
            >
              <span>Znajdź placówkę ZUS</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Dolna wstążka */}
        <div className="border-t border-green-600 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-green-50">
            <p className="mb-2 md:mb-0">© 2025 ZANT - ZUS Accident Notification Tool</p>
            <div className="flex gap-6">
              <Link
                href="/polityka-prywatnosci"
                className="hover:text-white transition-colors underline"
              >
                Polityka prywatności
              </Link>
              <Link
                href="/regulamin"
                className="hover:text-white transition-colors underline"
              >
                Regulamin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

