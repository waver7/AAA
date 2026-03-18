import { describe, expect, it } from 'vitest';
import pkg from '@/package.json';

describe('package scripts', () => {
  it('auto-generates Prisma client in common local workflows', () => {
    expect(pkg.scripts.postinstall).toBe('prisma generate');
    expect(pkg.scripts.predev).toBe('npm run prisma:generate');
    expect(pkg.scripts.prebuild).toBe('npm run prisma:generate');
    expect(pkg.scripts.preseed).toBe('npm run prisma:generate');
    expect(pkg.scripts['predb:push']).toBe('npm run prisma:generate');
  });
});
