# ZANT - ZUS Accident Notification Tool

System wspierania zgłoszeń i decyzji ZUS w sprawie uznania zdarzeń za wypadki przy pracy.

## 🚀 Technologie

- **Next.js 14** - Framework React z App Router
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Stylowanie
- **React** - Biblioteka UI

## 📋 Wymagania

- Node.js 18+ 
- npm lub yarn

## 🛠️ Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Uruchom serwer deweloperski:
```bash
npm run dev
```

3. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce

## 📁 Struktura projektu

```
├── app/              # Next.js App Router
│   ├── layout.tsx    # Główny layout
│   ├── page.tsx      # Strona główna
│   ├── asystent/     # Moduł wirtualnego asystenta
│   └── zus/          # Moduł analizy ZUS
├── components/       # Komponenty React
├── lib/              # Funkcje pomocnicze
├── types/            # Definicje TypeScript
└── public/           # Pliki statyczne
```

## 🎯 Moduły

### 1. Wirtualny Asystent (`/asystent`)
Pomoc w zgłoszeniu wypadku przy pracy dla obywateli.

### 2. Moduł ZUS (`/zus`)
Analiza dokumentacji i wsparcie w podejmowaniu decyzji dla pracowników ZUS.

## 📝 Plan rozwoju

Szczegółowy plan działania znajduje się w pliku `PLAN.md`.

## 🔒 Bezpieczeństwo i RODO

Aplikacja została zaprojektowana z uwzględnieniem wymagań RODO:
- Minimalizacja przechowywania danych osobowych
- Szyfrowanie danych wrażliwych
- Informacje o przetwarzaniu danych

## 📄 Licencja

Projekt stworzony na potrzeby konkursu ZUS.

