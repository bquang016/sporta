import type { OwnerRevenueReportResponse } from '../types/report.types';

export const formatCurrency = (val: number = 0): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

/**
 * Xuất file Excel (.xls) định dạng HTML Spreadsheet nguyên bản
 */
export const exportToExcel = (data: OwnerRevenueReportResponse) => {
  const filename = `Bao_Cao_Doanh_Thu_${data.venueName.replace(/\s+/g, '_')}_${data.fromDate}_den_${data.toDate}.xls`;

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Báo cáo doanh thu</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        .title-header { background-color: #064E3B; color: #ffffff; font-size: 16pt; font-weight: bold; text-align: center; height: 40px; vertical-align: middle; }
        .subtitle-header { background-color: #022c22; color: #ffffff; font-size: 10pt; font-weight: bold; text-align: center; height: 24px; vertical-align: middle; }
        .info-cell { font-size: 10pt; font-weight: bold; color: #0f172a; }
        .section-header { background-color: #f1f5f9; color: #0f172a; font-size: 11pt; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; }
        .table-th { background-color: #064E3B; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #003527; }
        .td-text { font-size: 10pt; color: #0f172a; border: 1px solid #cbd5e1; }
        .td-number { font-size: 10pt; font-weight: bold; color: #0f172a; text-align: right; border: 1px solid #cbd5e1; mso-number-format:"\#\,\#\#0\\ \\"VNĐ\""; }
        .td-bold-black { font-size: 10pt; font-weight: bold; color: #000000; text-align: right; background-color: #f8fafc; border: 1px solid #cbd5e1; mso-number-format:"\#\,\#\#0\\ \\"VNĐ\""; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="5" class="title-header">SPORTA OWNER PORTAL - BÁO CÁO DOANH THU & CHỜ ĐỐI SOÁT</td>
        </tr>
        <tr>
          <td colspan="5" class="subtitle-header">HỆ THỐNG QUẢN LÝ CỤM SÂN THỂ THAO SPORTA</td>
        </tr>
        <tr><td colspan="5"></td></tr>

        <tr>
          <td class="info-cell">Cụm sân:</td>
          <td colspan="4"><b>${data.venueName}</b></td>
        </tr>
        <tr>
          <td class="info-cell">Kỳ báo cáo:</td>
          <td colspan="4">Từ <b>${data.fromDate}</b> đến <b>${data.toDate}</b></td>
        </tr>
        <tr>
          <td class="info-cell">Ngày xuất file:</td>
          <td colspan="4">${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</td>
        </tr>
        <tr><td colspan="5"></td></tr>

        <!-- SUMMARY KPI TABLE -->
        <tr>
          <td colspan="5" class="section-header">1. TỔNG QUAN CHỈ SỐ DOANH THU</td>
        </tr>
        <tr>
          <td class="table-th">Tổng Doanh Thu (GMV)</td>
          <td class="table-th">Phí Sàn Sporta (10%)</td>
          <td class="table-th">Thực Nhận Về Ví (90%)</td>
          <td class="table-th">Tổng Số Đơn Đặt</td>
          <td class="table-th">Giá Trị TB / Đơn (AOV)</td>
        </tr>
        <tr>
          <td class="td-number">${data.totalGmv}</td>
          <td class="td-bold-black">${data.commissionFee}</td>
          <td class="td-bold-black">${data.netRevenue}</td>
          <td class="td-text" style="text-align: center; font-weight: bold;">${data.totalBookings} đơn</td>
          <td class="td-number">${Math.round(data.averageOrderValue)}</td>
        </tr>
        <tr><td colspan="5"></td></tr>

        <!-- REVENUE SOURCE BREAKDOWN -->
        <tr>
          <td colspan="5" class="section-header">2. PHÂN RÃ THEO NGUỒN THU BAN ĐẦU</td>
        </tr>
        <tr>
          <td colspan="3" class="table-th">Nguồn Thu Giao Dịch</td>
          <td colspan="2" class="table-th">Doanh Thu (VNĐ)</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Đặt sân lẻ (Khách tự do đặt theo giờ)</td>
          <td colspan="2" class="td-number">${data.bookingSingleAmount}</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Đặt sân cố định (Đơn đặt lịch đều hàng tuần)</td>
          <td colspan="2" class="td-number">${data.bookingFixedAmount}</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Vé lượt (Vé xé / Ca ghép giao lưu)</td>
          <td colspan="2" class="td-number">${data.ticketSessionAmount}</td>
        </tr>
        <tr><td colspan="5"></td></tr>

        <!-- PAYMENT METHOD BREAKDOWN -->
        <tr>
          <td colspan="5" class="section-header">3. PHÂN RÃ THEO PHƯƠNG THỨC THANH TOÁN</td>
        </tr>
        <tr>
          <td colspan="3" class="table-th">Phương Thức Thanh Toán</td>
          <td colspan="2" class="table-th">Số Tiền Thu ĐC (VNĐ)</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Chuyển khoản trực tuyến / PayOS / Ngân hàng</td>
          <td colspan="2" class="td-number">${data.payosAmount}</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Ví điện tử Sporta Wallet</td>
          <td colspan="2" class="td-number">${data.walletAmount}</td>
        </tr>
        <tr>
          <td colspan="3" class="td-text">Tiền mặt thu trực tiếp tại quầy lễ tân</td>
          <td colspan="2" class="td-number">${data.cashAmount}</td>
        </tr>
        <tr><td colspan="5"></td></tr>

        <!-- DAILY TIMELINE -->
        <tr>
          <td colspan="5" class="section-header">4. DIỄN BIẾN DOANH THU CHI TIẾT THEO NGÀY</td>
        </tr>
        <tr>
          <td class="table-th">Ngày</td>
          <td class="table-th">Doanh Thu Gộp (GMV)</td>
          <td class="table-th">Phí Sàn (10%)</td>
          <td class="table-th">Thực Nhận (90%)</td>
          <td class="table-th">Số Đơn Đặt</td>
        </tr>
        ${data.dailyTimeline.map(point => `
          <tr>
            <td class="td-text" style="text-align: center; font-weight: bold;">${point.date}</td>
            <td class="td-number">${point.gmv}</td>
            <td class="td-bold-black">${point.gmv * 0.10}</td>
            <td class="td-bold-black">${point.netRevenue}</td>
            <td class="td-text" style="text-align: center;">${point.bookingCount} đơn</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Xuất Báo Cáo PDF / In Ấn Tối Ưu Hóa Tuyệt Đổi Cho Máy In Đen Trắng
 * - Toàn bộ chữ số liệu, văn bản, tiêu đề bảng đều là MÀU ĐEN TUYỀN (#0F172A / #000000)
 * - Đảm bảo máy in laser đen trắng văn phòng in ra nét căng 100%, không bị mờ hay xám chữ.
 */
export const exportToPrintablePdf = (data: OwnerRevenueReportResponse) => {
  const printWindow = window.open('', '_blank', 'width=950,height=850');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Báo cáo doanh thu - ${data.venueName}</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          color-adjust: exact !important; 
        }
        body { 
          font-family: 'Segoe UI', system-ui, Roboto, sans-serif; 
          background-color: #ffffff; 
          color: #0f172a !important; /* ALL TEXT PITCH BLACK FOR B&W PRINTERS */
          margin: 0; 
          padding: 24px; 
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* BRAND HEADER BANNER - HIGH CONTRAST DARK EMERALD + WHITE TEXT */
        .brand-header {
          background-color: #064E3B !important;
          color: #ffffff !important;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          position: relative;
          box-shadow: 0 4px 12px rgba(6, 78, 59, 0.15);
          -webkit-print-color-adjust: exact !important;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff !important;
        }
        .emerald-badge {
          background-color: #047857 !important;
          color: #ffffff !important;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.5px;
          border: 1px solid #10b981;
          -webkit-print-color-adjust: exact !important;
        }
        .brand-subtitle {
          font-size: 12px;
          color: #ffffff !important;
          font-weight: 700;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* INFO METADATA BAR */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 12px;
          -webkit-print-color-adjust: exact !important;
        }
        .info-item span { color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; display: block; }
        .info-item strong { color: #0f172a !important; font-weight: 900; font-size: 13px; }

        /* KPI STATS CARDS - PITCH BLACK NUMBERS FOR HIGH B&W PRINTER CONTRAST */
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background-color: #ffffff !important;
          border: 1.5px solid #0f172a;
          border-radius: 12px;
          padding: 14px;
          -webkit-print-color-adjust: exact !important;
        }
        .kpi-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #334155 !important;
        }
        .kpi-value {
          font-size: 20px;
          font-weight: 900;
          margin-top: 4px;
          color: #000000 !important; /* PITCH BLACK FOR CLEAR B&W PRINTING */
        }

        /* SECTION TITLES */
        .section-title {
          font-size: 13px;
          font-weight: 900;
          color: #0f172a !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 22px 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 16px;
          background-color: #064E3B !important;
          border-radius: 2px;
          -webkit-print-color-adjust: exact !important;
        }

        /* DATA TABLES - HIGH CONTRAST BLACK TEXT ON WHITE */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 20px;
          font-size: 12px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }
        th {
          background-color: #064E3B !important;
          color: #ffffff !important;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          padding: 10px 14px;
          text-align: left;
          -webkit-print-color-adjust: exact !important;
        }
        td {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          background-color: #ffffff;
          color: #0f172a !important; /* PITCH BLACK */
        }
        tr:nth-child(even) td {
          background-color: #f8fafc !important;
          -webkit-print-color-adjust: exact !important;
        }
        td.bold-black {
          color: #000000 !important;
          font-weight: 900;
        }
        .text-right { text-align: right; }
        .font-bold { font-weight: 800; }

        /* FOOTER SIGNATURE AREA */
        .footer-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .sig-box { text-align: center; width: 220px; }
        .sig-box strong { color: #0f172a !important; display: block; font-size: 13px; }
        .sig-space { height: 60px; }

        @media print {
          body { padding: 0; color: #000000 !important; }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- PRINT ACTION BUTTON -->
      <div class="no-print" style="text-align: right; margin-bottom: 16px;">
        <button onclick="window.print()" style="background-color: #064E3B; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          🖨️ In Báo Cáo Ngay / Lưu Thành File PDF
        </button>
      </div>

      <!-- BRAND HEADER BANNER -->
      <div class="brand-header">
        <div class="brand-title">
          <span>SPORTA OWNER PORTAL</span>
          <span class="emerald-badge">CHÍNH THỨC</span>
        </div>
        <div class="brand-subtitle">BÁO CÁO DOANH THU & CHỜ ĐỐI SOÁT TÀI CHÍNH</div>
      </div>

      <!-- METADATA INFO BAR -->
      <div class="info-grid">
        <div class="info-item">
          <span>Cơ sở thể thao</span>
          <strong>${data.venueName}</strong>
        </div>
        <div class="info-item">
          <span>Kỳ thống kê</span>
          <strong>Từ ${data.fromDate} đến ${data.toDate}</strong>
        </div>
        <div class="info-item">
          <span>Thời gian lập báo cáo</span>
          <strong>${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</strong>
        </div>
      </div>

      <!-- KPI GRID -->
      <div class="kpi-container">
        <div class="kpi-card">
          <div class="kpi-label">Tổng Doanh Thu Gộp (GMV)</div>
          <div class="kpi-value">${formatCurrency(data.totalGmv)}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Phí Sàn Sporta (10%)</div>
          <div class="kpi-value">${formatCurrency(data.commissionFee)}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Doanh Thu Thực Nhận (90%)</div>
          <div class="kpi-value">${formatCurrency(data.netRevenue)}</div>
        </div>
      </div>

      <!-- SECTION 1 -->
      <div class="section-title">1. Phân Rã Doanh Thu Theo Nguồn Thu</div>
      <table>
        <thead>
          <tr>
            <th>Loại Hình Đặt Sân</th>
            <th class="text-right">Doanh Thu Gộp (VNĐ)</th>
            <th class="text-right">Tỷ Lệ (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold">Đặt sân lẻ (Khách tự do)</td>
            <td class="text-right font-bold">${formatCurrency(data.bookingSingleAmount)}</td>
            <td class="text-right">${data.totalGmv > 0 ? ((data.bookingSingleAmount / data.totalGmv) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr>
            <td class="font-bold">Đặt sân cố định (Lịch đều hàng tuần)</td>
            <td class="text-right font-bold">${formatCurrency(data.bookingFixedAmount)}</td>
            <td class="text-right">${data.totalGmv > 0 ? ((data.bookingFixedAmount / data.totalGmv) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr>
            <td class="font-bold">Vé lượt (Vé xé / Ca giao lưu)</td>
            <td class="text-right font-bold">${formatCurrency(data.ticketSessionAmount)}</td>
            <td class="text-right">${data.totalGmv > 0 ? ((data.ticketSessionAmount / data.totalGmv) * 100).toFixed(1) : 0}%</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 2 -->
      <div class="section-title">2. Phân Rã Theo Phương Thức Thanh Toán</div>
      <table>
        <thead>
          <tr>
            <th>Phương Thức Thanh Toán</th>
            <th class="text-right">Số Tiền Thu Được (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chuyển khoản trực tuyến / PayOS / Ngân hàng</td>
            <td class="text-right font-bold">${formatCurrency(data.payosAmount)}</td>
          </tr>
          <tr>
            <td>Ví điện tử Sporta Wallet</td>
            <td class="text-right font-bold">${formatCurrency(data.walletAmount)}</td>
          </tr>
          <tr>
            <td>Tiền mặt thu trực tiếp tại quầy tiếp đón</td>
            <td class="text-right font-bold">${formatCurrency(data.cashAmount)}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 3 -->
      <div class="section-title">3. Diễn Biến Doanh Thu Theo Ngày</div>
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th class="text-right">Doanh Thu Gộp (GMV)</th>
            <th class="text-right">Phí Sàn (10%)</th>
            <th class="text-right">Thực Nhận (90%)</th>
            <th class="text-right">Số Đơn</th>
          </tr>
        </thead>
        <tbody>
          ${data.dailyTimeline.map(p => `
            <tr>
              <td class="font-bold">${p.date}</td>
              <td class="text-right font-bold">${formatCurrency(p.gmv)}</td>
              <td class="text-right bold-black">${formatCurrency(p.gmv * 0.10)}</td>
              <td class="text-right bold-black">${formatCurrency(p.netRevenue)}</td>
              <td class="text-right">${p.bookingCount} đơn</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- FOOTER SIGNATURES -->
      <div class="footer-section">
        <div class="sig-box">
          <strong>Người Lập Báo Cáo</strong>
          <div class="sig-space"></div>
          <div style="font-size: 11px; color: #475569;">(Ký và ghi rõ họ tên)</div>
        </div>

        <div class="sig-box">
          <strong>Đại Diện Chủ Sân</strong>
          <div class="sig-space"></div>
          <div style="font-size: 11px; color: #0f172a; font-weight: 900;">${data.venueName}</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
