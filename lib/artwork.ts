const SIZE_RE = /\d+x\d+bb/;

export function upscale(url: string, size: 600 | 1000 = 600): string {
  if (!url) return "";
  return url.replace(SIZE_RE, `${size}x${size}bb`);
}
