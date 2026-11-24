import { ValidationError } from '@/lib/errors';

export async function readEnadeJson(request: Request, maximumLength: number): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json')
    throw new ValidationError('VALIDATION_ERROR', 'Envie os dados do ENADE em JSON.');
  if (Number(request.headers.get('content-length')) > maximumLength * 3)
    throw new ValidationError('VALIDATION_ERROR', 'Dados do ENADE muito grandes.');
  const text = await request.text();
  if (text.length > maximumLength)
    throw new ValidationError('VALIDATION_ERROR', 'Dados do ENADE muito grandes.');
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError('VALIDATION_ERROR', 'Dados do ENADE inválidos.');
  }
}
