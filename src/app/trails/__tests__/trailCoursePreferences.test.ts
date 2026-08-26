import { describe, expect, it } from 'vitest';
import {
  parseTrailCoursePreferences,
  serializeTrailCoursePreferences,
} from '@/app/trails/trailCoursePreferences';

describe('trailCoursePreferences', () => {
  it('round-trips started courses and the active course for the same user', () => {
    const value = serializeTrailCoursePreferences('user-123', ['PYTHON', 'JS'], 'PYTHON');

    expect(parseTrailCoursePreferences(value, 'user-123')).toEqual({
      activeLanguage: 'PYTHON',
      startedLanguages: ['JS', 'PYTHON'],
    });
  });

  it('ignores preferences saved by another user', () => {
    const value = serializeTrailCoursePreferences('user-123', ['JS'], 'JS');

    expect(parseTrailCoursePreferences(value, 'user-456')).toEqual({
      activeLanguage: null,
      startedLanguages: [],
    });
  });

  it('discards unsupported values and an invalid active course', () => {
    expect(parseTrailCoursePreferences('user-123:JS.CPP.python:CPP', 'user-123')).toEqual({
      activeLanguage: null,
      startedLanguages: ['JS'],
    });
  });
});
