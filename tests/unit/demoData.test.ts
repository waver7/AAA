import { describe, expect, it } from 'vitest';
import { demoApplications, demoJobs } from '@/lib/demo/demoData';

describe('demo data', () => {
  it('contains sample jobs and application statuses', () => {
    expect(demoJobs.length).toBeGreaterThan(1);
    expect(demoJobs[0].score).toBeGreaterThan(0);
    expect(demoApplications.length).toBeGreaterThan(1);
  });
});
