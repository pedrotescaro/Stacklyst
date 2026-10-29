import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostCard } from '../PostCard';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const pythonPost = {
  id: 'post-1',
  title: 'Python hello world',
  body: 'Como rodar um print simples?',
  language: 'PYTHON',
  code_snippet: 'print("hello world")',
  image_url: null,
  created_at: '2026-08-14T12:00:00.000Z',
  view_count: 0,
  author: {
    username: 'pedrotescaro',
    avatar_url: null,
    total_xp: 1200,
  },
  _count: {
    answers: 0,
  },
  votes: [],
  bookmarks: [],
  upvotes: 0,
  quizzes: [],
};

describe('PostCard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    pushMock.mockClear();
  });

  it('renders legacy code snippets as executable feed blocks', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, output: 'ran from api' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<PostCard post={pythonPost} flat />);

    const runButton = screen.getByRole('button', { name: /Executar/i });
    expect(runButton).toBeInTheDocument();
    expect(document.body).toHaveTextContent('print("hello world")');

    await user.click(runButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/run', expect.any(Object)));
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(requestInit.body))).toEqual({
      code: 'print("hello world")',
      language: 'python',
    });
    expect(await screen.findByText('ran from api')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('allows the reply link to navigate and does not navigate when interacting with code', () => {
    const { container } = render(<PostCard post={pythonPost} flat />);
    const reply = screen.getByTitle('Responder');
    const event = new Event('click', { bubbles: true, cancelable: true });
    fireEvent(reply, event);
    // The footer stops propagation but must not cancel the link's default action.
    expect(event.defaultPrevented).toBe(false);
    expect(reply).toHaveAttribute('href', '/post/post-1');
    fireEvent.click(container.querySelector('pre')!);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('renders author display name, flags, title, username underneath, and hides low level badge', () => {
    const postWithProfile = {
      ...pythonPost,
      author: {
        username: 'pedrotescaro',
        avatar_url: null,
        total_xp: 1200, // Level 2 (< 5)
        avatar_config: {
          displayName: 'Pedro',
          profileStyle: {
            flag: 'BR',
            title: {
              id: 'first-steps',
              name: 'Iniciante',
              color: '#0083fe',
              rarity: 'common',
            },
          },
        },
      },
    };

    render(<PostCard post={postWithProfile} flat />);

    // Display name shown
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    // Username shown with @
    expect(screen.getByText('@pedrotescaro')).toBeInTheDocument();
    // Flag shown
    expect(screen.getByAltText(/Bandeira: Brasil/i)).toBeInTheDocument();
    // Title shown
    expect(screen.getByText('Iniciante')).toBeInTheDocument();
    // Level 2 should NOT be shown (minLevel 5)
    expect(screen.queryByText(/Lvl 2/i)).not.toBeInTheDocument();
    // Language tag in header should NOT be present (the code block itself handles language in console)
    const pythonPills = screen.queryAllByText('PYTHON');
    // Only in code block console header, not as a standalone tag in header
    expect(pythonPills.length).toBeLessThanOrEqual(1);
  });

  it('displays level badge when level is 5 or higher', () => {
    const highLevelPost = {
      ...pythonPost,
      author: {
        username: 'masterdev',
        total_xp: 5000, // Level 6 (>= 5)
      },
    };

    render(<PostCard post={highLevelPost} flat />);
    expect(screen.getByText(/Lvl 6/i)).toBeInTheDocument();
  });
});
