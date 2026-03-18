import { env } from '@/lib/validation/env';

export type AutofillPreparationInput = {
  url: string;
  fields: Record<string, string>;
  resumePath?: string;
};

const fieldSelectors: Record<string, string[]> = {
  name: ['input[name*="name"]', 'input[id*="name"]'],
  full_name: ['input[name*="full_name"]', 'input[id*="full_name"]', 'input[name*="name"]'],
  email: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
  phone: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
  location: ['input[name*="location"]', 'input[id*="location"]'],
  linkedin: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  github: ['input[name*="github"]', 'input[id*="github"]'],
  portfolio: ['input[name*="portfolio"]', 'input[name*="website"]', 'input[id*="portfolio"]', 'input[id*="website"]'],
  authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]'],
  summary: ['textarea[name*="summary"]', 'textarea[name*="cover"]', 'textarea[name*="why"]']
};

export async function runAutofillPreparation(input: AutofillPreparationInput) {
  if (env.ENABLE_AUTOMATION !== 'true') {
    throw new Error('Browser automation is disabled. Set ENABLE_AUTOMATION=true to enable preparation mode.');
  }

  let chromium: { launch: (args: { headless: boolean }) => Promise<any> };
  try {
    const playwright = await import('playwright');
    chromium = playwright.chromium;
  } catch {
    throw new Error('Playwright is optional and not installed. Install with `npm i playwright` to enable browser automation.');
  }

  // Respect website terms and robots/automation policies before enabling this flow in production.
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(input.url, { waitUntil: 'domcontentloaded' });

  const steps: string[] = [];
  for (const [field, value] of Object.entries(input.fields)) {
    const selectors = fieldSelectors[field] ?? [`input[name*="${field}"]`, `input[id*="${field}"]`, `textarea[name*="${field}"]`];
    let filled = false;

    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0) {
        await locator.fill(value);
        steps.push(`Filled ${field}`);
        filled = true;
        break;
      }
    }

    if (!filled) steps.push(`Could not confidently fill ${field}`);
  }

  if (input.resumePath) {
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(input.resumePath);
      steps.push('Attached resume file');
    } else {
      steps.push('No resume upload input found');
    }
  }

  const screenshotPath = `artifacts/autofill-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  return {
    steps,
    screenshotPath,
    blockedBeforeSubmit: true
  };
}
