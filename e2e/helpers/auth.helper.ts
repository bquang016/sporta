import { Page, expect } from '@playwright/test';
import { MOCK_USER } from '../fixtures/mock-data';

/**
 * Injects authenticated session tokens directly into browser localStorage.
 * Speeds up subsequent test scenarios without having to re-submit login form.
 */
export async function injectAuthSession(page: Page, user = MOCK_USER) {
  await page.addInitScript((userData) => {
    window.localStorage.setItem('accessToken', userData.accessToken);
    window.localStorage.setItem('userEmail', userData.email);
    window.localStorage.setItem('userName', userData.fullName);
    if (userData.avatarUrl) {
      window.localStorage.setItem('userAvatar', userData.avatarUrl);
    }
  }, user);
}

/**
 * Performs full UI login via the Login Screen.
 */
export async function loginViaUi(
  page: Page,
  email = MOCK_USER.email,
  password = 'Password123!'
) {
  await page.goto('/(auth)/login');

  // Fill in Email / Username
  const emailInput = page.getByPlaceholder('name@example.com');
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill(email);

  // Fill in Password
  const passwordInput = page.getByPlaceholder('••••••••••••');
  await passwordInput.fill(password);

  // Click Submit Login Button
  const submitButton = page.getByRole('button', { name: /đăng nhập/i }).or(page.getByText(/^đăng nhập$/i)).last();
  await submitButton.click();

  // Verify successful redirect to home tabs
  await expect(page).toHaveURL(/\/(tabs)?$/);
}

/**
 * Performs UI logout from the Profile screen.
 */
export async function logoutViaUi(page: Page) {
  await page.goto('/profile');
  const logoutButton = page.getByRole('button', { name: /đăng xuất/i });
  await logoutButton.click();

  // Confirm logout modal if present
  const confirmBtn = page.getByRole('button', { name: /xác nhận|đồng ý/i });
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
  }

  // Verify redirect back to Login screen
  await expect(page).toHaveURL(/login/);
}
