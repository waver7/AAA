import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/parsing/resumeParser';
import { saveParsedResume } from '@/lib/profile/profileService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Resume PDF file is required.' }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF resumes are supported in this onboarding flow.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const parsed = await parseResume(Buffer.from(arrayBuffer));
    const saved = await saveParsedResume(file, parsed);

    return NextResponse.json({
      parsed,
      parseStatus: parsed.parseQuality,
      saved: {
        userId: saved.user.id,
        profileId: saved.profile.id,
        resumeAssetId: saved.resumeAsset.id,
        uploadedFileId: saved.uploadedFile.id
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to parse resume.';
    return NextResponse.json(
      {
        error: 'Resume parsing failed. Please upload a text-based PDF resume and fill missing fields manually.',
        detail: message
      },
      { status: 422 }
    );
  }
}
