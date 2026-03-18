import type { UserProfile } from '@prisma/client';

export type RecommendedBoard = {
  id: string;
  company: string;
  sourceType: 'greenhouse' | 'lever';
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
    url: 'https://job-boards.greenhouse.io/vercel',
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
    locationHint: 'Hybrid / remote by team',
    roleThemes: ['backend engineer', 'infrastructure engineer', 'full-stack engineer', 'platform engineer'],
    skillThemes: ['api', 'distributed systems', 'ruby', 'java', 'typescript'],
    reasons: ['Good place to look for backend, platform, and systems-heavy roles.']
  },
  {
    id: 'figma',
    company: 'Figma',
    sourceType: 'lever',
    url: 'https://jobs.lever.co/figma',
    locationHint: 'US hybrid / remote by role',
    roleThemes: ['frontend engineer', 'full-stack engineer', 'product engineer'],
    skillThemes: ['react', 'typescript', 'design systems', 'collaboration'],
    reasons: ['Likely to surface product-focused web roles with strong front-end ownership.']
  },
  {
    id: 'datadog',
    company: 'Datadog',
    sourceType: 'greenhouse',
    url: 'https://job-boards.greenhouse.io/datadog',
    locationHint: 'Global / hybrid by office',
    roleThemes: ['backend engineer', 'site reliability engineer', 'infrastructure engineer', 'data engineer'],
    skillThemes: ['observability', 'go', 'python', 'kubernetes', 'distributed systems'],
    reasons: ['Useful if you want infra, platform, observability, or reliability work.']
  },
  {
    id: 'notion',
    company: 'Notion',
    sourceType: 'greenhouse',
    url: 'https://job-boards.greenhouse.io/notion',
    locationHint: 'Hybrid / remote by team',
    roleThemes: ['full-stack engineer', 'product engineer', 'frontend engineer'],
    skillThemes: ['react', 'typescript', 'product', 'collaboration'],
    reasons: ['Often a fit for engineers who like customer-facing product work.']
  },
  {
    id: 'openai',
    company: 'OpenAI',
    sourceType: 'greenhouse',
    url: 'https://job-boards.greenhouse.io/openai',
    locationHint: 'San Francisco / hybrid by team',
    roleThemes: ['backend engineer', 'full-stack engineer', 'infrastructure engineer', 'machine learning engineer'],
    skillThemes: ['python', 'typescript', 'ai', 'distributed systems', 'infrastructure'],
    reasons: ['Relevant for AI-adjacent product, infrastructure, and platform engineering roles.']
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
      const locationMatches = countMatches(locationTerms, [board.locationHint]);
      const fitScore = 35 + roleMatches * 18 + skillMatches * 12 + Math.min(locationMatches, 1) * 8;
      const reasons = [...board.reasons];

      if (roleMatches > 0 && targetTerms.length) reasons.unshift(`Matches your target titles: ${summarizeMatches(targetTerms, board.roleThemes)}.`);
      if (skillMatches > 0 && skillTerms.length) reasons.push(`Skill overlap found in ${summarizeMatches(skillTerms, board.skillThemes)}.`);
      if (locationMatches > 0 && locationTerms.length) reasons.push(`Location preference may align with ${board.locationHint}.`);
      if (roleMatches === 0 && skillMatches === 0 && targetTerms.length + skillTerms.length > 0) reasons.push('Broad engineering board worth checking even without a direct keyword match.');

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
