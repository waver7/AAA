const pendingJobs = [];
const JOB_TTL_MS = 10 * 60 * 1000;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'AUTOAPPLY_PREPARE_AUTOFILL') return false;

  cleanupExpiredJobs();
  const job = {
    targetUrl: message.payload.targetUrl,
    fields: message.payload.fields,
    resumeFile: message.payload.resumeFile ?? null,
    createdAt: Date.now()
  };
  pendingJobs.push(job);
  attemptDispatch(job).then((matchedTabs) => sendResponse({ accepted: true, matchedTabs }));
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  cleanupExpiredJobs();

  for (const job of [...pendingJobs]) {
    if (!jobMatchesUrl(job, tab.url)) continue;
    dispatchToTab(tabId, job);
  }
});

async function attemptDispatch(job) {
  const tabs = await chrome.tabs.query({});
  let matchedTabs = 0;

  for (const tab of tabs) {
    if (!tab.id || !tab.url || !jobMatchesUrl(job, tab.url)) continue;
    matchedTabs += 1;
    dispatchToTab(tab.id, job);
  }

  return matchedTabs;
}

function dispatchToTab(tabId, job) {
  chrome.tabs.sendMessage(tabId, { type: 'AUTOAPPLY_RUN_AUTOFILL', payload: { fields: job.fields, resumeFile: job.resumeFile } }, (response) => {
    if (chrome.runtime.lastError) return;
    if (response?.completed) removeJob(job);
  });
}

function removeJob(job) {
  const index = pendingJobs.indexOf(job);
  if (index >= 0) pendingJobs.splice(index, 1);
}

function cleanupExpiredJobs() {
  const now = Date.now();
  for (const job of [...pendingJobs]) {
    if (now - job.createdAt > JOB_TTL_MS) removeJob(job);
  }
}

function jobMatchesUrl(job, actualUrl) {
  return urlsMatch(job.targetUrl, actualUrl) || tokensMatch(job.targetUrl, actualUrl);
}

function urlsMatch(expected, actual) {
  return normalizeUrl(expected) === normalizeUrl(actual);
}

function tokensMatch(expected, actual) {
  const expectedTokens = extractCandidateTokens(expected);
  const actualTokens = extractCandidateTokens(actual);
  return expectedTokens.some((token) => actualTokens.includes(token));
}

function extractCandidateTokens(value) {
  try {
    const url = new URL(value);
    return [url.searchParams.get('gh_jid'), url.searchParams.get('token')].filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch {
    return value;
  }
}
