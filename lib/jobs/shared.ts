import type { JobDescriptionSection, NormalizedCompensation } from './types';

const headingAliases = {
  responsibilities: ['responsibilities', 'what you will do', 'what you’ll do', 'what you will be doing', 'in this role', 'you will', 'your impact'],
  qualifications: ['qualifications', 'minimum qualifications', 'requirements', 'what you bring', 'about you', 'must have'],
  preferredQualifications: ['preferred qualifications', 'preferred', 'nice to have', 'bonus points', 'pluses'],
  benefits: ['benefits', 'perks', 'what we offer', 'why you’ll love', 'why you will love', 'compensation & benefits']
} as const;

export function htmlToStructuredText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|h1|h2|h3|h4|h5|h6|section)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function stripHtml(value: string) {
  return htmlToStructuredText(value).replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractRequirements(text: string) {
  return Array.from(text.matchAll(/\b(TypeScript|JavaScript|Node(?:\.js)?|React|Next\.js|PostgreSQL|Redis|AWS|Docker|Kubernetes|GraphQL|Terraform|Python|Go|Java|Ruby)\b/gi)).map(
    (match) => match[0]
  );
}

export function formatRelativeDate(value?: string | Date | null) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export function inferEmploymentType(...inputs: Array<string | null | undefined>) {
  const text = inputs.filter(Boolean).join(' ').toLowerCase();
  if (/full[- ]time/.test(text)) return 'Full-time';
  if (/part[- ]time/.test(text)) return 'Part-time';
  if (/contract|contractor/.test(text)) return 'Contract';
  if (/intern/.test(text)) return 'Internship';
  if (/temporary|temp/.test(text)) return 'Temporary';
  return undefined;
}

export function inferSeniority(title: string, ...inputs: Array<string | null | undefined>) {
  const text = [title, ...inputs].filter(Boolean).join(' ').toLowerCase();
  if (/principal/.test(text)) return 'Principal';
  if (/staff/.test(text)) return 'Staff';
  if (/senior|sr\.?\b/.test(text)) return 'Senior';
  if (/lead/.test(text)) return 'Lead';
  if (/junior|jr\.?\b|entry[- ]level/.test(text)) return 'Junior';
  return undefined;
}

export function normalizeCompensation(input: NormalizedCompensation | undefined) {
  if (!input) return undefined;
  const currency = input.currency ?? detectCurrency(input.text);
  const period = input.period ?? inferPeriod(input.text);
  const formattedRange =
    typeof input.min === 'number' || typeof input.max === 'number'
      ? formatCompensationRange(input.min, input.max, currency, period)
      : input.text?.trim();

  return {
    text: formattedRange,
    min: input.min,
    max: input.max,
    currency,
    period
  };
}

export function extractCompensationFromText(text: string): NormalizedCompensation | undefined {
  const range = text.match(/([$€£])\s?(\d{2,3}(?:[,\d]{0,6})?)\s*(?:-|to)\s*([$€£])?\s?(\d{2,3}(?:[,\d]{0,6})?)/i);
  if (range) {
    const currency = symbolToCurrency(range[1] ?? range[3]);
    return normalizeCompensation({
      text: range[0],
      min: Number(range[2].replace(/,/g, '')),
      max: Number(range[4].replace(/,/g, '')),
      currency,
      period: inferPeriod(text)
    });
  }

  const single = text.match(/([$€£])\s?(\d{2,3}(?:[,\d]{0,6})?)/i);
  if (single) {
    return normalizeCompensation({
      text: single[0],
      min: Number(single[2].replace(/,/g, '')),
      currency: symbolToCurrency(single[1]),
      period: inferPeriod(text)
    });
  }

  return undefined;
}

export function extractDescriptionSections(text: string) {
  const sections: JobDescriptionSection[] = [];
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let current: JobDescriptionSection | null = null;

  for (const line of lines) {
    const heading = normalizeHeading(line.replace(/:$/, ''));
    if (heading) {
      current = { title: heading, items: [] };
      sections.push(current);
      continue;
    }

    const item = line.replace(/^[-•*]\s*/, '').trim();
    if (!item) continue;

    if (!current) {
      current = { title: 'Overview', items: [] };
      sections.push(current);
    }

    current.items.push(item);
  }

  return sections.filter((section) => section.items.length > 0);
}

export function pickSectionItems(sections: JobDescriptionSection[], key: keyof typeof headingAliases) {
  const aliases = headingAliases[key] as readonly string[];
  const matches = sections.filter((section) => aliases.includes(section.title.toLowerCase()));
  return matches.flatMap((section) => section.items).slice(0, 12);
}

export function summarizeBenefits(sections: JobDescriptionSection[]) {
  return pickSectionItems(sections, 'benefits').slice(0, 10);
}

function normalizeHeading(value: string) {
  const lowered = value.toLowerCase();
  if (Object.values(headingAliases).some((aliases) => (aliases as readonly string[]).includes(lowered))) return value;
  return /^[A-Za-z][A-Za-z &'’/()-]{2,40}$/.test(value) ? value : null;
}

function symbolToCurrency(symbol?: string) {
  if (symbol === '€') return 'EUR';
  if (symbol === '£') return 'GBP';
  if (symbol === '$') return 'USD';
  return undefined;
}

function detectCurrency(text?: string) {
  if (!text) return undefined;
  return symbolToCurrency(text.match(/[$€£]/)?.[0]);
}

function inferPeriod(text?: string) {
  if (!text) return undefined;
  if (/hour|hr\b|\/hr|hourly/i.test(text)) return 'hour';
  if (/year|annually|annual|\/yr|per year/i.test(text)) return 'year';
  return undefined;
}

function formatCompensationRange(min?: number, max?: number, currency = 'USD', period?: 'hour' | 'year') {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
  const suffix = period === 'hour' ? '/hr' : period === 'year' ? '/yr' : '';
  if (typeof min === 'number' && typeof max === 'number') return `${formatter.format(min)} - ${formatter.format(max)}${suffix}`;
  if (typeof min === 'number') return `${formatter.format(min)}${suffix}`;
  if (typeof max === 'number') return `${formatter.format(max)}${suffix}`;
  return undefined;
}
