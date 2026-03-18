import { describe, expect, it } from 'vitest';

// parser skill extraction is deterministic and can be validated without a fixture PDF.
import { parseResume } from '@/lib/parsing/resumeParser';

describe('resume parser', () => {
  it('throws on invalid non-pdf bytes', async () => {
    await expect(parseResume(Buffer.from('not a pdf'))).rejects.toBeTruthy();
  });
});
