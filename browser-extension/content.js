const FIELD_SELECTORS = {
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

  Object.entries(fields).forEach(([field, value]) => {
    const selectors = FIELD_SELECTORS[field] ?? [`input[name*="${field}"]`, `input[id*="${field}"]`, `textarea[name*="${field}"]`];
    const element = selectors.map((selector) => document.querySelector(selector)).find(Boolean);
    if (!element || typeof value !== 'string' || !value.trim()) {
      steps.push(`Could not find ${field}`);
      return;
    }

    fillElement(element, value);
    steps.push(`Filled ${field}`);
  });

  return steps;
}

function fillElement(element, value) {
  element.focus();
  const nativeSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value')?.set;
  if (nativeSetter) nativeSetter.call(element, value);
  else element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
