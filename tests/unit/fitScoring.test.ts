import { describe, expect, it } from 'vitest';
import { scoreJobFit } from '@/lib/scoring/fitScoring';

describe('scoreJobFit', () => {
  it('scores based on matching skills and returns explainable shape', () => {
    const result = scoreJobFit(
      {
        externalId: '1',
        title: 'Backend Engineer',
        company: 'Acme',
        location: 'Remote',
        description: 'TypeScript Node PostgreSQL',
        sourceUrl: '',
        sourceType: 'generic',
        sourceName: 'Ashby',
        easyApply: false,
        requirements: [],
        responsibilities: [],
        qualifications: [],
        preferredQualifications: [],
        benefits: [],
        descriptionSections: [],
        compensation: '$180,000',
        remote: true,
        remoteStatus: 'remote'
      },
      { requiredSkills: ['TypeScript', 'Node'], preferredLocations: ['Remote'], salaryTarget: 170000 }
    );

    expect(result.score).toBeGreaterThan(70);
    expect(result.explanation.missingSkills).toHaveLength(0);
    expect(result.explanation.pitch.length).toBeGreaterThan(5);
    expect(Array.isArray(result.explanation.mismatchNotes)).toBe(true);
  });
});
