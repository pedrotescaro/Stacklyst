import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
vi.mock('@/components/AchievementShowcase', () => ({ AchievementShowcase: () => null }));
vi.mock('@/app/feed/FeedEngagementCard', () => ({ FeedEngagementCard: () => null }));

afterEach(() => {
  push.mockClear();
});

describe('Feed search from another page', () => {
  it('navigates to the feed with the entered query', () => {
    render(<FeedRightSidebar duels={[]} weeklyActivity={new Map()} />);
    const input = screen.getByRole('textbox', { name: 'Buscar' });
    fireEvent.change(input, { target: { value: '  typescript e react  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith('/feed?q=typescript%20e%20react');
  });
});
