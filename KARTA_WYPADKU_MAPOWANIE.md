# MAPOWANIE PÓL - KARTA WYPADKU

## Mapowanie nazw w kodzie ↔ etykiety w PDF

### I. DANE IDENTYFIKACYJNE PŁATNIKA SKŁADEK

| Nazwa w kodzie | Etykieta w PDF |
|----------------|----------------|
| `daneIdentyfikacyjnePlatnika.imieNazwiskoLubNazwa` | 1. Imię i nazwisko lub nazwa |
| `daneIdentyfikacyjnePlatnika.adresSiedziby` | 2. Adres siedziby |
| `daneIdentyfikacyjnePlatnika.nip` | 3. NIP |
| `daneIdentyfikacyjnePlatnika.regon` | 3. REGON |
| `daneIdentyfikacyjnePlatnika.pesel` | 3. PESEL |
| `daneIdentyfikacyjnePlatnika.dokumentTozsamosci.rodzaj` | rodzaj dokumentu |
| `daneIdentyfikacyjnePlatnika.dokumentTozsamosci.seria` | seria |
| `daneIdentyfikacyjnePlatnika.dokumentTozsamosci.numer` | numer |

### II. DANE IDENTYFIKACYJNE POSZKODOWANEGO

| Nazwa w kodzie | Etykieta w PDF |
|----------------|----------------|
| `daneIdentyfikacyjnePoszkodowanego.imieNazwisko` | 1. Imię i nazwisko poszkodowanego |
| `daneIdentyfikacyjnePoszkodowanego.pesel` | 2. PESEL |
| `daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.rodzaj` | rodzaj dokumentu |
| `daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.seria` | seria |
| `daneIdentyfikacyjnePoszkodowanego.dokumentTozsamosci.numer` | numer |
| `daneIdentyfikacyjnePoszkodowanego.dataUrodzenia` | 3. Data urodzenia |
| `daneIdentyfikacyjnePoszkodowanego.miejsceUrodzenia` | 3. Miejsce urodzenia |
| `daneIdentyfikacyjnePoszkodowanego.adresZamieszkania` | 4. Adres zamieszkania |
| `daneIdentyfikacyjnePoszkodowanego.tytulUbezpieczeniaWypadkowego` | 5. Tytuł ubezpieczenia wypadkowego |

### III. INFORMACJE O WYPADKU

| Nazwa w kodzie | Etykieta w PDF |
|----------------|----------------|
| `informacjeOWypadku.dataZgloszenia` | 1. Data zgłoszenia |
| `informacjeOWypadku.imieNazwiskoOsobyZglaszajacej` | 1. Imię i nazwisko osoby zgłaszającej wypadek |
| `informacjeOWypadku.informacjeOWypadku` | 2. Informacje dotyczące okoliczności, przyczyn, czasu i miejsca wypadku, rodzaju i umiejscowienia urazu |
| `informacjeOWypadku.swiadkowie[].imieNazwisko` | 3. Świadkowie wypadku - imię i nazwisko |
| `informacjeOWypadku.swiadkowie[].miejsceZamieszkania` | 3. Świadkowie wypadku - miejsce zamieszkania |
| `informacjeOWypadku.czyJestWypadkiemPrzyPracy` | 4. Wypadek jest / nie jest |
| `informacjeOWypadku.art3Ust3Pkt` | 4. art. 3 ust. 3 pkt |
| `informacjeOWypadku.czyArt3a` | 4. / albo art. 3a |
| `informacjeOWypadku.uzasadnienieNieUznano` | 4. Uzasadnienie i wskazanie dowodów, jeżeli zdarzenia nie uznano za wypadek przy pracy |
| `informacjeOWypadku.wykluczajacaPrzyczynaNaruszenie` | 5. Stwierdzono, że wyłączną przyczyną wypadku było udowodnione naruszenie... |
| `informacjeOWypadku.przyczynienieSieNietrzezwosc` | 6. Stwierdzono, że poszkodowany, będąc w stanie nietrzeźwości... |

### IV. POZOSTAŁE INFORMACJE

| Nazwa w kodzie | Etykieta w PDF |
|----------------|----------------|
| `pozostaleInformacje.zapoznanieZTrecia.imieNazwisko` | 1. imię i nazwisko poszkodowanego (członka rodziny) |
| `pozostaleInformacje.zapoznanieZTrecia.data` | 1. data |
| `pozostaleInformacje.zapoznanieZTrecia.podpis` | 1. podpis |
| `pozostaleInformacje.dataSporzadzenia` | 2. Kartę wypadku sporządzono w dniu |
| `pozostaleInformacje.nazwaPodmiotuSporzadzajacego` | 2. 1) nazwa podmiotu obowiązanego do sporządzenia karty wypadku |
| `pozostaleInformacje.dodatkowePole` | 2. 2) |
| `pozostaleInformacje.przeszkodyTrudnosci` | 3. Przeszkody i trudności uniemożliwiające sporządzenie karty wypadku w wymaganym terminie 14 dni |
| `pozostaleInformacje.dataOdbioru` | 4. Kartę wypadku odebrano w dniu |
| `pozostaleInformacje.podpisUprawnionego` | 4. podpis uprawnionego |
| `pozostaleInformacje.zalaczniki` | 5. Załączniki |

## Użycie

### 1. Formularz

```tsx
import { FormularzKartyWypadku } from "@/components/karta-wypadku/FormularzKartyWypadku";
import { KartaWypadku } from "@/types/karta-wypadku";

<FormularzKartyWypadku
  initialData={data}
  onSubmit={(data: KartaWypadku) => {
    // Obsługa zapisu
  }}
  onSave={(data: Partial<KartaWypadku>) => {
    // Auto-save
  }}
/>
```

### 2. Generowanie dokumentu HTML

```tsx
import { generateKartaWypadkuHTML } from "@/lib/karta-wypadku/generateDocument";
import { KartaWypadku } from "@/types/karta-wypadku";

const html = generateKartaWypadkuHTML(data);
```

### 3. API endpoint

```typescript
POST /api/karta-wypadku/generate
Content-Type: application/json

{
  // Dane KartaWypadku
}

// Zwraca HTML dokumentu
```

## Struktura plików

```
types/
  └── karta-wypadku.ts          # TypeScript interfaces

components/
  └── karta-wypadku/
      └── FormularzKartyWypadku.tsx  # Komponent formularza

lib/
  └── karta-wypadku/
      └── generateDocument.ts   # Funkcje generujące HTML/PDF

app/
  ├── karta-wypadku/
  │   └── page.tsx              # Strona z formularzem
  └── api/
      └── karta-wypadku/
          └── generate/
              └── route.ts      # API endpoint
```

