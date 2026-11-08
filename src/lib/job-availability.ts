/** One availability rule shared by public listings, detail controls and application writes. */
export function isJobAcceptingApplications(
  job: { status?: string; expires_at?: Date | string | null },
  now = Date.now()
) {
  if (job.status && job.status !== 'OPEN') return false;
  if (!job.expires_at) return true;
  const expires = new Date(job.expires_at).getTime();
  return Number.isFinite(expires) && expires > now;
}
