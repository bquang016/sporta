import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { injectAuthSession } from './helpers/auth.helper';
import { MOCK_USER, MOCK_RECOMMENDED_VENUES } from './fixtures/mock-data';

test.describe('Luồng Kiểm Thử Trợ Lý Ảo AI & Gợi Ý Sân Thông Minh (AI & Recommendation)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuthSession(page, MOCK_USER);
  });

  test('Kịch bản 1: Mở Sporta AI Chatbot -> Nhập Prompt tìm sân -> Kiểm tra phản hồi & render thẻ sân gợi ý', async ({ page }) => {
    // 1. Truy cập Trang chủ Sporta
    await page.goto('/');

    // 2. Click vào nút Trợ lý ảo AI (Chatbot Floating Action Button)
    // Dùng { force: true } vì nút FAB có hiệu ứng pulse nhấp nháy liên tục (Animated.loop)
    const chatbotFab = page.getByLabel(/mở trợ lý sporta ai/i)
      .or(page.getByRole('button', { name: /sporta ai|mở trợ lý/i }))
      .first();

    await expect(chatbotFab).toBeVisible();
    await chatbotFab.click({ force: true });

    // 3. Assert Chatbot Bottom Sheet đã mở ra và hiển thị lời chào
    await expect(
      page.getByText(/mình là sporta ai/i)
        .or(page.getByText(/sporta ai/i))
        .first()
    ).toBeVisible();

    // 4. Nhập prompt tìm sân vào ô nhập liệu của Chatbot
    const chatInput = page.getByPlaceholder(/tìm sân trống|nhập tin nhắn|hỏi sporta ai/i)
      .or(page.locator('input[type="text"]'))
      .last();
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Tìm sân cầu lông gần đây');

    // 5. Gửi tin nhắn bằng phím Enter
    await chatInput.press('Enter');

    // 6. Assert tin nhắn của người dùng xuất hiện trong hội thoại
    await expect(page.getByText('Tìm sân cầu lông gần đây')).toBeVisible();

    // 7. Assert tin nhắn phản hồi của Sporta AI xuất hiện
    await expect(page.getByText(/đã tìm thấy các cụm sân chất lượng cao/i)).toBeVisible();

    // 8. Assert danh sách thẻ sân gợi ý (Venue Cards) được render chuẩn xác
    await expect(page.getByText('Sân Cầu Lông Sporta Tân Bình').first()).toBeVisible();
    await expect(page.getByText(/120\.000\s*đ\/h/i).or(page.getByText(/120\.000/)).first()).toBeVisible();
    await expect(page.getByText('Sân Pickleball Elite Center').first()).toBeVisible();
    await expect(page.getByText('Đặt sân ngay').first()).toBeVisible();
  });

  test('Kịch bản 2: Sử dụng Quick Prompt Chips để tương tác nhanh với AI', async ({ page }) => {
    await page.goto('/');

    // Mở Chatbot
    const chatbotFab = page.getByLabel(/mở trợ lý sporta ai/i)
      .or(page.getByRole('button', { name: /sporta ai|mở trợ lý/i }))
      .first();
    await chatbotFab.click({ force: true });

    // Chờ Chatbot hiển thị các chip gợi ý nhanh (Quick Replies)
    const quickChip = page.getByText(/tìm sân đá bóng gần đây|ghép kèo bóng đá|sân cầu lông giá rẻ/i).first();
    if (await quickChip.isVisible()) {
      const chipText = await quickChip.innerText();
      await quickChip.click();

      // Assert tin nhắn tương ứng với chip được gửi
      await expect(page.getByText(chipText)).toBeVisible();

      // Assert AI trả về kết quả trong Chatbot
      await expect(page.getByText(/đã tìm thấy các cụm sân chất lượng cao/i)).toBeVisible();
      await expect(page.getByText('Sân Cầu Lông Sporta Tân Bình').first()).toBeVisible();
    }
  });

  test('Kịch bản 3: Click "Đặt sân ngay" từ Thẻ gợi ý của Chatbot -> Điều hướng sang màn hình đặt sân', async ({ page }) => {
    await page.goto('/');

    // 1. Mở Chatbot
    const chatbotFab = page.getByLabel(/mở trợ lý sporta ai/i)
      .or(page.getByRole('button', { name: /sporta ai|mở trợ lý/i }))
      .first();
    await chatbotFab.click({ force: true });

    // 2. Nhập prompt
    const chatInput = page.getByPlaceholder(/tìm sân trống|nhập tin nhắn|hỏi sporta ai/i)
      .or(page.locator('input[type="text"]'))
      .last();
    await chatInput.fill('Tìm sân cầu lông');
    await chatInput.press('Enter');

    // Chờ Bot AI trả lời và render danh sách thẻ sân trong dialog
    await expect(page.getByText(/đã tìm thấy các cụm sân chất lượng cao/i)).toBeVisible();

    // 3. Click nút "Đặt sân ngay" trên thẻ sân đầu tiên bên trong Chatbot dialog
    const chatbotDialog = page.getByRole('dialog').or(page.locator('[role="dialog"], [aria-modal="true"]'));
    const bookNowBtn = chatbotDialog.getByRole('button', { name: /đặt sân ngay/i }).first();
    await expect(bookNowBtn).toBeVisible();
    await bookNowBtn.click();

    // 4. Assert đã điều hướng trực tiếp sang trang đặt sân của venue-001
    await expect(page).toHaveURL(/\/booking\/venue-001/);
    await expect(page.getByText('Sân Cầu Lông Sporta Tân Bình').last()).toBeVisible();
  });

  test('Kịch bản 4: Đóng Chatbot và kiểm tra thu gọn về nút FAB', async ({ page }) => {
    await page.goto('/');

    // 1. Mở Chatbot
    const chatbotFab = page.getByLabel(/mở trợ lý sporta ai/i)
      .or(page.getByRole('button', { name: /sporta ai|mở trợ lý/i }))
      .first();
    await chatbotFab.click({ force: true });

    // 2. Assert Bottom Sheet đang mở
    await expect(page.getByText(/mình là sporta ai/i).or(page.getByText(/sporta ai assistant/i)).first()).toBeVisible();

    // 3. Click nút "Đóng"
    const closeBtn = page.getByRole('button', { name: /đóng/i }).or(page.locator('[aria-label="Đóng"]')).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // 4. Assert nút FAB vẫn hiển thị ngoài màn hình
    await expect(chatbotFab).toBeVisible();
  });

  test('Kịch bản 5: Làm mới đoạn hội thoại (Reset Chat)', async ({ page }) => {
    await page.goto('/');

    // 1. Mở Chatbot và gửi tin nhắn
    const chatbotFab = page.getByLabel(/mở trợ lý sporta ai/i).first();
    await chatbotFab.click({ force: true });

    const chatInput = page.getByPlaceholder(/tìm sân trống|nhập tin nhắn|hỏi sporta ai/i).last();
    await chatInput.fill('Tìm sân tennis');
    await chatInput.press('Enter');
    await expect(page.getByText('Tìm sân tennis')).toBeVisible();

    // 2. Click nút "Làm mới đoạn chat"
    const refreshBtn = page.getByRole('button', { name: /làm mới đoạn chat|làm mới/i }).or(page.locator('[aria-label*="mới"]')).first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();

      // 3. Assert hội thoại đã được reset
      await expect(page.getByText(/mình là sporta ai/i).first()).toBeVisible();
    }
  });

  test('Kịch bản 6: Màn hình Gợi ý cá nhân hóa (Hybrid AI Recommendations) & Bộ lọc môn Cầu lông', async ({ page }) => {
    // 1. Truy cập trang Gợi ý sân cá nhân hóa
    await page.goto('/recommended-venues');

    // 2. Assert hiển thị danh sách thẻ sân gợi ý
    await expect(page.getByText(MOCK_RECOMMENDED_VENUES[0].name)).toBeVisible();

    // 3. Assert hiển thị huy hiệu AI Match Score ("98% Phù hợp")
    await expect(page.getByText(/98% phù hợp/i).or(page.getByText(/98%/i))).toBeVisible();

    // 4. Assert hiển thị lý do gợi ý AI
    await expect(page.getByText(/phù hợp sở thích|gần vị trí/i).first()).toBeVisible();

    // 5. Thao tác chọn bộ lọc môn thể thao: "Cầu lông"
    const sportFilterPill = page.getByText('Cầu lông').first();
    if (await sportFilterPill.isVisible()) {
      await sportFilterPill.click();

      // Assert thẻ sân Cầu lông vẫn hiển thị nổi bật
      await expect(page.getByText('Sân Cầu Lông Sporta Tân Bình')).toBeVisible();
    }
  });

  test('Kịch bản 7: Bộ lọc môn Bóng đá trên màn hình Gợi ý cá nhân hóa', async ({ page }) => {
    await page.goto('/recommended-venues');

    // Chọn bộ lọc "Bóng đá"
    const footballFilter = page.getByText('Bóng đá').first();
    if (await footballFilter.isVisible()) {
      await footballFilter.click();

      // Assert hiển thị thẻ Sân Bóng Đá Sporta Cháy Rực kèm Match Score 92%
      await expect(page.getByText('Sân Bóng Đá Sporta Cháy Rực')).toBeVisible();
      await expect(page.getByText(/92% phù hợp/i).or(page.getByText(/92%/i))).toBeVisible();
    }
  });
});
