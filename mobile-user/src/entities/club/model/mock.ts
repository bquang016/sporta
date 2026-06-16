import { Club } from './types';

export const SPORTS_FILTERS = ['Tất cả', 'Bóng đá', 'Bóng rổ', 'Cầu lông', 'Pickle ball'];

export const MOCK_CLUBS: Club[] = [
  {
    id: '1',
    name: 'CLB Bóng Đá Phủi Sài Gòn',
    sport: 'Bóng đá',
    members: 32,
    memberLimit: 50,
    isPrivate: false,
    area: 'Bình Thạnh',
    description: 'Nơi giao lưu, kết nối các anh em đam mê đá bóng phủi tại Sài Gòn. Sân chơi cuối tuần vui vẻ.',
    canJoin: true,
    membersList: [
      'Nguyễn Hoàng Nam (Trưởng nhóm)',
      'Phạm Minh Đức',
      'Lê Hoài An',
      'Trần Quốc Bảo',
      'Vũ Minh Tuấn',
      'Nguyễn Tấn Đạt',
      'Hoàng Văn Phong',
      'Đỗ Huy Khánh',
      'Trần Gia Huy',
      'Lê Hữu Đạt'
    ]
  },
  {
    id: '2',
    name: 'Hà Nội Pickleball Club',
    sport: 'Pickle ball',
    members: 12,
    memberLimit: 20,
    isPrivate: false,
    area: 'Cầu Giấy',
    description: 'Câu lạc bộ Pickleball cho mọi lứa tuổi, tập luyện hàng tuần với huấn luyện viên phong trào.',
    canJoin: true,
    membersList: [
      'Trần Thị Bích (Trưởng nhóm)',
      'Lê Cẩm Tú',
      'Nguyễn Duy Hải',
      'Đỗ Thành Trung',
      'Vũ Thị Hồng',
      'Phan Minh Quân'
    ]
  },
  {
    id: '3',
    name: 'Cầu Lông Chiến Thần',
    sport: 'Cầu lông',
    members: 24,
    memberLimit: 30,
    isPrivate: true,
    area: 'Quận 3',
    description: 'Sân chơi cầu lông đỉnh cao, giao lưu cọ sát nâng cao trình độ. Lịch đánh tối thứ 3, 5, 7.',
    canJoin: true,
    membersList: [
      'Nguyễn Văn An (Trưởng nhóm)',
      'Trần Thị Bình',
      'Lê Văn Cường',
      'Phạm Văn Dũng',
      'Vũ Thị Hạnh',
      'Hoàng Xuân Hùng',
      'Bùi Tiến Dũng',
      'Đỗ Hoài Nam'
    ]
  },
  {
    id: '4',
    name: 'Saigon Heat Fan Club',
    sport: 'Bóng rổ',
    members: 45,
    memberLimit: 50,
    isPrivate: false,
    area: 'Quận 1',
    description: 'Cộng đồng những người yêu mến câu lạc bộ bóng rổ Saigon Heat và đam mê chơi bóng rổ phong trào.',
    canJoin: true,
    membersList: [
      'Nguyễn Văn Chiến (Trưởng nhóm)',
      'Trần Minh Hoàng',
      'Đặng Quốc Huy',
      'Bùi Anh Tuấn',
      'Phan Thanh Bình',
      'Trần Nhật Minh',
      'Võ Hoàng Yến',
      'Lê Hữu Phước'
    ]
  },
  {
    id: '5',
    name: 'Pickleball Sài Gòn Đống Đa',
    sport: 'Pickle ball',
    members: 18,
    memberLimit: 25,
    isPrivate: false,
    area: 'Đống Đa',
    description: 'Hội chơi Pickleball khu vực Đống Đa, thân thiện và chào đón cả người mới bắt đầu.',
    canJoin: true,
    membersList: [
      'Hoàng Văn Thắng (Trưởng nhóm)',
      'Phan Văn Hậu',
      'Trần Văn Tiến',
      'Nguyễn Thị Hoa',
      'Bùi Đức Phúc'
    ]
  },
  {
    id: '6',
    name: 'FC Hàng Không',
    sport: 'Bóng đá',
    members: 15,
    memberLimit: 30,
    isPrivate: false,
    area: 'Quận Tân Bình',
    description: 'Đội bóng văn phòng hàng không, giao lưu rèn luyện sức khỏe mỗi tối thứ 5 hàng tuần.',
    canJoin: true,
    membersList: [
      'Trịnh Đình Quang (Trưởng nhóm)',
      'Lê Quốc Khánh',
      'Đỗ Gia Bảo',
      'Nguyễn Minh Triết',
      'Trần Đại Nghĩa'
    ]
  },
];

export const INITIAL_JOINED_CLUBS: Club[] = [
  {
    id: '1',
    name: 'CLB Bóng Đá Phủi Sài Gòn',
    sport: 'Bóng đá',
    members: 32,
    memberLimit: 50,
    isPrivate: false,
    area: 'Bình Thạnh',
    description: 'Nơi giao lưu, kết nối các anh em đam mê đá bóng phủi tại Sài Gòn. Sân chơi cuối tuần vui vẻ.',
    joined: true,
    membersList: [
      'Nguyễn Hoàng Nam (Trưởng nhóm)',
      'Phạm Minh Đức',
      'Lê Hoài An',
      'Trần Quốc Bảo',
      'Vũ Minh Tuấn',
      'Nguyễn Tấn Đạt',
      'Hoàng Văn Phong',
      'Đỗ Huy Khánh',
      'Trần Gia Huy',
      'Lê Hữu Đạt'
    ]
  },
  {
    id: '3',
    name: 'Cầu Lông Chiến Thần',
    sport: 'Cầu lông',
    members: 24,
    memberLimit: 30,
    isPrivate: true,
    area: 'Quận 3',
    description: 'Sân chơi cầu lông đỉnh cao, giao lưu cọ sát nâng cao trình độ. Lịch đánh tối thứ 3, 5, 7.',
    joined: true,
    membersList: [
      'Nguyễn Văn An (Trưởng nhóm)',
      'Trần Thị Bình',
      'Lê Văn Cường',
      'Phạm Văn Dũng',
      'Vũ Thị Hạnh',
      'Hoàng Xuân Hùng',
      'Bùi Tiến Dũng',
      'Đỗ Hoài Nam'
    ]
  },
  {
    id: '4',
    name: 'Saigon Heat Fan Club',
    sport: 'Bóng rổ',
    members: 45,
    memberLimit: 50,
    isPrivate: false,
    area: 'Quận 1',
    description: 'Cộng đồng những người yêu mến câu lạc bộ bóng rổ Saigon Heat và đam mê chơi bóng rổ phong trào.',
    joined: true,
    membersList: [
      'Nguyễn Văn Chiến (Trưởng nhóm)',
      'Trần Minh Hoàng',
      'Đặng Quốc Huy',
      'Bùi Anh Tuấn',
      'Phan Thanh Bình',
      'Trần Nhật Minh',
      'Võ Hoàng Yến',
      'Lê Hữu Phước'
    ]
  },
];
