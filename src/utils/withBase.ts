const baseRoot = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  return `${baseRoot}/${path.replace(/^\//, '')}`;
}

export function withBaseSrcSet(srcset: string): string {
  return srcset
    .split(',')
    .map((entry) => {
      const [url, ...descriptorParts] = entry.trim().split(/\s+/);
      const descriptor = descriptorParts.join(' ');
      const resolved = withBase(url);

      return descriptor ? `${resolved} ${descriptor}` : resolved;
    })
    .join(', ');
}
