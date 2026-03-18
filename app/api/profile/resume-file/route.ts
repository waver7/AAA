import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentProfile } from '@/lib/profile/profileService';

export async function GET() {
  const profileState = await getCurrentProfile();
  if (!profileState.latestResume?.uploadedFileId) {
    return NextResponse.json({ error: 'No saved resume is available.' }, { status: 404 });
  }

  const uploadedFile = await prisma.uploadedFile.findUnique({ where: { id: profileState.latestResume.uploadedFileId } });
  if (!uploadedFile) {
    return NextResponse.json({ error: 'Saved resume metadata was not found.' }, { status: 404 });
  }

  try {
    const fileBuffer = await readFile(uploadedFile.storagePath);
    return NextResponse.json({
      filename: uploadedFile.filename,
      mimeType: uploadedFile.mimeType,
      dataBase64: fileBuffer.toString('base64')
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read the saved resume file.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
