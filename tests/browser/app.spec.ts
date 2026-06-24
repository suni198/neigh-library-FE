import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3001';
const CREDS = { username: 'admin', password: 'admin123' };

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('#username', CREDS.username);
  await page.fill('#password', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

test.describe('Authentication', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveURL(/login/);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('h2')).toHaveText('Login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('successful login navigates to home', async ({ page }) => {
    await login(page);
    await expect(page.locator('h1')).toContainText('Neighborhood Library');
  });

  test('logout clears session and returns to login', async ({ page }) => {
    await login(page);
    await page.click('button.btn-logout');
    await expect(page).toHaveURL(/login/);
  });
});

// ── Tab navigation ────────────────────────────────────────────────────────────

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('Books tab is active by default', async ({ page }) => {
    await expect(page.locator('.tab.active')).toHaveText('Books');
  });

  test('clicking Members tab shows members table', async ({ page }) => {
    await page.click('button.tab:has-text("Members")');
    await expect(page.locator('th:has-text("Member Since")')).toBeVisible();
  });

  test('clicking Borrowings tab shows borrowings table', async ({ page }) => {
    await page.click('button.tab:has-text("Borrowings")');
    await expect(page.locator('th:has-text("Due Date")')).toBeVisible();
  });
});

// ── Members ───────────────────────────────────────────────────────────────────

test.describe('Members', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button.tab:has-text("Members")');
    await page.waitForSelector('table.table');
  });

  test('members list loads and shows at least one active member', async ({ page }) => {
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    // All visible members should be Active (inactive are filtered out)
    const badges = page.locator('tbody .badge.active');
    await expect(badges.first()).toBeVisible();
  });

  test('Add Member modal opens and closes', async ({ page }) => {
    await page.click('button:has-text("+ Add Member")');
    await expect(page.locator('.modal h2')).toHaveText('Add New Member');
    await page.click('button.btn-close');
    await expect(page.locator('.modal')).not.toBeVisible();
  });

  test('Add Member form creates a new member', async ({ page }) => {
    const ts = Date.now();
    await page.click('button:has-text("+ Add Member")');
    await page.fill('input[type="text"]:near(.form-group:has-text("First Name"))', 'Test');
    await page.fill('input[type="text"]:near(.form-group:has-text("Last Name"))', 'User');
    await page.fill('input[type="email"]', `test${ts}@example.com`);
    await page.click('button[type="submit"]:has-text("Create")');
    await expect(page.locator('tbody')).toContainText('Test User');
  });

  test('Edit Member modal pre-fills existing data', async ({ page }) => {
    await page.click('tbody tr:first-child button[title="Edit"]');
    await expect(page.locator('.modal h2')).toHaveText('Edit Member');
    const firstNameInput = page.locator('.modal input[type="text"]').first();
    await expect(firstNameInput).not.toHaveValue('');
  });

  test('Edit Member modal shows Active Member checkbox', async ({ page }) => {
    await page.click('tbody tr:first-child button[title="Edit"]');
    await expect(page.locator('#member-is-active')).toBeVisible();
  });

  test('Delete member shows confirmation dialog', async ({ page }) => {
    await page.click('tbody tr:first-child button[title="Delete"]');
    await expect(page.locator('.confirm-dialog h2')).toHaveText('Delete Member');
    await expect(page.locator('.confirm-message p')).toContainText('Are you sure');
    // Cancel to avoid actually deleting
    await page.click('.confirm-dialog button:has-text("Cancel")');
  });

  test('Deleted member disappears from list (soft delete)', async ({ page }) => {
    // Create a fresh member with no borrowings so delete is guaranteed to succeed
    const ts = Date.now();
    const email = `deleteme${ts}@test.com`;
    await page.click('button:has-text("+ Add Member")');
    await page.fill('input[type="text"]:near(.form-group:has-text("First Name"))', 'Delete');
    await page.fill('input[type="text"]:near(.form-group:has-text("Last Name"))', 'Me');
    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"]:has-text("Create")');
    await expect(page.locator('tbody')).toContainText('Delete Me');

    const rows = page.locator('tbody tr');
    const countBefore = await rows.count();

    // Find the newly created member's row and delete it
    const newRow = page.locator(`tbody tr:has-text("Delete Me")`);
    await newRow.locator('button[title="Delete"]').click();
    await page.click('.confirm-dialog button:has-text("Confirm")');

    await expect(rows).toHaveCount(countBefore - 1, { timeout: 8000 });
    await expect(page.locator('tbody')).not.toContainText('Delete Me');
  });
});

// ── Books ─────────────────────────────────────────────────────────────────────

test.describe('Books', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('books grid loads with cards', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('Add Book modal opens', async ({ page }) => {
    await page.click('button:has-text("+ Add Book")');
    await expect(page.locator('.modal h2')).toHaveText('Add New Book');
    await page.click('button.btn-close');
  });

  test('Edit book modal pre-fills existing data', async ({ page }) => {
    await page.click('.card button[title="Edit"]:first-child');
    await expect(page.locator('.modal h2')).toHaveText('Edit Book');
    await expect(page.locator('.modal input[type="text"]').first()).not.toHaveValue('');
  });

  test('Delete book shows confirmation dialog', async ({ page }) => {
    await page.click('.card:first-child button[title="Delete"]');
    await expect(page.locator('.confirm-dialog h2')).toHaveText('Delete Book');
    await page.click('.confirm-dialog button:has-text("Cancel")');
  });
});

// ── Borrowings ────────────────────────────────────────────────────────────────

test.describe('Borrowings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button.tab:has-text("Borrowings")');
    await page.waitForSelector('table.table');
  });

  test('borrowings table shows borrowed books', async ({ page }) => {
    await expect(page.locator('th:has-text("Book")')).toBeVisible();
    await expect(page.locator('th:has-text("Member")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });
});
