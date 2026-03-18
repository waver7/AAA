import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/user/currentUser';
import type { ParsedResume } from '@/lib/parsing/resumeParser';

async function resolveSafeEmailUpdate(userId: string, requestedEmail?: string, fallbackEmail?: string) {
  if (!requestedEmail) return fallbackEmail;

  const existing = await prisma.user.findUnique({ where: { email: requestedEmail } });
  if (!existing || existing.id === userId) return requestedEmail;

  return fallbackEmail;
}

function deriveHeadline(parsed: ParsedResume) {
  const candidate = parsed.workHistory.find((item) => item.title && !/^(remote|[A-Za-z .'-]+,\s*[A-Z]{2})$/i.test(item.title))?.title;
  if (candidate) return candidate;
  if (parsed.summary) return parsed.summary.split(/[.!?]/)[0]?.slice(0, 80);
  return parsed.skills.slice(0, 3).join(' / ') || undefined;
}

function isPrismaClientOutOfSyncError(error: unknown) {
  return error instanceof Error && /Unknown argument `(?:phone|location|workHistory|education|certifications)`/.test(error.message);
}

function isDatabaseSchemaOutOfSyncError(error: unknown) {
  return (
    error instanceof Error &&
    /The column `(?:UserProfile|ResumeAsset)\.[A-Za-z]+` does not exist in the current database\./.test(error.message)
  );
}

function toActionablePersistenceError(error: unknown) {
  if (isPrismaClientOutOfSyncError(error)) {
    return new Error(
      'Prisma Client is out of date for the current schema. Run `npm run prisma:generate` and `npm run db:push`, then restart `npm run dev`.'
    );
  }

  if (isDatabaseSchemaOutOfSyncError(error)) {
    return new Error(
      'Your local database schema is out of date for the current Prisma models. Run `npm run db:push`, then restart `npm run dev`.'
    );
  }

  return error instanceof Error ? error : new Error('Unexpected persistence error.');
}

export async function saveParsedResume(file: File, parsed: ParsedResume) {
  try {
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
        headline: deriveHeadline(parsed),
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
        headline: deriveHeadline(parsed),
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
        email: await resolveSafeEmailUpdate(user.id, parsed.email, user.email)
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
  } catch (error) {
    throw toActionablePersistenceError(error);
  }
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
  try {
    const user = await getCurrentUser();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name || user.name,
        email: await resolveSafeEmailUpdate(user.id, input.email, user.email)
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
  } catch (error) {
    throw toActionablePersistenceError(error);
  }
}

export async function getCurrentProfile() {
  try {
    const user = await getCurrentUser();
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    const latestResume = await prisma.resumeAsset.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return { user, profile, latestResume };
  } catch (error) {
    throw toActionablePersistenceError(error);
  }
}
