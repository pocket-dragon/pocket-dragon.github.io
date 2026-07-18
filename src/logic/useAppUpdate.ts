import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Wraps vite-plugin-pwa's React registration hook. Exposes whether a new
 * version is waiting (`updateAvailable`) and a `reload` that applies it.
 *
 * Detection is visibility-triggered only: the initial registration performs
 * the first check, and we re-check whenever the tab becomes visible again.
 * There is no interval and no background polling. We NEVER reload on our own —
 * `reload` is called only from the user's button click.
 */
export function useAppUpdate(): { updateAvailable: boolean; reload: () => void } {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return;
      // App-lifetime listener (onRegisteredSW fires once per registration).
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // Swallow rejections: a transient offline/404 (e.g. mid-deploy) must
          // not surface as a recurring unhandledrejection on every re-show.
          registration.update().catch(() => {});
        }
      });
    },
    onRegisterError(error) {
      // Only diagnostic if a deploy's sw.js ever fails to register.
      console.warn('Service worker registration failed', error);
    },
  });

  return {
    updateAvailable: needRefresh,
    reload: () => {
      // User-initiated (button click), so a failure is worth a diagnostic —
      // unlike the silent visibility-check catch above, this path is rare and
      // logging it is signal, not noise.
      updateServiceWorker(true).catch((error) => {
        console.warn('Failed to apply the waiting service worker', error);
      });
    },
  };
}
