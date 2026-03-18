import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/user/currentUser';
import { scoreJobFit } from '@/lib/scoring/fitScoring';
import { GreenhouseAdapter } from './greenhouseAdapter';
import { LeverAdapter } from './leverAdapter';
import { IngestedJob, JobSourceAdapter } from './types';

const adapters: JobSourceAdapter[] = [new GreenhouseAdapter(), new LeverAdapter()];

export function detectJobAdapter(url: string) {
  return adapters.find((candidate) => candidate.canHandle(url));
}

export async function ingestJobsFromUrl(url: string): Promise<IngestedJob[]> {
  const adapter = detectJobAdapter(url);
  if (!adapter) {
    throw new Error('Unsupported source URL. AutoApply AI currently supports Greenhouse and Lever job boards.');
  }
  return adapter.fetchJobs(url);
}

export async function ingestAndPersistJobs(url: string) {
  const adapter = detectJobAdapter(url);
  if (!adapter) {
    throw new Error('Unsupported source URL. Use a Greenhouse board URL or a Lever jobs URL.');
  }

  const jobs = await adapter.fetchJobs(url);
  const user = await getCurrentUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const existingSource = await prisma.jobSource.findFirst({ where: { baseUrl: url, sourceType: adapter.sourceType } });
  const source = existingSource
    ? await prisma.jobSource.update({ where: { id: existingSource.id }, data: { isEnabled: true } })
    : await prisma.jobSource.create({
        data: {
          name: adapter.sourceType === 'greenhouse' ? 'Greenhouse board' : 'Lever board',
          sourceType: adapter.sourceType,
          baseUrl: url
        }
      });

  const persisted = [];

  for (const job of jobs) {
    const posting = await prisma.jobPosting.upsert({
      where: {
        externalId_sourceType: {
          externalId: job.externalId,
          sourceType: job.sourceType
        }
      },
      update: {
        sourceId: source.id,
        title: job.title,
        company: job.company,
        location: job.location,
        compensation: job.compensation,
        description: job.description,
        sourceUrl: job.sourceUrl,
        requirements: job.requirements,
        easyApply: job.easyApply,
        discoveredAt: new Date()
      },
      create: {
        sourceId: source.id,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        compensation: job.compensation,
        description: job.description,
        sourceUrl: job.sourceUrl,
        sourceType: job.sourceType,
        requirements: job.requirements,
        easyApply: job.easyApply
      }
    });

    if (profile) {
      const fit = scoreJobFit(job, {
        requiredSkills: profile.skills,
        preferredLocations: profile.preferredLocations,
        salaryTarget: profile.salaryTarget ?? undefined,
        remotePreference: profile.workMode ?? undefined
      });

      await prisma.jobFitScore.upsert({
        where: { id: `${user.id}-${posting.id}` },
        update: {
          score: fit.score,
          matchingSkills: fit.explanation.matchingSkills,
          missingSkills: fit.explanation.missingSkills,
          concerns: fit.explanation.concerns,
          explanation: JSON.stringify({
            pitch: fit.explanation.pitch,
            mismatchNotes: fit.explanation.mismatchNotes
          })
        },
        create: {
          id: `${user.id}-${posting.id}`,
          userId: user.id,
          jobPostingId: posting.id,
          score: fit.score,
          matchingSkills: fit.explanation.matchingSkills,
          missingSkills: fit.explanation.missingSkills,
          concerns: fit.explanation.concerns,
          explanation: JSON.stringify({
            pitch: fit.explanation.pitch,
            mismatchNotes: fit.explanation.mismatchNotes
          })
        }
      });
    }

    persisted.push(posting);
  }

  return { adapter: adapter.sourceType, count: persisted.length, jobs: persisted };
}
