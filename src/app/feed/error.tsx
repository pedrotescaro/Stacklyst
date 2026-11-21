'use client';

import ErrorScreen from '@/app/error';
import { useFeedEntryReady } from '@/components/FeedEntryBoundary';

export default function FeedError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useFeedEntryReady();
  return <ErrorScreen {...props} />;
}
