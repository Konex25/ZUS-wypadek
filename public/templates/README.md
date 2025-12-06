# Szablony PDF

Umieść tutaj szablony PDF od ZUS:

1. **zawiadomienie-wypadek.pdf** - szablon zawiadomienia o wypadku (z polami formularza)
2. **zapis-wyjasnien.pdf** - szablon zapisu wyjaśnień poszkodowanego (z polami formularza)

## Jak sprawdzić nazwy pól w szablonie PDF?

1. Umieść szablon PDF w tym folderze
2. Uruchom serwer deweloperski: `npm run dev`
3. Otwórz w przeglądarce: `http://localhost:3000/api/pdf/debug-fields?template=nazwa-pliku.pdf`
4. Zobaczysz listę wszystkich pól formularza w PDF wraz z ich nazwami

## Dostosowanie mapowania pól

Jeśli nazwy pól w Twoim szablonie PDF różnią się od domyślnych, zaktualizuj mapowanie w pliku `lib/pdf/fillTemplate.ts` w obiekcie `fieldMapping`.

