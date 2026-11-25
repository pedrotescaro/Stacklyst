'use client';
import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type MenuOption = { value: string; label: string; detail?: ReactNode };
export type MenuGroup = { label: string; options: MenuOption[] };

/**
 * A select that opens as a floating menu, styled like the sidebar's "Mais"
 * menu: rounded card, soft shadow, gray hover and a blue check on the choice.
 */
export function MenuSelect({
  label,
  value,
  onChange,
  options,
  groups,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: MenuOption[];
  groups?: MenuGroup[];
  className?: string;
}) {
  const all = groups ? groups.flatMap((g) => g.options) : (options ?? []);
  const current = all.find((option) => option.value === value);
  const renderOption = (option: MenuOption) => (
    <SelectItem
      key={option.value}
      value={option.value}
      label={option.label}
      className="rounded-xl px-3.5 py-2.5 text-[14px] font-semibold hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 data-[highlighted]:bg-dd-bg/60 data-[selected]:bg-dd-bg/60"
    >
      <span className="min-w-0 flex-1 break-words">{option.label}</span>
      {option.detail !== undefined && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-dd-muted">
          {option.detail}
        </span>
      )}
    </SelectItem>
  );
  return (
    <div className={`grid min-w-0 gap-1 ${className}`}>
      <span className="text-xs text-dd-muted">{label}</span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (typeof next === 'string' && next) onChange(next);
        }}
      >
        <SelectTrigger
          aria-label={label}
          className="min-h-10 rounded-full border-dd-border bg-dd-bg px-4 text-[13px] hover:border-dd-border hover:bg-dd-surface focus-visible:ring-0"
        >
          <SelectValue>
            <span className="min-w-0 truncate">{current?.label ?? ''}</span>
          </SelectValue>
        </SelectTrigger>
        {/* Flat surface, no glow; the scrollbar is hidden so it never pokes out of
            the rounded corners (the menu still scrolls, with arrows at the ends). */}
        <SelectContent className="w-auto min-w-[max(var(--anchor-width),11rem)] max-w-[min(32rem,calc(100vw-2rem))] border-dd-border bg-dd-surface shadow-none dark:shadow-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_[data-slot^=select-scroll]]:bg-dd-surface">
          {groups
            ? groups.map((group) => (
                <SelectGroup key={group.label} className="p-0">
                  <SelectLabel className="px-3.5 pb-1 pt-2.5">{group.label}</SelectLabel>
                  {group.options.map(renderOption)}
                </SelectGroup>
              ))
            : all.map(renderOption)}
        </SelectContent>
      </Select>
    </div>
  );
}
