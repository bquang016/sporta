export interface VenueReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  content: string;
  tags?: string[];
  helpfulCount?: number;
  userRole?: string;
}

export interface VenueRule {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'primary' | 'warning' | 'info';
}

export interface GalleryPhoto {
  id: string;
  title: string;
  url: string;
  category: 'court' | 'night' | 'facility' | 'lounge';
}

export interface MembershipPackage {
  id: string;
  name: string;
  tag?: string;
  originalPrice?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface VenueServiceItem {
  id: string;
  name: string;
  icon: string;
  price: string;
  description: string;
  badge?: string;
}

export const MOCK_MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: 'pkg-1',
    name: 'Gói Cố Định Tháng',
    tag: 'Tiết kiệm 15%',
    originalPrice: '2.400.000đ',
    price: '2.040.000đ',
    period: '/ tháng (8 buổi)',
    description: 'Giữ khung giờ cố định mỗi tuần, không lo bị trùng lịch hoặc hết sân.',
    features: [
      'Giữ sân cố định 2 buổi / tuần',
      'Được bù tối đa 2 ca trong tháng',
      'Miễn phí gửi xe ô tô & xe máy',
      'Tặng 2 chai nước khoáng mỗi buổi',
    ],
    popular: true,
  },
  {
    id: 'pkg-2',
    name: 'Thẻ Hội Viên VIP Sporta',
    tag: 'Đặc quyền VIP',
    originalPrice: '4.500.000đ',
    price: '3.600.000đ',
    period: '/ 3 tháng',
    description: 'Giảm trực tiếp 20% cho tất cả các lần đặt sân trong 3 tháng.',
    features: [
      'Giảm 20% giá mọi khung giờ trong ngày',
      'Ưu tiên đặt trước 14 ngày',
      'Miễn phí mượn vợt & bóng thi đấu',
      'Tặng áo thi đấu Sporta Pro',
    ],
    popular: false,
  },
  {
    id: 'pkg-3',
    name: 'Gói Giờ Vàng (Off-Peak)',
    tag: 'Giá tốt nhất',
    price: '1.200.000đ',
    period: '/ tháng',
    description: 'Dành cho khung giờ 08:00 - 16:00 các ngày thứ 2 đến thứ 6 trong tuần.',
    features: [
      'Chơi không giới hạn số ca giờ vàng',
      'Đặt trước linh hoạt qua ứng dụng',
      'Tự do ghép kèo cùng các hội viên khác',
    ],
    popular: false,
  },
  {
    id: 'pkg-4',
    name: 'Vé Lượt Tiết Kiệm (Pack 10 Lượt)',
    tag: 'Linh hoạt',
    originalPrice: '1.800.000đ',
    price: '1.500.000đ',
    period: '/ 10 ca (Hạn 60 ngày)',
    description: 'Mua trước 10 buổi tặng 1 buổi thi đấu miễn phí, phù hợp chơi linh hoạt.',
    features: [
      'Áp dụng cho mọi khung giờ trong tuần',
      'Có thể chia sẻ lượt cho bạn bè / nhóm',
      'Hạn sử dụng dài 60 ngày',
    ],
    popular: false,
  },
];

export const MOCK_VENUE_SERVICES: VenueServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Cho thuê vợt & bóng thi đấu',
    icon: 'sports-tennis',
    price: '30.000đ - 50.000đ / buổi',
    description: 'Vợt carbon chính hãng chất lượng cao, bóng tiêu chuẩn thi đấu quốc tế.',
    badge: 'Phổ biến',
  },
  {
    id: 'srv-2',
    name: 'Căn tin & Nước giải khát mát lạnh',
    icon: 'local-cafe',
    price: '15.000đ - 35.000đ / phần',
    description: 'Đầy đủ các loại nước bù khoáng Pocari, Revive, nước ngọt, sinh tố & đồ ăn nhẹ.',
  },
  {
    id: 'srv-3',
    name: 'Phòng thay đồ & Tắm nóng lạnh',
    icon: 'shower',
    price: 'Miễn phí',
    description: 'Khu vực vệ sinh & phòng tắm sạch sẽ, nước nóng lạnh công suất lớn, có máy sấy tóc.',
    badge: 'Miễn phí',
  },
  {
    id: 'srv-4',
    name: 'Căng cước vợt lấy ngay',
    icon: 'build',
    price: '70.000đ - 120.000đ / lần',
    description: 'Máy căng điện tử 4 nút chuẩn BWF, kỹ thuật viên có chứng chỉ chuyên nghiệp.',
  },
  {
    id: 'srv-5',
    name: 'Huấn luyện viên cá nhân / Kèm nhóm',
    icon: 'sports',
    price: '250.000đ - 400.000đ / giờ',
    description: 'Đội ngũ HLV giàu kinh nghiệm đào tạo từ cơ bản đến nâng cao cho mọi lứa tuổi.',
  },
  {
    id: 'srv-6',
    name: 'Tủ locker gửi đồ thông minh',
    icon: 'lock',
    price: 'Miễn phí',
    description: 'Khóa điện tử bảo mật cao, bảo quản tư trang và đồ dùng cá nhân an toàn.',
    badge: 'Miễn phí',
  },
];

export const MOCK_VENUE_REVIEWS: VenueReview[] = [
  {
    id: 'rev-1',
    userName: 'Nguyễn Hoàng Nam',
    userAvatar: '',
    rating: 5,
    date: '2 ngày trước',
    userRole: 'Người chơi thường xuyên',
    content: 'Sân chất lượng cao, mặt sàn êm và bám tốt. Hệ thống đèn LED chống chói ban đêm rất dễ chịu cho mắt. Đặt lịch trên app Sporta xác nhận ca ngay tức thì, chủ sân nhiệt tình hỗ trợ!',
    tags: ['Mặt sân êm', 'Đèn chuẩn thi đấu', 'Chủ sân nhiệt tình'],
    helpfulCount: 24,
  },
  {
    id: 'rev-2',
    userName: 'Trần Minh Đức',
    userAvatar: '',
    rating: 5,
    date: '4 ngày trước',
    userRole: 'Trưởng CLB Smash Zone',
    content: 'Không gian thoáng mát, trần cao không bị tù túng. Bãi gửi xe ô tô & xe máy rộng rãi thoải mái. Rất thích hợp để CLB tổ chức giao lưu và giải đấu mini vào cuối tuần.',
    tags: ['Rộng rãi', 'Bãi đỗ xe tiện', 'Không gian thoáng'],
    helpfulCount: 19,
  },
  {
    id: 'rev-3',
    userName: 'Lê Quốc Tuấn',
    userAvatar: '',
    rating: 4.8,
    date: '1 tuần trước',
    userRole: 'Thành viên đã xác thực',
    content: 'Sân tiêu chuẩn thi đấu, vạch kẻ rõ ràng và sắc nét. Ghế ngồi chờ có quạt gió mát, có sẵn quầy nước giải khát tiện lợi.',
    tags: ['Chuẩn thi đấu', 'Đặt lịch nhanh'],
    helpfulCount: 12,
  },
  {
    id: 'rev-4',
    userName: 'Phạm Thuỳ Linh',
    userAvatar: '',
    rating: 5,
    date: '2 tuần trước',
    userRole: 'Thành viên đã xác thực',
    content: 'Dịch vụ tại cụm sân rất chuyên nghiệp. Phòng thay đồ sạch sẽ, thơm tho, có nước nóng lạnh đầy đủ. 10/10 điểm cho chất lượng.',
    tags: ['Dịch vụ tốt', 'Phòng thay đồ sạch'],
    helpfulCount: 15,
  },
];

export const MOCK_VENUE_RULES: VenueRule[] = [
  {
    id: 'rule-1',
    icon: 'sports-handball',
    title: 'Trang phục & Giày thể thao',
    description: 'Bắt buộc sử dụng giày thể thao chuyên dụng (đế kếp / giày cỏ nhân tạo không để lại vệt đen) để bảo vệ mặt sân.',
    badge: 'Bắt buộc',
    badgeType: 'primary',
  },
  {
    id: 'rule-2',
    icon: 'access-time-filled',
    title: 'Thời gian nhận & trả sân',
    description: 'Có mặt trước giờ thi đấu 10-15 phút để làm thủ tục nhận sân và trả sân đúng thời gian quy định của ca đặt.',
    badge: 'Đúng giờ',
    badgeType: 'info',
  },
  {
    id: 'rule-3',
    icon: 'published-with-changes',
    title: 'Chính sách hoàn / đổi lịch',
    description: 'Hỗ trợ hủy hoặc đổi lịch thi đấu miễn phí trước 4 tiếng so với giờ bắt đầu. Hoàn tiền 100% về ví Sporta.',
    badge: 'Linh hoạt',
    badgeType: 'primary',
  },
  {
    id: 'rule-4',
    icon: 'smoke-free',
    title: 'Nội quy văn minh & An toàn',
    description: 'Nghiêm cấm hút thuốc lá, sử dụng đồ uống có cồn và xả rác bừa bãi trong khuôn viên khu vực thi đấu.',
    badge: 'Nghiêm cấm',
    badgeType: 'warning',
  },
  {
    id: 'rule-5',
    icon: 'security',
    title: 'Bảo quản tư trang cá nhân',
    description: 'Quý khách vui lòng tự bảo quản đồ dùng cá nhân và tư trang có giá trị, hoặc gửi tại tủ locker an ninh.',
    badge: 'Lưu ý',
    badgeType: 'info',
  },
];

export const MOCK_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p-1',
    title: 'Góc nhìn toàn cảnh cụm sân',
    url: '',
    category: 'court',
  },
  {
    id: 'p-2',
    title: 'Mặt sàn thi đấu chống trơn trượt',
    url: '',
    category: 'court',
  },
  {
    id: 'p-3',
    title: 'Hệ thống đèn LED chống chói ban đêm',
    url: '',
    category: 'night',
  },
  {
    id: 'p-4',
    title: 'Khu vực khán đài & ghế chờ vận động viên',
    url: '',
    category: 'lounge',
  },
  {
    id: 'p-5',
    title: 'Không gian thi đấu ban đêm',
    url: '',
    category: 'night',
  },
  {
    id: 'p-6',
    title: 'Quầy dịch vụ & Căn tin nước mát',
    url: '',
    category: 'facility',
  },
];

export const MOCK_GALLERY_IMAGES = MOCK_GALLERY_PHOTOS.map(p => p.url);

export const MOCK_DEFAULT_COURTS = [
  { id: 'c-1', courtName: 'Sân 01 - Thảm PVC Cao Cấp', courtType: 'Thi đấu tiêu chuẩn', pricePerHour: 160000 },
  { id: 'c-2', courtName: 'Sân 02 - Thảm PVC Cao Cấp', courtType: 'Thi đấu tiêu chuẩn', pricePerHour: 160000 },
  { id: 'c-3', courtName: 'Sân 03 - Thảm PVC Chuẩn BWF', courtType: 'Đơn / Đôi chuyên nghiệp', pricePerHour: 180000 },
  { id: 'c-4', courtName: 'Sân 04 - Thảm PVC Chuẩn BWF', courtType: 'Đơn / Đôi chuyên nghiệp', pricePerHour: 180000 },
  { id: 'c-5', courtName: 'Sân 05 - Sân tập luyện nâng cao', courtType: 'Giao lưu / Rèn luyện', pricePerHour: 140000 },
  { id: 'c-6', courtName: 'Sân 06 - Sân tập luyện nâng cao', courtType: 'Giao lưu / Rèn luyện', pricePerHour: 140000 },
];
