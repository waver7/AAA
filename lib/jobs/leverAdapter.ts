import { IngestedJob, JobSourceAdapter } from './types';

export class LeverAdapter implements JobSourceAdapter {
  sourceType = 'lever' as const;

  canHandle(url: string): boolean {
    return url.includes('jobs.lever.co');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const company = url.split('jobs.lever.co/')[1]?.split(/[/?#]/)[0];
    if (!company) return [];

    const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
    const response = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!response.ok) throw new Error(`Lever request failed with status ${response.status}.`);
    const postings = (await response.json()) as Array<Record<string, unknown>>;

    return postings.map((job) => {
      const description = String(job.descriptionPlain ?? job.description ?? '');
      const salaryRange = (job.categories as { commitment?: string; team?: string; location?: string; allLocations?: string[] } | undefined)?.team;
      return {
        externalId: String(job.id),
        title: String(job.text ?? 'Untitled role'),
        company,
        location: String((job.categories as { location?: string } | undefined)?.location ?? 'Unknown'),
        description,
        sourceUrl: String(job.hostedUrl ?? url),
        sourceType: 'lever',
        easyApply: true,
        requirements: extractRequirements(description),
        compensation: typeof salaryRange === 'string' && salaryRange.includes('$') ? salaryRange : undefined
      } as IngestedJob;
    });
  }
}

function extractRequirements(text: string) {
  return Array.from(text.matchAll(/\b(TypeScript|JavaScript|Node(?:\.js)?|React|Next\.js|PostgreSQL|Redis|AWS|Docker|Kubernetes|GraphQL|Terraform)\b/gi)).map(
    (match) => match[0]
  );
}
