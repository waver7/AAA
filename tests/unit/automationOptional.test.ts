import { describe, expect, it } from 'vitest';

import { runAutofillPreparation } from '@/lib/automation/autofillPreparation';

describe('automation optional fallback', () => {
  it('fails gracefully when automation disabled', async () => {
    await expect(runAutofillPreparation({ url: 'https://example.com', fields: { email: 'x@y.com' } })).rejects.toThrow(
      'Browser automation is disabled'
    );
  });
});
