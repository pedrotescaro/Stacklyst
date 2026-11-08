import { expect, it } from 'vitest';
import { isJobAcceptingApplications } from '../job-availability';
it('applies the same strict deadline to Date and serialized detail props', () => {
  const now = Date.parse('2026-11-08T12:00:00Z');
  expect(isJobAcceptingApplications({ status: 'OPEN' }, now)).toBe(true);
  expect(isJobAcceptingApplications({ status: 'CLOSED' }, now)).toBe(false);
  expect(isJobAcceptingApplications({ status: 'OPEN', expires_at: new Date(now) }, now)).toBe(
    false
  );
  expect(
    isJobAcceptingApplications({ status: 'OPEN', expires_at: new Date(now - 1).toISOString() }, now)
  ).toBe(false);
  expect(
    isJobAcceptingApplications({ status: 'OPEN', expires_at: new Date(now + 1).toISOString() }, now)
  ).toBe(true);
});
