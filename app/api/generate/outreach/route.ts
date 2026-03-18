import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOutreach } from '@/lib/ai/generationService';

const schema = z.object({
  profileSummary: z.string().min(20),
  jobTitle: z.string().min(2),
  company: z.string().min(2)
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await generateOutreach(parsed.data.profileSummary, parsed.data.jobTitle, parsed.data.company);
  return NextResponse.json(result);
}
