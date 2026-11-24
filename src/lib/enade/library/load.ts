import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { buildLibrary, type Library, type LibraryCategory } from './catalog';

export const LIBRARY_ROOT = path.join(process.cwd(), 'content', 'enade');

let cached: Library | null = null;

/**
 * Reads the versioned library from `content/enade`. Production keeps the parsed
 * result in memory; development re-reads so edits show up on refresh.
 */
export function loadLibrary(): Library {
  if (cached && process.env.NODE_ENV === 'production') return cached;
  const categories = JSON.parse(
    readFileSync(path.join(LIBRARY_ROOT, 'categories.json'), 'utf8')
  ) as LibraryCategory[];
  const sources = categories.flatMap((category) => {
    const folder = path.join(process.cwd(), 'content', 'enade', category.slug);
    const files = readdirSync(folder).filter((file) => file.endsWith('.md'));
    return files.map((file) => ({
      category: category.slug,
      file,
      raw: readFileSync(path.join(folder, file), 'utf8'),
    }));
  });
  const library = buildLibrary(categories, sources);
  if (process.env.NODE_ENV === 'production') cached = library;
  return library;
}
