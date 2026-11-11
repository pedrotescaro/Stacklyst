import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import data from './exams.json';
import { gradeEnade, type EnadeExam } from './types';

describe('ADS Enade official archive', () => {
  it('contains all 200 questions across the five official ADS editions, with valid answer keys and assets', () => {
    expect(data.map((e) => e.year)).toEqual([2008, 2011, 2014, 2017, 2021]);
    for (const exam of data) {
      expect(exam.questions).toHaveLength(40);
      expect(new Set(exam.questions.map((q) => q.id)).size).toBe(40);
      expect(exam.questions.filter((q) => q.kind === 'discursive')).toHaveLength(5);
      expect(exam.questions.filter((q) => q.kind === 'objective')).toHaveLength(35);
      const pages = JSON.parse(
        readFileSync(resolve(`public/enade/${exam.year}/pages.json`), 'utf8')
      ) as { image: string }[];
      expect(pages).toHaveLength(exam.pageCount);
      for (const page of pages) expect(existsSync(resolve(`public${page.image}`))).toBe(true);
      for (const q of exam.questions) {
        expect(q.page).toBeGreaterThan(0);
        expect(q.page).toBeLessThanOrEqual(exam.pageCount);
        if (q.kind === 'objective' && !q.annulled) expect(q.answer).toMatch(/^[A-E]$/);
      }
      for (const [name, checksum] of Object.entries(exam.sha256)) {
        const file = readFileSync(resolve(`public/enade/${exam.year}/${name}.pdf`));
        expect(file.subarray(0, 4).toString()).toBe('%PDF');
        expect(createHash('sha256').update(file).digest('hex')).toBe(checksum);
      }
    }
  });
  it('excludes annulled and discursive questions without inflating unanswered scores', () => {
    const exam = data.find((e) => e.year === 2008)! as EnadeExam;
    const answers = Object.fromEntries(
      exam.questions.filter((q) => q.answer).map((q) => [q.id, q.answer!])
    );
    expect(gradeEnade(exam, answers)).toEqual({
      correct: 32,
      total: 32,
      percent: 100,
      unanswered: 0,
    });
    expect(gradeEnade(exam, {})).toEqual({ correct: 0, total: 32, percent: 0, unanswered: 32 });
    const cancelled = data.find((e) => e.year === 2017)! as EnadeExam;
    expect(gradeEnade(cancelled, {}).total).toBe(34);
  });
});
