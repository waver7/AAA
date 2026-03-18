import { describe, expect, it } from 'vitest';
import { getRecommendedBoards } from '@/lib/jobs/recommendedBoards';

describe('getRecommendedBoards', () => {
  it('prioritizes boards that match target titles and skills', () => {
    const boards = getRecommendedBoards({
      skills: ['TypeScript', 'React', 'Next.js'],
      targetTitles: ['Frontend Engineer'],
      preferredLocations: ['Remote'],
      location: 'Remote'
    });

    expect(boards[0]?.company).toBe('Vercel');
    expect(boards[0]?.fitScore).toBeGreaterThan(boards.at(-1)?.fitScore ?? 0);
    expect(boards[0]?.reasons.join(' ')).toMatch(/target titles|Skill overlap/i);
  });
});
