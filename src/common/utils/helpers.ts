export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeName(input: string): string {
  return input.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function getPagination(page = 1, limit = 10) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateStartWib(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(
    DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00.000+07:00` : value,
  );
}

export function parseDateEndWib(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(
    DATE_ONLY_PATTERN.test(value) ? `${value}T23:59:59.999+07:00` : value,
  );
}

export function startOfDayWib(date = new Date()): Date {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  wib.setUTCHours(0, 0, 0, 0);
  return new Date(wib.getTime() - 7 * 60 * 60 * 1000);
}
