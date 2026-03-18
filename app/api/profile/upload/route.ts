import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logging/logger';
import { parseResume } from '@/lib/parsing/resumeParser';
import { saveParsedResume } from '@/lib/profile/profileService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Resume PDF file is required.', code: 'resume_missing' }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF resumes are supported in this onboarding flow.', code: 'unsupported_file_type' },
        { status: 400 }
      );
    }

    log('info', 'Resume upload started', { filename: file.name, size: file.size });

    const arrayBuffer = await file.arrayBuffer();
    const parsed = await parseResume(Buffer.from(arrayBuffer));
    const saved = await saveParsedResume(file, parsed);

    log('info', 'Resume upload completed', {
      userId: saved.user.id,
      parseStatus: parsed.parseQuality,
      warnings: parsed.warnings.length
    });

    return NextResponse.json({
      parsed,
      parseStatus: parsed.parseQuality,
      message:
        parsed.parseQuality === 'success'
          ? 'Resume parsed successfully.'
          : 'Resume parsed partially. Review and edit extracted fields before continuing.',
      saved: {
        userId: saved.user.id,
        profileId: saved.profile.id,
        resumeAssetId: saved.resumeAsset.id,
        uploadedFileId: saved.uploadedFile.id
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to parse resume.';
    log('error', 'Resume upload failed', { error: message });
    return NextResponse.json(
      {
        error: 'Resume parsing failed. Please upload a text-based PDF resume and fill missing fields manually.',
        detail: message,
        code: 'resume_parse_failed'
      },
      { status: 422 }
    );
  }
}
