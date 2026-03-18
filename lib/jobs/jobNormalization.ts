import type { IngestedJob } from './types';
import { inferRemoteStatus } from './remoteDetection';

export function normalizeIngestedJob(job: Omit<IngestedJob, 'remote' | 'remoteStatus' | 'postedAt' | 'requirements'> & {
  requirements?: string[];
  postedAt?: string | null;
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
    requirements: Array.from(new Set((job.requirements ?? []).map((item) => item.trim()).filter(Boolean))),
    remote: remote.isRemote,
    remoteStatus: remote.status,
    postedAt: parseDate(job.postedAt)
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

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
