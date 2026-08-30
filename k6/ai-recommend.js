import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(90)<400', 'p(95)<600'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8387';

export default function () {
  // Test endpoint Hybrid AI Recommendations: GET /api/v1/public/venues/recommendations
  const res = http.get(`${BASE_URL}/api/v1/public/venues/recommendations?lat=21.0285&lng=105.8542&sportId=1&limit=6`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'recommendation duration < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
