// @vitest-environment node
import { PDFDict, PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { renderCredentialPdf } from './pdf';
import type { CredentialRecord } from './types';

const record: CredentialRecord = {
  id: '35ca5499-276b-4a56-8c20-9bc4d4de382f',
  recipientName: 'João Luís Gonçalves de Almeida',
  recipientUsername: 'joao_exemplo',
  issuedAt: '2026-11-01T18:00:00.000Z',
  verifiedAt: '2026-11-01T18:00:00.000Z',
  integrityHash: '8b68b452c383bdbbb4e152bb329357ac462a7a67deb4d5735b91284dcb06cdc5',
  status: 'valid',
  definition: {
    id: 'course-js',
    version: 1,
    kind: 'course',
    language: 'JS',
    title: 'Programação: funções, coleções e resolução de problemas',
    description: 'Registro sintético para teste de renderização.',
    estimatedMinutes: 146,
    skills: ['Funções', 'Coleções', 'Resolução de problemas'],
    requirements: [],
  },
};

describe('Credential PDF', () => {
  it('embeds the credential identity in one landscape page and makes both verification links usable', async () => {
    const url = `https://stacklyst.vercel.app/credentials/verify/${record.id}`;
    const bytes = await renderCredentialPdf(record, url);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    const page = pdf.getPage(0);
    expect(page.getWidth()).toBeCloseTo(841.89);
    expect(page.getHeight()).toBeCloseTo(595.28);
    expect(pdf.getTitle()).toBe(`Certificado de conclusão - ${record.definition.title}`);
    expect(pdf.getSubject()).toBe(`Credencial ${record.id}`);
    expect(pdf.getAuthor()).toBe('Stacklyst');
    expect(pdf.getCreationDate()).toEqual(new Date(record.issuedAt));
    const annotations = page.node.Annots()!;
    expect(annotations.size()).toBe(2);
    for (let index = 0; index < annotations.size(); index++) {
      const annotation = annotations.lookup(index, PDFDict);
      expect(annotation.lookup(PDFName.of('Subtype'), PDFName).asString()).toBe('/Link');
      const action = annotation.lookup(PDFName.of('A'), PDFDict);
      expect(action.lookup(PDFName.of('URI'), PDFString).decodeText()).toBe(url);
    }
  });

  it('rejects revoked records and non-web verification targets', async () => {
    await expect(
      renderCredentialPdf(
        { ...record, status: 'revoked' },
        'https://stacklyst.vercel.app/verify/test'
      )
    ).rejects.toThrow('não está válida');
    await expect(renderCredentialPdf(record, 'javascript:alert(1)')).rejects.toThrow(
      'URL de verificação inválida'
    );
  });
});
