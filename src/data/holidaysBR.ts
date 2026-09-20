/**
 * Brazilian National Holidays Engine
 * Includes fixed national holidays and algorithm to calculate movable Christian holidays
 * (Carnaval, Sexta-feira Santa, Páscoa, Corpus Christi) using Meeus/Jones/Butcher algorithm.
 */

export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getBrazilianHolidaysForYear(year: number): string[] {
  const holidays: string[] = [
    `${year}-01-01`, // Confraternização Universal
    `${year}-04-21`, // Tiradentes
    `${year}-05-01`, // Dia do Trabalho
    `${year}-09-07`, // Independência do Brasil
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamação da República
    `${year}-11-20`, // Dia da Consciência Negra (Lei 14.759/23)
    `${year}-12-25`, // Natal
  ];

  const easter = getEasterDate(year);

  // Carnaval: 47 days before Easter
  const carnaval = new Date(easter.getTime() - 47 * 24 * 60 * 60 * 1000);
  holidays.push(formatDate(carnaval));

  // Sexta-feira Santa: 2 days before Easter
  const goodFriday = new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000);
  holidays.push(formatDate(goodFriday));

  // Corpus Christi: 60 days after Easter
  const corpusChristi = new Date(easter.getTime() + 60 * 24 * 60 * 60 * 1000);
  holidays.push(formatDate(corpusChristi));

  return holidays;
}

export function getDefaultHolidays(): string[] {
  const currentYear = new Date().getFullYear();
  const list = [
    ...getBrazilianHolidaysForYear(currentYear - 1),
    ...getBrazilianHolidaysForYear(currentYear),
    ...getBrazilianHolidaysForYear(currentYear + 1),
    ...getBrazilianHolidaysForYear(currentYear + 2),
  ];
  return Array.from(new Set(list)).sort();
}
