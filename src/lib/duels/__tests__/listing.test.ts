import { describe, expect, it } from 'vitest';
import {
  getDuelListingExpiryAt,
  getDuelListingWhere,
  isDuelVisibleInListing,
  RECENTLY_FINISHED_DUEL_WINDOW_MS,
} from '../listing';

describe('duel listing visibility', () => {
  const now = new Date('2026-09-01T15:00:00.000Z');

  it('keeps open duels visible and only retains a closed duel for two minutes', () => {
    expect(isDuelVisibleInListing({ status: 'PENDING', finished_at: null }, now.getTime())).toBe(
      true
    );
    expect(isDuelVisibleInListing({ status: 'ACTIVE', finished_at: null }, now.getTime())).toBe(
      true
    );
    expect(
      isDuelVisibleInListing({ status: 'REVIEW_PENDING', finished_at: null }, now.getTime())
    ).toBe(true);
    expect(
      isDuelVisibleInListing(
        { status: 'CLOSED', finished_at: new Date(now.getTime() - 119_999) },
        now.getTime()
      )
    ).toBe(true);
    expect(
      isDuelVisibleInListing(
        {
          status: 'CLOSED',
          finished_at: new Date(now.getTime() - RECENTLY_FINISHED_DUEL_WINDOW_MS),
        },
        now.getTime()
      )
    ).toBe(false);
    expect(isDuelVisibleInListing({ status: 'EXPIRED', finished_at: now }, now.getTime())).toBe(
      false
    );
  });

  it('builds the database filter with the same two-minute cutoff', () => {
    expect(getDuelListingWhere(now)).toEqual({
      OR: [
        { status: { in: ['PENDING', 'ACTIVE', 'REVIEW_PENDING'] } },
        {
          status: 'CLOSED',
          finished_at: {
            gt: new Date(now.getTime() - RECENTLY_FINISHED_DUEL_WINDOW_MS),
          },
        },
      ],
    });
  });

  it('returns the exact refresh time for a recently finished duel', () => {
    const finishedAt = new Date(now.getTime() - 5_000);
    expect(getDuelListingExpiryAt({ status: 'CLOSED', finished_at: finishedAt })).toBe(
      finishedAt.getTime() + RECENTLY_FINISHED_DUEL_WINDOW_MS
    );
    expect(getDuelListingExpiryAt({ status: 'ACTIVE', finished_at: null })).toBeNull();
  });
});
