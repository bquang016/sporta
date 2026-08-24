import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { injectAuthSession } from './helpers/auth.helper';
import { MOCK_USER, MOCK_VENUE_DETAIL } from './fixtures/mock-data';

test.describe('Luồng Kiểm Thử Đặt Sân & Thanh Toán (Booking E2E Flow)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup deterministic API mocking
    await setupApiMocks(page);
    // Inject authenticated session
    await injectAuthSession(page, MOCK_USER);
  });

  test('Kịch bản 1: Chọn sân -> Chọn slot -> Thanh toán DEV -> Thành công', async ({ page }) => {
    // 1. Truy cập trực tiếp trang chọn lịch đặt sân
    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    // Assert thông tin sân hiển thị trên trang booking
    await expect(page.getByText(MOCK_VENUE_DETAIL.name).first()).toBeVisible();
    await expect(page.getByText(/sân 1/i).first()).toBeVisible();

    // 2. Click chọn slot còn trống (17:00 trên Sân 1)
    const slotCell = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await expect(slotCell).toBeVisible();
    await slotCell.click();

    // Assert đã chọn được 1 khung giờ
    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();

    // 3. Nhấn nút "Tiếp tục" để chuyển sang màn hình Thanh toán
    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).or(page.getByText(/tiếp tục/i)).last();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 4. Assert đã điều hướng đến trang Thanh toán (/booking/payment)
    await expect(page).toHaveURL(/booking\/payment/);
    await expect(page.getByText('Xác Nhận & Thanh Toán')).toBeVisible();
    await expect(page.getByText(MOCK_VENUE_DETAIL.name).last()).toBeVisible();

    // 5. Lựa chọn phương thức thanh toán DEV (Test Auto Success)
    const devPaymentMethod = page.getByText(/thanh toán dev/i).first();
    await expect(devPaymentMethod).toBeVisible();
    await devPaymentMethod.click();

    // 6. Nhấn nút "Xác nhận đặt sân"
    const confirmBookingBtn = page.getByRole('button', { name: /xác nhận đặt sân/i }).or(page.getByText(/xác nhận đặt sân/i)).last();
    await expect(confirmBookingBtn).toBeEnabled();
    await confirmBookingBtn.click();

    // 7. Assert kết quả chuyển hướng đến màn hình thành công (/booking/success)
    await expect(page).toHaveURL(/booking\/success/);
    await expect(page.getByText('Đặt sân thành công!')).toBeVisible();
    await expect(page.getByText('MÃ ĐƠN ĐẶT SÂN')).toBeVisible();
    await expect(page.getByText('SP-888999').first()).toBeVisible();
  });

  test('Kịch bản 2: Đặt nhiều khung giờ cùng lúc (Multi-slot booking) & Kiểm tra cập nhật tổng tiền', async ({ page }) => {
    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    // Chọn slot 1: 17:00 trên Sân 1
    const slot1 = page.getByRole('button', { name: /slot .*sân 1.*17:00/i })
      .or(page.getByTestId('slot-court-1-17:00'))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await slot1.click();
    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();

    // Chọn slot 2: 17:30 trên Sân 1
    const slot2 = page.getByRole('button', { name: /slot .*sân 1.*17:30/i })
      .or(page.getByTestId('slot-court-1-17:30'))
      .or(page.locator('[aria-label*="17:30"]'))
      .first();
    await slot2.click();

    // Assert đã chọn được 2 khung giờ và tổng tiền cập nhật đúng (120k + 120k = 240k)
    await expect(page.getByText(/đã chọn:\s*2\s*khung giờ/i)).toBeVisible();
    await expect(page.getByText(/240\.000/i).first()).toBeVisible();

    // Chuyển sang màn hình thanh toán
    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).or(page.getByText(/tiếp tục/i)).last();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page).toHaveURL(/booking\/payment/);
    await expect(page.getByText(/Khung giờ đã chọn \(2 slot\)/i)).toBeVisible();
  });

  test('Kịch bản 3: Hủy chọn slot (Deselect / Toggle off slot) -> Nút Tiếp tục bị vô hiệu hóa', async ({ page }) => {
    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    const slot1 = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();

    // 1. Click chọn slot
    await slot1.click();
    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();

    // 2. Click lại chính slot đó để hủy chọn
    await slot1.click();
    await expect(page.getByText(/đã chọn:\s*0\s*khung giờ/i)).toBeVisible();

    // 3. Assert nút Tiếp tục bị disabled
    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).last();
    await expect(continueBtn).toBeDisabled();
  });

  test('Kịch bản 4: Chuyển ngày xem lịch đặt sân (Date Navigation)', async ({ page }) => {
    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    // Tìm và click nút Next Day (mũi tên chuyển sang ngày tiếp theo)
    const nextDayBtn = page.locator('div[role="button"]').filter({ has: page.locator('svg[data-icon="chevron-right"], [class*="chevron-right"]') })
      .or(page.locator('[style*="cursor"]').filter({ hasText: /chevron-right/ }))
      .last();
    
    if (await nextDayBtn.isVisible()) {
      await nextDayBtn.click();
    }

    // Chọn slot trên ngày mới
    const slotCell = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await slotCell.click();
    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();
  });

  test('Kịch bản 5: Kiểm tra cảnh báo khi số dư ví không đủ để thanh toán', async ({ page }) => {
    // Mock số dư ví là 0 VNĐ (không đủ trả)
    await setupApiMocks(page, { walletBalance: 0 });

    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    // Chọn slot và tiếp tục sang payment
    const slotCell = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await expect(slotCell).toBeVisible();
    await slotCell.click();

    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();

    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).or(page.getByText(/tiếp tục/i)).last();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page).toHaveURL(/booking\/payment/);

    // Chọn phương thức Ví Sporta
    const walletMethod = page.getByText(/ví sporta/i).first();
    await walletMethod.click();

    // Kiểm tra hiển thị thông báo số dư không đủ và nút "Nạp ví ngay"
    await expect(page.getByText(/số dư ví không đủ/i)).toBeVisible();
    await expect(page.getByText(/nạp ví ngay/i)).toBeVisible();
  });

  test('Kịch bản 6: Xử lý xung đột slot (Conflict 409) khi có người đặt trước', async ({ page }) => {
    // Mock API trả về 409 Conflict khi tạo booking
    await setupApiMocks(page, { bookingConflict: true });

    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    const slotCell = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await expect(slotCell).toBeVisible();
    await slotCell.click();

    await expect(page.getByText(/đã chọn:\s*1\s*khung giờ/i)).toBeVisible();

    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).or(page.getByText(/tiếp tục/i)).last();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page).toHaveURL(/booking\/payment/);

    // Chọn phương thức DEV và submit
    const devMethod = page.getByText(/thanh toán dev/i).first();
    await expect(devPaymentMethod(page)).resolves;
    await devMethod.click();

    const confirmBookingBtn = page.getByRole('button', { name: /xác nhận đặt sân/i }).or(page.getByText(/xác nhận đặt sân/i)).last();
    await confirmBookingBtn.click();

    // Assert hiển thị Modal cảnh báo xung đột
    await expect(page.getByText(/sân đã được đặt/i)).toBeVisible();
    await expect(page.getByText(/rất tiếc, khung giờ này vừa có người nhanh tay hơn/i)).toBeVisible();
  });

  test('Kịch bản 7: Đặt sân với phương thức Thanh toán tại sân (Cash on Arrival)', async ({ page }) => {
    await page.goto(`/booking/${MOCK_VENUE_DETAIL.id}`);

    const slotCell = page.getByRole('button', { name: /slot .* 17:00/i })
      .or(page.getByTestId(/slot-.*-17:00/))
      .or(page.locator('[aria-label*="17:00"]'))
      .first();
    await slotCell.click();

    const continueBtn = page.getByRole('button', { name: /tiếp tục/i }).or(page.getByText(/tiếp tục/i)).last();
    await continueBtn.click();

    await expect(page).toHaveURL(/booking\/payment/);

    // Chọn phương thức Thanh toán tại sân
    const cashMethod = page.getByText(/thanh toán tại sân/i).first();
    await expect(cashMethod).toBeVisible();
    await cashMethod.click();

    // Xác nhận đặt sân
    const confirmBookingBtn = page.getByRole('button', { name: /xác nhận đặt sân/i }).or(page.getByText(/xác nhận đặt sân/i)).last();
    await confirmBookingBtn.click();

    // Assert thành công
    await expect(page).toHaveURL(/booking\/success/);
    await expect(page.getByText('Đặt sân thành công!')).toBeVisible();
  });
});

async function devPaymentMethod(page: any) {
  const method = page.getByText(/thanh toán dev/i).first();
  if (await method.isVisible()) {
    await method.click();
  }
}
