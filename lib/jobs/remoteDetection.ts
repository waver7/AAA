export type RemoteStatus = 'remote' | 'hybrid' | 'onsite' | 'unknown';

export function inferRemoteStatus(input: {
  location?: string | null;
  description?: string | null;
  workplaceType?: string | null;
  title?: string | null;
}) {
  const fields = [input.workplaceType, input.location, input.title, input.description]
    .filter(Boolean)
    .join(' · ')
    .toLowerCase();

  const hasHybrid = /\bhybrid\b/.test(fields);
  const hasOnsite = /\b(on[ -]?site|in[ -]?office|office-based|office based|relocation required)\b/.test(fields);
  const hasRemote = /\b(remote|remotely|distributed|work from home|wfh|telecommut|home[- ]based|anywhere)\b/.test(fields);
  const remoteLocation = /\b(us remote|remote us|united states remote|remote - united states|remote within|remote across|remote anywhere|remote - usa)\b/.test(fields);

  if (hasHybrid) return { isRemote: false, status: 'hybrid' as const, label: 'Hybrid' };
  if (hasOnsite) return { isRemote: false, status: 'onsite' as const, label: 'On-site' };
  if (hasRemote || remoteLocation) return { isRemote: true, status: 'remote' as const, label: 'Remote' };

  return { isRemote: false, status: 'unknown' as const, label: 'Unknown' };
}
