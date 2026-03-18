const FIELD_SELECTORS = {
  name: ['input[name*="name"]', 'input[id*="name"]'],
  full_name: ['input[name*="full_name"]', 'input[id*="full_name"]', 'input[name*="name"]'],
  legal_name: ['input[name*="legal"]', 'input[id*="legal"]'],
  first_name: ['input[name*="first"]', 'input[id*="first"]', 'input[autocomplete="given-name"]'],
  last_name: ['input[name*="last"]', 'input[id*="last"]', 'input[autocomplete="family-name"]'],
  email: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
  phone: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
  location: ['input[name*="location"]', 'input[id*="location"]'],
  city: ['input[name*="city"]', 'input[id*="city"]'],
  state: ['input[name*="state"]', 'input[id*="state"]', 'input[name*="region"]', 'input[id*="region"]'],
  country: ['input[name*="country"]', 'input[id*="country"]'],
  linkedin: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  linkedin_url: ['input[name*="linkedin"]', 'input[id*="linkedin"]'],
  github: ['input[name*="github"]', 'input[id*="github"]'],
  website: ['input[name*="website"]', 'input[id*="website"]', 'input[name*="portfolio"]', 'input[id*="portfolio"]'],
  portfolio: ['input[name*="portfolio"]', 'input[id*="portfolio"]', 'input[name*="website"]', 'input[id*="website"]'],
  portfolio_url: ['input[name*="portfolio"]', 'input[id*="portfolio"]', 'input[name*="website"]', 'input[id*="website"]'],
  authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]', 'input[id*="authorization"]'],
  work_authorization: ['input[name*="authorization"]', 'textarea[name*="authorization"]', 'input[id*="authorization"]'],
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
  last_name: ['last name', 'family name', 'surname'],
  email: ['email', 'email address'],
  phone: ['phone', 'phone number', 'mobile'],
  location: ['location', 'address', 'where are you based'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  country: ['country'],
  linkedin: ['linkedin'],
  linkedin_url: ['linkedin'],
  github: ['github'],
  website: ['website', 'personal site', 'portfolio'],
  portfolio: ['portfolio', 'website', 'personal site'],
  portfolio_url: ['portfolio', 'website', 'personal site'],
  authorization: ['authorization', 'authorized', 'work authorization', 'legally authorized'],
  work_authorization: ['authorization', 'authorized', 'work authorization', 'legally authorized'],
  summary: ['summary', 'cover letter', 'why are you interested', 'about you', 'tell us about yourself'],
  current_company: ['current company', 'company', 'most recent company', 'employer'],
  current_title: ['current title', 'job title', 'most recent title', 'role title'],
  school: ['school', 'university', 'college'],
  degree: ['degree'],
  skills: ['skills', 'keywords', 'core skills', 'technical skills']
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
  const steps = runAutofill(message.payload.fields ?? {});
  sendResponse({ ok: true, steps });
  return false;
});

function runAutofill(fields) {
  const steps = [];
  const usedElements = new Set();

  Object.entries(fields).forEach(([field, value]) => {
    if (typeof value !== 'string' || !value.trim()) return;
    const element = findCandidateElement(field, usedElements);
    if (!element) {
      steps.push(`Could not find ${field}`);
      return;
    }

    fillElement(element, value);
    usedElements.add(element);
    steps.push(`Filled ${field}`);
  });

  return steps;
}

function findCandidateElement(field, usedElements) {
  const directSelectors = FIELD_SELECTORS[field] ?? [];
  const directMatch = directSelectors.map((selector) => document.querySelector(selector)).find((element) => element && !usedElements.has(element));
  if (directMatch) return directMatch;

  const candidates = Array.from(document.querySelectorAll('input, textarea, select')).filter((element) => !usedElements.has(element) && isFillable(element));
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
  return true;
}

function fillElement(element, value) {
  element.focus();

  if (element instanceof HTMLSelectElement) {
    const option = Array.from(element.options).find((candidate) => candidate.text.toLowerCase() === value.toLowerCase() || candidate.value.toLowerCase() === value.toLowerCase());
    if (option) element.value = option.value;
  } else {
    const prototype = Object.getPrototypeOf(element);
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(element, value);
    else element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
}
