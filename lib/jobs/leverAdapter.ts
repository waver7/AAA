import { normalizeIngestedJob } from './jobNormalization';
import { extractRequirements } from './shared';
import type { IngestedJob, JobSourceAdapter } from './types';

export class LeverAdapter implements JobSourceAdapter {
  sourceType = 'lever' as const;
  sourceName = 'Lever';

  canHandle(url: string): boolean {
    return url.includes('jobs.lever.co');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const company = url.split('jobs.lever.co/')[1]?.split(/[/?#]/)[0];
    if (!company) return [];

    const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Lever request failed with status ${response.status}.`);
    const postings = (await response.json()) as Array<Record<string, unknown>>;

    return postings.map((job) => {
      const description = String(job.descriptionPlain ?? job.description ?? '');
      const categories = job.categories as { commitment?: string; team?: string; location?: string; workplaceType?: string } | undefined;
      const salaryRange = categories?.team;
      return normalizeIngestedJob({
        externalId: String(job.id),
        title: String(job.text ?? 'Untitled role'),
        company,
        location: String(categories?.location ?? 'Unknown'),
        description,
        sourceUrl: String(job.applyUrl ?? job.hostedUrl ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: true,
        requirements: extractRequirements(description),
        compensation: typeof salaryRange === 'string' && salaryRange.includes('$') ? salaryRange : undefined,
        postedAt: typeof job.createdAt === 'number' ? new Date(job.createdAt).toISOString() : undefined,
        workplaceType: categories?.workplaceType
      });
    });
  }
}
