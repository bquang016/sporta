import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 20 },
    { duration: '15s', target: 50 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(90)<250', 'p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8387';

export default function () {
  group('1. Public Venues List', () => {
    const res = http.get(`${BASE_URL}/api/v1/public/venues`);
    check(res, { 'venues status is 200': (r) => r.status === 200 });
  });

  group('2. Hybrid AI Recommendations', () => {
    const res = http.get(`${BASE_URL}/api/v1/public/venues/recommendations?sportId=1&limit=4`);
    check(res, { 'recommendations status is 200': (r) => r.status === 200 });
  });

  group('3. Public Venue Search Criteria', () => {
    const payload = JSON.stringify({
      sport: 'BADMINTON',
      province: 'Hà Nội',
    });
    const params = {
      headers: { 'Content-Type': 'application/json' },
    };
    const res = http.post(`${BASE_URL}/api/v1/public/venues/search`, payload, params);
    check(res, { 'search status is 200': (r) => r.status === 200 });
  });

  sleep(0.5);
}

