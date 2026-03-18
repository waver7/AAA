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
      .map((job) => {
        const description = htmlToStructuredText(String(job.descriptionPlain ?? job.descriptionHtml ?? ''));
        const sections = extractDescriptionSections(description);
        const compensation = normalizeCompensation(
          typeof (job.compensation as { compensationTierSummary?: string } | undefined)?.compensationTierSummary === 'string'
            ? { text: String((job.compensation as { compensationTierSummary?: string }).compensationTierSummary) }
            : extractCompensationFromText(description)
        );

        return normalizeIngestedJob({
          externalId: String(job.id ?? job.jobUrl ?? job.applyUrl ?? job.title),
          title: String(job.title ?? 'Untitled role'),
          company: boardName,
          location: String(job.location ?? job.workplaceType ?? 'Unknown'),
          locationDetails: Array.isArray(job.locationParts) ? job.locationParts.join(', ') : undefined,
          description,
          sourceUrl: String(job.applyUrl ?? job.jobUrl ?? url),
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
          postedAt: typeof job.publishedAt === 'string' ? job.publishedAt : undefined,
          updatedAt: typeof job.updatedAt === 'string' ? job.updatedAt : undefined,
          workplaceType: String(job.workplaceType ?? '') || undefined,
          employmentType: inferEmploymentType(String(job.employmentType ?? ''), description),
          team: String(job.departmentName ?? '') || undefined,
          seniority: inferSeniority(String(job.title ?? ''), String(job.seniority ?? ''), description)
        });
      });
  }
}
