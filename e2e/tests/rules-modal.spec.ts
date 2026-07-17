import { test, expect } from '../fixtures/test';
import { selectors } from '../fixtures/selectors';

test.describe('Rules Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('rules link is visible', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);
    await expect(rulesLink).toBeVisible();
    await expect(rulesLink).toContainText('Rules version');
  });

  test('clicking rules link opens rules dialog', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);
    const rulesDialog = page.locator(selectors.rulesDialog);

    await rulesLink.click();

    await expect(rulesDialog).toBeVisible();
  });

  test('rules dialog contains rules content', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);
    const rulesContent = page.locator(selectors.rulesContent);

    await rulesLink.click();

    await expect(rulesContent).toBeVisible();
    // Should contain some rules text
    await expect(rulesContent).toContainText('Dragon');
  });

  test('rules dialog has close button', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);
    const rulesCloseButton = page.locator(selectors.rulesCloseButton);

    await rulesLink.click();

    await expect(rulesCloseButton).toBeVisible();
    await expect(rulesCloseButton).toHaveAttribute('label', 'Close');
  });

  test('close button closes the rules dialog', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);
    const rulesDialog = page.locator(selectors.rulesDialog);
    const rulesCloseButton = page.locator(selectors.rulesCloseButton);

    // Open the dialog
    await rulesLink.click();
    await expect(rulesDialog).toBeVisible();

    // Close the dialog
    await rulesCloseButton.click();

    // Dialog should be closed (not visible or hidden)
    // MDC dialogs may not be removed from DOM but become hidden
    await expect(rulesDialog).not.toHaveClass(/mdc-dialog--open/);
  });

  test('rules dialog contains promo sections', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);

    await rulesLink.click();

    // Check for some known promo sections
    const anachronyPromo = page.locator('[data-testid="promo-anachrony"]');
    const trickerionPromo = page.locator('[data-testid="promo-trickerion"]');
    const petrichorPromo = page.locator('[data-testid="promo-petrichor"]');

    await expect(anachronyPromo).toBeVisible();
    await expect(trickerionPromo).toBeVisible();
    await expect(petrichorPromo).toBeVisible();
  });

  test('promo sections are collapsible', async ({ page }) => {
    const rulesLink = page.locator(selectors.rulesLink);

    await rulesLink.click();

    // Find a collapsible section header
    const anachronyPromo = page.locator('[data-testid="promo-anachrony"]');

    // Click to expand/collapse
    // The collapsible sections use app-collapsible-section which has a header slot
    const header = anachronyPromo.locator('h2');
    await expect(header).toBeVisible();

    // Initially should be collapsed (no 'expanded' attribute or class)
    // After clicking, should expand
    await header.click();

    // Verify the section has content (promo image and rules)
    const promoImage = anachronyPromo.locator('img.promo');
    await expect(promoImage).toBeVisible();
  });
});
