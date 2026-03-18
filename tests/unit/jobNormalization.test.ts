import { describe, expect, it } from 'vitest';
import { normalizeIngestedJob, partitionRemoteJobs } from '@/lib/jobs/jobNormalization';

describe('job normalization', () => {
  it('normalizes remote metadata and partitions non-remote jobs out of the remote discovery list', () => {
    const remoteJob = normalizeIngestedJob({
      externalId: '1',
      title: 'Backend Engineer',
      company: 'Acme',
      location: 'US Remote',
      description: 'TypeScript',
      sourceUrl: 'https://example.com/1',
      sourceType: 'generic',
      sourceName: 'Ashby',
      easyApply: true,
      workplaceType: 'Remote'
    });
    const hybridJob = normalizeIngestedJob({
      externalId: '2',
      title: 'Full-Stack Engineer',
      company: 'Acme',
      location: 'New York (Hybrid)',
      description: 'React',
      sourceUrl: 'https://example.com/2',
      sourceType: 'generic',
      sourceName: 'Workable',
      easyApply: true
    });

    const result = partitionRemoteJobs([remoteJob, hybridJob]);
    expect(result.remoteJobs).toHaveLength(1);
    expect(result.filteredOut).toBe(1);
    expect(result.remoteJobs[0]?.remoteStatus).toBe('remote');
  });
});
