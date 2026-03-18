import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scoreJobFit } from '@/lib/scoring/fitScoring';

const schema = z.object({
  job: z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    compensation: z.string().optional()
  }),
  profile: z.object({
    preferredLocations: z.array(z.string()),
    requiredSkills: z.array(z.string()),
    salaryTarget: z.number().optional()
  })
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = scoreJobFit(
    {
      externalId: 'inline',
      title: parsed.data.job.title,
      company: 'unknown',
      location: parsed.data.job.location,
      locationDetails: parsed.data.job.location,
      description: parsed.data.job.description,
      sourceName: 'inline',
      sourceType: 'generic',
      sourceUrl: '',
      easyApply: false,
      compensation: parsed.data.job.compensation,
      compensationMin: undefined,
      compensationMax: undefined,
      compensationCurrency: undefined,
      compensationPeriod: undefined,
      requirements: [],
      responsibilities: [],
      qualifications: [],
      preferredQualifications: [],
      benefits: [],
      descriptionSections: [],
      postedAt: undefined,
      updatedAt: undefined,
      workplaceType: undefined,
      employmentType: undefined,
      team: undefined,
      seniority: undefined,
      remote: true,
      remoteStatus: 'remote'
    },
    parsed.data.profile
  );

  return NextResponse.json(result);
}
