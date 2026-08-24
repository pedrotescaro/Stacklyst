import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrailCourseSelector } from '@/app/trails/TrailCourseSelector';

const startedCourses = [
  { language: 'JS' as const, xp: 380, started: true },
  { language: 'PYTHON' as const, xp: 120, started: true },
];

describe('TrailCourseSelector', () => {
  it('shows only the compact language logo and XP value without an outer icon container', () => {
    render(
      <TrailCourseSelector
        activeLanguage="JS"
        courses={[startedCourses[0]]}
        onSelectCourse={vi.fn()}
        variant="compact"
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Trocar curso. JavaScript, 380 XP',
    });
    expect(trigger).toHaveTextContent('380');
    expect(trigger.querySelector('img')?.parentElement).not.toHaveClass(
      'rounded-md',
      'rounded-full',
      'bg-dd-surface'
    );
  });

  it('keeps unstarted courses hidden until the add-course view is opened', async () => {
    const user = userEvent.setup();
    const onSelectCourse = vi.fn();

    render(
      <TrailCourseSelector
        activeLanguage="JS"
        courses={[startedCourses[0]]}
        onSelectCourse={onSelectCourse}
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Trocar curso. JavaScript, 380 XP',
    });
    const triggerLogo = screen.getByTestId('active-language-logo');
    expect(triggerLogo.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringMatching(/javascript-original|f0db4f/i)
    );
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();

    await user.click(trigger);

    expect(await screen.findByRole('menu', { name: 'Meus cursos' })).toBeInTheDocument();
    const javaScriptRow = screen.getByRole('menuitemradio', { name: /javascript/i });
    expect(javaScriptRow).toBeInTheDocument();
    expect(javaScriptRow.querySelector('img')?.parentElement).not.toHaveClass(
      'rounded-xl',
      'border',
      'bg-dd-surface'
    );
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: /adicionar curso/i }));

    expect(await screen.findByRole('menu', { name: 'Adicionar curso' })).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: /typescript/i }));

    expect(onSelectCourse).toHaveBeenCalledTimes(1);
    expect(onSelectCourse).toHaveBeenCalledWith('TS');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('lists only started courses and selects one from Meus cursos', async () => {
    const user = userEvent.setup();
    const onSelectCourse = vi.fn();

    render(
      <TrailCourseSelector
        activeLanguage="JS"
        courses={startedCourses}
        onSelectCourse={onSelectCourse}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Trocar curso. JavaScript, 380 XP' }));

    expect(await screen.findByRole('menu', { name: 'Meus cursos' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /javascript/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await user.click(screen.getByRole('menuitemradio', { name: /python/i }));

    expect(onSelectCourse).toHaveBeenCalledTimes(1);
    expect(onSelectCourse).toHaveBeenCalledWith('PYTHON');
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();

    render(
      <TrailCourseSelector
        activeLanguage="JS"
        courses={[startedCourses[0]]}
        onSelectCourse={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Trocar curso. JavaScript, 380 XP',
    });
    await user.click(trigger);
    expect(await screen.findByRole('menu', { name: 'Meus cursos' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('can be read-only when embedded in another profile', async () => {
    const user = userEvent.setup();

    render(
      <TrailCourseSelector
        activeLanguage="JS"
        courses={startedCourses}
        onSelectCourse={vi.fn()}
        allowAddingCourses={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Trocar curso. JavaScript, 380 XP' }));

    expect(await screen.findByRole('menu', { name: 'Meus cursos' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /adicionar curso/i })).not.toBeInTheDocument();
  });
});
