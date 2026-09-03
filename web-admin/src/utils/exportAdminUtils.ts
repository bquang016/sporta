export const formatCurrency = (val: number = 0): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

/**
 * Xuất file Excel (.xls) định dạng HTML Spreadsheet nguyên bản cho Admin
 */
export const exportTransactionsToExcel = (transactions: any[]) => {
  const filename = `Bao_Cao_Giao_Dich_Sporta_Admin_${new Date().toISOString().split('T')[0]}.xls`;

  let totalGmv = 0;
  let totalCommission = 0;
  let totalOwner = 0;

  transactions.forEach((tx) => {
    const comm = tx.commissionAmount ?? Math.round(tx.amount * 0.10);
    const owner = tx.ownerAmount ?? (tx.amount - comm);
    totalGmv += tx.amount || 0;
    totalCommission += comm;
    totalOwner += owner;
  });

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Đối soát giao dịch Admin</x:Name>
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
        .badge-success { background-color: #f8fafc; color: #0f172a; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="10" class="title-header">SPORTA ADMIN MANAGEMENT PORTAL - BÁO CÁO ĐỐI SOÁT GIAO DỊCH SÀN</td>
        </tr>
        <tr>
          <td colspan="10" class="subtitle-header">HỆ THỐNG QUẢN TRỊ NỀN TẢNG THỂ THAO SPORTA VIỆT NAM</td>
        </tr>
        <tr><td colspan="10"></td></tr>

        <tr>
          <td class="info-cell">Ngày xuất báo cáo:</td>
          <td colspan="9"><b>${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</b></td>
        </tr>
        <tr>
          <td class="info-cell">Tổng giao dịch:</td>
          <td colspan="9"><b>${transactions.length} giao dịch</b></td>
        </tr>
        <tr><td colspan="10"></td></tr>

        <!-- SUMMARY STATS -->
        <tr>
          <td colspan="10" class="section-header">1. TỔNG QUAN CHỈ SỐ DOANH THU SÀN</td>
        </tr>
        <tr>
          <td colspan="3" class="table-th">Tổng Doanh Thu GMV</td>
          <td colspan="4" class="table-th">Tổng Hoa Hồng Sàn Thực Thu (10%)</td>
          <td colspan="3" class="table-th">Tổng Doanh Thu Chủ Sân (90%)</td>
        </tr>
        <tr>
          <td colspan="3" class="td-number" style="font-size: 12pt; text-align: center;">${totalGmv}</td>
          <td colspan="4" class="td-bold-black" style="font-size: 12pt; text-align: center;">${totalCommission}</td>
          <td colspan="3" class="td-bold-black" style="font-size: 12pt; text-align: center;">${totalOwner}</td>
        </tr>
        <tr><td colspan="10"></td></tr>

        <!-- TRANSACTION TABLE -->
        <tr>
          <td colspan="10" class="section-header">2. DANH SÁCH CHI TIẾT CÁC GIAO DỊCH</td>
        </tr>
        <tr>
          <td class="table-th">Mã Đơn</td>
          <td class="table-th">Khách Hàng</td>
          <td class="table-th">Số Điện Thoại</td>
          <td class="table-th">Cụm Sân & Chi Tiết</td>
          <td class="table-th">Môn Thể Thao</td>
          <td class="table-th">Ngày Chơi</td>
          <td class="table-th">Tổng Tiền (GMV)</td>
          <td class="table-th">Hoa Hồng (10%)</td>
          <td class="table-th">Chủ Sân (90%)</td>
          <td class="table-th">Trạng Thái</td>
        </tr>
        ${transactions.map((tx) => {
          const comm = tx.commissionAmount ?? Math.round(tx.amount * 0.10);
          const owner = tx.ownerAmount ?? (tx.amount - comm);
          return `
            <tr>
              <td class="td-text" style="font-weight: bold; text-align: center;">#${tx.id}</td>
              <td class="td-text">${tx.playerName || 'Khách lẻ'}</td>
              <td class="td-text" style="text-align: center;">${tx.playerPhone || tx.playerEmail || '-'}</td>
              <td class="td-text">${tx.facilityCluster || ''} ${tx.courtName ? `(${tx.courtName})` : ''}</td>
              <td class="td-text" style="text-align: center;">${tx.sportType || 'Khác'}</td>
              <td class="td-text" style="text-align: center;">${tx.bookingDate || ''}</td>
              <td class="td-number">${tx.amount}</td>
              <td class="td-bold-black">${comm}</td>
              <td class="td-bold-black">${owner}</td>
              <td class="badge-success">${tx.status === 'SUCCESS' ? 'Thành công' : tx.status}</td>
            </tr>
          `;
        }).join('')}
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
 * Xuất Báo Cáo PDF / In Ấn Cho Admin Tối Ưu Hóa 100% Cho Máy In Đen Trắng
 */
export const exportAdminReportPdf = (
  title: string,
  subtitle: string,
  kpis: { label: string; value: string }[],
  rows: any[]
) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=850');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          color-adjust: exact !important; 
        }
        body { 
          font-family: 'Segoe UI', system-ui, Roboto, sans-serif; 
          background-color: #ffffff; 
          color: #0f172a !important; /* PITCH BLACK FOR B&W PRINTING */
          margin: 0; 
          padding: 20px; 
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* BRAND HEADER BANNER */
        .brand-header {
          background-color: #064E3B !important;
          color: #ffffff !important;
          border-radius: 12px;
          padding: 18px 24px;
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

        /* KPI ROW */
        .kpi-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          justify-content: space-between;
        }
        .kpi-box {
          flex: 1;
          background-color: #ffffff !important;
          border: 1.5px solid #0f172a;
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          -webkit-print-color-adjust: exact !important;
        }
        .kpi-label {
          font-size: 10px;
          color: #334155 !important;
          font-weight: 800;
          text-transform: uppercase;
        }
        .kpi-val {
          font-size: 18px;
          color: #000000 !important; /* PITCH BLACK */
          font-weight: 900;
          margin-top: 4px;
        }

        /* DATA TABLE */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 20px;
          font-size: 11px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }
        th {
          background-color: #064E3B !important;
          color: #ffffff !important;
          font-weight: 800;
          font-size: 10px;
          text-transform: uppercase;
          padding: 8px 10px;
          text-align: left;
          -webkit-print-color-adjust: exact !important;
        }
        td {
          padding: 8px 10px;
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

        /* FOOTER */
        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 2px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #475569;
        }
        .footer strong { color: #0f172a !important; }

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
      <div class="no-print" style="text-align: right; margin-bottom: 14px;">
        <button onclick="window.print()" style="background-color: #064E3B; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          🖨️ In Báo Cáo Ngay / Lưu Thành File PDF
        </button>
      </div>

      <div class="brand-header">
        <div class="brand-title">
          <span>SPORTA ADMIN MANAGEMENT PORTAL</span>
          <span class="emerald-badge">HỆ THỐNG QUẢN TRỊ</span>
        </div>
        <div class="brand-subtitle">${title} — ${subtitle}</div>
      </div>

      <div class="kpi-row">
        ${kpis.map((k) => `
          <div class="kpi-box">
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-val">${k.value}</div>
          </div>
        `).join('')}
      </div>

      <table>
        <thead>
          <tr>
            <th>Mã Đơn</th>
            <th>Khách Hàng</th>
            <th>Cụm Sân & Chi Tiết</th>
            <th>Môn Thể Thao</th>
            <th>Ngày Chơi</th>
            <th class="text-right">Tổng GMV</th>
            <th class="text-right">Hoa Hồng Sàn (10%)</th>
            <th class="text-right">Chủ Sân (90%)</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="font-bold">#${r.id}</td>
              <td>${r.playerName || 'Khách lẻ'}</td>
              <td>${r.facilityCluster || ''} ${r.courtName ? `(${r.courtName})` : ''}</td>
              <td>${r.sportType || 'Khác'}</td>
              <td>${r.bookingDate || ''}</td>
              <td class="text-right font-bold">${formatCurrency(r.amount)}</td>
              <td class="text-right bold-black">${formatCurrency(r.commissionAmount ?? Math.round(r.amount * 0.10))}</td>
              <td class="text-right bold-black">${formatCurrency(r.ownerAmount ?? Math.round(r.amount * 0.90))}</td>
              <td style="color: #0f172a; font-weight: bold;">${r.status === 'SUCCESS' ? 'Thành công' : r.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div><strong>SPORTA VIỆT NAM — HỆ THỐNG QUẢN TRỊ NỀN TẢNG</strong></div>
        <div>Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</div>
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
