import { normalizeIngestedJob } from './jobNormalization';
import { extractRequirements } from './shared';
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
      const description = String(job.description ?? job.description_plain ?? '');
      const compensation = formatSalary(job.salary as { salary_from?: number; salary_to?: number; salary_currency?: string } | undefined);

      return normalizeIngestedJob({
        externalId: String(job.id ?? job.shortcode ?? job.url),
        title: String(job.title ?? 'Untitled role'),
        company: account,
        location: String(location?.location_str ?? (location?.telecommuting ? 'Remote' : 'Unknown')),
        description,
        sourceUrl: String(job.application_url ?? job.shortlink ?? job.url ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: true,
        compensation,
        requirements: extractRequirements(description),
        postedAt: typeof job.created_at === 'string' ? job.created_at : undefined,
        workplaceType: location?.telecommuting ? 'remote' : workplaceType
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
