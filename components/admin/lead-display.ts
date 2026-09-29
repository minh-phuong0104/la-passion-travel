export function textOrDash(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : '—';
}

export function listOrDash(value: unknown): string {
  if (!Array.isArray(value)) return '—';
  const items = value.filter((item): item is string => typeof item === 'string' && !!item.trim());
  return items.length ? items.join(', ') : '—';
}

export function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

export function phoneNumber(phone: string | null | undefined, countryCode: string | null | undefined): string {
  if (!phone?.trim()) return '—';
  return phone.trim().startsWith('+') ? phone.trim() : `${countryCode || ''} ${phone}`.trim();
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date) + ' ICT';
}

export function statusStyle(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-50 text-blue-800 ring-blue-100';
    case 'contacted': return 'bg-amber-50 text-amber-800 ring-amber-100';
    case 'qualified': return 'bg-violet-50 text-violet-800 ring-violet-100';
    case 'won': return 'bg-emerald-50 text-emerald-800 ring-emerald-100';
    case 'lost': return 'bg-slate-100 text-slate-600 ring-slate-200';
    default: return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}
