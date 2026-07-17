// True when the app is NOT being served over the web — i.e. a downloaded
// offline copy. Downloaded copies open under many schemes depending on the
// platform (file: on desktop, content: via Android's media store, and so on),
// so treat anything that isn't plain http(s) as the offline copy rather than
// enumerating offline schemes.
export function isOfflineCopy(): boolean {
  return !['http:', 'https:'].includes(window.location.protocol);
}
