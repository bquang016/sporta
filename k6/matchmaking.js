import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 150 },
    { duration: '30s', target: 150 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(90)<250', 'p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8387';

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/matchmaking/rooms?sportId=1`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(0.5);
}
