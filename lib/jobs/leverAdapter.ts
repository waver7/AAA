import { IngestedJob, JobSourceAdapter } from './types';

export class LeverAdapter implements JobSourceAdapter {
  sourceType = 'lever' as const;

  canHandle(url: string): boolean {
    return url.includes('jobs.lever.co');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const company = url.split('jobs.lever.co/')[1]?.split('/')[0];
    if (!company) return [];

    const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) return [];
    const postings = (await response.json()) as Array<Record<string, unknown>>;

    return postings.map((job) => ({
      externalId: String(job.id),
      title: String(job.text ?? 'Untitled role'),
      company,
      location: String((job.categories as { location?: string } | undefined)?.location ?? 'Unknown'),
      description: String(job.descriptionPlain ?? ''),
      sourceUrl: String(job.hostedUrl ?? url),
      sourceType: 'lever',
      easyApply: true,
      requirements: [],
      compensation: undefined
    }));
  }
}
