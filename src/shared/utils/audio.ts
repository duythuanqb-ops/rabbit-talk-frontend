export function getAudioUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('translate.google.com') || url.includes('translate.googleapis.com')) {
    if (url.includes('/proxy-audio')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    return `${apiUrl}/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  return url;
}
