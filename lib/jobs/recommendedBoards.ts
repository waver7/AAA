import type { UserProfile } from '@prisma/client';

type ProviderLabel = 'greenhouse' | 'lever' | 'ashby' | 'workable';

export type RecommendedBoard = {
  id: string;
  company: string;
  sourceType: ProviderLabel;
  url: string;
  locationHint: string;
  roleThemes: string[];
  skillThemes: string[];
  reasons: string[];
  fitScore: number;
};

type BoardSeed = Omit<RecommendedBoard, 'fitScore' | 'reasons'> & {
  reasons: string[];
};

const boardSeeds: BoardSeed[] = [
  {
    id: 'vercel',
    company: 'Vercel',
    sourceType: 'greenhouse',
    url: 'https://boards.greenhouse.io/vercel',
    locationHint: 'Remote-friendly',
    roleThemes: ['frontend engineer', 'full-stack engineer', 'platform engineer', 'developer experience'],
    skillThemes: ['react', 'next.js', 'typescript', 'platform'],
    reasons: ['Strong match for modern TypeScript, React, and product engineering roles.']
  },
  {
    id: 'stripe',
    company: 'Stripe',
    sourceType: 'lever',
    url: 'https://jobs.lever.co/stripe',
    locationHint: 'Remote-friendly teams',
    roleThemes: ['backend engineer', 'infrastructure engineer', 'full-stack engineer', 'platform engineer'],
    skillThemes: ['api', 'distributed systems', 'ruby', 'java', 'typescript'],
    reasons: ['Good place to look for backend, platform, and systems-heavy roles.']
  },
  {
    id: 'openai-ashby',
    company: 'Ashby example boards',
    sourceType: 'ashby',
    url: 'https://jobs.ashbyhq.com/Ashby',
    locationHint: 'Remote flags supported directly by the source',
    roleThemes: ['backend engineer', 'full-stack engineer', 'product engineer'],
    skillThemes: ['typescript', 'python', 'api', 'product'],
    reasons: ['Ashby boards expose explicit remote metadata, making remote-only discovery cleaner.']
  },
  {
    id: 'workable-demo',
    company: 'Workable public boards',
    sourceType: 'workable',
    url: 'https://apply.workable.com/remotecom',
    locationHint: 'Telecommuting metadata available',
    roleThemes: ['backend engineer', 'support engineer', 'product engineer'],
    skillThemes: ['remote', 'typescript', 'customer', 'product'],
    reasons: ['Workable public account feeds include telecommuting and workplace metadata.']
  },
  {
    id: 'datadog',
    company: 'Datadog',
    sourceType: 'greenhouse',
    url: 'https://boards.greenhouse.io/datadog',
    locationHint: 'Remote roles mixed with hybrid',
    roleThemes: ['backend engineer', 'site reliability engineer', 'infrastructure engineer', 'data engineer'],
    skillThemes: ['observability', 'go', 'python', 'kubernetes', 'distributed systems'],
    reasons: ['Useful if you want infra, platform, observability, or reliability work.']
  },
  {
    id: 'figma',
    company: 'Figma',
    sourceType: 'lever',
    url: 'https://jobs.lever.co/figma',
    locationHint: 'Remote roles mixed with hybrid',
    roleThemes: ['frontend engineer', 'full-stack engineer', 'product engineer'],
    skillThemes: ['react', 'typescript', 'design systems', 'collaboration'],
    reasons: ['Likely to surface product-focused web roles with strong front-end ownership.']
  }
];

export function getRecommendedBoards(profile?: Pick<UserProfile, 'skills' | 'targetTitles' | 'preferredLocations' | 'location'> | null) {
  const targetTerms = normalizeTerms(profile?.targetTitles ?? []);
  const skillTerms = normalizeTerms(profile?.skills ?? []);
  const locationTerms = normalizeTerms([...(profile?.preferredLocations ?? []), profile?.location ?? '']);

  return boardSeeds
    .map((board) => {
      const roleMatches = countMatches(targetTerms, board.roleThemes);
      const skillMatches = countMatches(skillTerms, board.skillThemes);
      const locationMatches = countMatches(locationTerms, [board.locationHint, 'remote']);
      const fitScore = 40 + roleMatches * 18 + skillMatches * 12 + Math.min(locationMatches, 1) * 8;
      const reasons = [...board.reasons];

      if (roleMatches > 0 && targetTerms.length) reasons.unshift(`Matches your target titles: ${summarizeMatches(targetTerms, board.roleThemes)}.`);
      if (skillMatches > 0 && skillTerms.length) reasons.push(`Skill overlap found in ${summarizeMatches(skillTerms, board.skillThemes)}.`);
      if (locationMatches > 0 && locationTerms.length) reasons.push(`Remote preference may align with ${board.locationHint}.`);
      if (roleMatches === 0 && skillMatches === 0 && targetTerms.length + skillTerms.length > 0) reasons.push('Worth checking because the source exposes useful remote metadata or remote-friendly roles.');

      return {
        ...board,
        fitScore: Math.min(99, fitScore),
        reasons: reasons.slice(0, 3)
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || a.company.localeCompare(b.company))
    .slice(0, 4);
}

function normalizeTerms(values: string[]) {
  return values
    .flatMap((value) => value.toLowerCase().split(/[\/,&()|-]+/))
    .map((value) => value.trim())
    .filter((value) => value.length > 1);
}

function countMatches(profileTerms: string[], boardTerms: string[]) {
  return summarizeMatchTerms(profileTerms, boardTerms).length;
}

function summarizeMatches(profileTerms: string[], boardTerms: string[]) {
  return summarizeMatchTerms(profileTerms, boardTerms).slice(0, 3).join(', ');
}

function summarizeMatchTerms(profileTerms: string[], boardTerms: string[]) {
  const boardHaystack = boardTerms.join(' ').toLowerCase();
  return Array.from(new Set(profileTerms.filter((term) => boardHaystack.includes(term))));
}
