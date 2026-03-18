import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildBrowserPreparationPacket } from '@/lib/applications/applicationPreparation';
import { runAutofillPreparation } from '@/lib/automation/autofillPreparation';
import { prisma } from '@/lib/db/prisma';
import { getCurrentProfile } from '@/lib/profile/profileService';
import { getCurrentUser } from '@/lib/user/currentUser';

const schema = z.object({ applicationId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await getCurrentUser();
  const [application, profileState] = await Promise.all([
    prisma.application.findFirst({
      where: { id: parsed.data.applicationId, userId: user.id },
      include: { jobPosting: { include: { source: true } } }
    }),
    getCurrentProfile()
  ]);

  if (!application) return NextResponse.json({ error: 'Prepared application not found.' }, { status: 404 });

  const uploadedFile = profileState.latestResume?.uploadedFileId
    ? await prisma.uploadedFile.findUnique({ where: { id: profileState.latestResume.uploadedFileId } })
    : null;

  const browserPrep = buildBrowserPreparationPacket({
    user,
    profile: profileState.profile,
    resume: profileState.latestResume ? { ...profileState.latestResume, uploadedFile } : null,
    job: {
      title: application.jobPosting.title,
      company: application.jobPosting.company,
      sourceUrl: application.jobPosting.sourceUrl,
      easyApply: application.jobPosting.easyApply,
      sourceName: application.jobPosting.source?.name
    }
  });

  const clientPacket = (({ resumeStoragePath: _resumeStoragePath, ...packet }) => packet)(browserPrep);

  let automationResult: Awaited<ReturnType<typeof runAutofillPreparation>> | null = null;
  let automationError: string | null = null;

  if (browserPrep.automationEnabled && browserPrep.prefillSupport === 'best_effort') {
    try {
      automationResult = await runAutofillPreparation({
        url: browserPrep.targetUrl,
        fields: browserPrep.automationFields,
        resumePath: browserPrep.resumeStoragePath
      });
    } catch (error) {
      automationError = error instanceof Error ? error.message : 'Unable to run automation preparation flow.';
    }
  }

  const run = await prisma.automationRun.create({
    data: {
      applicationId: application.id,
      targetUrl: browserPrep.targetUrl,
      status: automationResult ? 'prepared_in_browser_automation' : 'browser_handoff_ready',
      stepLogs: automationResult?.steps ?? [browserPrep.prefillSummary],
      screenshotPath: automationResult?.screenshotPath,
      errorMessage: automationError ?? undefined
    }
  });

  await prisma.applicationEvent.create({
    data: {
      userId: user.id,
      applicationId: application.id,
      eventType: 'application_open_prepared',
      payload: {
        targetUrl: browserPrep.targetUrl,
        prefillSupport: browserPrep.prefillSupport,
        resumeReady: browserPrep.resume.ready,
        visibleBrowserPrefill: browserPrep.visibleBrowserPrefill,
        automationRunId: run.id,
        automationError
      }
    }
  });

  return NextResponse.json({ browserPrep: clientPacket, automationResult, automationError, runId: run.id });
}
