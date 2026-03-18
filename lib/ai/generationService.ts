import { AIProvider, OpenAICompatibleProvider } from './provider';

const provider: AIProvider = new OpenAICompatibleProvider();

export async function generateOutreach(profileSummary: string, jobTitle: string, company: string) {
  return provider.complete(
    `Write a concise recruiter outreach message for ${jobTitle} at ${company}. Candidate profile: ${profileSummary}`
  );
}

export async function generateTailoredSummary(profileSummary: string, jobDescription: string) {
  return provider.complete(
    `Write a tailored professional summary in 4 lines for this role. Candidate profile: ${profileSummary}. Job description: ${jobDescription}`
  );
}
