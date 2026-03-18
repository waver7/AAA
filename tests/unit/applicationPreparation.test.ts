import { describe, expect, it } from 'vitest';
import { buildBrowserPreparationPacket } from '@/lib/applications/applicationPreparation';

describe('buildBrowserPreparationPacket', () => {
  it('builds a browser-ready packet with resume readiness and honest handoff metadata', () => {
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
        targetTitles: ['Backend Engineer'],
        visaInfo: 'Authorized to work in the US'
      },
      resume: {
        summary: 'Backend engineer focused on resilient APIs.',
        skills: ['PostgreSQL'],
        uploadedFile: {
          filename: 'ada-resume.pdf',
          storagePath: '/tmp/ada-resume.pdf'
        }
      },
      job: {
        title: 'Senior Backend Engineer',
        company: 'Acme Cloud',
        sourceUrl: 'https://example.com/jobs/backend',
        easyApply: true,
        sourceName: 'Lever'
      }
    });

    expect(packet.targetUrl).toBe('https://example.com/jobs/backend');
    expect(packet.prefillSupport).toBe('best_effort');
    expect(packet.visibleBrowserPrefill).toBe(false);
    expect(packet.resume.ready).toBe(true);
    expect(packet.resume.filename).toBe('ada-resume.pdf');
    expect(packet.applicantDetailsText).toMatch(/Ada Lovelace/);
    expect(packet.automationFields.first_name).toBe('Ada');
    expect(packet.automationFields.last_name).toBe('Lovelace');
    expect(packet.contactFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Full name', value: 'Ada Lovelace' }),
        expect.objectContaining({ label: 'Email', value: 'ada@example.com' })
      ])
    );
    expect(packet.profileFields).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Work authorization' })]));
    expect(packet.warnings.join(' ')).toMatch(/phone number/i);
    expect(packet.notes).toMatch(/Prepared browser handoff/i);
    expect(packet.prefillSummary).toMatch(/browser extension/i);
  });
});
