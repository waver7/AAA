import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ingestJobsFromUrl } from '@/lib/jobs/jobIngestionService';

const schema = z.object({ url: z.string().url() });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const jobs = await ingestJobsFromUrl(parsed.data.url);
  return NextResponse.json({ jobs });
}
