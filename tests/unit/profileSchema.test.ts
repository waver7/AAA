import { describe, expect, it } from 'vitest';
import { profileInputSchema } from '@/lib/profile/profileSchema';

describe('profileInputSchema', () => {
  it('accepts blank optional fields so onboarding save does not fail silently', () => {
    const result = profileInputSchema.safeParse({
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: ['TypeScript'],
      targetTitles: ['Backend Engineer'],
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: ''
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.linkedinUrl).toBeUndefined();
    }
  });

  it('rejects malformed emails with actionable validation', () => {
    const result = profileInputSchema.safeParse({
      email: 'not-an-email',
      skills: [],
      targetTitles: ['Software Engineer']
    });

    expect(result.success).toBe(false);
  });
});
