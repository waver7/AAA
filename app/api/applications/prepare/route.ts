import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/user/currentUser';

const schema = z.object({ jobPostingId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await getCurrentUser();
  const existing = await prisma.application.findFirst({
    where: { userId: user.id, jobPostingId: parsed.data.jobPostingId }
  });
  const fit = await prisma.jobFitScore.findFirst({ where: { userId: user.id, jobPostingId: parsed.data.jobPostingId } });

  const application = existing
    ? await prisma.application.update({
        where: { id: existing.id },
        data: { status: ApplicationStatus.prepared, fitScore: fit?.score ?? existing.fitScore }
      })
    : await prisma.application.create({
        data: {
          userId: user.id,
          jobPostingId: parsed.data.jobPostingId,
          status: ApplicationStatus.prepared,
          fitScore: fit?.score ?? undefined
        }
      });

  return NextResponse.json({ application });
}
