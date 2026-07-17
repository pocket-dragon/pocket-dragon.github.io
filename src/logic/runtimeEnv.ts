// True when the app runs from a downloaded offline copy (opened via file://)
// rather than the deployed site.
export function isOfflineCopy(): boolean {
  return window.location.protocol === 'file:';
}
