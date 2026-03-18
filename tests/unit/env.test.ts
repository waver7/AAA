import { describe, expect, it } from 'vitest';
import { env, isDemoMode } from '@/lib/validation/env';

describe('env defaults', () => {
  it('exposes safe defaults for local startup', () => {
    expect(env.OPENAI_BASE_URL).toContain('openai.com');
    expect(typeof isDemoMode()).toBe('boolean');
  });
});
