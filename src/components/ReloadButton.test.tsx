import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReloadButton } from './ReloadButton';

describe('ReloadButton', () => {
  it('renders nothing when not visible', () => {
    render(<ReloadButton visible={false} onReload={() => {}} />);
    expect(screen.queryByTestId('reload-button')).toBeNull();
  });

  it('renders the reload pill when visible', () => {
    render(<ReloadButton visible onReload={() => {}} />);
    const button = screen.getByTestId('reload-button');
    expect(button.textContent).toBe('New version available — tap to reload');
  });

  it('calls onReload when clicked', () => {
    const onReload = vi.fn();
    render(<ReloadButton visible onReload={onReload} />);
    fireEvent.click(screen.getByTestId('reload-button'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
