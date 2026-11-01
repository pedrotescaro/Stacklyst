/** Use a trusted configured origin; certificate links must not trust a request Host header. */
export function credentialVerificationUrl(id: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  let origin = 'https://stacklyst.vercel.app';
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' && !url.username && !url.password) origin = url.origin;
    } catch {
      /* The public production origin remains usable with invalid optional configuration. */
    }
  }
  return `${origin}/certificates/${encodeURIComponent(id)}`;
}
