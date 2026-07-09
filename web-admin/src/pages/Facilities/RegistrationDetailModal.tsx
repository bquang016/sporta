import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: string | null;
}

export const RegistrationDetailModal: React.FC<RegistrationDetailModalProps> = ({ isOpen, onClose, registrationId }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && registrationId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`http://localhost:8387/api/v1/admin/registrations/${registrationId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          if (!res.ok) {
            throw new Error('Failed to fetch details');
          }
          const result = await res.json();
          setData(result);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else {
      setData(null);
    }
  }, [isOpen, registrationId]);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Chờ Duyệt</Badge>;
      case 'APPROVED': return <Badge variant="success">Đã Duyệt</Badge>;
      case 'REJECTED': return <Badge variant="error">Đã Từ Chối</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getSportNames = (sportTypesJson: string) => {
    const SPORT_NAMES_VI: Record<string, string> = {
      'football': 'Bóng đá',
      'badminton': 'Cầu lông',
      'tennis': 'Quần vợt',
      'basketball': 'Bóng rổ',
      'volleyball': 'Bóng chuyền',
      'table_tennis': 'Bóng bàn',
      'billiards': 'Bida',
      'pickleball': 'Pickleball',
      'swimming': 'Bơi lội'
    };

    try {
      const parsed = JSON.parse(sportTypesJson);
      if (Array.isArray(parsed)) {
        return parsed.map(sport => SPORT_NAMES_VI[sport.toLowerCase()] || sport).join(', ');
      }
      return SPORT_NAMES_VI[sportTypesJson.toLowerCase()] || sportTypesJson;
    } catch {
      return SPORT_NAMES_VI[sportTypesJson.toLowerCase()] || sportTypesJson;
    }
  };

  const getCourtsInfo = (courtsJson: string) => {
    try {
      const parsed = JSON.parse(courtsJson);
      if (Array.isArray(parsed)) {
        return parsed.map((c: any, index: number) => (
          <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
            <div className="font-bold text-slate-800">{c.name || `Sân con ${index + 1}`}</div>
            <div className="text-sm text-slate-600 mt-1">Đơn giá: {c.price ? `${c.price.toLocaleString()} VND/giờ` : 'Chưa cập nhật'}</div>
          </div>
        ));
      }
    } catch {}
    return <div className="text-sm text-slate-500 italic">Chưa có thông tin sân con chi tiết.</div>;
  };

  const renderVenueImages = (imagesJson: string) => {
    if (!imagesJson) return <div className="text-sm text-slate-500 italic mt-1">Không có hình ảnh sân bãi.</div>;
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {parsed.map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={img} alt={`Ảnh sân ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );
      }
    } catch {}
    return <div className="text-sm text-slate-500 italic mt-1">Không có hình ảnh sân bãi.</div>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Đăng Ký Kiểm Duyệt"
      maxWidth="3xl"
      dotColor="bg-blue-500"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
        >
          Đóng
        </button>
      }
    >
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="py-10 text-center text-red-500 font-medium">Lỗi: {error}</div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
          
          {/* Thông tin chủ sân */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-lg font-black text-slate-800">Thông Tin Cá Nhân</h4>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-medium text-xs uppercase mb-1">Họ và tên</div>
                  <div className="font-bold text-slate-800">{data.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-xs uppercase mb-1">Trạng thái</div>
                  <div>{renderStatus(data.status)}</div>
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Email</div>
                <div className="font-bold text-slate-800 break-all">{data.email}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Số CMND / CCCD</div>
                <div className="font-bold text-slate-800">{data.idNumber || 'Chưa cập nhật'}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-slate-500 font-medium text-xs uppercase">Hình Ảnh Giấy Tờ</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                  {data.idFrontImage ? (
                    <img src={data.idFrontImage} alt="Mặt trước" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Không có mặt trước</div>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                  {data.idBackImage ? (
                    <img src={data.idBackImage} alt="Mặt sau" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Không có mặt sau</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin sân bãi */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-lg font-black text-brand-emerald">Thông Tin Cơ Sở Vật Chất</h4>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Tên Cơ Sở</div>
                <div className="font-bold text-slate-800 text-base">{data.venueName}</div>
              </div>

              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Địa Chỉ</div>
                <div className="font-medium text-slate-700">
                  {data.ward}, {data.district}, {data.province}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-medium text-xs uppercase mb-1">Loại Hình Thể Thao</div>
                  <div className="font-bold text-slate-800">{data.sportTypes ? getSportNames(data.sportTypes) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-xs uppercase mb-1">Tổng Số Sân Con</div>
                  <div className="font-bold text-slate-800">{data.subCourtCount} sân</div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Mô tả</div>
                <div className="text-slate-700 text-sm italic">{data.description || 'Không có mô tả.'}</div>
              </div>

              {data.courtsJson && (
                <div>
                  <div className="text-slate-500 font-medium text-xs uppercase mb-2">Chi Tiết Sân Con</div>
                  <div className="max-h-40 overflow-y-auto matrix-scroll pr-2">
                    {getCourtsInfo(data.courtsJson)}
                  </div>
                </div>
              )}

              <div>
                <div className="text-slate-500 font-medium text-xs uppercase mb-1">Hình Ảnh Sân Bãi</div>
                {renderVenueImages(data.registrationImages)}
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </Modal>
  );
};
