import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ingestAndPersistJobs, listSupportedSources } from '@/lib/jobs/jobIngestionService';

const schema = z.object({ url: z.string().url() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const result = await ingestAndPersistJobs(parsed.data.url);
    return NextResponse.json({ ...result, supportedSources: listSupportedSources() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to ingest jobs from the provided source.';
    return NextResponse.json({ error: message, supportedSources: listSupportedSources() }, { status: 422 });
  }
}
