import { IngestedJob, JobSourceAdapter } from './types';

export class GreenhouseAdapter implements JobSourceAdapter {
  sourceType = 'greenhouse' as const;

  canHandle(url: string): boolean {
    return url.includes('boards.greenhouse.io');
  }

  async fetchJobs(url: string): Promise<IngestedJob[]> {
    const boardToken = url.split('boards.greenhouse.io/')[1]?.split(/[/?#]/)[0];
    if (!boardToken) return [];

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
    const response = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!response.ok) throw new Error(`Greenhouse request failed with status ${response.status}.`);
    const payload = (await response.json()) as { jobs: Array<Record<string, unknown>> };

    return payload.jobs.map((job) => ({
      externalId: String(job.id),
      title: String(job.title ?? 'Untitled role'),
      company: boardToken,
      location: String((job.location as { name?: string } | undefined)?.name ?? 'Unknown'),
      description: stripHtml(String(job.content ?? '')),
      sourceUrl: String(job.absolute_url ?? url),
      sourceType: 'greenhouse',
      easyApply: false,
      compensation: undefined,
      requirements: extractRequirements(stripHtml(String(job.content ?? '')))
    }));
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractRequirements(text: string) {
  return Array.from(text.matchAll(/\b(TypeScript|JavaScript|Node(?:\.js)?|React|Next\.js|PostgreSQL|Redis|AWS|Docker|Kubernetes|GraphQL|Terraform)\b/gi)).map(
    (match) => match[0]
  );
}
