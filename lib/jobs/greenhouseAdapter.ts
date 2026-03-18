import { normalizeIngestedJob } from './jobNormalization';
import { extractRequirements, stripHtml } from './shared';
import type { IngestedJob, JobSourceAdapter } from './types';

export class GreenhouseAdapter implements JobSourceAdapter {
  sourceType = 'greenhouse' as const;
  sourceName = 'Greenhouse';

  canHandle(url: string): boolean {
    return url.includes('boards.greenhouse.io');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const boardToken = url.split('boards.greenhouse.io/')[1]?.split(/[/?#]/)[0];
    if (!boardToken) return [];

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Greenhouse request failed with status ${response.status}.`);
    const payload = (await response.json()) as { jobs: Array<Record<string, unknown>> };

    return payload.jobs.map((job) =>
      normalizeIngestedJob({
        externalId: String(job.id),
        title: String(job.title ?? 'Untitled role'),
        company: boardToken,
        location: String((job.location as { name?: string } | undefined)?.name ?? 'Unknown'),
        description: stripHtml(String(job.content ?? '')),
        sourceUrl: String(job.absolute_url ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: false,
        compensation: undefined,
        requirements: extractRequirements(stripHtml(String(job.content ?? ''))),
        postedAt: typeof job.updated_at === 'string' ? job.updated_at : undefined
      })
    );
  }
}
