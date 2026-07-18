import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { RulesModal } from './RulesModal';

const mocks = vi.hoisted(() => ({ isOfflineCopy: vi.fn(), markdown: vi.fn() }));
vi.mock('../logic/runtimeEnv', () => ({ isOfflineCopy: mocks.isOfflineCopy }));

// Count how many times react-markdown actually runs its parse pipeline.
// Each render of the real <Markdown> re-parses its `text`; by counting the
// component invocations we can assert the parse does not recur on re-render.
vi.mock('react-markdown', () => ({
  default: (props: { children?: string }) => {
    mocks.markdown();
    return <div data-testid="md">{props.children}</div>;
  },
}));

afterEach(() => {
  cleanup();
  mocks.isOfflineCopy.mockReset();
  mocks.markdown.mockReset();
});

describe('RulesModal markdown memoization', () => {
  test('does not re-parse the rules markdown when the parent re-renders', () => {
    mocks.isOfflineCopy.mockReturnValue(false);

    // A fresh onClose closure each render deliberately defeats RulesModal's own
    // memo (its props are no longer reference-stable), forcing RulesModal to
    // re-render. That isolates the RulesMarkdown boundary: a flat parse count
    // below can only be held by memo(RulesMarkdown), not by RulesModal's memo.
    // This guard therefore covers only the RulesMarkdown memo — it would not
    // catch a regression of RulesModal's own memo or App's stable `onClose`.
    const { rerender } = render(<RulesModal isOpen={false} onClose={() => {}} />);
    const afterFirstRender = mocks.markdown.mock.calls.length;
    expect(afterFirstRender).toBeGreaterThan(0);

    rerender(<RulesModal isOpen={false} onClose={() => {}} />);
    rerender(<RulesModal isOpen={false} onClose={() => {}} />);

    // No additional parses: the markdown was parsed once and reused.
    expect(mocks.markdown.mock.calls.length).toBe(afterFirstRender);
  });
});
