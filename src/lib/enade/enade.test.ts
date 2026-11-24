import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, it, expect } from 'vitest';
import data from './exams.json';
import { gradeEnade, type EnadeExam, type EnadeQuestionContent } from './types';

function archivedQuestion(year: number, number: number) {
  const items = JSON.parse(
    readFileSync(resolve(`public/enade/${year}/questions.json`), 'utf8')
  ) as EnadeQuestionContent[];
  return items.find((item) => item.id === `${year}-objective-${number}`)!;
}

describe('ADS Enade official archive', () => {
  it('supplies complete lettered alternatives and source images for all 200 questions', () => {
    let optionCount = 0;
    for (const exam of data) {
      const contents = JSON.parse(
        readFileSync(resolve(`public/enade/${exam.year}/questions.json`), 'utf8')
      ) as EnadeQuestionContent[];
      expect(contents).toHaveLength(40);
      expect(new Set(contents.map((q) => q.id))).toEqual(new Set(exam.questions.map((q) => q.id)));
      for (const item of contents) {
        const question = exam.questions.find((q) => q.id === item.id)!;
        expect(item.images.length).toBeGreaterThan(0);
        expect(item.statement.length).toBeGreaterThan(5);
        expect(item.transcript.length).toBeGreaterThan(20);
        expect(item.formattedStatement?.length).toBeGreaterThan(0);
        for (const block of item.formattedStatement!) {
          const texts =
            block.kind === 'list'
              ? block.items.map(({ text }) => text)
              : block.kind === 'table'
                ? [...block.headers, ...block.rows.flat()]
                : [block.text];
          expect(texts.length).toBeGreaterThan(0);
          for (const text of texts) {
            expect(text.trim()).not.toBe('');
            expect(text).not.toMatch(/[\x00-\x08\x0b-\x1f]/);
          }
        }
        const images = [...item.images, ...item.options.flatMap((o) => (o.image ? [o.image] : []))];
        for (const image of images) {
          expect(image.src).toMatch(new RegExp(`^/enade/${exam.year}/questions/`));
          expect(existsSync(resolve(`public${image.src}`))).toBe(true);
          expect(image.page).toBeGreaterThanOrEqual(question.page);
          expect(image.page).toBeLessThanOrEqual(exam.pageCount);
        }
        expect(item.options.map((o) => o.letter).join('')).toBe(
          question.kind === 'objective' ? 'ABCDE' : ''
        );
        for (const option of item.options) {
          expect(Boolean(option.text || option.image)).toBe(true);
          expect(option.text).not.toMatch(/[ƟƩơİŌŅ\x00-\x08\x0b-\x1f]/);
          expect(option.text).not.toMatch(/(?:área|ea) livre/i);
        }
        optionCount += item.options.length;
      }
    }
    expect(optionCount).toBe(875);
  });

  it('rejoins PDF line wraps while preserving verse, references, and code', () => {
    expect(archivedQuestion(2014, 33).formattedStatement?.[0]).toMatchObject({
      kind: 'paragraph',
      text: expect.stringMatching(/^Às vezes, garantia de qualidade significa simplesmente/),
    });
    expect(archivedQuestion(2011, 1).formattedStatement?.map(({ kind }) => kind)).toEqual([
      'heading',
      'lines',
      'source',
      'paragraph',
    ]);
    expect(archivedQuestion(2014, 29).formattedStatement).toContainEqual({
      kind: 'code',
      text: expect.stringMatching(
        /\n24 {2,}return this\.getSalario\(\) \+ adicional - desconto;\n/
      ),
    });
    const table = archivedQuestion(2017, 9).formattedStatement?.find(
      (block) => block.kind === 'table'
    );
    expect(table?.headers).toEqual(['NOTA', 'QUANTIDADE DE CLIENTES']);
    expect(table?.rows).toHaveLength(11);
    expect(table?.rows[3]).toEqual(['3', '1']);
    const assertions = archivedQuestion(2017, 30).formattedStatement?.find(
      (block) => block.kind === 'list'
    );
    expect(assertions?.items[0].text).toContain('\nImprimindo na Laser\nImprimindo na Matricial\n');
  });

  it('includes the full Lorenz graph and all five original artwork alternatives', async () => {
    const graph = archivedQuestion(2008, 7);
    expect(graph.images.map((image) => image.page)).toEqual([5, 5]);
    const { width, height } = await sharp(resolve(`public${graph.images[0].src}`)).metadata();
    expect(height / width).toBeGreaterThan(0.85);

    const artwork = archivedQuestion(2008, 8);
    expect(artwork.transcript).toContain('O filósofo alemão Friedrich Nietzsche');
    for (const option of artwork.options) {
      expect(option.text).toBeTruthy();
      expect(option.image).toEqual({
        src: `/enade/2008/questions/${artwork.id}-${option.letter}.webp`,
        page: 6,
      });
      const painting = await sharp(resolve(`public${option.image!.src}`)).metadata();
      expect(painting.height).toBeGreaterThan(painting.width);
    }
  });

  it('includes both columns of the 2014 UML question and its five diagrams', () => {
    const question = archivedQuestion(2014, 29);
    expect(question.images.map((image) => image.page)).toEqual([23, 23]);
    expect(question.transcript).toContain('return this.getSalario() + adicional - desconto;');
    expect(question.statement).toMatch(/^Utilizando a engenharia reversa/);
    for (const option of question.options) {
      expect(option.image).toMatchObject({
        src: `/enade/2014/questions/${question.id}-${option.letter}.webp`,
        page: 23,
      });
    }
  });

  it('provides a readable reconstruction for 2008/24 and enlarged sources for technical diagrams', async () => {
    const [restored] = archivedQuestion(2008, 24).images;
    expect(restored.src).toMatch(/2008-objective-24-readable\.svg$/);
    expect(restored.page).toBe(14);
    expect(restored.alt).toContain('Urna eletrônica');
    const vector = readFileSync(resolve('public' + restored.src), 'utf8');
    expect(vector).toContain('Solicita número do candidato');
    expect(vector).toContain('Emite sinal sonoro');
    expect(vector).not.toContain('<image');

    const examples = [
      archivedQuestion(2014, 29),
      archivedQuestion(2017, 20),
      archivedQuestion(2021, 15),
    ];
    const sources = [
      examples[0].images[0],
      ...examples.flatMap((question) => question.options.map((option) => option.image!)),
    ];
    expect(sources).toHaveLength(16);
    for (const { src, detailSrc } of sources) {
      expect(detailSrc).toBe(src.replace('.webp', '-detail.webp'));
      const [preview, detail] = await Promise.all([
        sharp(resolve('public' + src)).metadata(),
        sharp(resolve('public' + detailSrc)).metadata(),
      ]);
      expect(detail.width).toBeGreaterThan(preview.width * 1.95);
      expect(detail.height).toBeGreaterThan(preview.height * 1.9);
    }
  });

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
