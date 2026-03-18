import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logging/logger';
import { getCurrentProfile, saveManualProfile } from '@/lib/profile/profileService';
import { profileInputSchema } from '@/lib/profile/profileSchema';

export async function GET() {
  const result = await getCurrentProfile();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = profileInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      log('warn', 'Profile validation failed', { fieldErrors: parsed.error.flatten().fieldErrors });
      return NextResponse.json(
        {
          error: 'Profile validation failed. Please review the highlighted fields and try again.',
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const profile = await saveManualProfile(parsed.data);
    return NextResponse.json({ profile, message: 'Profile saved successfully.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save profile.';
    log('error', 'Profile save failed', { error: message });
    return NextResponse.json(
      {
        error: 'Unable to save your profile right now. Please try again.',
        detail: message
      },
      { status: 500 }
    );
  }
}
