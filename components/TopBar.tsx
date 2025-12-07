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

      {/* Top bar - matches ZUS.pl style exactly 1:1 */}
      <div className="bg-white border-b relative z-50" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between" style={{ height: '64px', fontSize: '14px', lineHeight: '1.5', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left side - Logo ZUS + links */}
            <div className="flex items-center gap-8">
              {/* Logo ZUS - identyczne jak na zus.pl */}
              <Link href="/" className="flex items-center gap-3 no-underline hover:opacity-90 transition-opacity">
                <div className="flex items-center justify-center w-12 h-12 bg-[#007834] rounded" style={{ backgroundColor: '#007834', borderRadius: '4px' }}>
                  <span className="text-white font-bold text-xl" style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', fontFamily: 'Arial, Helvetica, sans-serif' }}>ZUS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#007834] font-bold text-sm leading-tight" style={{ color: '#007834', fontSize: '13px', lineHeight: '1.2', fontWeight: '700', fontFamily: 'Arial, Helvetica, sans-serif' }}>ZAKŁAD</span>
                  <span className="text-[#007834] font-bold text-sm leading-tight" style={{ color: '#007834', fontSize: '13px', lineHeight: '1.2', fontWeight: '700', fontFamily: 'Arial, Helvetica, sans-serif' }}>UBEZPIECZEŃ</span>
                  <span className="text-[#007834] font-bold text-sm leading-tight" style={{ color: '#007834', fontSize: '13px', lineHeight: '1.2', fontWeight: '700', fontFamily: 'Arial, Helvetica, sans-serif' }}>SPOŁECZNYCH</span>
                </div>
              </Link>
              
              {/* Links */}
              <ul className="flex items-center list-none m-0 p-0" style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: 0, padding: 0, listStyle: 'none', flexWrap: 'nowrap' }}>
              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/kontakt"
                  className="hover:text-blue-600 transition-colors no-underline"
                  style={{ color: '#333333', textDecoration: 'none', fontSize: '14px' }}
                >
                  Kontakt
                </Link>
              </li>
              
              {/* Language selector - matches ZUS.pl format */}
              <li className="relative" style={{ margin: 0, padding: 0 }}>
                <button
                  onClick={() => {
                    setLanguageMenuOpen(!languageMenuOpen);
                    setSearchMenuOpen(false);
                  }}
                  className="language-button flex items-center hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
                  aria-expanded={languageMenuOpen}
                  aria-haspopup="true"
                  style={{ color: '#333333', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>PL</span>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: '12px', height: '12px', marginLeft: '4px' }}
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
              </li>

              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/informacje-nieslyszacy"
                  className="hover:opacity-80 transition-opacity no-underline flex items-center justify-center"
                  style={{ 
                    color: '#ffffff', 
                    backgroundColor: '#1e3a8a',
                    textDecoration: 'none', 
                    width: '40px',
                    height: '40px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  aria-label="Informacje dla osób niesłyszących"
                >
                  {/* Ikona ucha dla osób niesłyszących */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2 20c.4 0 .8-.3.8-.8v-1.4c0-.4-.3-.8-.8-.8-.4 0-.8.3-.8.8v1.4c0 .4.4.8.8.8zM19.6 16.4c.4 0 .8-.3.8-.8 0-.4-.3-.8-.8-.8-.4 0-.8.3-.8.8 0 .4.4.8.8.8zM12 1C6.5 1 2 5.5 2 11v6c0 1.1.9 2 2 2h4v-8H5c-.6 0-1-.4-1-1 0-4.4 3.6-8 8-8s8 3.6 8 8c0 .6-.4 1-1 1h-5v8h4c1.1 0 2-.9 2-2v-6c0-5.5-4.5-10-10-10z" fill="#ffffff"/>
                  </svg>
                </Link>
              </li>

              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/informacje-niepelnosprawnosci"
                  className="hover:opacity-80 transition-opacity no-underline flex items-center justify-center"
                  style={{ 
                    color: '#ffffff', 
                    backgroundColor: '#1e3a8a',
                    textDecoration: 'none', 
                    width: '40px',
                    height: '40px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  aria-label="Informacje dla osób z niepełnosprawnościami"
                >
                  {/* Ikona wózka inwalidzkiego dla osób z niepełnosprawnościami */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="19.5" r="1.5" fill="#ffffff"/>
                    <circle cx="16.5" cy="19.5" r="1.5" fill="#ffffff"/>
                    <path d="M5 17h2v-2h10v2h2v-2.5c0-1.1-.9-2-2-2h-1v-2c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2V17h2zm2-6h8v2H7v-2z" fill="#ffffff"/>
                    <path d="M12 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#ffffff"/>
                  </svg>
                </Link>
              </li>

              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/bip"
                  className="hover:text-blue-600 transition-colors no-underline flex items-center gap-1"
                  style={{ color: '#333333', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ 
                    backgroundColor: '#dc2626', 
                    color: '#ffffff', 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '2px 6px', 
                    borderRadius: '2px',
                    lineHeight: '1.2'
                  }}>BIP</span>
                  <span>Biuletyn Informacji Publicznej</span>
                </Link>
              </li>


              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/rejestracja"
                  className="hover:bg-gray-50 transition-colors no-underline flex items-center gap-1 border"
                  style={{ 
                    color: '#1e3a8a', 
                    backgroundColor: '#ffffff',
                    borderColor: '#1e3a8a',
                    textDecoration: 'none', 
                    fontSize: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: '500',
                    borderWidth: '1px'
                  }}
                >
                  <span>Zarejestruj w PUE/eZUS</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }}>
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </Link>
              </li>

              <li style={{ margin: 0, padding: 0 }}>
                <Link
                  href="/logowanie"
                  className="hover:opacity-90 transition-opacity no-underline flex items-center gap-1"
                  style={{ 
                    color: '#1e3a8a', 
                    backgroundColor: '#ff6b35',
                    textDecoration: 'none', 
                    fontSize: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}
                >
                  <span>Zaloguj do PUE/eZUS</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }}>
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="#1e3a8a"/>
                  </svg>
                </Link>
              </li>
            </ul>
            </div>

            {/* Right side - matches ZUS.pl exactly */}
            <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search - matches ZUS.pl - green circle with magnifying glass */}
              <div className="relative">
                <button
                  onClick={() => {
                    setSearchMenuOpen(!searchMenuOpen);
                    setLanguageMenuOpen(false);
                  }}
                  className="search-button hover:opacity-80 transition-opacity flex items-center justify-center bg-[#007834] border-none cursor-pointer rounded-full"
                  aria-label="Szukaj"
                  style={{ 
                    color: '#ffffff', 
                    backgroundColor: '#007834',
                    textDecoration: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '10px', 
                    width: '40px',
                    height: '40px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
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

              <Link
                href="/fundusze-europejskie"
                className="hover:text-blue-600 transition-colors no-underline flex items-center gap-1"
                style={{ color: '#333333', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {/* Flaga UE - uproszczona wersja z predefiniowanymi pozycjami gwiazdek */}
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '14px', borderRadius: '2px' }}>
                  <rect width="20" height="14" fill="#003399"/>
                  <circle cx="10" cy="7" r="2.5" fill="#FFCC00"/>
                  <circle cx="10" cy="7" r="4" fill="none" stroke="#FFCC00" strokeWidth="0.5"/>
                  {/* 12 gwiazdek w predefiniowanych pozycjach (obliczone wcześniej, zaokrąglone) */}
                  <circle cx="14.2" cy="7" r="0.4" fill="#FFCC00"/>
                  <circle cx="13.64" cy="3.36" r="0.4" fill="#FFCC00"/>
                  <circle cx="12.1" cy="0.3" r="0.4" fill="#FFCC00"/>
                  <circle cx="9.5" cy="1.1" r="0.4" fill="#FFCC00"/>
                  <circle cx="7.9" cy="3.36" r="0.4" fill="#FFCC00"/>
                  <circle cx="5.8" cy="7" r="0.4" fill="#FFCC00"/>
                  <circle cx="7.9" cy="10.64" r="0.4" fill="#FFCC00"/>
                  <circle cx="9.5" cy="12.9" r="0.4" fill="#FFCC00"/>
                  <circle cx="12.1" cy="13.7" r="0.4" fill="#FFCC00"/>
                  <circle cx="13.64" cy="10.64" r="0.4" fill="#FFCC00"/>
                  <circle cx="10" cy="2.8" r="0.4" fill="#FFCC00"/>
                  <circle cx="10" cy="11.2" r="0.4" fill="#FFCC00"/>
                </svg>
                <span>Fundusze Europejskie Projekty ZUS</span>
              </Link>

              {/* Menu */}
              <button
                className="hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
                aria-label="Menu"
                style={{ color: '#333333', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}
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
