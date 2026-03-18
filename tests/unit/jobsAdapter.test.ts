import { describe, expect, it } from 'vitest';
import { GreenhouseAdapter } from '@/lib/jobs/greenhouseAdapter';
import { LeverAdapter } from '@/lib/jobs/leverAdapter';

describe('job adapters', () => {
  it('detects supported board URLs', () => {
    expect(new GreenhouseAdapter().canHandle('https://boards.greenhouse.io/acme')).toBe(true);
    expect(new LeverAdapter().canHandle('https://jobs.lever.co/acme')).toBe(true);
  });
});
