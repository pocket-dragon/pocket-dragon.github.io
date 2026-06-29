// Reads the build identifier injected at deploy time via VITE_APP_VERSION
// (set to "b<github.run_number>" by .github/workflows/deploy.yml). Returns
// undefined for local/dev builds where the variable is not set, so the
// indicator only appears on deployed builds.
export function getBuildVersion(): string | undefined {
  const value = import.meta.env.VITE_APP_VERSION;
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return undefined;
}
