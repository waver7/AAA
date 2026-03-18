import { describe, expect, it } from 'vitest';
import { inferRemoteStatus } from '@/lib/jobs/remoteDetection';

describe('inferRemoteStatus', () => {
  it('recognizes remote wording and rejects hybrid/on-site roles from the remote default flow', () => {
    expect(inferRemoteStatus({ location: 'Remote - United States' }).isRemote).toBe(true);
    expect(inferRemoteStatus({ location: 'Work from home' }).status).toBe('remote');
    expect(inferRemoteStatus({ location: 'New York, NY (Hybrid)' }).status).toBe('hybrid');
    expect(inferRemoteStatus({ description: 'This role is on-site in Austin' }).status).toBe('onsite');
  });
});
