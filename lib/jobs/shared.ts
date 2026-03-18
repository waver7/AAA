export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
