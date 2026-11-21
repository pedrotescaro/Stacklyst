'use client';

import { useRef, useState, type ComponentProps } from 'react';
import { activeMention } from '@/lib/mention-text';
import { MentionDropdown, type MentionTarget } from '@/components/motion/MentionDropdown';

type Props = Omit<ComponentProps<'textarea'>, 'value' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function MentionTextarea({ value, onValueChange, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [target, setTarget] = useState<MentionTarget | null>(null);
  function sync(field: HTMLTextAreaElement) {
    const range =
      field.selectionStart === field.selectionEnd &&
      activeMention(field.value, field.selectionStart);
    setTarget(range ? { ...range, field, rect: () => field.getBoundingClientRect() } : null);
  }
  function pick(username: string) {
    const field = ref.current;
    if (!field || !target) return;
    const rest = field.value.slice(target.to);
    const handle = '@' + username;
    const room =
      field.maxLength < 0
        ? Infinity
        : field.maxLength - (field.value.length - (target.to - target.from));
    if (handle.length > room) {
      setTarget(null);
      return;
    }
    const insert = handle + (!/^\s/.test(rest) && handle.length < room ? ' ' : '');
    const cursor = target.from + insert.length + (rest.startsWith(' ') ? 1 : 0);
    onValueChange(field.value.slice(0, target.from) + insert + rest);
    setTarget(null);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(cursor, cursor);
    });
  }
  return (
    <>
      <textarea
        {...props}
        ref={ref}
        value={value}
        onChange={(e) => {
          onValueChange(e.currentTarget.value);
          sync(e.currentTarget);
        }}
        onSelect={(e) => sync(e.currentTarget)}
        onFocus={(e) => sync(e.currentTarget)}
        onBlur={() => setTarget(null)}
      />
      {target && (
        <MentionDropdown
          key={target.from + ':' + target.query}
          target={target}
          onPick={pick}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
