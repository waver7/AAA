import type { ResumeAsset, UploadedFile, User, UserProfile } from '@prisma/client';
import { env } from '@/lib/validation/env';

export type BrowserPreparationPacket = {
  targetUrl: string;
  contactFields: Array<{ label: string; value: string }>;
  profileFields: Array<{ label: string; value: string }>;
  applicantDetailsText: string;
  checklist: string[];
  warnings: string[];
  notes: string;
  prefillSupport: 'best_effort' | 'copy_assist';
  prefillSummary: string;
  visibleBrowserPrefill: boolean;
  resume: {
    ready: boolean;
    filename?: string;
    note: string;
    automationUploadReady: boolean;
    uploadAssistance: 'direct_file_input' | 'attach_prompt' | 'manual_only';
  };
  automationEnabled: boolean;
  automationFields: Record<string, string>;
  resumeStoragePath?: string;
};

const DEFAULT_SELF_ID_ANSWERS = {
  requires_sponsorship: 'No',
  requires_visa_sponsorship: 'No',
  immigration_sponsorship: 'No',
  gender: 'Male',
  race: 'White',
  ethnicity: 'No',
  hispanic_or_latino: 'No',
  veteran_status: 'No',
  disability_status: 'No',
  transgender: 'No',
  sexual_orientation: 'Heterosexual',
  phone_country_code: 'United States (+1)',
  phone_country: 'United States'
} as const;

export function buildBrowserPreparationPacket(input: {
  user: Pick<User, 'name' | 'email'>;
  profile?: Pick<
    UserProfile,
    'phone' | 'location' | 'summary' | 'skills' | 'linkedinUrl' | 'githubUrl' | 'portfolioUrl' | 'targetTitles' | 'visaInfo'
  > | null;
  resume?: ((Pick<ResumeAsset, 'summary' | 'skills'> & Partial<Pick<ResumeAsset, 'parsedName' | 'parsedEmail' | 'parsedPhone' | 'parsedLocation' | 'links' | 'workHistory' | 'education'>>) & {
    uploadedFile?: Pick<UploadedFile, 'filename' | 'storagePath'> | null;
  }) | null;
  job: { title: string; company: string; sourceUrl: string; easyApply?: boolean; sourceName?: string | null };
}): BrowserPreparationPacket {
  const resolvedName = input.user.name || input.resume?.parsedName || '';
  const resolvedEmail = input.user.email || input.resume?.parsedEmail || '';
  const resolvedPhone = input.profile?.phone || input.resume?.parsedPhone || '';
  const resolvedLocation = input.profile?.location || input.resume?.parsedLocation || '';
  const summary = input.profile?.summary || input.resume?.summary || '';
  const skills = dedupe([...(input.profile?.skills ?? []), ...(input.resume?.skills ?? [])]).slice(0, 8);
  const targetTitles = dedupe(input.profile?.targetTitles ?? []).slice(0, 3);
  const sourceName = input.job.sourceName?.toLowerCase() ?? '';
  const prefillSupport = input.job.easyApply || ['lever', 'ashby', 'workable', 'greenhouse'].some((label) => sourceName.includes(label)) ? 'best_effort' : 'copy_assist';
  const { firstName, lastName } = splitName(resolvedName);
  const locationBits = splitLocation(resolvedLocation);
  const inferredCountry = inferCountry(resolvedLocation, input.profile?.visaInfo);
  const phoneCountry = inferPhoneCountry(resolvedPhone, inferredCountry || locationBits.country);
  const sponsorshipAnswer = inferSponsorshipAnswer(input.profile?.visaInfo) || DEFAULT_SELF_ID_ANSWERS.requires_sponsorship;
  const latestExperience = getFirstSectionRecord(input.resume?.workHistory);
  const latestEducation = getFirstSectionRecord(input.resume?.education);
  const linkedinUrl = input.profile?.linkedinUrl || input.resume?.links?.find((link) => link.includes('linkedin.com'));
  const githubUrl = input.profile?.githubUrl || input.resume?.links?.find((link) => link.includes('github.com'));
  const portfolioUrl =
    input.profile?.portfolioUrl || input.resume?.links?.find((link) => !link.includes('linkedin.com') && !link.includes('github.com'));

  const contactFields = compactFields([
    ['Full name', resolvedName],
    ['Email', resolvedEmail],
    ['Phone', resolvedPhone],
    ['Location', resolvedLocation]
  ]);

  const profileFields = compactFields([
    ['Target roles', targetTitles.join(', ')],
    ['Top skills', skills.join(', ')],
    ['LinkedIn', linkedinUrl],
    ['GitHub', githubUrl],
    ['Portfolio', portfolioUrl],
    ['Work authorization', input.profile?.visaInfo ?? (sponsorshipAnswer === 'No' ? 'No sponsorship required' : '')],
    ['Gender', DEFAULT_SELF_ID_ANSWERS.gender],
    ['Race', DEFAULT_SELF_ID_ANSWERS.race],
    ['Hispanic / Latino', DEFAULT_SELF_ID_ANSWERS.hispanic_or_latino],
    ['Veteran status', DEFAULT_SELF_ID_ANSWERS.veteran_status],
    ['Disability status', DEFAULT_SELF_ID_ANSWERS.disability_status],
    ['Transgender', DEFAULT_SELF_ID_ANSWERS.transgender],
    ['Sexual orientation', DEFAULT_SELF_ID_ANSWERS.sexual_orientation],
    ['Short summary', summary]
  ]);

  const automationFields = Object.fromEntries(
    compactFields([
      ['name', resolvedName],
      ['full_name', resolvedName],
      ['legal_name', resolvedName],
      ['first_name', firstName],
      ['preferred_first_name', firstName],
      ['last_name', lastName],
      ['email', resolvedEmail],
      ['phone', resolvedPhone],
      ['location', resolvedLocation],
      ['city', locationBits.city],
      ['state', locationBits.state],
      ['region', locationBits.state],
      ['country', inferredCountry || locationBits.country],
      ['phone_country', phoneCountry.country],
      ['phone_country_code', phoneCountry.display],
      ['country_code', phoneCountry.code],
      ['linkedin', linkedinUrl],
      ['linkedin_url', linkedinUrl],
      ['github', githubUrl],
      ['website', portfolioUrl],
      ['portfolio', portfolioUrl],
      ['portfolio_url', portfolioUrl],
      ['authorization', input.profile?.visaInfo],
      ['work_authorization', input.profile?.visaInfo],
      ['requires_sponsorship', sponsorshipAnswer],
      ['requires_visa_sponsorship', sponsorshipAnswer],
      ['immigration_sponsorship', sponsorshipAnswer],
      ['gender', DEFAULT_SELF_ID_ANSWERS.gender],
      ['sex', DEFAULT_SELF_ID_ANSWERS.gender],
      ['race', DEFAULT_SELF_ID_ANSWERS.race],
      ['ethnicity', DEFAULT_SELF_ID_ANSWERS.ethnicity],
      ['hispanic_or_latino', DEFAULT_SELF_ID_ANSWERS.hispanic_or_latino],
      ['veteran_status', DEFAULT_SELF_ID_ANSWERS.veteran_status],
      ['protected_veteran', DEFAULT_SELF_ID_ANSWERS.veteran_status],
      ['disability_status', DEFAULT_SELF_ID_ANSWERS.disability_status],
      ['disability', DEFAULT_SELF_ID_ANSWERS.disability_status],
      ['transgender', DEFAULT_SELF_ID_ANSWERS.transgender],
      ['sexual_orientation', DEFAULT_SELF_ID_ANSWERS.sexual_orientation],
      ['summary', summary]
    ])
      .concat(compactFields([
        ['skills', skills.join(', ')],
        ['current_company', latestExperience.subtitle],
        ['current_title', latestExperience.title],
        ['company', latestExperience.subtitle],
        ['job_title', latestExperience.title],
        ['school', latestEducation.subtitle ?? latestEducation.title],
        ['university', latestEducation.subtitle ?? latestEducation.title],
        ['degree', latestEducation.title],
        ['resume_keywords', skills.join(', ')]
      ]))
      .map((entry) => [entry.label.toLowerCase().replace(/\s+/g, '_'), entry.value])
  );
  const applicantDetailsText = [...contactFields, ...profileFields].map((entry) => `${entry.label}: ${entry.value}`).join('\n');

  const resumeReady = Boolean(input.resume?.uploadedFile?.storagePath);
  const warnings = [
    !input.profile?.phone ? 'Add a phone number in onboarding before applying to forms that require it.' : '',
    !input.profile?.location ? 'Add your location so location-required applications are faster to complete.' : '',
    !summary ? 'Add a professional summary to speed up “Why are you interested?” style prompts.' : '',
    skills.length === 0 ? 'Add key skills so you have a concise copy/paste list for application forms.' : '',
    !resumeReady ? 'Upload a resume to enable resume-ready preparation and any best-effort file upload automation.' : '',
    resumeReady ? 'Resume upload automation works best on pages with a visible file input; attach-button flows may still require one manual click.' : ''
  ].filter(Boolean);

  const checklist = [
    `Review the ${input.job.company} posting in the new tab before you fill anything out.`,
    'Use the copied applicant details to paste common fields into the external application form.',
    resumeReady ? 'If the site uses an Attach button, click it when prompted so the browser can finish the resume upload where allowed.' : 'Upload your saved resume/CV manually before submitting.',
    'Confirm all answers, then submit manually yourself. AutoApply AI does not submit for you.'
  ];

  const prefillSummary =
    prefillSupport === 'best_effort'
      ? 'We can prepare your details and may run server-side automation for supported sites. Install the optional AutoApply browser extension if you want the newly opened page itself to show visible autofill; otherwise use copied details and manual review.'
      : 'This source uses copy-assist mode. We will open the application and copy your saved details so you can paste them into the external form.';

  const notes = [
    `Prepared browser handoff for ${input.job.title} at ${input.job.company}.`,
    targetTitles.length ? `Target roles: ${targetTitles.join(', ')}.` : '',
    skills.length ? `Top skills: ${skills.join(', ')}.` : '',
    summary ? 'Summary ready for copy/paste.' : '',
    resumeReady ? `Resume ready: ${input.resume?.uploadedFile?.filename}.` : 'Resume upload still required.',
    'Self-ID defaults loaded for gender, race, Hispanic/Latino, veteran, disability, transgender, and sexual orientation questions.'
  ]
    .filter(Boolean)
    .join(' ');

  return {
    targetUrl: input.job.sourceUrl,
    contactFields,
    profileFields,
    applicantDetailsText,
    checklist,
    warnings,
    notes,
    prefillSupport,
    prefillSummary,
    visibleBrowserPrefill: false,
    resume: {
      ready: resumeReady,
      filename: input.resume?.uploadedFile?.filename ?? undefined,
      note: resumeReady
        ? 'Saved resume is ready for manual upload and optional best-effort automation. Some sites still require you to click an Attach button before the browser can supply the file.'
        : 'No saved resume is available yet. Upload one in onboarding before continuing.',
      automationUploadReady: Boolean(env.ENABLE_AUTOMATION === 'true' && resumeReady),
      uploadAssistance: resumeReady ? 'attach_prompt' : 'manual_only'
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

function splitName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: value.trim(), lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

function splitLocation(value: string) {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    city: parts[0] ?? '',
    state: parts[1] ?? '',
    country: parts[2] ?? ''
  };
}

function getFirstSectionRecord(value: unknown) {
  if (!Array.isArray(value)) return { title: '', subtitle: '' };
  const first = value.find((item) => item && typeof item === 'object') as { title?: unknown; subtitle?: unknown } | undefined;
  return {
    title: typeof first?.title === 'string' ? first.title : '',
    subtitle: typeof first?.subtitle === 'string' ? first.subtitle : ''
  };
}

function inferCountry(location: string, visaInfo?: string | null) {
  const normalized = `${location} ${visaInfo ?? ''}`.toLowerCase();
  if (/\b(us|usa|united states|u\.s\.)\b/.test(normalized)) return 'United States';
  if (/\bcanada\b/.test(normalized)) return 'Canada';
  if (/\buk|united kingdom|england\b/.test(normalized)) return 'United Kingdom';
  return '';
}

function inferPhoneCountry(phone: string, country: string) {
  const normalizedPhone = phone.replace(/\s+/g, '');
  if (/canada/i.test(country)) {
    return { country: 'Canada', code: '+1', display: 'Canada (+1)' };
  }
  if (normalizedPhone.startsWith('+44') || /united kingdom|uk|england/i.test(country)) {
    return { country: 'United Kingdom', code: '+44', display: 'United Kingdom (+44)' };
  }
  if (normalizedPhone.startsWith('+1') || /united states|usa|us/i.test(country)) {
    return { country: 'United States', code: '+1', display: 'United States (+1)' };
  }
  return {
    country: country || DEFAULT_SELF_ID_ANSWERS.phone_country,
    code: '+1',
    display: country ? `${country} (+1)` : DEFAULT_SELF_ID_ANSWERS.phone_country_code
  };
}

function inferSponsorshipAnswer(visaInfo?: string | null) {
  if (!visaInfo) return '';
  const normalized = visaInfo.toLowerCase();
  if (/authorized to work|no sponsorship|citizen|permanent resident|green card/.test(normalized)) return 'No';
  if (/require sponsorship|need sponsorship|visa required|h-1b/.test(normalized)) return 'Yes';
  return '';
}
