import { Page } from '@playwright/test';
import {
  MOCK_USER,
  MOCK_VENUES,
  MOCK_VENUE_DETAIL,
  MOCK_MY_VOUCHERS,
  MOCK_WALLET_BALANCE,
  MOCK_BOOKING_RESULT,
  MOCK_AI_CHAT_RESPONSE,
  MOCK_RECOMMENDED_VENUES,
  MOCK_TICKET_SESSIONS,
} from '../fixtures/mock-data';

/**
 * Sets up mock API route interception for deterministic, reliable E2E tests.
 * Enables tests to pass consistently regardless of backend availability or Gemini API rate limits.
 */
export async function setupApiMocks(page: Page, options?: {
  walletBalance?: number;
  bookingConflict?: boolean;
}) {
  // 1. Auth: Ping / Session Check
  await page.route(/\/api\/v1\/auth\/ping/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'UP', message: 'Pong' }),
    });
  });

  // 1. Auth: Login API
  await page.route(/\/api\/v1\/auth\/login/, async (route) => {
    const postData = route.request().postDataJSON();
    if (postData?.password === 'WrongPassword123!') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email hoặc mật khẩu không chính xác.' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: MOCK_USER.accessToken,
        email: postData?.email || MOCK_USER.email,
        fullName: MOCK_USER.fullName,
      }),
    });
  });

  // 2. User Profile API
  await page.route(/\/api\/v1\/users\/profile/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        fullName: MOCK_USER.fullName,
        avatarUrl: MOCK_USER.avatarUrl,
        phoneNumber: MOCK_USER.phoneNumber,
      }),
    });
  });

  // 3. Public Venues: Recommendations
  await page.route(/\/api\/v1\/public\/venues\/recommendations/, async (route) => {
    if (route.request().method() === 'POST') {
      // Record recommendation click
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RECOMMENDED_VENUES),
    });
  });

  // 4. Public Venues: Schedule
  await page.route(/\/api\/v1\/public\/venues\/[^/]+\/schedule/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_VENUE_DETAIL.slots),
    });
  });

  // 5. Public Venues: Detail
  await page.route(/\/api\/v1\/public\/venues\/venue-001(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_VENUE_DETAIL),
    });
  });

  // 6. Public Venues: Search (POST)
  await page.route(/\/api\/v1\/public\/venues\/search/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_VENUES),
    });
  });

  // 7. Public Venues: Active List (GET /public/venues) -> Returns Array
  await page.route(/\/api\/v1\/public\/venues(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_VENUES),
    });
  });

  // 8. User Vouchers
  await page.route(/\/api\/v1\/vouchers\/my-vouchers/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MY_VOUCHERS),
    });
  });

  // 9. Wallet Balance
  await page.route(/\/api\/v1\/wallet\/balance/, async (route) => {
    const balance = options?.walletBalance !== undefined ? options.walletBalance : MOCK_WALLET_BALANCE.balance;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_WALLET_BALANCE,
        balance,
      }),
    });
  });

  // 10. Bookings: Specific Detail by ID
  await page.route(/\/api\/v1\/bookings\/[^/]+$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_BOOKING_RESULT),
    });
  });

  // 11. Bookings: Create (POST) / List (GET)
  await page.route(/\/api\/v1\/bookings(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      if (options?.bookingConflict) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Rất tiếc, khung giờ này vừa có người nhanh tay hơn. Vui lòng chọn giờ khác!' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_BOOKING_RESULT),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [MOCK_BOOKING_RESULT],
        totalElements: 1,
      }),
    });
  });

  // 12. AI Chatbot
  await page.route(/\/api\/v1\/chat/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AI_CHAT_RESPONSE),
    });
  });

  // 13. Ticket Sessions (Matchmaking): Detail & List
  await page.route(/\/api\/v1\/ticket-sessions\/[^/]+$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TICKET_SESSIONS[0]),
    });
  });

  await page.route(/\/api\/v1\/ticket-sessions(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TICKET_SESSIONS),
    });
  });
}
