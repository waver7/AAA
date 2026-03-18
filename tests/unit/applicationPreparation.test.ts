import { describe, expect, it } from 'vitest';
import { buildBrowserPreparationPacket } from '@/lib/applications/applicationPreparation';

describe('buildBrowserPreparationPacket', () => {
  it('builds a browser-ready packet and warns about missing profile data', () => {
    const packet = buildBrowserPreparationPacket({
      user: { name: 'Ada Lovelace', email: 'ada@example.com' },
      profile: {
        phone: null,
        location: 'Remote',
        summary: null,
        skills: ['TypeScript', 'Node.js'],
        linkedinUrl: 'https://linkedin.com/in/ada',
        githubUrl: null,
        portfolioUrl: null,
        targetTitles: ['Backend Engineer']
      },
      resume: {
        summary: 'Backend engineer focused on resilient APIs.',
        skills: ['PostgreSQL']
      },
      job: {
        title: 'Senior Backend Engineer',
        company: 'Acme Cloud',
        sourceUrl: 'https://example.com/jobs/backend'
      }
    });

    expect(packet.targetUrl).toBe('https://example.com/jobs/backend');
    expect(packet.contactFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Full name', value: 'Ada Lovelace' }),
        expect.objectContaining({ label: 'Email', value: 'ada@example.com' })
      ])
    );
    expect(packet.profileFields).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Short summary' })]));
    expect(packet.warnings.join(' ')).toMatch(/phone number/i);
    expect(packet.notes).toMatch(/Prepared browser handoff/i);
  });
});
