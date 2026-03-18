const FIELD_SELECTORS = {
  name: ['input[name*="name"]', 'input[id*="name"]'],
  full_name: ['input[name*="full_name"]', 'input[id*="full_name"]', 'input[name*="name"]'],
  legal_name: ['input[name*="legal"]', 'input[id*="legal"]'],
  first_name: ['input[name*="first"]', 'input[id*="first"]', 'input[autocomplete="given-name"]'],
  preferred_first_name: ['input[name*="preferred"]', 'input[id*="preferred"]', 'input[name*="nickname"]', 'input[id*="nickname"]'],
  last_name: ['input[name*="last"]', 'input[id*="last"]', 'input[autocomplete="family-name"]'],
  email: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
  phone: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
  location: ['input[name*="location"]', 'input[id*="location"]'],
  city: ['input[name*="city"]', 'input[id*="city"]'],
  state: ['input[name*="state"]', 'input[id*="state"]', 'input[name*="region"]', 'input[id*="region"]'],
  country: ['input[name*="country"]', 'input[id*="country"]', 'select[name*="country"]', 'select[id*="country"]', '[role="combobox"][aria-label*="country" i]'],
  phone_country: ['select[name*="phone"]', 'select[id*="phone"]', 'select[name*="country"]', '[role="combobox"][aria-label*="phone country" i]', '[role="combobox"][aria-label*="country code" i]'],
  phone_country_code: ['select[name*="phone"]', 'select[id*="phone"]', 'select[name*="country"]', '[role="combobox"][aria-label*="country code" i]', '[role="combobox"][aria-label*="dial code" i]'],
  country_code: ['input[name*="country_code"]', 'input[id*="country_code"]', 'select[name*="country_code"]', 'select[id*="country_code"]'],
  linkedin: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  linkedin_url: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  github: ['input[name*="github"]', 'input[id*="github"]'],
  website: ['input[name*="website"]', 'input[id*="website"]', 'input[name*="portfolio"]', 'input[id*="portfolio"]'],
  portfolio: ['input[name*="portfolio"]', 'input[id*="portfolio"]', 'input[name*="website"]', 'input[id*="website"]'],
  portfolio_url: ['input[name*="portfolio"]', 'input[id*="portfolio"]', 'input[name*="website"]', 'input[id*="website"]'],
  authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]', 'input[id*="authorization"]'],
  work_authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]', 'input[id*="authorization"]'],
  requires_sponsorship: ['select[name*="sponsor"]', 'select[id*="sponsor"]', '[role="combobox"][aria-label*="sponsor" i]'],
  requires_visa_sponsorship: ['select[name*="sponsor"]', 'select[id*="sponsor"]', '[role="combobox"][aria-label*="visa" i]'],
  immigration_sponsorship: ['select[name*="immigration"]', 'select[id*="immigration"]', '[role="combobox"][aria-label*="immigration" i]'],
  gender: ['select[name*="gender"]', 'select[id*="gender"]', '[role="combobox"][aria-label*="gender" i]'],
  sex: ['select[name*="sex"]', 'select[id*="sex"]', '[role="combobox"][aria-label*="sex" i]'],
  race: ['select[name*="race"]', 'select[id*="race"]', '[role="combobox"][aria-label*="race" i]'],
  ethnicity: ['select[name*="ethnicity"]', 'select[id*="ethnicity"]', '[role="combobox"][aria-label*="ethnicity" i]'],
  hispanic_or_latino: ['select[name*="hispanic"]', 'select[id*="hispanic"]', '[role="combobox"][aria-label*="hispanic" i]', '[role="combobox"][aria-label*="latino" i]'],
  veteran_status: ['select[name*="veteran"]', 'select[id*="veteran"]', '[role="combobox"][aria-label*="veteran" i]'],
  protected_veteran: ['select[name*="veteran"]', 'select[id*="veteran"]', '[role="combobox"][aria-label*="protected veteran" i]'],
  disability_status: ['select[name*="disability"]', 'select[id*="disability"]', '[role="combobox"][aria-label*="disability" i]'],
  disability: ['select[name*="disability"]', 'select[id*="disability"]', '[role="combobox"][aria-label*="disability" i]'],
  transgender: ['select[name*="transgender"]', 'select[id*="transgender"]', '[role="combobox"][aria-label*="transgender" i]'],
  sexual_orientation: ['select[name*="orientation"]', 'select[id*="orientation"]', '[role="combobox"][aria-label*="orientation" i]'],
  summary: ['textarea[name*="summary"]', 'textarea[name*="cover"]', 'textarea[name*="why"]'],
  current_company: ['input[name*="company"]', 'input[id*="company"]'],
  current_title: ['input[name*="title"]', 'input[id*="title"]'],
  school: ['input[name*="school"]', 'input[id*="school"]', 'input[name*="university"]', 'input[id*="university"]'],
  degree: ['input[name*="degree"]', 'input[id*="degree"]'],
  skills: ['textarea[name*="skill"]', 'input[name*="skill"]', 'textarea[id*="skill"]', 'input[id*="skill"]']
};

const FIELD_KEYWORDS = {
  name: ['name', 'full name', 'candidate name'],
  full_name: ['full name', 'complete name', 'candidate name'],
  legal_name: ['legal name'],
  first_name: ['first name', 'given name', 'forename'],
  preferred_first_name: ['preferred first name', 'preferred name', 'nickname'],
  last_name: ['last name', 'family name', 'surname'],
  email: ['email', 'email address'],
  phone: ['phone', 'phone number', 'mobile'],
  location: ['location', 'address', 'where are you based'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  country: ['country', 'country of residence'],
  phone_country: ['phone country', 'phone country code', 'country code', 'dial code'],
  phone_country_code: ['country code', 'dial code', 'phone country'],
  country_code: ['country code', 'dial code'],
  linkedin: ['linkedin'],
  linkedin_url: ['linkedin'],
  github: ['github'],
  website: ['website', 'personal site', 'portfolio'],
  portfolio: ['portfolio', 'website', 'personal site'],
  portfolio_url: ['portfolio', 'website', 'personal site'],
  authorization: ['authorization', 'authorized', 'work authorization', 'legally authorized'],
  work_authorization: ['authorization', 'authorized', 'work authorization', 'legally authorized'],
  requires_sponsorship: ['require sponsorship', 'visa sponsorship', 'immigration sponsorship', 'will you require sponsorship', 'do you require sponsorship'],
  requires_visa_sponsorship: ['require sponsorship', 'visa sponsorship', 'immigration sponsorship'],
  immigration_sponsorship: ['immigration sponsorship', 'visa sponsorship', 'require sponsorship'],
  gender: ['gender'],
  sex: ['sex', 'gender'],
  race: ['race'],
  ethnicity: ['ethnicity'],
  hispanic_or_latino: ['hispanic', 'latino'],
  veteran_status: ['veteran', 'protected veteran'],
  protected_veteran: ['protected veteran', 'veteran'],
  disability_status: ['disability'],
  disability: ['disability'],
  transgender: ['transgender'],
  sexual_orientation: ['sexual orientation', 'orientation'],
  summary: ['summary', 'cover letter', 'why are you interested', 'about you', 'tell us about yourself'],
  current_company: ['current company', 'company', 'most recent company', 'employer'],
  current_title: ['current title', 'job title', 'most recent title', 'role title'],
  school: ['school', 'university', 'college'],
  degree: ['degree'],
  skills: ['skills', 'keywords', 'core skills', 'technical skills']
};

const FIELD_VALUE_ALIASES = {
  requires_sponsorship: ['No', 'No, I do not require sponsorship'],
  requires_visa_sponsorship: ['No', 'No, I do not require sponsorship'],
  immigration_sponsorship: ['No', 'No, I do not require sponsorship'],
  gender: ['Male', 'Man'],
  sex: ['Male', 'Man'],
  race: ['White', 'White or European'],
  ethnicity: ['No', 'Not Hispanic or Latino'],
  hispanic_or_latino: ['No', 'Not Hispanic or Latino'],
  veteran_status: ['No', 'I am not a protected veteran', 'No, I am not a veteran or active member'],
  protected_veteran: ['No', 'I am not a protected veteran', 'No, I am not a veteran or active member'],
  disability_status: ['No', 'No, I do not have a disability'],
  disability: ['No', 'No, I do not have a disability'],
  transgender: ['No', 'No, I do not identify as transgender'],
  sexual_orientation: ['Heterosexual', 'Straight'],
  country: ['United States', 'USA', 'United States of America'],
  phone_country: ['United States', 'USA', 'United States (+1)', '+1'],
  phone_country_code: ['United States (+1)', '+1', 'US (+1)'],
  country_code: ['+1', '1']
};

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data?.type) return;

  if (event.data.type === 'AUTOAPPLY_EXTENSION_PING') {
    window.postMessage({ type: 'AUTOAPPLY_EXTENSION_PONG' }, window.location.origin);
  }

  if (event.data.type === 'AUTOAPPLY_EXTENSION_PREPARE') {
    chrome.runtime.sendMessage(
      {
        type: 'AUTOAPPLY_PREPARE_AUTOFILL',
        payload: event.data.payload
      },
      (response) => {
        window.postMessage({ type: 'AUTOAPPLY_EXTENSION_PREPARE_RESULT', payload: response ?? { accepted: false, reason: 'no_response' } }, window.location.origin);
      }
    );
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'AUTOAPPLY_RUN_AUTOFILL') return false;
  runAutofill(message.payload.fields ?? {}).then((steps) => sendResponse({ ok: true, steps }));
  return true;
});

async function runAutofill(fields) {
  const steps = [];
  const usedElements = new Set();

  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const element = findCandidateElement(field, usedElements);
    if (!element) {
      steps.push(`Could not find ${field}`);
      continue;
    }

    const filled = await fillElement(field, element, value);
    if (!filled) {
      steps.push(`Could not fill ${field}`);
      continue;
    }

    usedElements.add(element);
    steps.push(`Filled ${field}`);
  }

  const resumeHint = maybePromptResumeAttach();
  if (resumeHint) steps.push(resumeHint);

  return steps;
}

function findCandidateElement(field, usedElements) {
  const directSelectors = FIELD_SELECTORS[field] ?? [];
  const directMatch = directSelectors.map((selector) => document.querySelector(selector)).find((element) => element && !usedElements.has(element));
  if (directMatch) return directMatch;

  const candidates = Array.from(document.querySelectorAll('input, textarea, select, [role="combobox"], button[aria-haspopup="listbox"]')).filter(
    (element) => !usedElements.has(element) && isFillable(element)
  );
  const keywords = FIELD_KEYWORDS[field] ?? field.split('_');
  let best = null;

  for (const element of candidates) {
    const metadata = getElementMetadata(element);
    const score = keywords.reduce((total, keyword) => total + (metadata.includes(keyword.toLowerCase()) ? 2 : 0), 0);
    if (!best || score > best.score) best = { element, score };
  }

  return best && best.score > 0 ? best.element : null;
}

function getElementMetadata(element) {
  const pieces = [
    element.getAttribute('name'),
    element.getAttribute('id'),
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label'),
    element.getAttribute('autocomplete'),
    element.getAttribute('data-automation-id'),
    element.getAttribute('role'),
    findLabelText(element)
  ].filter(Boolean);

  return pieces.join(' ').toLowerCase();
}

function findLabelText(element) {
  if (element.labels?.length) {
    return Array.from(element.labels)
      .map((label) => label.textContent || '')
      .join(' ');
  }

  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.textContent) return label.textContent;
  }

  return element.closest('label')?.textContent || '';
}

function isFillable(element) {
  if (element instanceof HTMLInputElement) {
    return !['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(element.type);
  }
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
  return element.getAttribute('role') === 'combobox' || element.getAttribute('aria-haspopup') === 'listbox';
}

async function fillElement(field, element, value) {
  element.focus();

  if (element instanceof HTMLSelectElement) {
    const option = findSelectOption(field, element, value);
    if (!option) return false;
    element.value = option.value;
  } else if (element.getAttribute('role') === 'combobox' || element.getAttribute('aria-haspopup') === 'listbox') {
    const selected = await selectComboboxOption(field, element, value);
    if (!selected) return false;
  } else {
    const prototype = Object.getPrototypeOf(element);
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(element, value);
    else element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
  return true;
}

function findSelectOption(field, element, value) {
  const aliases = buildValueCandidates(field, value);
  return Array.from(element.options).find((candidate) => aliases.some((alias) => matchesOption(candidate.text, alias) || matchesOption(candidate.value, alias)));
}

async function selectComboboxOption(field, element, value) {
  element.click();
  await wait(150);

  const aliases = buildValueCandidates(field, value);
  const options = Array.from(document.querySelectorAll('[role="option"], li, button, div')).filter((candidate) => {
    const text = candidate.textContent?.trim();
    return text && aliases.some((alias) => matchesOption(text, alias));
  });

  const option = options[0];
  if (!option) return false;
  option.click();
  return true;
}

function buildValueCandidates(field, value) {
  return Array.from(new Set([value, ...(FIELD_VALUE_ALIASES[field] ?? [])].filter(Boolean)));
}

function matchesOption(optionText, desiredText) {
  const option = normalizeValue(optionText);
  const desired = normalizeValue(desiredText);
  return option === desired || option.includes(desired) || desired.includes(option);
}

function normalizeValue(value) {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
}

function maybePromptResumeAttach() {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) return null;

  const attachControl = Array.from(document.querySelectorAll('button, a, div[role="button"], span'))
    .find((element) => /attach|upload|resume|cv/i.test(element.textContent || ''));

  if (!attachControl) return null;

  attachControl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  attachControl.classList?.add('autoapply-resume-attach-hint');
  return 'Resume upload likely needs one manual click on the Attach/Upload control before the browser can continue.';
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
