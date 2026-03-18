import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/user/currentUser';
import type { ParsedResume } from '@/lib/parsing/resumeParser';

export async function saveParsedResume(file: File, parsed: ParsedResume) {
  const user = await getCurrentUser();
  const uploadDir = path.join(process.cwd(), 'uploads', user.id);
  await mkdir(uploadDir, { recursive: true });

  const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '-')}`;
  const storagePath = path.join(uploadDir, safeFilename);
  await writeFile(storagePath, Buffer.from(await file.arrayBuffer()));

  const uploadedFile = await prisma.uploadedFile.create({
    data: {
      userId: user.id,
      filename: file.name,
      mimeType: file.type || 'application/pdf',
      storagePath
    }
  });

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: parsed.workHistory[0]?.title ?? parsed.skills.slice(0, 3).join(' / '),
      summary: parsed.summary,
      phone: parsed.phone,
      location: parsed.location,
      linkedinUrl: parsed.linkedinUrl,
      githubUrl: parsed.githubUrl,
      portfolioUrl: parsed.portfolioUrl,
      skills: parsed.skills,
      preferredLocations: parsed.location ? [parsed.location] : [],
      workHistory: parsed.workHistory,
      education: parsed.education,
      certifications: parsed.certifications
    },
    create: {
      userId: user.id,
      headline: parsed.workHistory[0]?.title ?? parsed.skills.slice(0, 3).join(' / '),
      summary: parsed.summary,
      phone: parsed.phone,
      location: parsed.location,
      linkedinUrl: parsed.linkedinUrl,
      githubUrl: parsed.githubUrl,
      portfolioUrl: parsed.portfolioUrl,
      skills: parsed.skills,
      preferredLocations: parsed.location ? [parsed.location] : [],
      preferredIndustries: [],
      targetTitles: [],
      workHistory: parsed.workHistory,
      education: parsed.education,
      certifications: parsed.certifications
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name ?? user.name,
      email: parsed.email ?? user.email
    }
  });

  const resumeAsset = await prisma.resumeAsset.create({
    data: {
      userId: user.id,
      uploadedFileId: uploadedFile.id,
      rawText: parsed.fullText,
      parsedName: parsed.name,
      parsedEmail: parsed.email,
      parsedPhone: parsed.phone,
      parsedLocation: parsed.location,
      summary: parsed.summary,
      links: parsed.links,
      skills: parsed.skills,
      workHistory: parsed.workHistory,
      education: parsed.education,
      certifications: parsed.certifications
    }
  });

  return { user, profile, uploadedFile, resumeAsset };
}

export async function saveManualProfile(input: {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  targetTitles: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}) {
  const user = await getCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name || user.name,
      email: input.email || user.email
    }
  });

  return prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      phone: input.phone,
      location: input.location,
      summary: input.summary,
      skills: input.skills,
      targetTitles: input.targetTitles,
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      headline: input.targetTitles[0],
      preferredLocations: input.location ? [input.location] : []
    },
    create: {
      userId: user.id,
      phone: input.phone,
      location: input.location,
      summary: input.summary,
      skills: input.skills,
      targetTitles: input.targetTitles,
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      headline: input.targetTitles[0],
      preferredLocations: input.location ? [input.location] : [],
      preferredIndustries: [],
      certifications: []
    }
  });
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const latestResume = await prisma.resumeAsset.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return { user, profile, latestResume };
}
