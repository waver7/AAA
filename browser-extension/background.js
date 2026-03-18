const pendingJobs = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'AUTOAPPLY_PREPARE_AUTOFILL') return false;

  const job = {
    targetUrl: message.payload.targetUrl,
    fields: message.payload.fields,
    createdAt: Date.now()
  };
  pendingJobs.push(job);
  attemptDispatch(job).then((matchedTabs) => sendResponse({ accepted: true, matchedTabs }));
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  for (const job of [...pendingJobs]) {
    if (urlsMatch(job.targetUrl, tab.url)) {
      chrome.tabs.sendMessage(tabId, { type: 'AUTOAPPLY_RUN_AUTOFILL', payload: { fields: job.fields } }, () => {
        void chrome.runtime.lastError;
      });
      removeJob(job);
    }
  }
});

async function attemptDispatch(job) {
  const tabs = await chrome.tabs.query({});
  let matchedTabs = 0;

  for (const tab of tabs) {
    if (!tab.id || !tab.url || !urlsMatch(job.targetUrl, tab.url)) continue;
    matchedTabs += 1;
    chrome.tabs.sendMessage(tab.id, { type: 'AUTOAPPLY_RUN_AUTOFILL', payload: { fields: job.fields } }, () => {
      void chrome.runtime.lastError;
    });
  }

  if (matchedTabs > 0) removeJob(job);
  return matchedTabs;
}

function removeJob(job) {
  const index = pendingJobs.indexOf(job);
  if (index >= 0) pendingJobs.splice(index, 1);
}

function urlsMatch(expected, actual) {
  return normalizeUrl(expected) === normalizeUrl(actual);
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
