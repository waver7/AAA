import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAutofillPreparation } from '@/lib/automation/autofillPreparation';

const schema = z.object({
  url: z.string().url(),
  fields: z.record(z.string()),
  resumePath: z.string().optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await runAutofillPreparation(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to run automation preparation flow.';
    return NextResponse.json({ error: message, blockedBeforeSubmit: true }, { status: 503 });
  }
}
