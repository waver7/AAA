import OpenAI from 'openai';
import { env, isDemoMode } from '@/lib/validation/env';

export type AIResult = {
  content: string;
  mode: 'live' | 'demo';
};

export type AIProvider = {
  complete(prompt: string): Promise<AIResult>;
};

function mockResponse(prompt: string): string {
  if (prompt.toLowerCase().includes('outreach')) {
    return 'Hi team — I am excited about this role because my recent work aligns with your backend stack. I would love to connect and share how I can contribute quickly.';
  }

  return 'Senior software engineer focused on TypeScript, distributed backend systems, and shipping measurable product outcomes in fast-moving teams.';
}

export class OpenAICompatibleProvider implements AIProvider {
  private client = process.env.OPENAI_API_KEY
    ? new OpenAI({ baseURL: env.OPENAI_BASE_URL, apiKey: env.OPENAI_API_KEY })
    : null;

  async complete(prompt: string): Promise<AIResult> {
    if (!this.client) {
      if (isDemoMode()) {
        return { content: mockResponse(prompt), mode: 'demo' };
      }
      throw new Error('OPENAI_API_KEY is not set. Provide an API key or enable DEMO_MODE=true for mock generation.');
    }

    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    return { content: response.choices[0]?.message?.content ?? '', mode: 'live' };
  }
}
