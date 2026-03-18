import pdf from 'pdf-parse';

export type ResumeSectionItem = {
  title: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
};

export type ParsedResume = {
  fullText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  links: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  workHistory: ResumeSectionItem[];
  education: ResumeSectionItem[];
  certifications: string[];
  parseQuality: 'success' | 'partial';
  warnings: string[];
};

const commonSkills = [
  'typescript',
  'javascript',
  'node',
  'node.js',
  'react',
  'next.js',
  'postgresql',
  'redis',
  'aws',
  'docker',
  'kubernetes',
  'graphql',
  'python',
  'java',
  'go',
  'terraform'
];

const sectionAliases: Record<string, string[]> = {
  summary: ['summary', 'professional summary', 'profile'],
  experience: ['experience', 'work experience', 'professional experience', 'employment'],
  education: ['education'],
  skills: ['skills', 'technical skills', 'core skills'],
  certifications: ['certifications', 'licenses']
};

export async function parseResume(buffer: Buffer): Promise<ParsedResume> {
  const data = await pdf(buffer);
  return parseResumeText(data.text);
}

export function parseResumeText(rawText: string): ParsedResume {
  const fullText = normalizeText(rawText);
  const lines = fullText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = splitSections(lines);
  const links = extractLinks(fullText);
  const email = fullText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = fullText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim();
  const location = extractLocation(lines);
  const name = extractName(lines, email);
  const summary = extractSummary(sections, lines);
  const skills = unique(extractSkills(fullText, sections.skills));
  const workHistory = extractExperience(sections.experience);
  const education = extractEducation(sections.education);
  const certifications = extractCertifications(sections.certifications, fullText);

  const warnings: string[] = [];
  if (!name) warnings.push('Could not confidently detect full name.');
  if (!email) warnings.push('Could not detect email address.');
  if (skills.length === 0) warnings.push('Could not detect explicit skills list.');
  if (workHistory.length === 0) warnings.push('Could not extract structured work history.');

  return {
    fullText,
    name,
    email,
    phone,
    location,
    summary,
    skills,
    links,
    linkedinUrl: links.find((link) => link.includes('linkedin.com')),
    githubUrl: links.find((link) => link.includes('github.com')),
    portfolioUrl: links.find((link) => !link.includes('linkedin.com') && !link.includes('github.com')),
    workHistory,
    education,
    certifications,
    parseQuality: warnings.length > 2 ? 'partial' : 'success',
    warnings
  };
}

function normalizeText(text: string) {
  return text.replace(/\r/g, '').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
}

function splitSections(lines: string[]) {
  const sections: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: []
  };

  let current: keyof typeof sections = 'summary';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const next = Object.entries(sectionAliases).find(([, aliases]) => aliases.includes(lower));
    if (next) {
      current = next[0] as keyof typeof sections;
      continue;
    }
    sections[current].push(line);
  }

  return sections;
}

function extractName(lines: string[], email?: string) {
  for (const line of lines.slice(0, 5)) {
    if (email && line.includes(email)) continue;
    if (/^[A-Z][a-z]+(?: [A-Z][a-z]+){1,3}$/.test(line)) return line;
  }
  return lines[0]?.length && lines[0].length < 60 ? lines[0] : undefined;
}

function extractLocation(lines: string[]) {
  const candidate = lines.slice(0, 8).find((line) => /,\s*[A-Z]{2}\b|remote|new york|san francisco|london|berlin/i.test(line));
  return candidate;
}

function extractSummary(sections: Record<string, string[]>, lines: string[]) {
  const explicit = sections.summary.join(' ').trim();
  if (explicit.length > 40) return explicit.slice(0, 400);
  const firstParagraph = lines.slice(1, 5).join(' ').trim();
  return firstParagraph.length > 40 ? firstParagraph.slice(0, 400) : undefined;
}

function extractLinks(text: string) {
  return unique(Array.from(text.matchAll(/https?:\/\/[^\s)]+/g)).map((match) => match[0].replace(/[.,]$/, '')));
}

function extractSkills(text: string, skillLines: string[]) {
  const normalized = text.toLowerCase();
  const lineText = skillLines.join(' ').toLowerCase();
  return commonSkills
    .filter((skill) => normalized.includes(skill) || lineText.includes(skill))
    .map((skill) => skill.replace('node.js', 'Node.js').replace('next.js', 'Next.js'));
}

function extractExperience(lines: string[]) {
  return extractStructuredItems(lines).slice(0, 8);
}

function extractEducation(lines: string[]) {
  return extractStructuredItems(lines).slice(0, 4);
}

function extractStructuredItems(lines: string[]): ResumeSectionItem[] {
  const items: ResumeSectionItem[] = [];
  let current: ResumeSectionItem | null = null;

  for (const line of lines) {
    if (/^[•*-]/.test(line)) {
      if (current) {
        current.bullets = [...(current.bullets ?? []), line.replace(/^[•*-]\s*/, '')];
      }
      continue;
    }

    if (looksLikeHeading(line)) {
      if (current) items.push(current);
      current = buildItemFromHeading(line);
      continue;
    }

    if (current && !current.subtitle) {
      current.subtitle = line;
    } else if (current) {
      current.bullets = [...(current.bullets ?? []), line];
    }
  }

  if (current) items.push(current);
  return items.filter((item) => item.title.length > 1);
}

function looksLikeHeading(line: string) {
  return /\b(19|20)\d{2}\b/.test(line) || / at /i.test(line) || /\|/.test(line) || /^[A-Z][A-Za-z0-9,&()/. -]{5,}$/.test(line);
}

function buildItemFromHeading(line: string): ResumeSectionItem {
  const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*[-–]\s*((?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}))/i);
  const cleaned = line.replace(dateMatch?.[0] ?? '', '').trim().replace(/[|–-]+$/, '').trim();
  const [title, subtitle] = cleaned.split(/\s+at\s+|\s+\|\s+/i);

  return {
    title: title?.trim() || cleaned,
    subtitle: subtitle?.trim(),
    startDate: dateMatch?.[1],
    endDate: dateMatch?.[2]
  };
}

function extractCertifications(lines: string[], text: string) {
  const explicit = lines.filter((line) => line.length > 3);
  const inferred = Array.from(text.matchAll(/\b(AWS Certified[^\n,]*|CKA|CKAD|PMP|Scrum Master)\b/gi)).map((match) => match[0]);
  return unique([...explicit, ...inferred]).slice(0, 10);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
