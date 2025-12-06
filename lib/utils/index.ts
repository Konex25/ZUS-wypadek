// Funkcje pomocnicze

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function validatePESEL(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(pesel[i]) * weights[i];
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(pesel[10]);
}

