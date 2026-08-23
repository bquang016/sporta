import React from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { getLoggedInUser } from '../../../../utils/auth';

export const ContractPreview = () => {
  const {
    name,
    location,
    province,
    district,
    ward,
    addressDetail,
    isContractSigned,
    signatureData
  } = useVenueWizard();

  const loggedInUser = getLoggedInUser();
  const ownerName = loggedInUser?.email || 'Chủ Sân Sporta'; // Fallback

  const currentDate = new Date();
  const formattedDate = `Ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;

  // Use a generated mock contract code
  const contractCode = 'HD-' + currentDate.getTime().toString().slice(-8);

  return (
    <div
      className="bg-white mx-auto max-w-3xl rounded shadow-sm border border-slate-200 min-h-[1050px] px-8 py-12 md:px-12 md:py-16 text-[15px] leading-relaxed text-slate-900 relative print:border-none print:shadow-none print:min-h-0 print:px-0 print:py-0"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="text-center mb-8">
        <h4 className="font-bold text-base uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</h4>
        <h5 className="font-bold text-sm uppercase underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</h5>
        <p className="mt-2">---o0o---</p>
      </div>

      <div className="text-center mb-8">
        <h3 className="font-bold text-lg uppercase">Hợp đồng Hợp tác Dịch vụ Nền tảng Sporta</h3>
        <p className="italic text-sm mt-1">Mã hợp đồng: {contractCode}</p>
      </div>

      <div className="space-y-5">
        <p>
          Hôm nay, {formattedDate}, tại hệ thống Sporta, hai bên gồm có:
        </p>

        <div className="space-y-1">
          <div className="font-bold uppercase underline underline-offset-2 mb-2">BÊN A (CHỦ CƠ SỞ THỂ THAO / OWNER):</div>
          <p>• Người đại diện: <strong>{ownerName}</strong></p>
          <p>• Số CCCD/CMND: <strong>[Đã xác thực trên hệ thống]</strong></p>
          <p>• Tên cụm sân: <strong>{name || '[Chưa nhập Tên sân]'}</strong></p>
          <p>• Địa chỉ kinh doanh: {addressDetail ? `${addressDetail}, ` : ''}{ward ? `${ward}, ` : ''}{district ? `${district}, ` : ''}{province || location || '[Chưa nhập Vị trí]'}</p>
        </div>

        <div className="space-y-1 mt-6">
          <div className="font-bold uppercase underline underline-offset-2 mb-2">BÊN B (ĐƠN VỊ CUNG CẤP NỀN TẢNG):</div>
          <p>• Đại diện: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ SPORTA VIỆT NAM</strong></p>
          <p>• Địa chỉ: Tòa nhà T6/08, số 39 Tôn Quang Phiệt, Phường Cổ Nhuế 2, Quận Bắc Từ Liêm, Thành phố Hà Nội</p>
          <p>• Nền tảng: Hệ thống quản lý và đặt sân trực tuyến Sporta</p>
        </div>

        <p className="mt-4 italic">Hai bên thống nhất ký kết Hợp đồng hợp tác với các điều khoản sau:</p>

        <div className="font-bold uppercase mt-6 mb-2">ĐIỀU 1: PHẠM VI HỢP TÁC</div>
        <p>1. Bên A đồng ý niêm yết và cung cấp dịch vụ cho thuê sân thể thao trên nền tảng Sporta.</p>
        <p>2. Bên B cung cấp hạ tầng công nghệ (phần mềm quản lý lịch, hệ thống đặt sân, cổng thanh toán và chăm sóc khách hàng) cho Bên A.</p>

        <div className="font-bold uppercase mt-6 mb-2">ĐIỀU 2: PHÍ DỊCH VỤ VÀ ĐỐI SOÁT TÀI CHÍNH</div>
        <p>1. <strong>Phí dịch vụ nền tảng:</strong> Bên B thu phí 5% trên tổng giá trị của mỗi giao dịch đặt sân thành công qua hệ thống.</p>
        <p>2. <strong>Chu kỳ đối soát:</strong> Thực hiện cố định vào ngày 05 và ngày 20 hàng tháng.</p>
        <p>3. <strong>Hình thức chi trả:</strong> Doanh thu sau khi trừ phí dịch vụ sẽ được chuyển vào số dư ví của Bên A trên hệ thống. Bên A có thể chủ động tạo yêu cầu rút tiền về tài khoản ngân hàng đã đăng ký. <strong>Thời gian giữa 2 lần rút tiền tối thiểu là 1 tuần.</strong></p>

        <div className="font-bold uppercase mt-6 mb-2">ĐIỀU 3: CHÍNH SÁCH VẬN HÀNH VÀ CAM KẾT</div>
        <p>1. Bên A cam kết thông tin về giá, giờ hoạt động và các chính sách do Bên A tự thiết lập trên hệ thống là chính xác và là một phần không thể tách rời của Hợp đồng này.</p>
        <p>2. Bên A chịu trách nhiệm tiếp đón khách hàng đúng lịch và đảm bảo chất lượng sân bãi.</p>
        <p>3. Sporta đóng vai trò trung gian đối soát và hỗ trợ giải quyết tranh chấp căn cứ trên dữ liệu ghi nhận tại hệ thống.</p>

        <div className="font-bold uppercase mt-6 mb-2">ĐIỀU 4: THỜI HẠN VÀ CHẤM DỨT HỢP ĐỒNG</div>
        <p>1. Hợp đồng có hiệu lực kể từ thời điểm Bên A xác thực ký kết điện tử thành công.</p>
        <p>2. Mỗi bên có quyền chấm dứt hợp đồng bằng thông báo trước 30 ngày. Bên B có quyền đơn phương tạm ngưng dịch vụ nếu phát hiện Bên A có hành vi gian lận hoặc vi phạm nghiêm trọng.</p>

        <div className="my-8 border-t border-dashed border-slate-400"></div>

        {/* Signature Block */}
        <div className="flex justify-between px-4 pb-32">
          <div className="text-center relative min-h-[150px] min-w-[200px]">
            <p className="font-bold uppercase text-base">ĐẠI DIỆN BÊN A</p>
            <p className="text-sm italic mb-2">(Xác thực ký kết điện tử bằng OTP)</p>

            {/* E-Signature Stamp */}
            {isContractSigned && signatureData && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-56 border-2 border-red-600 rounded-lg p-3 bg-white/95 shadow-sm rotate-[-3deg] animate-[stampIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" style={{ fontFamily: 'sans-serif' }}>
                <div className="border border-red-600/50 rounded p-1.5 text-center">
                  <p className="text-[10px] font-black text-red-600 tracking-widest uppercase">Đã xác thực OTP</p>
                  <p className="text-red-700 font-bold text-sm my-1.5 uppercase">{ownerName}</p>
                  <p className="text-[9px] text-red-600 font-medium">Thời gian: {new Date(signatureData.timestamp).toLocaleString('vi-VN')}</p>
                  <p className="text-[9px] text-red-600 font-medium mt-0.5">IP: {signatureData.ip}</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center min-w-[200px]">
            <p className="font-bold uppercase text-base">ĐẠI DIỆN BÊN B</p>
            <p className="text-sm italic mb-2">(Ký duyệt tự động)</p>
            <div className="mt-8 w-28 h-28 rounded-full border-[3px] border-blue-600/40 flex items-center justify-center mx-auto opacity-70" style={{ fontFamily: 'sans-serif' }}>
              <span className="text-blue-600 font-black text-2xl -rotate-12 tracking-wider">SPORTA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
