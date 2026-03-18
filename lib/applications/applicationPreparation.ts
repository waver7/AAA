import type { ResumeAsset, UploadedFile, User, UserProfile } from '@prisma/client';
import { env } from '@/lib/validation/env';

export type BrowserPreparationPacket = {
  targetUrl: string;
  contactFields: Array<{ label: string; value: string }>;
  profileFields: Array<{ label: string; value: string }>;
  checklist: string[];
  warnings: string[];
  notes: string;
  prefillSupport: 'best_effort' | 'copy_assist';
  prefillSummary: string;
  resume: {
    ready: boolean;
    filename?: string;
    note: string;
    automationUploadReady: boolean;
  };
  automationEnabled: boolean;
  automationFields: Record<string, string>;
  resumeStoragePath?: string;
};

export function buildBrowserPreparationPacket(input: {
  user: Pick<User, 'name' | 'email'>;
  profile?: Pick<
    UserProfile,
    'phone' | 'location' | 'summary' | 'skills' | 'linkedinUrl' | 'githubUrl' | 'portfolioUrl' | 'targetTitles' | 'visaInfo'
  > | null;
  resume?: (Pick<ResumeAsset, 'summary' | 'skills'> & { uploadedFile?: Pick<UploadedFile, 'filename' | 'storagePath'> | null }) | null;
  job: { title: string; company: string; sourceUrl: string; easyApply?: boolean; sourceName?: string | null };
}): BrowserPreparationPacket {
  const summary = input.profile?.summary || input.resume?.summary || '';
  const skills = dedupe([...(input.profile?.skills ?? []), ...(input.resume?.skills ?? [])]).slice(0, 8);
  const targetTitles = dedupe(input.profile?.targetTitles ?? []).slice(0, 3);
  const sourceName = input.job.sourceName?.toLowerCase() ?? '';
  const prefillSupport = input.job.easyApply || ['lever', 'ashby', 'workable', 'greenhouse'].some((label) => sourceName.includes(label)) ? 'best_effort' : 'copy_assist';

  const contactFields = compactFields([
    ['Full name', input.user.name],
    ['Email', input.user.email],
    ['Phone', input.profile?.phone],
    ['Location', input.profile?.location]
  ]);

  const profileFields = compactFields([
    ['Target roles', targetTitles.join(', ')],
    ['Top skills', skills.join(', ')],
    ['LinkedIn', input.profile?.linkedinUrl],
    ['GitHub', input.profile?.githubUrl],
    ['Portfolio', input.profile?.portfolioUrl],
    ['Work authorization', input.profile?.visaInfo],
    ['Short summary', summary]
  ]);

  const automationFields = Object.fromEntries(
    compactFields([
      ['name', input.user.name],
      ['full_name', input.user.name],
      ['email', input.user.email],
      ['phone', input.profile?.phone],
      ['location', input.profile?.location],
      ['linkedin', input.profile?.linkedinUrl],
      ['github', input.profile?.githubUrl],
      ['portfolio', input.profile?.portfolioUrl],
      ['authorization', input.profile?.visaInfo],
      ['summary', summary]
    ]).map((entry) => [entry.label.toLowerCase().replace(/\s+/g, '_'), entry.value])
  );

  const resumeReady = Boolean(input.resume?.uploadedFile?.storagePath);
  const warnings = [
    !input.profile?.phone ? 'Add a phone number in onboarding before applying to forms that require it.' : '',
    !input.profile?.location ? 'Add your location so location-required applications are faster to complete.' : '',
    !summary ? 'Add a professional summary to speed up “Why are you interested?” style prompts.' : '',
    skills.length === 0 ? 'Add key skills so you have a concise copy/paste list for application forms.' : '',
    !resumeReady ? 'Upload a resume to enable resume-ready preparation and any best-effort file upload automation.' : ''
  ].filter(Boolean);

  const checklist = [
    `Review the ${input.job.company} posting in the new tab before you fill anything out.`,
    'Use the prepared profile details below to complete or verify required fields in your own browser session.',
    resumeReady ? 'Verify the selected resume/CV is the correct version before you submit.' : 'Upload your saved resume/CV manually before submitting.',
    'Confirm all answers, then submit manually yourself. AutoApply AI does not submit for you.'
  ];

  const prefillSummary =
    prefillSupport === 'best_effort'
      ? 'Best-effort prefilling is available for common fields. You still need to review the external form before submitting.'
      : 'This source falls back to copy-assist mode. We will open the application and prepare your details for manual paste.';

  const notes = [
    `Prepared browser handoff for ${input.job.title} at ${input.job.company}.`,
    targetTitles.length ? `Target roles: ${targetTitles.join(', ')}.` : '',
    skills.length ? `Top skills: ${skills.join(', ')}.` : '',
    summary ? 'Summary ready for copy/paste.' : '',
    resumeReady ? `Resume ready: ${input.resume?.uploadedFile?.filename}.` : 'Resume upload still required.'
  ]
    .filter(Boolean)
    .join(' ');

  return {
    targetUrl: input.job.sourceUrl,
    contactFields,
    profileFields,
    checklist,
    warnings,
    notes,
    prefillSupport,
    prefillSummary,
    resume: {
      ready: resumeReady,
      filename: input.resume?.uploadedFile?.filename ?? undefined,
      note: resumeReady
        ? 'Saved resume is ready for manual upload and optional best-effort automation.'
        : 'No saved resume is available yet. Upload one in onboarding before continuing.',
      automationUploadReady: Boolean(env.ENABLE_AUTOMATION === 'true' && resumeReady)
    },
    automationEnabled: env.ENABLE_AUTOMATION === 'true',
    automationFields,
    resumeStoragePath: input.resume?.uploadedFile?.storagePath ?? undefined
  };
}

function compactFields(entries: Array<[string, string | null | undefined]>) {
  return entries
    .map(([label, value]) => ({ label, value: value?.trim() }))
    .filter((entry): entry is { label: string; value: string } => Boolean(entry.value));
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
