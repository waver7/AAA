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
  country: ['select[name*="country"]', 'select[id*="country"]', 'input[name*="country"]', 'input[id*="country"]'],
  phone_country: ['select[name*="phone"]', 'select[id*="phone"]', 'select[name*="country"]', 'select[id*="country"]'],
  phone_country_code: ['select[name*="code"]', 'select[id*="code"]', 'select[name*="phone"]', 'select[id*="phone"]'],
  linkedin: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  github: ['input[name*="github"]', 'input[id*="github"]'],
  portfolio: ['input[name*="portfolio"]', 'input[name*="website"]', 'input[id*="portfolio"]', 'input[id*="website"]'],
  authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]'],
  work_authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]'],
  requires_sponsorship: ['select[name*="sponsor"]', 'select[id*="sponsor"]'],
  gender: ['select[name*="gender"]', 'select[id*="gender"]'],
  race: ['select[name*="race"]', 'select[id*="race"]'],
  ethnicity: ['select[name*="ethnicity"]', 'select[id*="ethnicity"]'],
  veteran_status: ['select[name*="veteran"]', 'select[id*="veteran"]'],
  disability_status: ['select[name*="disability"]', 'select[id*="disability"]'],
  transgender: ['select[name*="transgender"]', 'select[id*="transgender"]'],
  sexual_orientation: ['select[name*="orientation"]', 'select[id*="orientation"]'],
  summary: ['textarea[name*="summary"]', 'textarea[name*="cover"]', 'textarea[name*="why"]']
};

const fieldValueAliases: Record<string, string[]> = {
  country: ['United States', 'USA', 'United States of America'],
  phone_country: ['United States (+1)', 'United States', 'USA', '+1'],
  phone_country_code: ['United States (+1)', '+1', '1'],
  requires_sponsorship: ['No', 'No, I do not require sponsorship'],
  gender: ['Male', 'Man'],
  race: ['White', 'White or European'],
  ethnicity: ['No', 'Not Hispanic or Latino'],
  veteran_status: ['No', 'I am not a protected veteran', 'No, I am not a veteran or active member'],
  disability_status: ['No', 'No, I do not have a disability'],
  transgender: ['No', 'No, I do not identify as transgender'],
  sexual_orientation: ['Heterosexual', 'Straight']
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
    const selectors = fieldSelectors[field] ?? [`input[name*="${field}"]`, `input[id*="${field}"]`, `textarea[name*="${field}"]`, `select[name*="${field}"]`];
    let filled = false;

    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      if ((await locator.count()) === 0) continue;

      const tagName = await locator.evaluate((node) => node.tagName.toLowerCase());
      if (tagName === 'select') {
        const selected = await trySelect(locator, field, value);
        if (!selected) continue;
      } else {
        await locator.fill(value);
      }

      steps.push(`Filled ${field}`);
      filled = true;
      break;
    }

    if (!filled) steps.push(`Could not confidently fill ${field}`);
  }

  if (input.resumePath) {
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(input.resumePath);
      steps.push('Attached resume file');
    } else {
      const attachTrigger = page.locator('button:has-text("Attach"), button:has-text("Upload"), text=/Attach|Upload|Resume|CV/i').first();
      if ((await attachTrigger.count()) > 0) {
        steps.push('Resume upload needs a manual Attach/Upload click before file selection can continue.');
      } else {
        steps.push('No resume upload input found');
      }
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

async function trySelect(locator: any, field: string, value: string) {
  const aliases = Array.from(new Set([value, ...(fieldValueAliases[field] ?? [])]));
  const options = await locator.evaluate((node) => Array.from((node as HTMLSelectElement).options).map((option) => ({ value: option.value, text: option.text })));
  const match = options.find((option: { value: string; text: string }) => aliases.some((alias) => matchesOption(option.text, alias) || matchesOption(option.value, alias)));
  if (!match) return false;
  await locator.selectOption(match.value);
  return true;
}

function matchesOption(optionText: string, desiredText: string) {
  const option = normalizeValue(optionText);
  const desired = normalizeValue(desiredText);
  return option === desired || option.includes(desired) || desired.includes(option);
}

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
}
