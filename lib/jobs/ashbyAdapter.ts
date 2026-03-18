import { normalizeIngestedJob } from './jobNormalization';
import { extractRequirements } from './shared';
import type { IngestedJob, JobSourceAdapter } from './types';

export class AshbyAdapter implements JobSourceAdapter {
  sourceType = 'generic' as const;
  sourceName = 'Ashby';

  canHandle(url: string): boolean {
    return url.includes('jobs.ashbyhq.com');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const boardName = url.split('jobs.ashbyhq.com/')[1]?.split(/[/?#]/)[0];
    if (!boardName) return [];

    const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${boardName}?includeCompensation=true`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Ashby request failed with status ${response.status}.`);
    const payload = (await response.json()) as { jobs?: Array<Record<string, unknown>> };

    return (payload.jobs ?? [])
      .filter((job) => job.isListed !== false)
      .map((job) =>
        normalizeIngestedJob({
          externalId: String(job.id ?? job.jobUrl ?? job.applyUrl ?? job.title),
          title: String(job.title ?? 'Untitled role'),
          company: boardName,
          location: String(job.location ?? job.workplaceType ?? 'Unknown'),
          description: String(job.descriptionPlain ?? job.descriptionHtml ?? ''),
          sourceUrl: String(job.applyUrl ?? job.jobUrl ?? url),
          sourceType: this.sourceType,
          sourceName: this.sourceName,
          easyApply: true,
          compensation: String((job.compensation as { compensationTierSummary?: string } | undefined)?.compensationTierSummary ?? '').trim() || undefined,
          requirements: extractRequirements(String(job.descriptionPlain ?? job.descriptionHtml ?? '')),
          postedAt: typeof job.publishedAt === 'string' ? job.publishedAt : undefined,
          workplaceType: String(job.workplaceType ?? '') || undefined
        })
      );
  }
}
