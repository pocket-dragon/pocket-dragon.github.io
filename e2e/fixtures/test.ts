import { test as base } from '@playwright/test';

// Shared `test` for all e2e suites. When the active config points baseURL at a
// file: URL (the offline-artifact configs), Playwright's own URL joining can't
// express goto('/') — new URL('/', 'file:///…/index.html') is the filesystem
// root — so the fixture maps '/' to the artifact URL instead. With an http
// baseURL it is a passthrough.
//
// CONTRACT: the remap only rewrites the exact literal goto('/'). Every current
// spec navigates with '/', so this is complete today. Any future non-'/'
// navigation on file:// (e.g. goto('/?x') or goto('/path')) would bypass the
// remap and resolve against the filesystem root — extend this mapping if such a
// call is ever added.
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (baseURL?.startsWith('file:')) {
      const originalGoto = page.goto.bind(page);
      page.goto = ((url, options) =>
        originalGoto(url === '/' ? baseURL : url, options)) as typeof page.goto;
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
