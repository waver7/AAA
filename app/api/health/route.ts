import { NextResponse } from 'next/server';
import { env, isDemoMode } from '@/lib/validation/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    demoMode: isDemoMode(),
    automationEnabled: env.ENABLE_AUTOMATION === 'true',
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
}
