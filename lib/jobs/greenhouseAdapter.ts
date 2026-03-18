import { IngestedJob, JobSourceAdapter } from './types';

export class GreenhouseAdapter implements JobSourceAdapter {
  sourceType = 'greenhouse' as const;

  canHandle(url: string): boolean {
    return url.includes('boards.greenhouse.io');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const boardToken = url.split('boards.greenhouse.io/')[1]?.split('/')[0];
    if (!boardToken) return [];

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
    const response = await fetch(apiUrl);
    if (!response.ok) return [];
    const payload = (await response.json()) as { jobs: Array<Record<string, unknown>> };

    return payload.jobs.map((job) => ({
      externalId: String(job.id),
      title: String(job.title ?? 'Untitled role'),
      company: boardToken,
      location: String((job.location as { name?: string } | undefined)?.name ?? 'Unknown'),
      description: String(job.content ?? ''),
      sourceUrl: String(job.absolute_url ?? url),
      sourceType: 'greenhouse',
      easyApply: false,
      requirements: []
    }));
  }
}
