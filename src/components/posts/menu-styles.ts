/**
 * Shared look of the post and reply "..." menus: the same surface, border,
 * shadow and rows as the sidebar's "Mais" menu, with X's red for destructive rows.
 */
export const POST_MENU_PANEL =
  'z-50 w-[290px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-dd-border/70 bg-dd-surface p-2 font-sans shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-slide-up';

export const POST_MENU_ITEM =
  'flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-extrabold leading-5 text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const POST_MENU_ITEM_DANGER =
  'flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-extrabold leading-5 text-[#f4212e] transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const POST_MENU_ICON = 'h-5 w-5 shrink-0';

/** The round "..." trigger in a post or reply header. */
export const POST_MENU_TRIGGER =
  '-my-1 -mr-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-dd-muted transition-colors hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d9bf0]';
