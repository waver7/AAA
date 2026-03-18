import { prisma } from '@/lib/db/prisma';
import { scoreJobFit } from '@/lib/scoring/fitScoring';
import { getCurrentUser } from '@/lib/user/currentUser';
import { AshbyAdapter } from './ashbyAdapter';
import { partitionRemoteJobs } from './jobNormalization';
import { GreenhouseAdapter } from './greenhouseAdapter';
import { LeverAdapter } from './leverAdapter';
import { WorkableAdapter } from './workableAdapter';
import type { IngestedJob, JobSourceAdapter } from './types';

const adapters: JobSourceAdapter[] = [new GreenhouseAdapter(), new LeverAdapter(), new AshbyAdapter(), new WorkableAdapter()];

export function detectJobAdapter(url: string) {
  return adapters.find((candidate) => candidate.canHandle(url));
}

export function listSupportedSources() {
  return adapters.map((adapter) => ({ sourceName: adapter.sourceName, sourceType: adapter.sourceType }));
}

export async function ingestJobsFromUrl(url: string): Promise<IngestedJob[]> {
  const adapter = detectJobAdapter(url);
  if (!adapter) {
    throw new Error('Unsupported source URL. AutoApply AI currently supports Greenhouse, Lever, Ashby, and Workable public job boards.');
  }
  return adapter.fetchJobs(url);
}

export async function ingestAndPersistJobs(url: string) {
  const adapter = detectJobAdapter(url);
  if (!adapter) {
    throw new Error('Unsupported source URL. Use a Greenhouse, Lever, Ashby, or Workable jobs URL.');
  }

  const discoveredJobs = await adapter.fetchJobs(url);
  const { remoteJobs, filteredOut } = partitionRemoteJobs(discoveredJobs);
  const user = await getCurrentUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const existingSource = await prisma.jobSource.findFirst({ where: { baseUrl: url, sourceType: adapter.sourceType } });
  const source = existingSource
    ? await prisma.jobSource.update({ where: { id: existingSource.id }, data: { isEnabled: true, name: adapter.sourceName } })
    : await prisma.jobSource.create({
        data: {
          name: adapter.sourceName,
          sourceType: adapter.sourceType,
          baseUrl: url
        }
      });

  const persisted = [];

  for (const job of remoteJobs) {
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
        locationDetails: job.locationDetails,
        compensation: job.compensation,
        compensationMin: job.compensationMin,
        compensationMax: job.compensationMax,
        compensationCurrency: job.compensationCurrency,
        compensationPeriod: job.compensationPeriod,
        description: job.description,
        sourceUrl: job.sourceUrl,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        preferredQualifications: job.preferredQualifications,
        benefits: job.benefits,
        descriptionSections: job.descriptionSections,
        easyApply: job.easyApply,
        discoveredAt: new Date(),
        postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
        updatedAt: job.updatedAt ? new Date(job.updatedAt) : undefined,
        remote: job.remote,
        workplaceType: job.workplaceType ?? job.remoteStatus,
        employmentType: job.employmentType,
        team: job.team,
        seniority: job.seniority
      },
      create: {
        sourceId: source.id,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        locationDetails: job.locationDetails,
        compensation: job.compensation,
        compensationMin: job.compensationMin,
        compensationMax: job.compensationMax,
        compensationCurrency: job.compensationCurrency,
        compensationPeriod: job.compensationPeriod,
        description: job.description,
        sourceUrl: job.sourceUrl,
        sourceType: job.sourceType,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        preferredQualifications: job.preferredQualifications,
        benefits: job.benefits,
        descriptionSections: job.descriptionSections,
        easyApply: job.easyApply,
        postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
        updatedAt: job.updatedAt ? new Date(job.updatedAt) : undefined,
        remote: job.remote,
        workplaceType: job.workplaceType ?? job.remoteStatus,
        employmentType: job.employmentType,
        team: job.team,
        seniority: job.seniority
      }
    });

    if (profile) {
      const fit = scoreJobFit(job, {
        requiredSkills: profile.skills,
        preferredLocations: ['Remote', ...(profile.preferredLocations ?? [])],
        salaryTarget: profile.salaryTarget ?? undefined,
        remotePreference: profile.workMode ?? 'remote'
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

  return {
    adapter: adapter.sourceName,
    sourceType: adapter.sourceType,
    count: persisted.length,
    filteredOut,
    remoteOnly: true,
    jobs: persisted
  };
}
