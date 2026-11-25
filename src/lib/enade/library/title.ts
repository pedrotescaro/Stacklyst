/**
 * Library titles follow "Subject — what it covers". Navigation and headings show the
 * subject on its own and the list of contents as a quieter second line.
 */
export function splitTitle(title: string): { main: string; detail: string | null } {
  const at = title.indexOf(' — ');
  // A bare acronym ("RUP", "SQL") says too little on its own, so those keep the full title.
  if (at < 6) return { main: title, detail: null };
  return { main: title.slice(0, at).trim(), detail: title.slice(at + 3).trim() || null };
}
