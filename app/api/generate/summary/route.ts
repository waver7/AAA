import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateTailoredSummary } from '@/lib/ai/generationService';

const schema = z.object({
  profileSummary: z.string().min(20),
  jobDescription: z.string().min(20)
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await generateTailoredSummary(parsed.data.profileSummary, parsed.data.jobDescription);
  return NextResponse.json(result);
}
