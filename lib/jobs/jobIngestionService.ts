import { GreenhouseAdapter } from './greenhouseAdapter';
import { LeverAdapter } from './leverAdapter';
import { IngestedJob, JobSourceAdapter } from './types';

const adapters: JobSourceAdapter[] = [new GreenhouseAdapter(), new LeverAdapter()];

export async function ingestJobsFromUrl(url: string): Promise<IngestedJob[]> {
  const adapter = adapters.find((candidate) => candidate.canHandle(url));
  if (!adapter) return [];
  return adapter.fetchJobs(url);
}
