import { FeedEntryBoundary } from '@/components/FeedEntryBoundary';

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <FeedEntryBoundary>{children}</FeedEntryBoundary>;
}
