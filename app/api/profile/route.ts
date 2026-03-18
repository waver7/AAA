import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentProfile, saveManualProfile } from '@/lib/profile/profileService';

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  targetTitles: z.array(z.string()).default([]),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal(''))
});

export async function GET() {
  const result = await getCurrentProfile();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await saveManualProfile({
    ...parsed.data,
    linkedinUrl: parsed.data.linkedinUrl || undefined,
    githubUrl: parsed.data.githubUrl || undefined,
    portfolioUrl: parsed.data.portfolioUrl || undefined
  });

  return NextResponse.json({ profile });
}
