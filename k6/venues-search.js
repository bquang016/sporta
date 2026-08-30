import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình tải k6
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp-up lên 50 VUs
    { duration: '20s', target: 200 }, // Tăng lên 200 VUs
    { duration: '30s', target: 200 }, // Duy trì 200 VUs
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(90)<300', 'p(95)<500'], // 95% request dưới 500ms
    http_req_failed: ['rate<0.01'],                 // Tỷ lệ lỗi < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8387';

export default function () {
  const payload = JSON.stringify({
    sport: 'BADMINTON',
    province: 'Hà Nội',
    minPrice: 50000,
    maxPrice: 300000,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Test POST /api/v1/public/venues/search hoặc GET /api/v1/public/venues
  const res = http.post(`${BASE_URL}/api/v1/public/venues/search`, payload, params);

  check(res, {
    'status is 200 or 204': (r) => r.status === 200 || r.status === 204,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5); // Nghỉ 0.5s giữa các lần gửi request
}
