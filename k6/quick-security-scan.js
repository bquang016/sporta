/**
 * Quick Security Header & Vulnerability Scanner for Sporta Platform
 * Mô phỏng các kiểm tra bảo mật tương tự OWASP ZAP Passive Scan
 */

const http = require('http');

const TARGET_HOST = 'localhost';
const TARGET_PORT = 8387;
const TARGET_PATH = '/api/v1/public/venues';

console.log(`\n🔍 Bắt đầu quét an toàn thông tin (Security Audit) tại http://${TARGET_HOST}:${TARGET_PORT}${TARGET_PATH}...\n`);

const options = {
  hostname: TARGET_HOST,
  port: TARGET_PORT,
  path: TARGET_PATH,
  method: 'GET',
};

const req = http.request(options, (res) => {
  const headers = res.headers;
  const findings = {
    high: [],
    medium: [],
    low: [],
    informational: [],
  };

  console.log(`📡 Phản hồi từ Server: HTTP ${res.statusCode}`);
  console.log('--------------------------------------------------');

  // 1. Kiểm tra High Risk: Authentication & SQL injection safety headers
  if (res.statusCode === 500) {
    findings.high.push('Server trả về lỗi 500 Unhandled Exception (Nguy cơ rò rỉ hoặc Crash)');
  }

  // 2. Kiểm tra Medium Risk: Security Headers
  // X-Frame-Options (Clickjacking)
  if (!headers['x-frame-options']) {
    findings.medium.push('Thiếu Header X-Frame-Options (Nguy cơ Clickjacking)');
  } else {
    console.log(`✅ X-Frame-Options: ${headers['x-frame-options']}`);
  }

  // X-Content-Type-Options (MIME-sniffing)
  if (!headers['x-content-type-options']) {
    findings.medium.push('Thiếu Header X-Content-Type-Options: nosniff');
  } else {
    console.log(`✅ X-Content-Type-Options: ${headers['x-content-type-options']}`);
  }

  // Content-Security-Policy (CSP)
  if (!headers['content-security-policy']) {
    findings.medium.push('Thiếu Content-Security-Policy (CSP)');
  } else {
    console.log(`✅ Content-Security-Policy: Đã được cấu hình`);
  }

  // CORS Wildcard
  if (headers['access-control-allow-origin'] === '*') {
    findings.medium.push('CORS cấu hình Wildcard (*) trên API');
  } else if (headers['access-control-allow-origin']) {
    console.log(`✅ CORS Access-Control-Allow-Origin: ${headers['access-control-allow-origin']}`);
  }

  // 3. Kiểm tra Low Risk
  if (headers['server']) {
    findings.low.push(`Server Header Fingerprint bị lộ: ${headers['server']}`);
  } else {
    console.log('✅ Server Header: Đã được ẩn an toàn');
  }

  if (!headers['strict-transport-security'] && process.env.NODE_ENV === 'production') {
    findings.low.push('Thiếu HSTS (Strict-Transport-Security)');
  }

  // 4. Kiểm tra Informational
  if (headers['cache-control']) {
    findings.informational.push(`Cache-Control: ${headers['cache-control']}`);
  }
  if (headers['date']) {
    findings.informational.push(`Server Timestamp: ${headers['date']}`);
  }

  console.log('\n==================================================');
  console.log('📊 KẾT QUẢ QUÉT BẢO MẬT (SECURITY SCAN SUMMARY):');
  console.log('==================================================');
  console.log(`🔴 High Risk (Nghiêm trọng)   : ${findings.high.length} phát hiện`);
  findings.high.forEach(f => console.log(`   - ❌ ${f}`));

  console.log(`🟠 Medium Risk (Trung bình)   : ${findings.medium.length} phát hiện`);
  findings.medium.forEach(f => console.log(`   - ⚠️ ${f}`));

  console.log(`🟡 Low Risk (Thấp)            : ${findings.low.length} phát hiện`);
  findings.low.forEach(f => console.log(`   - ℹ️ ${f}`));

  console.log(`🔵 Informational (Thông tin)  : ${findings.informational.length} ghi nhận`);
  findings.informational.forEach(f => console.log(`   - 🔍 ${f}`));

  console.log('==================================================\n');
});

req.on('error', (e) => {
  console.error(`❌ Không thể kết nối tới Server: ${e.message}`);
});

req.end();
