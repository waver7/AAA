import { describe, expect, it } from 'vitest';
import { parseResumeText } from '@/lib/parsing/resumeParser';

const sampleResume = `Jane Doe
jane@example.com | +1 555 111 2222 | New York, NY
https://linkedin.com/in/janedoe https://github.com/janedoe

Professional Summary
Senior software engineer with 8 years building TypeScript and Node.js products.

Skills
TypeScript, Node.js, React, PostgreSQL, AWS

Experience
Senior Software Engineer at Acme 2021 - Present
• Built TypeScript APIs used by 2M users
• Improved PostgreSQL query performance by 35%

Software Engineer at Beta Corp 2018 - 2021
• Worked on React and Node.js applications

Education
B.S. Computer Science | State University | 2018

Certifications
AWS Certified Developer`;

describe('resume parser', () => {
  it('extracts structured profile data from resume text', () => {
    const parsed = parseResumeText(sampleResume);

    expect(parsed.name).toBe('Jane Doe');
    expect(parsed.email).toBe('jane@example.com');
    expect(parsed.phone).toContain('555');
    expect(parsed.location).toContain('New York');
    expect(parsed.skills).toContain('typescript');
    expect(parsed.linkedinUrl).toContain('linkedin.com');
    expect(parsed.workHistory.length).toBeGreaterThan(0);
    expect(parsed.education.length).toBeGreaterThan(0);
    expect(parsed.certifications.join(' ')).toContain('AWS');
  });
});
