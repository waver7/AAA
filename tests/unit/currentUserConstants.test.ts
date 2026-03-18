import { describe, expect, it } from 'vitest';
import { LOCAL_USER_EMAIL, LOCAL_USER_ID } from '@/lib/user/currentUser';

describe('local user constants', () => {
  it('uses stable local user identifiers', () => {
    expect(LOCAL_USER_ID).toBe('local-user');
<<<<<<< codex/build-mvp-for-autoapply-ai-platform
    expect(LOCAL_USER_EMAIL).toBe('waverstar7@gmail.com');
=======
    expect(LOCAL_USER_EMAIL).toBe('demo@autoapply.ai');
>>>>>>> master
  });
});
