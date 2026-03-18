import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/user/currentUser';

export async function getDashboardJobs() {
  const user = await getCurrentUser();
  const postings = await prisma.jobPosting.findMany({
    orderBy: { discoveredAt: 'desc' },
    include: {
      fitScores: { where: { userId: user.id }, take: 1 },
      source: true
    }
  });

  return postings.filter((job) => !job.externalId.startsWith('demo-job')).map((job) => {
    const fit = job.fitScores[0];
    const meta = safeParseExplanation(fit?.explanation);
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      compensation: job.compensation,
      description: job.description,
      sourceUrl: job.sourceUrl,
      sourceType: job.sourceType,
      discoveredAt: job.discoveredAt.toISOString().slice(0, 10),
      score: fit?.score ?? 0,
      matchingSkills: fit?.matchingSkills ?? [],
      missingSkills: fit?.missingSkills ?? [],
      concerns: fit?.concerns ?? [],
      pitch: meta.pitch ?? 'Ingest this job after finishing onboarding to generate a fit explanation.',
      mismatchNotes: meta.mismatchNotes ?? []
    };
  });
}

export async function getJobDetail(jobId: string) {
  const user = await getCurrentUser();
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      fitScores: { where: { userId: user.id }, take: 1 },
      applications: { where: { userId: user.id }, take: 1 }
    }
  });
  if (!job) return null;

  const fit = job.fitScores[0];
  const meta = safeParseExplanation(fit?.explanation);
  return {
    ...job,
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
  return prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      jobPosting: true
    }
  });
}

function safeParseExplanation(explanation?: string | null): { pitch?: string; mismatchNotes?: string[] } {
  if (!explanation) return {};
  try {
    return JSON.parse(explanation);
  } catch {
    return { pitch: explanation };
  }
}
