import { env } from '@/lib/validation/env';

export type AutofillPreparationInput = {
  url: string;
  fields: Record<string, string>;
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
    const locator = page.locator(`input[name*="${field}"]`).first();
    if ((await locator.count()) > 0) {
      await locator.fill(value);
      steps.push(`Filled ${field}`);
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
