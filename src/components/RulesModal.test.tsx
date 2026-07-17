import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RulesModal } from './RulesModal';

const mocks = vi.hoisted(() => ({ isOfflineCopy: vi.fn() }));
vi.mock('../logic/runtimeEnv', () => ({ isOfflineCopy: mocks.isOfflineCopy }));

afterEach(() => {
  cleanup();
  mocks.isOfflineCopy.mockReset();
});

describe('offline download link', () => {
  test('links to the latest release asset when running from the web', () => {
    mocks.isOfflineCopy.mockReturnValue(false);
    render(<RulesModal isOpen onClose={() => {}} />);
    const link = screen.getByTestId('offline-download-link');
    expect(link.getAttribute('href')).toBe(
      'https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('is hidden in the offline copy itself', () => {
    mocks.isOfflineCopy.mockReturnValue(true);
    render(<RulesModal isOpen onClose={() => {}} />);
    expect(screen.queryByTestId('offline-download-link')).toBeNull();
  });

  test('sits just before the Components heading', () => {
    mocks.isOfflineCopy.mockReturnValue(false);
    render(<RulesModal isOpen onClose={() => {}} />);
    const link = screen.getByTestId('offline-download-link');
    const componentsHeading = screen.getByRole('heading', { name: 'Components' });
    expect(
      // Bitmask: set when the heading follows the link in document order.
      link.compareDocumentPosition(componentsHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // "Just before": nothing but the heading's own section separates them —
    // the link's paragraph and the heading share the rules-content parent,
    // with the heading's markdown block rendered immediately after.
    const rulesContent = screen.getByTestId('rules-content');
    const children = Array.from(rulesContent.children);
    const linkParagraphIndex = children.indexOf(link.closest('p') as Element);
    expect(linkParagraphIndex).toBeGreaterThan(-1);
    const nextBlock = children[linkParagraphIndex + 1];
    // The block right after the link's paragraph must be the Components
    // heading itself (rulesBody starts with `## Components`).
    expect(nextBlock?.matches('h1, h2, h3')).toBe(true);
    expect(nextBlock?.textContent).toContain('Components');
  });
});
