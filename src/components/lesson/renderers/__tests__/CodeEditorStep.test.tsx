import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditorStep } from '../CodeEditorStep';
import type { LessonStep } from '@/lib/lessons/types';

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="Editor de código"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('CodeEditorStep renderer', () => {
  const stepWithMultilineOutput: LessonStep = {
    id: 'step-1',
    type: 'code_editor',
    title: 'Escreva seu primeiro programa',
    instruction: 'Escreva duas linhas na ordem: Stacklyst e Meu primeiro programa.',
    expectedOutput: 'Stacklyst\nMeu primeiro programa',
    xp: 20,
    testCases: [
      {
        id: 'output',
        description: 'Saída esperada, linha por linha',
        testCode: 'programa completo',
        expectedOutput: 'Stacklyst\nMeu primeiro programa',
      },
    ],
  };

  it('renders test cases preserving multiline expected output format without inline prefix', () => {
    render(
      <CodeEditorStep
        step={stepWithMultilineOutput}
        code='print("Stacklyst")\nprint("Meu primeiro programa")'
        onChangeCode={vi.fn()}
        language="PYTHON"
        onRunCode={vi.fn()}
      />
    );

    // Test case card description
    expect(screen.getByText('Saída esperada, linha por linha')).toBeInTheDocument();

    // The expected output should contain both lines and preserve pre-wrap
    const expectedDiv = screen.getByText((content, element) => {
      return Boolean(
        element?.tagName.toLowerCase() === 'div' &&
        element.classList.contains('whitespace-pre-wrap') &&
        content.includes('Stacklyst') &&
        content.includes('Meu primeiro programa')
      );
    });

    expect(expectedDiv).toBeInTheDocument();
    expect(expectedDiv).toHaveClass('whitespace-pre-wrap');
    expect(expectedDiv.textContent).toBe('Stacklyst\nMeu primeiro programa');

    // Make sure "Saída: " was not prepended to the text content
    expect(expectedDiv.textContent).not.toContain('Saída:');
  });

  it('renders console run output with whitespace-pre-wrap', () => {
    render(
      <CodeEditorStep
        step={stepWithMultilineOutput}
        code='print("Stacklyst")\nprint("Meu primeiro programa")'
        onChangeCode={vi.fn()}
        language="PYTHON"
        onRunCode={vi.fn()}
        runOutput={'Stacklyst\nMeu primeiro programa'}
      />
    );

    const consoleOutputs = screen.getAllByText((content, element) => {
      return Boolean(
        element?.classList.contains('whitespace-pre-wrap') &&
        content.includes('Stacklyst') &&
        content.includes('Meu primeiro programa')
      );
    });

    // Both the test case output and the console output preserve newlines
    expect(consoleOutputs.length).toBe(2);
  });
});
