import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { loadLibrary } from './load';
import { searchLibrary } from './catalog';
import { REQUIRED_SECTIONS, WIDGET_NAMES } from './widgets';
import { QUESTION_BY_ID } from '../simulator';
import questionTopics from '../question-topics.json';
import { insightFor, insightIds } from '../insights';

const library = loadLibrary();

describe('ENADE study library content', () => {
  it('loads every category with at least one article', () => {
    for (const category of library.categories)
      expect(
        library.articles.some((a) => a.category === category.slug),
        category.slug
      ).toBe(true);
  });

  it('follows the teaching methodology in every article', () => {
    for (const article of library.articles) {
      const ids = article.toc.filter((t) => t.depth === 2).map((t) => t.id);
      const missing = REQUIRED_SECTIONS.filter((s) => !ids.includes(s));
      expect(missing, article.slug).toEqual([]);
      expect(
        article.blocks.some((b) => b.type === 'quiz'),
        `${article.slug} sem miniquestionário`
      ).toBe(true);
      expect(article.readingMinutes, article.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it('has unique heading anchors inside each article', () => {
    for (const article of library.articles) {
      const ids = article.toc.map((t) => t.id);
      expect(new Set(ids).size, `${article.slug}: ${ids.join(', ')}`).toBe(ids.length);
    }
  });

  it('links only to existing articles, questions and widgets', () => {
    const slugs = new Set(library.articles.map((a) => a.slug));
    for (const article of library.articles) {
      for (const slug of article.related)
        expect(slugs.has(slug), `${article.slug} → ${slug}`).toBe(true);
      if (article.parent) expect(slugs.has(article.parent), article.slug).toBe(true);
      for (const block of article.blocks) {
        if (block.type === 'question')
          expect(QUESTION_BY_ID.has(block.id), `${article.slug} → ${block.id}`).toBe(true);
        if (block.type === 'widget')
          expect(WIDGET_NAMES as readonly string[], article.slug).toContain(block.name);
        const text = 'text' in block ? block.text : '';
        for (const match of text.matchAll(/\]\(lib:([a-z0-9-]+)/g))
          expect(slugs.has(match[1]), `${article.slug} → lib:${match[1]}`).toBe(true);
        for (const match of text.matchAll(/\]\(q:([a-z0-9-]+)/g))
          expect(QUESTION_BY_ID.has(match[1]), `${article.slug} → q:${match[1]}`).toBe(true);
      }
    }
  });

  it('tags every official question with existing subjects', () => {
    const slugs = new Set(library.articles.map((a) => a.slug));
    expect(Object.keys(questionTopics).length).toBe(QUESTION_BY_ID.size);
    for (const [id, topics] of Object.entries(questionTopics as Record<string, string[]>)) {
      expect(topics.length, id).toBeGreaterThan(0);
      for (const topic of topics) expect(slugs.has(topic), `${id} → ${topic}`).toBe(true);
    }
  });

  it('keeps commentaries attached to real questions', () => {
    for (const id of insightIds()) expect(QUESTION_BY_ID.has(id), id).toBe(true);
  });

  it('explains every alternative of each scored official objective question', () => {
    const questions = [...QUESTION_BY_ID.values()].filter(
      (question) => question.kind === 'objective' && !question.annulled && question.answer
    );

    for (const question of questions) {
      const insight = insightFor(question.id);
      expect(insight?.interpretation, question.id).toBeTruthy();
      expect(insight?.steps.length, question.id).toBeGreaterThanOrEqual(2);
      expect(insight?.concepts.length, question.id).toBeGreaterThan(0);
      expect(insight?.traps.length, question.id).toBeGreaterThan(0);
      for (const letter of ['A', 'B', 'C', 'D', 'E'] as const)
        expect(insight?.options[letter]?.trim(), `${question.id} ${letter}`).toBeTruthy();
    }
  });

  it('finds articles by concept, ignoring accents', () => {
    expect(searchLibrary(library, 'elaboracao')[0]?.slug).toMatch(/^rup-/);
  });
});
