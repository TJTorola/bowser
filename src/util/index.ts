const protocolRegex = /^[a-z][a-z0-9-+.]+:\/\//;
const ipv6Regex =
  /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

const dataUris = [
  'blob',
  'data',
  'javascript',
  'magnet',
  'mailto',
  'view-source',
  'viewsource',
  'sourceviewer',
  'readerview',
  'markdownviewer',
  'ws',
];

const hasProtocol = (location: string) =>
  protocolRegex.test(location) ||
  dataUris.some((d) => location.startsWith(`${d}:`));

const isUrl = (location: string) => {
  if (hasProtocol(location)) {
    try {
      const url = new URL(location);
      return !url.host.includes('%20') && !url.username.includes('%20');
    } catch {
      return false;
    }
  }
  let url = null;
  try {
    url = new URL(`https://${location}`);
    if (url.host.includes('%20') || url.username.includes('%20')) {
      return false;
    }
  } catch {
    return false;
  }
  if (url.hostname.startsWith('[') && url.hostname.endsWith(']')) {
    return ipv6Regex.test(url.hostname.replace(/^\[/, '').replace(/\]$/, ''));
  }
  const names = url.hostname.split('.');
  const invalid =
    names.find(
      (n) =>
        n.includes('---') ||
        encodeURI(n) !== n ||
        n.startsWith('-') ||
        n.endsWith('-'),
    ) || url.host.includes('..');
  if (invalid || (url.port && Number(url.port) <= 10)) {
    return false;
  }
  if (names.length < 2) {
    return url.hostname === 'localhost';
  }
  return true;
};

export const locationToUrl = (location: string) => {
  let url = isUrl(location)
    ? location
    : // If it is not a URL assume it should be a search
      `https://kagi.com/search?q=${encodeURIComponent(location)}`;

  if (!hasProtocol(url)) {
    url = `https://${url}`;
  }

  try {
    return new URL(url).href;
  } catch {
    // Can't be re-encoded
  }

  return encodeURI(url);
};
