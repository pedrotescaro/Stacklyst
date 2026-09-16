'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react';

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        'flex min-w-0 flex-1 items-center text-left text-dd-text data-placeholder:text-dd-muted',
        className
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'group flex w-full items-center justify-between gap-2 rounded-xl border border-dd-border bg-dd-bg px-3.5 text-sm text-dd-text transition-colors outline-none select-none hover:border-dd-accent/60 focus-visible:border-dd-accent focus-visible:ring-2 focus-visible:ring-dd-accent/25 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        size === 'sm' && 'h-8 py-1.5 text-xs rounded-lg px-2.5',
        size === 'default' && 'min-h-11 py-2 text-sm',
        size === 'lg' && 'min-h-12 py-3 text-base px-4',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-dd-muted transition-transform duration-200 group-data-[popup-open]:rotate-180 group-aria-expanded:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-[120]"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'relative isolate z-[120] max-h-[min(20rem,var(--available-height))] w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-2xl border border-dd-border/70 bg-dd-bg p-2 text-dd-text shadow-[0_8px_28px_rgba(15,20,25,0.16)] dark:shadow-[0_8px_28px_rgba(231,233,234,0.16)] duration-150 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 motion-reduce:animate-none',
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="flex flex-col gap-0.5">{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        'px-2 py-1 text-[11px] font-bold tracking-wider text-dd-muted uppercase',
        className
      )}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold text-dd-text outline-none transition-colors select-none hover:bg-dd-surface focus-visible:bg-dd-surface data-[highlighted]:bg-dd-surface data-[selected]:bg-dd-accent/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none ml-2 flex size-4 shrink-0 items-center justify-center text-dd-accent">
            <CheckIcon className="size-4" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-dd-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'top-0 z-10 flex w-full cursor-default items-center justify-center bg-dd-bg py-1 text-dd-muted hover:text-dd-text [&_svg]:size-4',
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-dd-bg py-1 text-dd-muted hover:text-dd-text [&_svg]:size-4',
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
