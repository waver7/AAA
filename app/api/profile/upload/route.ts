import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/parsing/resumeParser';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('resume');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'resume file is required' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const parsed = await parseResume(Buffer.from(arrayBuffer));
  return NextResponse.json({ parsed });
}
