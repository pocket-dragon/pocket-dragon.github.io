import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Simulate the rules text after the "## Components" heading has been renamed
// or removed. The split in RulesModal happens at module load, so the mock must
// be in place before RulesModal is imported (vi.mock is hoisted).
vi.mock('../rules/game-rules', () => ({
  pocketDragon: '# Pocket Dragon\n\nWelcome, dragon keeper.\n\n## Setup\n\nShuffle the deck.',
  promoGames: [],
}));

const mocks = vi.hoisted(() => ({ isOfflineCopy: vi.fn() }));
vi.mock('../logic/runtimeEnv', () => ({ isOfflineCopy: mocks.isOfflineCopy }));

// Import after the mocks are registered so the module-load-time split reads the
// mocked rules text.
const { RulesModal } = await import('./RulesModal');

afterEach(() => {
  cleanup();
  mocks.isOfflineCopy.mockReset();
});

describe('offline download link — Components heading absent', () => {
  test('still renders the callout and the full rules text', () => {
    mocks.isOfflineCopy.mockReturnValue(false);
    render(<RulesModal isOpen onClose={() => {}} />);

    // The callout degrades to the top of the body rather than disappearing.
    expect(screen.queryByTestId('offline-download-link')).not.toBeNull();

    // No text is lost: with no heading to split on, the whole document renders.
    const content = screen.getByTestId('rules-content');
    expect(content.textContent).toContain('Welcome, dragon keeper.');
    expect(content.textContent).toContain('Shuffle the deck.');
  });
});
