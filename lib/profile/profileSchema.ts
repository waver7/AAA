import { z } from 'zod';

function blankToUndefined(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

const optionalString = z.preprocess(blankToUndefined, z.string().optional());
const optionalEmail = z.preprocess(blankToUndefined, z.string().email().optional());
const optionalUrl = z.preprocess(blankToUndefined, z.string().url().optional());

export const profileInputSchema = z.object({
  name: optionalString,
  email: optionalEmail,
  phone: optionalString,
  location: optionalString,
  summary: optionalString,
  skills: z.array(z.string()).default([]),
  targetTitles: z.array(z.string()).default([]),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
