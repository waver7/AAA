import type { ResumeAsset, User, UserProfile } from '@prisma/client';

export type BrowserPreparationPacket = {
  targetUrl: string;
  contactFields: Array<{ label: string; value: string }>;
  profileFields: Array<{ label: string; value: string }>;
  checklist: string[];
  warnings: string[];
  notes: string;
};

export function buildBrowserPreparationPacket(input: {
  user: Pick<User, 'name' | 'email'>;
  profile?: Pick<UserProfile, 'phone' | 'location' | 'summary' | 'skills' | 'linkedinUrl' | 'githubUrl' | 'portfolioUrl' | 'targetTitles'> | null;
  resume?: Pick<ResumeAsset, 'summary' | 'skills'> | null;
  job: { title: string; company: string; sourceUrl: string };
}): BrowserPreparationPacket {
  const summary = input.profile?.summary || input.resume?.summary || '';
  const skills = dedupe([...(input.profile?.skills ?? []), ...(input.resume?.skills ?? [])]).slice(0, 8);
  const targetTitles = dedupe(input.profile?.targetTitles ?? []).slice(0, 3);

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
    ['Short summary', summary]
  ]);

  const warnings = [
    !input.profile?.phone ? 'Add a phone number in onboarding before applying to forms that require it.' : '',
    !input.profile?.location ? 'Add your location so location-required applications are faster to complete.' : '',
    !summary ? 'Add a professional summary to speed up “Why are you interested?” style prompts.' : '',
    skills.length === 0 ? 'Add key skills so you have a concise copy/paste list for application forms.' : ''
  ].filter(Boolean);

  const checklist = [
    `Review the ${input.job.company} posting in the new tab before you fill anything out.`,
    'Use the profile details below to complete required fields in your own browser session.',
    'Attach the correct resume version and tailor any free-text answers before submission.',
    'Confirm all answers, then submit manually yourself. AutoApply AI does not submit for you.'
  ];

  const notes = [
    `Prepared browser handoff for ${input.job.title} at ${input.job.company}.`,
    targetTitles.length ? `Target roles: ${targetTitles.join(', ')}.` : '',
    skills.length ? `Top skills: ${skills.join(', ')}.` : '',
    summary ? 'Summary ready for copy/paste.' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return {
    targetUrl: input.job.sourceUrl,
    contactFields,
    profileFields,
    checklist,
    warnings,
    notes
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
