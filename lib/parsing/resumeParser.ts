import pdf from 'pdf-parse';

export type ParsedResume = {
  fullText: string;
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
};

export async function parseResume(buffer: Buffer): Promise<ParsedResume> {
  const data = await pdf(buffer);
  const text = data.text;

  return {
    fullText: text,
    name: text.split('\n')[0]?.trim(),
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
    phone: text.match(/(\+?\d[\d\s()-]{7,}\d)/)?.[0],
    skills: extractSkills(text)
  };
}

const commonSkills = ['typescript', 'javascript', 'node', 'react', 'next.js', 'postgresql', 'redis', 'aws'];

function extractSkills(text: string): string[] {
  const normalized = text.toLowerCase();
  return commonSkills.filter((skill) => normalized.includes(skill));
}
