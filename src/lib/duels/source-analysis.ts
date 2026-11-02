import { javascriptLanguage, typescriptLanguage } from '@codemirror/lang-javascript';
import { pythonLanguage } from '@codemirror/lang-python';
import type { SyntaxNode } from '@lezer/common';

export function duelSourceTree(source: string, language: string) {
  return (
    language === 'PYTHON'
      ? pythonLanguage.parser
      : language === 'JS'
        ? javascriptLanguage.parser
        : typescriptLanguage.parser
  ).parse(source);
}
/** Exact syntax comparison, not plagiarism detection. Preserve literals, names and
 * Python block structure; discard comments, whitespace and optional semicolons. */
export function analyzeDuelSource(source: string, language = 'TS') {
  const tree = duelSourceTree(source, language),
    tokens: string[] = [];
  let logicalLines = 0,
    invalid = false;
  function visit(node: SyntaxNode) {
    if (node.type.isError) invalid = true;
    if (/Comment$/.test(node.name) || node.name === ';') return;
    // Logical executable lines prevent minification/blank-line gaming.
    if (/Statement$/.test(node.name) && !['BlockStatement', 'EmptyStatement'].includes(node.name))
      logicalLines++;
    if (['VariableDeclaration', 'FunctionDefinition', 'FunctionDeclaration'].includes(node.name))
      logicalLines++;
    tokens.push(node.name);
    if (!node.firstChild) tokens.push(source.slice(node.from, node.to));
    else
      for (let child: SyntaxNode | null = node.firstChild; child; child = child.nextSibling)
        visit(child);
    tokens.push('/');
  }
  visit(tree.topNode);
  return { canonical: invalid || logicalLines === 0 ? null : JSON.stringify(tokens), logicalLines };
}
