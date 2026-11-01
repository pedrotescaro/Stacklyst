import { NextResponse } from 'next/server';
import { getPublicCredential } from '@/lib/credentials/repository';
import { verifyCredentialIntegrity } from '@/lib/credentials/integrity';
import { renderCredentialPdf } from '@/lib/credentials/pdf';
import { credentialVerificationUrl } from '@/lib/credentials/urls';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getPublicCredential(id);
  if (!record)
    return NextResponse.json({ message: 'Certificado não encontrado.' }, { status: 404 });
  if (record.status !== 'valid' || !verifyCredentialIntegrity(record)) {
    return NextResponse.json(
      { message: 'Este certificado não está válido para download.' },
      { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const pdf = await renderCredentialPdf(record, credentialVerificationUrl(record.id));
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="stacklyst-${record.id}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
