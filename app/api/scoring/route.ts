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
      company: 'unknown',
      sourceType: 'generic',
      sourceUrl: '',
      easyApply: false,
      requirements: [],
      ...parsed.data.job
    },
    parsed.data.profile
  );

  return NextResponse.json(result);
}
