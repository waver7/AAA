import { normalizeIngestedJob } from './jobNormalization';
import {
  extractCompensationFromText,
  extractDescriptionSections,
  extractRequirements,
  htmlToStructuredText,
  inferEmploymentType,
  inferSeniority,
  pickSectionItems,
  stripHtml,
  summarizeBenefits
} from './shared';
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

    return payload.jobs.map((job) => {
      const content = String(job.content ?? '');
      const description = htmlToStructuredText(content);
      const sections = extractDescriptionSections(description);
      const compensation = extractCompensationFromText(description);

      return normalizeIngestedJob({
        externalId: String(job.id),
        title: String(job.title ?? 'Untitled role'),
        company: boardToken,
        location: String((job.location as { name?: string } | undefined)?.name ?? 'Unknown'),
        description: stripHtml(content),
        sourceUrl: String(job.absolute_url ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: false,
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
        employmentType: inferEmploymentType(String(job.title ?? ''), description),
        seniority: inferSeniority(String(job.title ?? ''), description),
        postedAt: typeof job.updated_at === 'string' ? job.updated_at : undefined,
        updatedAt: typeof job.updated_at === 'string' ? job.updated_at : undefined
      });
    });
  }
}
