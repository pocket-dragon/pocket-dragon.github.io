import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { RegisterSWOptions } from 'virtual:pwa-register/react';

// Mock the vite-plugin-pwa virtual module so we can drive the registration
// callbacks and assert what useAppUpdate does with them.
const mocks = vi.hoisted(() => ({ useRegisterSW: vi.fn() }));
vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: mocks.useRegisterSW }));

import { useAppUpdate } from './useAppUpdate';

type RegisterReturn = ReturnType<typeof import('virtual:pwa-register/react').useRegisterSW>;

function setup(overrides: Partial<RegisterReturn> = {}) {
  let capturedOptions: RegisterSWOptions | undefined;
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  mocks.useRegisterSW.mockImplementation((options?: RegisterSWOptions) => {
    capturedOptions = options;
    return {
      needRefresh: [false, () => {}],
      offlineReady: [false, () => {}],
      updateServiceWorker,
      ...overrides,
    } satisfies RegisterReturn;
  });
  const rendered = renderHook(() => useAppUpdate());
  return { rendered, updateServiceWorker, options: () => capturedOptions! };
}

describe('useAppUpdate', () => {
  beforeEach(() => {
    mocks.useRegisterSW.mockReset();
  });

  it('reports updateAvailable from needRefresh', () => {
    const { rendered } = setup({ needRefresh: [true, () => {}] });
    expect(rendered.result.current.updateAvailable).toBe(true);
  });

  it('reload applies the waiting worker', () => {
    const { rendered, updateServiceWorker } = setup();
    rendered.result.current.reload();
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('re-checks for an update when the tab becomes visible', () => {
    const { options } = setup();
    const registration = { update: vi.fn().mockResolvedValue(undefined) };
    // vite-plugin-pwa invokes this once per registration.
    options().onRegisteredSW?.('sw.js', registration as unknown as ServiceWorkerRegistration);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  it('attaches a rejection handler to update() so it never propagates', async () => {
    const { options } = setup();
    // Track the promise update() returns and whether the code attaches a
    // rejection handler to it. Asserting the .catch directly is deterministic;
    // waiting on the unhandledrejection event is not — jsdom does not reliably
    // dispatch it, so a test relying on that would pass even with no .catch.
    const rejected = Promise.reject(new Error('offline'));
    const catchSpy = vi.spyOn(rejected, 'catch');
    const registration = { update: vi.fn().mockReturnValue(rejected) };
    options().onRegisteredSW?.('sw.js', registration as unknown as ServiceWorkerRegistration);

    document.dispatchEvent(new Event('visibilitychange'));

    expect(registration.update).toHaveBeenCalledTimes(1);
    // The handler must swallow the rejection so a transient offline/404 can't
    // escape; drop the .catch in useAppUpdate and this assertion fails.
    expect(catchSpy).toHaveBeenCalledTimes(1);
    // The code already handled it; settle here too so no rejection dangles.
    await rejected.catch(() => {});
  });
});
