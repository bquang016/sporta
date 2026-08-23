import React from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { Dropdown } from '../../../../components/ui/Dropdown';

export const Step4Policy = () => {
  const {
    freeCancellationHours, setFreeCancellationHours,
    lateCancellationRefundRate, setLateCancellationRefundRate,
    rainRescheduleAllowed, setRainRescheduleAllowed,
    loading
  } = useVenueWizard();

  const handleFreeCancellationChange = (val: string) => {
    const numVal = val === '' ? null : Number(val);
    setFreeCancellationHours(numVal);
  };

  const handleLateRefundChange = (val: string) => {
    const numVal = val === '' ? null : Number(val);
    setLateCancellationRefundRate(numVal);
  };

  const DefaultTag = (
    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2">
      Mặc định
    </span>
  );

  const freeCancellationOptions = [
    { value: "2", label: "Trước 2 tiếng" },
    { value: "4", label: "Trước 4 tiếng" },
    { value: "12", label: "Trước 12 tiếng", suffix: DefaultTag },
    { value: "24", label: "Trước 24 tiếng" }
  ];

  const refundRateOptions = [
    { value: "0", label: "0% (Không hoàn tiền)" },
    { value: "30", label: "30%" },
    { value: "50", label: "50%" },
    { value: "70", label: "70%", suffix: DefaultTag },
    { value: "100", label: "100%" }
  ];

  return (
    <div className="flex-grow overflow-y-auto px-8 py-6 space-y-8 select-none max-w-4xl mx-auto w-full font-sans animate-fadeIn">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">
          Chính sách của sân
        </h3>
        <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed max-w-2xl">
          Cung cấp các quy định về việc hủy sân, hoàn tiền và hỗ trợ đổi lịch để bảo vệ quyền lợi của bạn và người chơi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Free Cancellation Timeframe */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-2xs">
          <label className="block text-sm font-black text-slate-800 mb-2">
            Khung giờ hủy sân miễn phí
          </label>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Thời gian tối thiểu người chơi phải báo trước để được hủy sân mà không mất phí.
          </p>
          <Dropdown
            options={freeCancellationOptions}
            value={freeCancellationHours === null ? '12' : String(freeCancellationHours)}
            onChange={handleFreeCancellationChange}
            disabled={loading}
            placeholder="Chọn thời gian"
            className="w-full text-xs font-bold text-slate-700 rounded-xl"
          />
        </div>

        {/* Late Cancellation Refund Rate */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-2xs">
          <label className="block text-sm font-black text-slate-800 mb-2">
            Tỷ lệ hoàn tiền khi hủy cận giờ
          </label>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Mức % số tiền sẽ hoàn lại cho khách nếu họ hủy sân sau khung giờ miễn phí.
          </p>
          <Dropdown
            options={refundRateOptions}
            value={lateCancellationRefundRate === null ? '70' : String(lateCancellationRefundRate)}
            onChange={handleLateRefundChange}
            disabled={loading}
            placeholder="Chọn tỷ lệ hoàn tiền"
            className="w-full text-xs font-bold text-slate-700 rounded-xl"
          />
        </div>
        
        {/* Weather Reschedule Policy */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-1">
              Hỗ trợ đổi lịch khi trời mưa
            </label>
            <p className="text-[11px] text-slate-500 font-medium max-w-xl">
              Cho phép người chơi đổi lịch sang khung giờ khác (phụ thuộc vào tình trạng sân trống) nếu thời tiết xấu không thể thi đấu.
            </p>
          </div>
          
          <div className="shrink-0 pt-2 md:pt-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={rainRescheduleAllowed ?? true}
                onChange={(e) => setRainRescheduleAllowed(e.target.checked)}
                disabled={loading}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-emerald/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-emerald"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
