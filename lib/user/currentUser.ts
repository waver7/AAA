import { prisma } from '@/lib/db/prisma';

export const LOCAL_USER_ID = 'local-user';
export const LOCAL_USER_EMAIL = 'demo@autoapply.ai';

export async function getCurrentUser() {
  const byId = await prisma.user.findUnique({ where: { id: LOCAL_USER_ID } });
  if (byId) return byId;

  const byEmail = await prisma.user.findUnique({ where: { email: LOCAL_USER_EMAIL } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { name: byEmail.name ?? 'Local User' }
    });
  }

  return prisma.user.create({
    data: { id: LOCAL_USER_ID, email: LOCAL_USER_EMAIL, name: 'Local User' }
  });
}
