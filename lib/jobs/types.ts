import type { RemoteStatus } from './remoteDetection';

export type JobSourceType = 'greenhouse' | 'lever' | 'generic';

export type JobDescriptionSection = {
  title: string;
  items: string[];
};

export type NormalizedCompensation = {
  text?: string;
  min?: number;
  max?: number;
  currency?: string;
  period?: 'hour' | 'year';
};

export type IngestedJob = {
  externalId: string;
  title: string;
  company: string;
  location: string;
  locationDetails?: string;
  description: string;
  sourceUrl: string;
  sourceType: JobSourceType;
  sourceName: string;
  easyApply: boolean;
  compensation?: string;
  compensationMin?: number;
  compensationMax?: number;
  compensationCurrency?: string;
  compensationPeriod?: 'hour' | 'year';
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  benefits: string[];
  descriptionSections: JobDescriptionSection[];
  postedAt?: string;
  updatedAt?: string;
  workplaceType?: string;
  employmentType?: string;
  team?: string;
  seniority?: string;
  remote: boolean;
  remoteStatus: RemoteStatus;
};

export interface JobSourceAdapter {
  sourceType: JobSourceType;
  sourceName: string;
  canHandle(url: string): boolean;
  fetchJobs(url: string): Promise<IngestedJob[]>;
}
