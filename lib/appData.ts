import { env } from '@/lib/validation/env';
import { prisma } from '@/lib/db/prisma';
import { formatRelativeDate } from '@/lib/jobs/shared';
import { getRecommendedBoards } from '@/lib/jobs/recommendedBoards';
import { inferRemoteStatus } from '@/lib/jobs/remoteDetection';
import { getCurrentProfile } from '@/lib/profile/profileService';
import { getCurrentUser } from '@/lib/user/currentUser';

export async function getDashboardJobs() {
  const user = await getCurrentUser();
  const postings = await prisma.jobPosting.findMany({
    orderBy: [{ postedAt: 'desc' }, { discoveredAt: 'desc' }],
    include: {
      fitScores: { where: { userId: user.id }, take: 1 },
      source: true
    }
  });

  const normalized = postings.filter((job) => !job.externalId.startsWith('demo-job')).map((job) => {
    const fit = job.fitScores[0];
    const meta = safeParseExplanation(fit?.explanation);
    const remote = job.remote || inferRemoteStatus({ location: job.location, description: job.description, workplaceType: job.workplaceType, title: job.title }).isRemote;
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      compensation: job.compensation,
      description: job.description,
      sourceUrl: job.sourceUrl,
      sourceType: job.sourceType,
      sourceName: job.source?.name ?? job.sourceType,
      discoveredAt: formatRelativeDate(job.discoveredAt),
      postedAt: formatRelativeDate(job.postedAt) ?? formatRelativeDate(job.discoveredAt),
      score: fit?.score ?? 0,
      matchingSkills: fit?.matchingSkills ?? [],
      missingSkills: fit?.missingSkills ?? [],
      concerns: fit?.concerns ?? [],
      pitch: meta.pitch ?? 'Ingest this job after finishing onboarding to generate a fit explanation.',
      mismatchNotes: meta.mismatchNotes ?? [],
      remote,
      remoteStatus: remote ? 'Remote' : job.workplaceType ?? 'Unknown',
      easyApply: job.easyApply
    };
  });

  const jobs = normalized.filter((job) => job.remote);

  return {
    jobs,
    remoteOnly: true,
    hiddenCount: normalized.length - jobs.length,
    totalCount: normalized.length,
    supportedSources: ['Greenhouse', 'Lever', 'Ashby', 'Workable']
  };
}

export async function getRecommendedJobBoards() {
  const { profile } = await getCurrentProfile();
  return getRecommendedBoards(profile);
}

export async function getJobDetail(jobId: string) {
  const user = await getCurrentUser();
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      source: true,
      fitScores: { where: { userId: user.id }, take: 1 },
      applications: { where: { userId: user.id }, take: 1 }
    }
  });
  if (!job) return null;

  const fit = job.fitScores[0];
  const meta = safeParseExplanation(fit?.explanation);
  return {
    ...job,
    sourceName: job.source?.name ?? job.sourceType,
    score: fit?.score ?? 0,
    matchingSkills: fit?.matchingSkills ?? [],
    missingSkills: fit?.missingSkills ?? [],
    concerns: fit?.concerns ?? [],
    pitch: meta.pitch ?? 'Complete onboarding to improve this fit explanation.',
    mismatchNotes: meta.mismatchNotes ?? [],
    application: job.applications[0] ?? null
  };
}

export async function getApplicationsBoard() {
  const user = await getCurrentUser();
  const { profile, latestResume } = await getCurrentProfile();
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      automationRuns: { orderBy: { createdAt: 'desc' }, take: 1 },
      jobPosting: { include: { source: true } }
    }
  });

  return {
    applications,
    prepReadiness: {
      resumeReady: Boolean(latestResume?.uploadedFileId),
      automationEnabled: env.ENABLE_AUTOMATION === 'true',
      profileReady: Boolean(profile?.phone && profile?.location && user.email)
    }
  };
}

function safeParseExplanation(explanation?: string | null): { pitch?: string; mismatchNotes?: string[] } {
  if (!explanation) return {};
  try {
    return JSON.parse(explanation);
  } catch {
    return { pitch: explanation };
  }
}
