import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';
import { buildBrowserPreparationPacket } from '@/lib/applications/applicationPreparation';
import { prisma } from '@/lib/db/prisma';
import { getCurrentProfile } from '@/lib/profile/profileService';
import { getCurrentUser } from '@/lib/user/currentUser';

const schema = z.object({ jobPostingId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await getCurrentUser();
  const [existing, fit, job, profileState] = await Promise.all([
    prisma.application.findFirst({ where: { userId: user.id, jobPostingId: parsed.data.jobPostingId } }),
    prisma.jobFitScore.findFirst({ where: { userId: user.id, jobPostingId: parsed.data.jobPostingId } }),
    prisma.jobPosting.findUnique({ where: { id: parsed.data.jobPostingId } }),
    getCurrentProfile()
  ]);

  if (!job) return NextResponse.json({ error: 'Job posting not found.' }, { status: 404 });

  const browserPrep = buildBrowserPreparationPacket({
    user,
    profile: profileState.profile,
    resume: profileState.latestResume,
    job: { title: job.title, company: job.company, sourceUrl: job.sourceUrl }
  });

  const application = existing
    ? await prisma.application.update({
        where: { id: existing.id },
        data: { status: ApplicationStatus.prepared, fitScore: fit?.score ?? existing.fitScore, notes: browserPrep.notes }
      })
    : await prisma.application.create({
        data: {
          userId: user.id,
          jobPostingId: parsed.data.jobPostingId,
          status: ApplicationStatus.prepared,
          fitScore: fit?.score ?? undefined,
          notes: browserPrep.notes
        }
      });

  return NextResponse.json({ application, browserPrep });
}
