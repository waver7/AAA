import { prisma } from '@/lib/db/prisma';

export const LOCAL_USER_ID = 'local-user';

export async function getCurrentUser() {
  return prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: { id: LOCAL_USER_ID, email: 'demo@autoapply.ai', name: 'Local User' }
  });
}
