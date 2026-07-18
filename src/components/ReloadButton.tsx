interface ReloadButtonProps {
  visible: boolean;
  onReload: () => void;
}

/**
 * "Click to reload" affordance for picking up a newly-deployed version.
 * Purely presentational — the parent decides `visible` (see
 * shouldShowReloadButton) and supplies `onReload`. Never reloads on its own.
 */
export function ReloadButton({ visible, onReload }: ReloadButtonProps) {
  if (!visible) return null;
  return (
    <button
      type="button"
      className="reload-button"
      data-testid="reload-button"
      aria-live="polite"
      onClick={onReload}
    >
      New version available — tap to reload
    </button>
  );
}
