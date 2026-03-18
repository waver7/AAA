import type { RemoteStatus } from './remoteDetection';

export type JobSourceType = 'greenhouse' | 'lever' | 'generic';

export type IngestedJob = {
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  sourceUrl: string;
  sourceType: JobSourceType;
  sourceName: string;
  easyApply: boolean;
  compensation?: string;
  requirements: string[];
  postedAt?: string;
  workplaceType?: string;
  remote: boolean;
  remoteStatus: RemoteStatus;
};

export interface JobSourceAdapter {
  sourceType: JobSourceType;
  sourceName: string;
  canHandle(url: string): boolean;
  fetchJobs(url: string): Promise<IngestedJob[]>;
}
