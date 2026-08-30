import React from 'react';
import type { PersonalInfo, VenueInfo } from '../types';

interface ContractPreviewProps {
  personalInfo: PersonalInfo;
  venueInfo: VenueInfo;
  isSigned: boolean;
  signatureData: { timestamp: string; ip: string } | null;
  contractCode?: string;
}

export const ContractPreview = ({
  personalInfo,
  venueInfo,
  isSigned,
  signatureData,
  contractCode: providedContractCode
}: ContractPreviewProps) => {
  const currentDate = new Date();
  const formattedDate = `Ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;

  // Use provided contract code or generate mock one
  const contractCode = providedContractCode || ('HD-' + currentDate.getTime().toString().slice(-8));

  return (
    <div
      className="bg-white mx-auto w-full max-w-3xl rounded-2xl sm:rounded shadow-sm border border-slate-200 min-h-[600px] sm:min-h-[1050px] p-4 sm:px-8 sm:py-12 md:px-12 md:py-16 text-xs sm:text-[15px] leading-relaxed text-slate-900 relative print:border-none print:shadow-none print:min-h-0 print:px-0 print:py-0 overflow-x-hidden"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h4 className="font-bold text-sm sm:text-base uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</h4>
        <h5 className="font-bold text-xs sm:text-sm uppercase underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</h5>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm">---o0o---</p>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <h3 className="font-bold text-base sm:text-lg uppercase">Hợp đồng Hợp tác Dịch vụ Nền tảng Sporta</h3>
        <p className="italic text-xs sm:text-sm mt-1">Mã hợp đồng: {contractCode}</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <p>
          Hôm nay, {formattedDate}, tại hệ thống Sporta, hai bên gồm có:
        </p>

        <div className="space-y-1">
          <div className="font-bold uppercase underline underline-offset-2 mb-2">BÊN A (CHỦ CƠ SỞ THỂ THAO / OWNER):</div>
          <p>• Người đại diện: <strong>{personalInfo.fullName || '[Chưa nhập Họ tên]'}</strong></p>
          <p>• Số CCCD/CMND: <strong>{personalInfo.idNumber || '[Chưa nhập CCCD]'}</strong></p>
          <p>• Tên cụm sân: <strong>{venueInfo.name || '[Chưa nhập Tên sân]'}</strong></p>
          <p>• Địa chỉ kinh doanh: {venueInfo.addressDetail ? `${venueInfo.addressDetail}, ` : ''}{venueInfo.ward}{venueInfo.district ? `, ${venueInfo.district}` : ''}{venueInfo.province ? `, ${venueInfo.province}` : ''}</p>
        </div>

        <div className="space-y-1 mt-4 sm:mt-6">
          <div className="font-bold uppercase underline underline-offset-2 mb-2">BÊN B (ĐƠN VỊ CUNG CẤP NỀN TẢNG):</div>
          <p>• Đại diện: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ SPORTA VIỆT NAM</strong></p>
          <p>• Địa chỉ: Tòa nhà T6/08, số 39 Tôn Quang Phiệt, Phường Cổ Nhuế 2, Quận Bắc Từ Liêm, Thành phố Hà Nội</p>
          <p>• Nền tảng: Hệ thống quản lý và đặt sân trực tuyến Sporta</p>
        </div>

        <div className="space-y-2 mt-4 sm:mt-6">
          <div className="font-bold uppercase underline underline-offset-2 mb-2">ĐIỀU KHOẢN HỢP TÁC CHÍNH:</div>
          <p>1. <strong>Quyền và Nghĩa vụ Bên A:</strong> Cung cấp thông tin sân bãi chính xác, đảm bảo chất lượng sân, tiếp nhận và phục vụ khách hàng đặt sân qua ứng dụng Sporta theo đúng khung giờ và giá niêm yết.</p>
          <p>2. <strong>Quyền và Nghĩa vụ Bên B:</strong> Cung cấp hệ thống phần mềm quản lý, tiếp thị quảng bá sân bãi, ghi nhận lịch đặt và xử lý thanh toán trực tuyến an toàn theo thỏa thuận.</p>
          <p>3. <strong>Phí dịch vụ:</strong> Mức phí đối tác và biểu phí xử lý giao dịch được áp dụng theo chính sách công bố tại thời điểm ký kết hợp đồng.</p>
          <p>4. <strong>Hiệu lực hợp đồng:</strong> Hợp đồng này được xác lập bằng phương thức điện tử, có giá trị pháp lý tương đương văn bản giấy kể từ thời điểm Bên A hoàn tất ký xác thực OTP trên hệ thống Sporta.</p>
        </div>

        <div className="my-6 sm:my-8 border-t border-dashed border-slate-400"></div>

        {/* Signature Block */}
        <div className="flex flex-col sm:flex-row justify-between gap-12 sm:gap-4 px-2 sm:px-4 pb-20 sm:pb-32">
          <div className="text-center relative min-h-[120px] sm:min-h-[150px] min-w-0 sm:min-w-[200px]">
            <p className="font-bold uppercase text-sm sm:text-base">ĐẠI DIỆN BÊN A</p>
            <p className="text-xs sm:text-sm italic mb-2">(Xác thực ký kết điện tử bằng OTP)</p>

            {/* E-Signature Stamp */}
            {isSigned && signatureData && (
              <div className="relative sm:absolute sm:top-14 left-1/2 -translate-x-1/2 w-full max-w-[240px] border-2 border-red-600 rounded-lg p-2.5 bg-white/95 shadow-sm rotate-[-2deg] mt-2 sm:mt-0" style={{ fontFamily: 'sans-serif' }}>
                <div className="border border-red-600/50 rounded p-1.5 text-center">
                  <p className="text-[10px] font-black text-red-600 tracking-widest uppercase">Đã xác thực OTP</p>
                  <p className="text-red-700 font-bold text-xs sm:text-sm my-1 uppercase">{personalInfo.fullName}</p>
                  <p className="text-[9px] text-red-600 font-medium">CCCD: {personalInfo.idNumber}</p>
                  <p className="text-[9px] text-red-600 font-medium mt-0.5">Thời gian: {new Date(signatureData.timestamp).toLocaleString('vi-VN')}</p>
                  <p className="text-[9px] text-red-600 font-medium mt-0.5">IP: {signatureData.ip}</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center min-w-0 sm:min-w-[200px]">
            <p className="font-bold uppercase text-sm sm:text-base">ĐẠI DIỆN BÊN B</p>
            <p className="text-xs sm:text-sm italic mb-2">(Ký duyệt tự động)</p>
            <div className="mt-4 sm:mt-8 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-blue-600/40 flex items-center justify-center mx-auto opacity-70" style={{ fontFamily: 'sans-serif' }}>
              <span className="text-blue-600 font-black text-xl sm:text-2xl -rotate-12 tracking-wider">SPORTA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
