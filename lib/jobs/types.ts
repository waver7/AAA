export type JobSourceType = 'greenhouse' | 'lever' | 'generic';

export type IngestedJob = {
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  sourceUrl: string;
  sourceType: JobSourceType;
  easyApply: boolean;
  compensation?: string;
  requirements: string[];
};

export interface JobSourceAdapter {
  sourceType: JobSourceType;
  canHandle(url: string): boolean;
  fetchJobs(url: string): Promise<IngestedJob[]>;
}
