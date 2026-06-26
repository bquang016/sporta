import React, { createContext, useContext, useState, useEffect } from 'react';
import { courtService } from '../features/venue/services/courtService';
import type { VenueResponse, CourtResponse } from '../features/venue/types';

export interface SimulatedBooking {
  id: string;
  courtId: string;
  courtName: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  price: number;
  status: 'CONFIRMED' | 'ACTION_REQUIRED' | 'REFUNDED' | 'POINTS_ISSUED' | 'RESCHEDULED';
  resolutionNote?: string;
}

interface OperationsContextType {
  venues: VenueResponse[];
  courts: CourtResponse[];
  bookings: SimulatedBooking[];
  selectedVenueId: string | null;
  selectedCourtIds: string[];
  loading: boolean;
  error: string | null;
  
  // Refetch
  refreshData: () => Promise<void>;
  
  // Venue Actions
  setSelectedVenueId: (id: string | null) => void;
  changeVenueStatus: (venueId: string, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => Promise<void>;
  updateVenueInfo: (id: string, name: string, location: string, description: string, openingTime: string, closingTime: string, sportId: number, coverImage: string, detailImages: string[], shiftDurationMinutes: number, latitude?: number, longitude?: number) => Promise<void>;
  createVenueInfo: (name: string, location: string, description: string, openingTime: string, closingTime: string, sportId: number, coverImage: string, detailImages: string[], shiftDurationMinutes: number, latitude?: number, longitude?: number) => Promise<void>;
  
  // Court/Facility Actions
  toggleCourtStatus: (courtId: string) => void;
  bulkToggleMaintenance: (courtIds: string[], enabled: boolean) => void;
  bulkApplySurcharge: (courtIds: string[], surchargeAmount: number) => void;
  setSelectedCourtIds: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Booking Resolution
  resolveBooking: (bookingId: string, action: 'refund' | 'points' | 'reschedule') => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [bookings, setBookings] = useState<SimulatedBooking[]>([]);
  const [selectedVenueId, setSelectedVenueIdState] = useState<string | null>(null);
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load selected venue from localStorage if exists
  const setSelectedVenueId = (id: string | null) => {
    setSelectedVenueIdState(id);
    if (id) {
      localStorage.setItem('selectedVenueId', id);
    } else {
      localStorage.removeItem('selectedVenueId');
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [fetchedVenues, fetchedCourts] = await Promise.all([
        courtService.getVenues(),
        courtService.getCourts(),
      ]);

      setVenues(fetchedVenues);
      setCourts(fetchedCourts);

      // Determine initial venue selection
      const savedVenueId = localStorage.getItem('selectedVenueId');
      if (savedVenueId && fetchedVenues.some(v => v.id === savedVenueId)) {
        setSelectedVenueIdState(savedVenueId);
      } else if (fetchedVenues.length > 0) {
        setSelectedVenueIdState(fetchedVenues[0].id);
      }

      // Generate or load mock bookings
      const savedBookings = localStorage.getItem('simulatedBookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        // Generate mock bookings based on fetched courts
        const initialBookings: SimulatedBooking[] = [];
        const customers = [
          { name: 'Nguyễn Văn Hùng', phone: '0912345678' },
          { name: 'Trần Anh Tuấn', phone: '0987654321' },
          { name: 'Lê Minh Quốc', phone: '0933445566' },
          { name: 'Phạm Thanh Sơn', phone: '0977889900' },
          { name: 'Hoàng Ngọc Lâm', phone: '0901234567' },
          { name: 'Vũ Đức Thịnh', phone: '0944556677' },
        ];
        
        const timeSlots = [
          '17:00 - 18:30',
          '18:30 - 20:00',
          '20:00 - 21:30',
          '08:00 - 09:30',
        ];

        // Format dates: Tomorrow, Day after tomorrow, and next week
        const dates: string[] = [];
        for (let i = 1; i <= 5; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          dates.push(d.toLocaleDateString('vi-VN'));
        }

        let bookingCounter = 1001;

        fetchedCourts.forEach((court) => {
          // Generate 2-3 bookings per court
          const numBookings = Math.floor(Math.random() * 2) + 2;
          for (let j = 0; j < numBookings; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            const dateStr = dates[Math.floor(Math.random() * dates.length)];
            
            initialBookings.push({
              id: `BK${bookingCounter++}`,
              courtId: court.id,
              courtName: court.name,
              customerName: customer.name,
              phoneNumber: customer.phone,
              date: dateStr,
              time: timeSlot,
              price: court.price,
              status: 'CONFIRMED',
            });
          }
        });

        setBookings(initialBookings);
        localStorage.setItem('simulatedBookings', JSON.stringify(initialBookings));
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshData = async () => {
    await loadInitialData();
  };

  // Change Venue status
  const changeVenueStatus = async (venueId: string, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
    try {
      const updatedVenue = await courtService.updateVenueStatus(venueId, status);
      
      // Update venues state
      setVenues(prev => prev.map(v => v.id === venueId ? updatedVenue : v));

      // Cascade venue status to all courts inside this venue
      const courtIdsInVenue = courts.filter(c => c.venueId === venueId).map(c => c.id);
      courtIdsInVenue.forEach(courtId => {
        localStorage.setItem(`court_op_status_${courtId}`, status);
      });
      // Force rerender courts list
      setCourts(prev => [...prev]);

      // Two-tier disable logic
      if (status === 'CLOSED') {
        // Hard Disable / Force Close: Flag all future confirmed bookings of courts in this venue as ACTION_REQUIRED
        setBookings(prev => {
          const updated = prev.map(b => {
            if (courtIdsInVenue.includes(b.courtId) && b.status === 'CONFIRMED') {
              return { ...b, status: 'ACTION_REQUIRED' as const };
            }
            return b;
          });
          localStorage.setItem('simulatedBookings', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi khi cập nhật trạng thái cụm sân');
    }
  };

  // Update Venue details
  const updateVenueInfo = async (
    id: string,
    name: string,
    location: string,
    description: string,
    openingTime: string,
    closingTime: string,
    sportId: number,
    coverImage: string,
    detailImages: string[],
    shiftDurationMinutes: number,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      const updated = await courtService.updateVenue(id, {
        name,
        location,
        description,
        openingTime,
        closingTime,
        sportId,
        coverImage,
        detailImages,
        shiftDurationMinutes,
        latitude,
        longitude
      });
      setVenues(prev => prev.map(v => v.id === id ? updated : v));
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi khi cập nhật thông tin cụm sân');
    }
  };

  // Create new Venue
  const createVenueInfo = async (
    name: string,
    location: string,
    description: string,
    openingTime: string,
    closingTime: string,
    sportId: number,
    coverImage: string,
    detailImages: string[],
    shiftDurationMinutes: number,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      const created = await courtService.createVenue({
        name,
        location,
        description,
        openingTime,
        closingTime,
        sportId,
        coverImage,
        detailImages,
        shiftDurationMinutes,
        latitude,
        longitude
      });
      setVenues(prev => [...prev, created]);
      setSelectedVenueId(created.id);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi khi tạo cụm sân mới');
    }
  };

  // Toggle court live status
  const toggleCourtStatus = (courtId: string) => {
    setCourts(prev => {
      const updated = prev.map(c => {
        if (c.id === courtId) {
          const currentMaintenance = localStorage.getItem(`court_maint_${courtId}`) === 'true';
          localStorage.setItem(`court_maint_${courtId}`, (!currentMaintenance).toString());
        }
        return c;
      });
      return [...updated];
    });
  };

  // Bulk actions toggle maintenance status
  const bulkToggleMaintenance = (courtIds: string[], enabled: boolean) => {
    courtIds.forEach(id => {
      localStorage.setItem(`court_op_status_${id}`, enabled ? 'MAINTENANCE' : 'ACTIVE');
    });
    // Force rerender
    setCourts(prev => [...prev]);
    setSelectedCourtIds([]);
  };

  // Bulk actions apply surcharge
  const bulkApplySurcharge = (courtIds: string[], surchargeAmount: number) => {
    courtIds.forEach(id => {
      localStorage.setItem(`court_surcharge_${id}`, surchargeAmount.toString());
    });
    // Force rerender
    setCourts(prev => [...prev]);
    setSelectedCourtIds([]);
  };

  // Resolve booking in the Action Required queue
  const resolveBooking = (bookingId: string, action: 'refund' | 'points' | 'reschedule') => {
    let resolutionNote = '';
    let newStatus: SimulatedBooking['status'] = 'CONFIRMED';

    switch (action) {
      case 'refund':
        newStatus = 'REFUNDED';
        resolutionNote = 'Đã hoàn tiền thành công cho khách hàng qua cổng thanh toán.';
        break;
      case 'points':
        newStatus = 'POINTS_ISSUED';
        resolutionNote = 'Đã hoàn trả 100% giá trị đặt sân dưới dạng điểm thưởng Sporta.';
        break;
      case 'reschedule':
        newStatus = 'RESCHEDULED';
        resolutionNote = 'Đã liên hệ khách hàng và dời lịch đặt sân sang ngày khả dụng khác.';
        break;
    }

    setBookings(prev => {
      const updated = prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: newStatus,
            resolutionNote,
          };
        }
        return b;
      });
      localStorage.setItem('simulatedBookings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <OperationsContext.Provider
      value={{
        venues,
        courts,
        bookings,
        selectedVenueId,
        selectedCourtIds,
        loading,
        error,
        refreshData,
        setSelectedVenueId,
        changeVenueStatus,
        updateVenueInfo,
        createVenueInfo,
        toggleCourtStatus,
        bulkToggleMaintenance,
        bulkApplySurcharge,
        setSelectedCourtIds,
        resolveBooking,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
