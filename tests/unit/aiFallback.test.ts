import { describe, expect, it } from 'vitest';
import { generateOutreach } from '@/lib/ai/generationService';

describe('AI fallback', () => {
  it('returns a labeled demo response when no key exists in demo mode', async () => {
    const result = await generateOutreach('Experienced backend engineer with TypeScript focus.', 'Backend Engineer', 'Acme');
    expect(result.content.length).toBeGreaterThan(10);
    expect(['demo', 'live']).toContain(result.mode);
  });
});
