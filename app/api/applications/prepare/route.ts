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
    prisma.jobPosting.findUnique({ where: { id: parsed.data.jobPostingId }, include: { source: true } }),
    getCurrentProfile()
  ]);

  if (!job) return NextResponse.json({ error: 'Job posting not found.' }, { status: 404 });

  const uploadedFile = profileState.latestResume?.uploadedFileId
    ? await prisma.uploadedFile.findUnique({ where: { id: profileState.latestResume.uploadedFileId } })
    : null;

  const browserPrep = buildBrowserPreparationPacket({
    user,
    profile: profileState.profile,
    resume: profileState.latestResume ? { ...profileState.latestResume, uploadedFile } : null,
    job: { title: job.title, company: job.company, sourceUrl: job.sourceUrl, easyApply: job.easyApply, sourceName: job.source?.name }
  });

  const clientPacket = (({ resumeStoragePath: _resumeStoragePath, ...packet }) => packet)(browserPrep);

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

  return NextResponse.json({ application, browserPrep: clientPacket });
}
