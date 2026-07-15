/**
 * Đối chiếu thời gian thực tế với định dạng LocalTime từ Backend.
 * Kiểm tra xem một khung giờ (slot) trong lịch đặt đã trôi qua so với thời gian hiện tại hay chưa.
 * @param slotDate Ngày của ô ma trận (Date hoặc chuỗi định dạng "YYYY-MM-DD")
 * @param slotTime Giờ bắt đầu của slot (định dạng "HH:mm")
 */
export const isPastSlot = (slotDate: Date | string, slotTime: string): boolean => {
  const now = new Date();
  
  // Chuẩn hóa ngày hiện tại (không lấy phần giờ phút giây)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let targetDate: Date;
  if (typeof slotDate === 'string') {
    // Parse "YYYY-MM-DD"
    const [year, month, day] = slotDate.split('-').map(Number);
    targetDate = new Date(year, month - 1, day);
  } else {
    targetDate = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
  }

  // 1. Nếu ngày mục tiêu nhỏ hơn ngày hiện tại -> Đã trôi qua
  if (targetDate < today) {
    return true;
  }
  
  // 2. Nếu ngày mục tiêu lớn hơn ngày hiện tại -> Chưa trôi qua
  if (targetDate > today) {
    return false;
  }

  // 3. Nếu là ngày hôm nay -> So sánh giờ bắt đầu của slot với giờ hiện tại
  const [slotHour, slotMin] = slotTime.split(':').map(Number);
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  if (slotHour < currentHour) {
    return true;
  }
  if (slotHour === currentHour && slotMin < currentMin) {
    return true;
  }

  return false;
};

/**
 * Tạo danh sách các ca giờ (HH:mm) cách nhau 30 phút dựa trên thời gian mở cửa và đóng cửa của cụm sân.
 */
export const generateTimesRange = (opening?: string, closing?: string): string[] => {
  // Mặc định từ 06:00 đến 22:00 nếu không có cấu hình
  let startHour = 6;
  let startMin = 0;
  let endHour = 22;
  let endMin = 0;

  if (opening) {
    const parts = opening.split(':');
    if (parts.length >= 2) {
      startHour = parseInt(parts[0], 10);
      startMin = parseInt(parts[1], 10);
    }
  }

  if (closing) {
    const parts = closing.split(':');
    if (parts.length >= 2) {
      endHour = parseInt(parts[0], 10);
      endMin = parseInt(parts[1], 10);
    }
  }

  const times: string[] = [];
  let h = startHour;
  let m = startMin;

  while (h < endHour || (h === endHour && m < endMin)) {
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    times.push(timeStr);
    
    m += 30;
    if (m >= 60) {
      h += 1;
      m = 0;
    }
  }

  return times;
};
