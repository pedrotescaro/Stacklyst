'use client';

import React from 'react';

interface DuolingoTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
}

function renderLineTokens(lineText: string, highlightWords: string[]) {
  const tokens = lineText.split(/(\`[^\`]+\`|\*\*[^\*]+\*\*|__+|[\s]+)/g);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      {tokens.map((token, index) => {
        if (!token) return null;

        // Se for espaço em branco
        if (/^\s+$/.test(token)) {
          return ' ';
        }

        // Se for lacuna de preenchimento (ex: ___ ou ____)
        if (/^__+$/.test(token)) {
          return (
            <span
              key={index}
              className="inline-block min-w-[48px] border-b-2 border-dotted border-blue-400 text-blue-400 font-mono text-center px-1 pb-0.5"
            >
              {token}
            </span>
          );
        }

        // Se for código inline `algo`
        if (token.startsWith('`') && token.endsWith('`')) {
          const raw = token.slice(1, -1);
          return (
            <span
              key={index}
              className="inline-block font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-lg border border-blue-500/20"
            >
              {raw}
            </span>
          );
        }

        // Se for negrito **algo**
        if (token.startsWith('**') && token.endsWith('**')) {
          const raw = token.slice(2, -2);
          return (
            <span key={index} className="inline-block font-extrabold text-dd-text dark:text-white">
              {raw}
            </span>
          );
        }

        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === token.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
        );

        if (isHighlighted) {
          return (
            <span
              key={index}
              className="inline-block font-bold text-blue-400 border-b-2 border-dotted border-blue-400 pb-0.5"
            >
              {token}
            </span>
          );
        }

        return (
          <span key={index} className="inline-block text-dd-text dark:text-neutral-100">
            {token}
          </span>
        );
      })}
    </span>
  );
}

export function DuolingoText({ text, className = '', highlightWords = [] }: DuolingoTextProps) {
  if (!text) return null;

  // Separa o texto por quebras de linha preservando parágrafos
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    const singleLine = lines[0] || text;
    // Se começar com header ###, remove o prefixo
    const cleanLine = singleLine.replace(/^#{1,4}\s+/, '');
    return (
      <span className={`text-base md:text-lg font-bold leading-relaxed ${className}`}>
        {renderLineTokens(cleanLine, highlightWords)}
      </span>
    );
  }

  return (
    <div className={`space-y-3 text-base md:text-lg font-bold leading-relaxed ${className}`}>
      {lines.map((line, lineIndex) => {
        // Se for título markdown (### Título)
        if (/^#{1,4}\s+/.test(line)) {
          const headingText = line.replace(/^#{1,4}\s+/, '');
          return (
            <div
              key={lineIndex}
              className="text-lg md:text-xl font-black text-dd-text dark:text-white tracking-tight pb-1 border-b border-dd-border/60"
            >
              {renderLineTokens(headingText, highlightWords)}
            </div>
          );
        }

        // Se for item de lista (- Item ou * Item ou • Item)
        if (/^[-*•]\s+/.test(line)) {
          const bulletText = line.replace(/^[-*•]\s+/, '');
          return (
            <div
              key={lineIndex}
              className="flex items-start gap-2.5 text-sm md:text-base font-semibold leading-relaxed text-dd-text dark:text-neutral-200"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <div className="flex-1 min-w-0">{renderLineTokens(bulletText, highlightWords)}</div>
            </div>
          );
        }

        // Parágrafo padrão
        return (
          <div
            key={lineIndex}
            className="text-sm md:text-base font-semibold leading-relaxed text-dd-text dark:text-neutral-200"
          >
            {renderLineTokens(line, highlightWords)}
          </div>
        );
      })}
    </div>
  );
}
