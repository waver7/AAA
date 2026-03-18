export type ExtensionResumeFile = {
  filename: string;
  mimeType: string;
  dataBase64: string;
};

type AutofillRequest = {
  targetUrl: string;
  fields: Record<string, string>;
  resumeFile?: ExtensionResumeFile | null;
};

type ExtensionReply = {
  accepted: boolean;
  matchedTabs?: number;
  reason?: string;
};

const PING = 'AUTOAPPLY_EXTENSION_PING';
const PONG = 'AUTOAPPLY_EXTENSION_PONG';
const PREPARE = 'AUTOAPPLY_EXTENSION_PREPARE';
const PREPARE_RESULT = 'AUTOAPPLY_EXTENSION_PREPARE_RESULT';

export async function isAutofillExtensionAvailable(timeoutMs = 700) {
  if (typeof window === 'undefined') return false;
  return new Promise<boolean>((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    function onMessage(event: MessageEvent) {
      if (event.source !== window || event.data?.type !== PONG) return;
      cleanup();
      resolve(true);
    }

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    }

    window.addEventListener('message', onMessage);
    window.postMessage({ type: PING }, window.location.origin);
  });
}

export async function requestExtensionAutofill(request: AutofillRequest, timeoutMs = 1500) {
  if (typeof window === 'undefined') return { accepted: false, reason: 'no_window' } satisfies ExtensionReply;

  return new Promise<ExtensionReply>((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({ accepted: false, reason: 'timeout' });
    }, timeoutMs);

    function onMessage(event: MessageEvent) {
      if (event.source !== window || event.data?.type !== PREPARE_RESULT) return;
      cleanup();
      resolve(event.data.payload as ExtensionReply);
    }

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    }

    window.addEventListener('message', onMessage);
    window.postMessage({ type: PREPARE, payload: request }, window.location.origin);
  });
}
