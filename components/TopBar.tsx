"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function TopBar() {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".language-menu") && !target.closest(".language-button")) {
        setLanguageMenuOpen(false);
      }
      if (!target.closest(".search-menu") && !target.closest(".search-button")) {
        setSearchMenuOpen(false);
      }
    };

    if (languageMenuOpen || searchMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [languageMenuOpen, searchMenuOpen]);

  return (
    <>
      {/* Accessibility links - hidden but accessible for screen readers */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Przejdź do treści
        </a>
        <a href="#sitemap" className="skip-link">
          Przejdź do mapy strony
        </a>
      </div>

      {/* Top bar - matches ZUS.pl style exactly */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12 text-sm">
            {/* Left side - matches ZUS.pl */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors no-underline"
              >
                Strona główna ZUS
              </Link>
              <Link
                href="/kontakt"
                className="text-gray-700 hover:text-blue-600 transition-colors no-underline"
              >
                Kontakt
              </Link>
            </div>

            {/* Right side - matches ZUS.pl */}
            <div className="flex items-center gap-4">
              {/* Language selector - matches ZUS.pl format */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLanguageMenuOpen(!languageMenuOpen);
                    setSearchMenuOpen(false);
                  }}
                  className="language-button flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
                  aria-expanded={languageMenuOpen}
                  aria-haspopup="true"
                >
                  Zmień język{" "}
                  <span className="text-xs">PL - polski</span>
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {languageMenuOpen && (
                  <div className="language-menu absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <Link
                      href="/?lang=pl"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 no-underline"
                      onClick={() => setLanguageMenuOpen(false)}
                    >
                      PL - polski
                    </Link>
                    <Link
                      href="/?lang=en"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 no-underline"
                      onClick={() => setLanguageMenuOpen(false)}
                    >
                      EN - angielski
                    </Link>
                    <Link
                      href="/?lang=ua"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 no-underline"
                      onClick={() => setLanguageMenuOpen(false)}
                    >
                      UA - ukraiński
                    </Link>
                  </div>
                )}
              </div>

              {/* Register button */}
              <Link
                href="/rejestracja"
                className="text-gray-700 hover:text-blue-600 transition-colors no-underline"
              >
                Zarejestruj wPUE/eZUS
              </Link>

              {/* Login button */}
              <Link
                href="/logowanie"
                className="text-gray-700 hover:text-blue-600 transition-colors no-underline"
              >
                Zaloguj doPUE/eZUS
              </Link>

              {/* Search - matches ZUS.pl */}
              <div className="relative">
                <button
                  onClick={() => {
                    setSearchMenuOpen(!searchMenuOpen);
                    setLanguageMenuOpen(false);
                  }}
                  className="search-button text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  aria-label="Szukaj"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Szukaj</span>
                </button>
                {searchMenuOpen && (
                  <div className="search-menu absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 p-4">
                    <input
                      type="text"
                      placeholder="Wpisz szukaną frazę..."
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Szukaj
                    </button>
                  </div>
                )}
              </div>

              {/* Menu */}
              <button
                className="text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
                aria-label="Menu"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

