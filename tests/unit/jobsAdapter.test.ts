import { describe, expect, it } from 'vitest';
import { AshbyAdapter } from '@/lib/jobs/ashbyAdapter';
import { GreenhouseAdapter } from '@/lib/jobs/greenhouseAdapter';
import { LeverAdapter } from '@/lib/jobs/leverAdapter';
import { WorkableAdapter } from '@/lib/jobs/workableAdapter';

describe('job adapters', () => {
  it('detects supported board URLs across all configured sources', () => {
    expect(new GreenhouseAdapter().canHandle('https://boards.greenhouse.io/acme')).toBe(true);
    expect(new LeverAdapter().canHandle('https://jobs.lever.co/acme')).toBe(true);
    expect(new AshbyAdapter().canHandle('https://jobs.ashbyhq.com/acme')).toBe(true);
    expect(new WorkableAdapter().canHandle('https://apply.workable.com/acme')).toBe(true);
  });
});
