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
      const description = htmlToStructuredText(String(job.descriptionPlain ?? job.description ?? ''));
      const categories = job.categories as { commitment?: string; team?: string; location?: string; workplaceType?: string; allLocations?: string[] } | undefined;
      const sections = extractDescriptionSections(description);
      const salaryRange = normalizeCompensation(
        typeof (job as { salaryRange?: string }).salaryRange === 'string'
          ? { text: (job as { salaryRange?: string }).salaryRange }
          : extractCompensationFromText(description)
      );

      return normalizeIngestedJob({
        externalId: String(job.id),
        title: String(job.text ?? 'Untitled role'),
        company,
        location: String(categories?.location ?? 'Unknown'),
        locationDetails: categories?.allLocations?.join(', '),
        description,
        sourceUrl: String(job.applyUrl ?? job.hostedUrl ?? url),
        sourceType: this.sourceType,
        sourceName: this.sourceName,
        easyApply: true,
        requirements: extractRequirements(description),
        responsibilities: pickSectionItems(sections, 'responsibilities'),
        qualifications: pickSectionItems(sections, 'qualifications'),
        preferredQualifications: pickSectionItems(sections, 'preferredQualifications'),
        benefits: summarizeBenefits(sections),
        descriptionSections: sections,
        compensation: salaryRange?.text,
        compensationMin: salaryRange?.min,
        compensationMax: salaryRange?.max,
        compensationCurrency: salaryRange?.currency,
        compensationPeriod: salaryRange?.period,
        postedAt: typeof job.createdAt === 'number' ? new Date(job.createdAt).toISOString() : undefined,
        updatedAt: typeof job.updatedAt === 'number' ? new Date(job.updatedAt).toISOString() : undefined,
        workplaceType: categories?.workplaceType,
        employmentType: inferEmploymentType(categories?.commitment, description),
        team: categories?.team,
        seniority: inferSeniority(String(job.text ?? ''), description)
      });
    });
  }
}
