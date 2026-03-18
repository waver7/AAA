import type { IngestedJob } from './types';
import { inferRemoteStatus } from './remoteDetection';

export function normalizeIngestedJob(job: Omit<IngestedJob, 'remote' | 'remoteStatus' | 'postedAt' | 'updatedAt' | 'requirements' | 'responsibilities' | 'qualifications' | 'preferredQualifications' | 'benefits' | 'descriptionSections'> & {
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  descriptionSections?: IngestedJob['descriptionSections'];
  postedAt?: string | null;
  updatedAt?: string | null;
  workplaceType?: string | null;
}) : IngestedJob {
  const remote = inferRemoteStatus({
    location: job.location,
    description: job.description,
    workplaceType: job.workplaceType,
    title: job.title
  });

  return {
    ...job,
    location: normalizeWhitespace(job.location || 'Unknown'),
    description: normalizeWhitespace(job.description || ''),
    requirements: uniqueStrings(job.requirements),
    responsibilities: uniqueStrings(job.responsibilities),
    qualifications: uniqueStrings(job.qualifications),
    preferredQualifications: uniqueStrings(job.preferredQualifications),
    benefits: uniqueStrings(job.benefits),
    descriptionSections: (job.descriptionSections ?? []).map((section) => ({
      title: normalizeWhitespace(section.title),
      items: uniqueStrings(section.items)
    })).filter((section) => section.title && section.items.length > 0),
    remote: remote.isRemote,
    remoteStatus: remote.status,
    postedAt: parseDate(job.postedAt),
    updatedAt: parseDate(job.updatedAt)
  };
}

export function partitionRemoteJobs<T extends { remote: boolean }>(jobs: T[]) {
  const remoteJobs = jobs.filter((job) => job.remote);
  const filteredOut = jobs.length - remoteJobs.length;
  return { remoteJobs, filteredOut };
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values?: string[]) {
  return Array.from(new Set((values ?? []).map((item) => normalizeWhitespace(item)).filter(Boolean)));
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
