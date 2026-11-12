import type { ComponentProps, ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { PlatformBackLink } from '@/components/PlatformBackLink';
import { cn } from '@/lib/cn';
import styles from './PlatformPageShell.module.css';

export function PlatformPageShell({
  user,
  children,
  className,
  railProps,
}: {
  user: ComponentProps<typeof Sidebar>['user'];
  children: ReactNode;
  className?: string;
  railProps?: Pick<ComponentProps<typeof FeedRightSidebar>, 'hideSearch' | 'hideWhoToFollow'>;
}) {
  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen">
      <Sidebar user={user} hideMobileHeader />
      <div className="dd-platform-body mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main
          data-testid="primary-column"
          className={cn(
            'dd-platform-main flex min-h-screen w-full min-w-0 max-w-[720px] flex-grow flex-col border-dd-border/60 bg-dd-bg pb-[calc(6rem+env(safe-area-inset-bottom))] md:border-x md:pb-8 xl:max-w-[820px] 2xl:max-w-[920px]',
            className
          )}
        >
          {children}
        </main>
        <FeedRightSidebar user={user} {...railProps} />
      </div>
    </div>
  );
}

export function PlatformPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <>
      <header className={styles.header}>
        <PlatformBackLink className={styles.back} />
        <h1>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {description && <p className={styles.description}>{description}</p>}
    </>
  );
}
