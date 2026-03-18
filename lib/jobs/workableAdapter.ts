import { normalizeIngestedJob } from './jobNormalization';
import {
  extractCompensationFromText,
  extractDescriptionSections,
  extractRequirements,
  htmlToStructuredText,
  inferEmploymentType,
  inferSeniority,
  normalizeCompensation,
  pickSectionItems,
  summarizeBenefits
} from './shared';
import type { IngestedJob, JobSourceAdapter } from './types';

export class WorkableAdapter implements JobSourceAdapter {
  sourceType = 'generic' as const;
  sourceName = 'Workable';

  canHandle(url: string): boolean {
    return url.includes('workable.com');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const account = resolveAccount(url);
    if (!account) return [];

    const apiUrl = `https://www.workable.com/api/accounts/${account}?details=true`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Workable request failed with status ${response.status}.`);
    const payload = (await response.json()) as { jobs?: Array<Record<string, unknown>> };

    return (payload.jobs ?? []).map((job) => {
      const location = job.location as { location_str?: string; workplace_type?: string; telecommuting?: boolean } | undefined;
      const workplaceType = location?.workplace_type?.replace('_', ' ');
      const description = htmlToStructuredText(String(job.description ?? job.description_plain ?? ''));
      const sections = extractDescriptionSections(description);
      const salary = job.salary as { salary_from?: number; salary_to?: number; salary_currency?: string } | undefined;
      const compensation =
        normalizeCompensation({
          text: formatSalary(salary),
          min: salary?.salary_from,
          max: salary?.salary_to,
          currency: salary?.salary_currency?.toUpperCase(),
          period: 'year'
        }) ?? extractCompensationFromText(description);

      return normalizeIngestedJob({
        externalId: String(job.id ?? job.shortcode ?? job.url),
        title: String(job.title ?? 'Untitled role'),
        company: account,
        location: String(location?.location_str ?? (location?.telecommuting ? 'Remote' : 'Unknown')),
        locationDetails: String((job as { location_string?: string }).location_string ?? '') || undefined,
        description,
        sourceUrl: String(job.application_url ?? job.shortlink ?? job.url ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: true,
        compensation: compensation?.text,
        compensationMin: compensation?.min,
        compensationMax: compensation?.max,
        compensationCurrency: compensation?.currency,
        compensationPeriod: compensation?.period,
        requirements: extractRequirements(description),
        responsibilities: pickSectionItems(sections, 'responsibilities'),
        qualifications: pickSectionItems(sections, 'qualifications'),
        preferredQualifications: pickSectionItems(sections, 'preferredQualifications'),
        benefits: summarizeBenefits(sections),
        descriptionSections: sections,
        postedAt: typeof job.created_at === 'string' ? job.created_at : undefined,
        updatedAt: typeof job.updated_at === 'string' ? job.updated_at : undefined,
        workplaceType: location?.telecommuting ? 'remote' : workplaceType,
        employmentType: inferEmploymentType(String((job as { employment_type?: string }).employment_type ?? ''), description),
        team: String((job as { department?: string }).department ?? '') || undefined,
        seniority: inferSeniority(String(job.title ?? ''), description)
      });
    });
  }
}

function resolveAccount(url: string) {
  const accountFromApi = url.match(/workable\.com\/api\/accounts\/([^/?#]+)/)?.[1];
  if (accountFromApi) return accountFromApi;

  const subdomainMatch = url.match(/https?:\/\/([^.]+)\.workable\.com/);
  if (subdomainMatch?.[1]) return subdomainMatch[1];

  return null;
}

function formatSalary(salary?: { salary_from?: number; salary_to?: number; salary_currency?: string }) {
  if (!salary?.salary_from && !salary?.salary_to) return undefined;
  const currency = (salary.salary_currency ?? 'USD').toUpperCase();
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
  const from = typeof salary.salary_from === 'number' ? formatter.format(salary.salary_from) : undefined;
  const to = typeof salary.salary_to === 'number' ? formatter.format(salary.salary_to) : undefined;
  if (from && to) return `${from} - ${to}`;
  return from ?? to;
}
