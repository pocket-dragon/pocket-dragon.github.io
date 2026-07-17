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
});
