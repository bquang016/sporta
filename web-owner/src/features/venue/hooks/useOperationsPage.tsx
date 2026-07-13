import React, { useState, useEffect } from 'react';
import { useOperations } from '../../../hooks/useOperationsState';
import { courtService } from '../services/courtService';
import type { CourtResponse, VenueResponse, CourtRequest } from '../types';
import { useToast } from '../../../components/ui/Toast';

export const useOperationsPage = () => {
  const { showToast } = useToast();
  const {
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
    bulkApplySurcharge,
    setSelectedCourtIds,
    resolveBooking,
    deleteVenueDraft,
  } = useOperations();

  const activeVenues = venues.filter(v => v.approvalStatus !== 'DRAFT');
  const activeVenue = activeVenues.find(v => v.id === selectedVenueId) || activeVenues[0];
  const activeVenueId = activeVenue?.id;

  // Local UI States
  const [mobileScreen, setMobileScreen] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'facilities' | 'overview' | 'tickets'>('facilities');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateVenueModalOpen, setIsCreateVenueModalOpen] = useState(false);
  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
  const [isVenueStatusModalOpen, setIsVenueStatusModalOpen] = useState(false);
  
  const [openVenueMenuId, setOpenVenueMenuId] = useState<string | null>(null);
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null);

  // Edit court form states
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOpStatus, setEditOpStatus] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');

  // States định giá phân tầng (Tiered Pricing)
  const [hasShiftPricing, setHasShiftPricing] = useState(false);
  const [shiftPrices, setShiftPrices] = useState<Record<string, string>>({});
  const [hasDayOfWeekPricing, setHasDayOfWeekPricing] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(6); // Mặc định là Thứ 7 (số 6)
  const [dayPricingType, setDayPricingType] = useState<'percentage' | 'fixed'>('percentage');
  const [dayPricingValue, setDayPricingValue] = useState<string>('');
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [configMode, setConfigMode] = useState<'shift' | 'day'>('shift');

  // --- CREATE VENUE FORM STATES ---
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueLocation, setNewVenueLocation] = useState('');
  const [newVenueLatitude, setNewVenueLatitude] = useState<number | undefined>(undefined);
  const [newVenueLongitude, setNewVenueLongitude] = useState<number | undefined>(undefined);
  const [newVenueDescription, setNewVenueDescription] = useState('');
  const [newVenueOpeningTime, setNewVenueOpeningTime] = useState('06:00');
  const [newVenueClosingTime, setNewVenueClosingTime] = useState('22:00');
  const [newVenueShiftDuration, setNewVenueShiftDuration] = useState(30);
  const [newVenueSportId, setNewVenueSportId] = useState('1');
  const [newVenueCoverImage, setNewVenueCoverImage] = useState('');
  const [newVenueDetailImages, setNewVenueDetailImages] = useState<string[]>([]);
  // THÊM: State phụ thu cho tạo mới
  const [newVenueHasSurcharge, setNewVenueHasSurcharge] = useState(false);
  const [newVenueSurchargeAmount, setNewVenueSurchargeAmount] = useState<number | undefined>(undefined);
  const [newVenueSurchargeDescription, setNewVenueSurchargeDescription] = useState('');
  
  const [uploadingNewVenueCover, setUploadingNewVenueCover] = useState(false);
  const [uploadingNewVenueDetail, setUploadingNewVenueDetail] = useState(false);



  // Bulk Surcharge states (cho Sân lẻ)
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [surchargeAmount, setSurchargeAmount] = useState('50000');
  const [surchargeCourtIds, setSurchargeCourtIds] = useState<string[]>([]);

  const [targetVenueForStatus, setTargetVenueForStatus] = useState<string | null>(null);
  const [pendingVenueStatus, setPendingVenueStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'CLOSED' | null>(null);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);

  // New Court Form
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtPrice, setNewCourtPrice] = useState('100000');
  const [newCourtStatus, setNewCourtStatus] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [newCourtValidationErrors, setNewCourtValidationErrors] = useState<Record<string, string>>({});

  const initCleanAddCourt = () => {
    setNewCourtName('');
    setNewCourtPrice('100000');
    setNewCourtStatus('ACTIVE');
    setNewCourtValidationErrors({});
  };

  const handleStartAddCourt = () => {
    initCleanAddCourt();
    setIsAddingCourt(true);
  };

  const handleCancelAddCourt = () => {
    setIsAddingCourt(false);
  };

  const validateNewCourt = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newCourtName.trim()) {
      errors.name = 'Tên sân không được để trống';
    } else if (newCourtName.length < 3) {
      errors.name = 'Tên sân phải có ít nhất 3 ký tự';
    }

    const priceNum = parseFloat(newCourtPrice);
    if (!newCourtPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Giá thuê phải là số dương lớn hơn 0';
    }

    setNewCourtValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewCourt = () => {
    if (!validateNewCourt()) {
      showToast('warning', 'Vui lòng kiểm tra lại thông tin sân');
      return;
    }
    setIsConfirmSubmitOpen(true);
  };

  const handleConfirmSubmitNewCourt = async () => {
    const payload: CourtRequest = {
      name: newCourtName,
      price: parseFloat(newCourtPrice),
      venueId: activeVenueId || '',
      status: newCourtStatus
    };

    try {
      await courtService.registerCourt(payload);
      showToast('success', 'Thêm sân mới thành công!');
      setIsAddingCourt(false);
      initCleanAddCourt();
      await refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm sân mới');
    } finally {
      setIsConfirmSubmitOpen(false);
    }
  };

  const formatVND = (amount: number) => {
    if (isNaN(amount)) return '0 VND';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
  };

  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  const hourDropdownOptions = TIME_OPTIONS.map(t => ({ value: t, label: t }));

  const opDropdownOptions = [
    { value: 'ACTIVE',      label: 'Hoạt động',  icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> },
    { value: 'MAINTENANCE', label: 'Bảo trì',     icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" /> }
  ];

  const activeCourts = courts.filter(c => c.venueId === activeVenueId);
  const filteredVenues = activeVenues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const draftVenues = venues.filter(v => v.approvalStatus === 'DRAFT');

  const venueBookings = bookings.filter(b => {
    const court = courts.find(c => c.id === b.courtId);
    return court?.venueId === activeVenueId;
  });

  const actionRequiredBookings = venueBookings.filter(b => b.status === 'ACTION_REQUIRED');
  const confirmedBookings = venueBookings.filter(b => b.status === 'CONFIRMED');
  const todayRevenue = confirmedBookings.reduce((sum, b) => sum + b.price, 0);
  const totalBookingsCount = venueBookings.length;

  const getCourtOpStatus = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    return court?.status || 'ACTIVE';
  };

  const getCourtLiveStatus = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 'MAINTENANCE';
    const charCodeSum = court.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return charCodeSum % 3 === 0 ? 'IN_USE' : 'AVAILABLE';
  };

  const getCourtOccupancy = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 45 + (charSum % 46);
  };

  const getCourtPerformanceRevenue = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const dailyBookingsCount = Math.floor(charSum % 5) + 1;
    return dailyBookingsCount * court.price;
  };

  const getCourtDetails = (court: CourtResponse) => {
    const name = court.name;
    const price = court.price;
    const surcharge = parseFloat(localStorage.getItem(`court_surcharge_${court.id}`) || '0');
    const opStatus = court.status;
    const liveStatus = getCourtLiveStatus(court);
    const occupancy = getCourtOccupancy(court);
    const performanceRevenue = getCourtPerformanceRevenue(court);
    return { name, price, surcharge, liveStatus, occupancy, performanceRevenue, isMaintenance: opStatus === 'MAINTENANCE' };
  };

  const avgOccupancy = activeCourts.length > 0
    ? Math.round(activeCourts.reduce((sum, c) => sum + getCourtOccupancy(c), 0) / activeCourts.length)
    : 0;

  const activeCount = activeCourts.filter(c => c.status === 'ACTIVE').length;
  const maintCount  = activeCourts.filter(c => c.status === 'MAINTENANCE').length;
  const closedCount = 0; 
  const totalOpCourts = activeCourts.length;

  const handleVenueStatusSelect = (newStatus: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
    setPendingVenueStatus(newStatus);
    setIsVenueStatusModalOpen(false);
    setIsConfirmStatusModalOpen(true);
  };

  const handleConfirmVenueStatusChange = async () => {
    if (!activeVenueId || !pendingVenueStatus) return;
    try {
      await changeVenueStatus(activeVenueId, pendingVenueStatus);
      showToast('success', `Đã chuyển trạng thái cụm sân thành: ${
        pendingVenueStatus === 'ACTIVE' ? 'Đang hoạt động' : pendingVenueStatus === 'MAINTENANCE' ? 'Tạm ngưng nhận khách' : 'Đóng cửa khẩn cấp'
      }.`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật trạng thái cụm sân');
    } finally {
      setPendingVenueStatus(null);
      setIsConfirmStatusModalOpen(false);
    }
  };

  const handleCancelVenueStatusChange = () => {
    setPendingVenueStatus(null);
    setIsConfirmStatusModalOpen(false);
    setIsVenueStatusModalOpen(true);
  };

  const handleOpenVenueStatusFromMenu = (venueId: string) => {
    setSelectedVenueId(venueId);
    setTargetVenueForStatus(venueId);
    setIsVenueStatusModalOpen(true);
  };

  const handleCreateVenue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newVenueName.trim() || !newVenueLocation.trim()) {
      showToast('error', 'Vui lòng điền đủ Tên và Địa chỉ cụm sân');
      return;
    }
    // Validate Surcharge
    if (newVenueHasSurcharge && (!newVenueSurchargeAmount || !newVenueSurchargeDescription.trim())) {
      showToast('error', 'Vui lòng nhập số tiền và mô tả cho Phụ thu');
      return;
    }

    try {
      await createVenueInfo(
        newVenueName,
        newVenueLocation,
        newVenueDescription,
        newVenueOpeningTime,
        newVenueClosingTime,
        parseInt(newVenueSportId),
        newVenueCoverImage,
        newVenueDetailImages,
        newVenueShiftDuration,
        newVenueLatitude,
        newVenueLongitude,
        // Gửi thông tin phụ thu xuống service
        newVenueHasSurcharge,
        newVenueSurchargeAmount,
        newVenueSurchargeDescription
      );
      setIsCreateVenueModalOpen(false);
      
      // Reset form
      setNewVenueName('');
      setNewVenueLocation('');
      setNewVenueLatitude(undefined);
      setNewVenueLongitude(undefined);
      setNewVenueDescription('');
      setNewVenueOpeningTime('06:00');
      setNewVenueClosingTime('22:00');
      setNewVenueShiftDuration(30);
      setNewVenueSportId('1');
      setNewVenueCoverImage('');
      setNewVenueDetailImages([]);
      setNewVenueHasSurcharge(false);
      setNewVenueSurchargeAmount(undefined);
      setNewVenueSurchargeDescription('');
      
      showToast('success', 'Đã tạo cụm sân mới thành công!');
      await refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi tạo cụm sân');
    }
  };

  const handleOpenEditVenue = (venueId?: string) => {
    const target = venueId ? venues.find(v => v.id === venueId) : activeVenue;
    if (!target) return;
    if (venueId) setSelectedVenueId(venueId);
    setIsEditVenueModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCourtIds(activeCourts.map(c => c.id));
    else setSelectedCourtIds([]);
  };

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtIds(prev => prev.includes(courtId) ? prev.filter(id => id !== courtId) : [...prev, courtId]);
  };

  const handleOpenBulkSurcharge = () => {
    setSurchargeCourtIds(selectedCourtIds);
    setIsSurchargeModalOpen(true);
  };

  const handleApplySurcharge = () => {
    const amt = parseFloat(surchargeAmount);
    if (isNaN(amt) || amt < 0) {
      showToast('error', 'Mức phụ thu không hợp lệ');
      return;
    }
    bulkApplySurcharge(surchargeCourtIds, amt);
    setIsSurchargeModalOpen(false);
    showToast('success', `Đã cấu hình phụ thu +${formatVND(amt)} thành công.`);
  };

  const handleOpenEditCourt = async (court: CourtResponse, mode: 'shift' | 'day') => {
    setIsBulkEdit(false);
    setConfigMode(mode);
    setEditingCourt(court);
    setEditName(court.name);
    setEditPrice(court.price.toString());
    setEditOpStatus(court.status);

    // Reset các state cấu hình
    setHasShiftPricing(mode === 'shift');
    setShiftPrices({});
    setHasDayOfWeekPricing(mode === 'day');
    setSelectedDayOfWeek(6);
    setDayPricingType('percentage');
    setDayPricingValue('');

    setIsEditModalOpen(true);

    try {
      const rules = await courtService.getCourtPriceRules(court.id);
      const shiftsMap: Record<string, string> = {};
      let hasShift = false;
      let hasDay = false;

      rules.forEach(rule => {
        if (rule.ruleType === 'SHIFT' && mode === 'shift') {
          hasShift = true;
          // Format start/end time dạng "HH:mm" từ "HH:mm:ss"
          const start = rule.startTime?.substring(0, 5) || '';
          const end = rule.endTime?.substring(0, 5) || '';
          if (start && end) {
            shiftsMap[`${start}-${end}`] = rule.customPrice?.toString() || '';
          }
        } else if (rule.ruleType === 'DAY_OF_WEEK' && mode === 'day') {
          hasDay = true;
          setSelectedDayOfWeek(rule.dayOfWeek || 6);
          if (rule.percentageModifier !== null && rule.percentageModifier !== undefined) {
            setDayPricingType('percentage');
            setDayPricingValue(rule.percentageModifier.toString());
          } else if (rule.fixedModifier !== null && rule.fixedModifier !== undefined) {
            setDayPricingType('fixed');
            setDayPricingValue(rule.fixedModifier.toString());
          }
        }
      });

      if (mode === 'shift') {
        setHasShiftPricing(hasShift);
        setShiftPrices(shiftsMap);
      } else {
        setHasDayOfWeekPricing(hasDay);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải quy tắc giá:', err);
    }
  };

  const handleOpenBulkEdit = (mode: 'shift' | 'day') => {
    if (selectedCourtIds.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một sân để cấu hình');
      return;
    }
    setIsBulkEdit(true);
    setConfigMode(mode);
    setEditingCourt(null);
    setEditName('Bulk Edit');
    
    const firstSelected = courts.find(c => c.id === selectedCourtIds[0]);
    setEditPrice(firstSelected ? firstSelected.price.toString() : '');
    setEditOpStatus('ACTIVE');

    setHasShiftPricing(mode === 'shift');
    setShiftPrices({});
    setHasDayOfWeekPricing(mode === 'day');
    setSelectedDayOfWeek(6);
    setDayPricingType('percentage');
    setDayPricingValue('');

    setIsEditModalOpen(true);
  };

  const handleSaveCourtConfig = async () => {
    // 1. Validate basic operational info only in shift mode
    let priceNum = 0;
    if (configMode === 'shift') {
      if (!isBulkEdit && !editName.trim()) {
        showToast('error', 'Tên sân không được để trống');
        return;
      }
      priceNum = parseFloat(editPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        showToast('error', 'Giá thuê sân không hợp lệ');
        return;
      }
    }

    try {
      // 2. Save Basic Court Info (only in shift mode)
      if (configMode === 'shift') {
        if (!isBulkEdit) {
          const payload: CourtRequest = {
            name: editName,
            price: priceNum,
            venueId: activeVenueId || '',
            status: editOpStatus,
          };
          await courtService.updateCourt(editingCourt!.id, payload);
        } else {
          // Cập nhật hàng loạt (Giữ nguyên tên gốc của từng sân)
          for (const courtId of selectedCourtIds) {
            const targetCourt = courts.find(c => c.id === courtId);
            if (!targetCourt) continue;
            const payload: CourtRequest = {
              name: targetCourt.name,
              price: priceNum,
              venueId: activeVenueId || '',
              status: editOpStatus,
            };
            await courtService.updateCourt(courtId, payload);
          }
        }
      }

      // 3. Save Price Rules (with merge logic to prevent deletion of rules not in mode)
      if (!isBulkEdit) {
        const courtId = editingCourt!.id;
        const existingRules = await courtService.getCourtPriceRules(courtId);
        const rulesPayload: any[] = [];

        if (configMode === 'shift') {
          // Keep existing day of week rules
          existingRules.forEach(r => {
            if (r.ruleType === 'DAY_OF_WEEK') {
              rulesPayload.push({
                ruleType: 'DAY_OF_WEEK',
                dayOfWeek: r.dayOfWeek,
                percentageModifier: r.percentageModifier,
                fixedModifier: r.fixedModifier
              });
            }
          });

          // Add new shift rules
          if (hasShiftPricing) {
            Object.entries(shiftPrices).forEach(([key, val]) => {
              const valNum = parseFloat(val);
              if (!isNaN(valNum) && valNum > 0) {
                const [start, end] = key.split('-');
                rulesPayload.push({
                  ruleType: 'SHIFT',
                  startTime: `${start}:00`,
                  endTime: `${end}:00`,
                  customPrice: valNum
                });
              }
            });
          }
        } else {
          // Keep existing shift rules
          existingRules.forEach(r => {
            if (r.ruleType === 'SHIFT') {
              rulesPayload.push({
                ruleType: 'SHIFT',
                startTime: r.startTime,
                endTime: r.endTime,
                customPrice: r.customPrice
              });
            }
          });

          // Add new day of week rules
          if (hasDayOfWeekPricing) {
            const valNum = parseFloat(dayPricingValue);
            if (!isNaN(valNum) && valNum > 0) {
              rulesPayload.push({
                ruleType: 'DAY_OF_WEEK',
                dayOfWeek: selectedDayOfWeek,
                percentageModifier: dayPricingType === 'percentage' ? valNum : null,
                fixedModifier: dayPricingType === 'fixed' ? valNum : null
              });
            }
          }
        }

        await courtService.saveCourtPriceRules(courtId, rulesPayload);
      } else {
        // Bulk Edit rules for all selected courts
        for (const courtId of selectedCourtIds) {
          const existingRules = await courtService.getCourtPriceRules(courtId);
          const rulesPayload: any[] = [];

          if (configMode === 'shift') {
            // Keep day rules
            existingRules.forEach(r => {
              if (r.ruleType === 'DAY_OF_WEEK') {
                rulesPayload.push({
                  ruleType: 'DAY_OF_WEEK',
                  dayOfWeek: r.dayOfWeek,
                  percentageModifier: r.percentageModifier,
                  fixedModifier: r.fixedModifier
                });
              }
            });

            // Add new shift rules
            if (hasShiftPricing) {
              Object.entries(shiftPrices).forEach(([key, val]) => {
                const valNum = parseFloat(val);
                if (!isNaN(valNum) && valNum > 0) {
                  const [start, end] = key.split('-');
                  rulesPayload.push({
                    ruleType: 'SHIFT',
                    startTime: `${start}:00`,
                    endTime: `${end}:00`,
                    customPrice: valNum
                  });
                }
              });
            }
          } else {
            // Keep shift rules
            existingRules.forEach(r => {
              if (r.ruleType === 'SHIFT') {
                rulesPayload.push({
                  ruleType: 'SHIFT',
                  startTime: r.startTime,
                  endTime: r.endTime,
                  customPrice: r.customPrice
                });
              }
            });

            // Add new day rules
            if (hasDayOfWeekPricing) {
              const valNum = parseFloat(dayPricingValue);
              if (!isNaN(valNum) && valNum > 0) {
                rulesPayload.push({
                  ruleType: 'DAY_OF_WEEK',
                  dayOfWeek: selectedDayOfWeek,
                  percentageModifier: dayPricingType === 'percentage' ? valNum : null,
                  fixedModifier: dayPricingType === 'fixed' ? valNum : null
                });
              }
            }
          }

          await courtService.saveCourtPriceRules(courtId, rulesPayload);
        }
      }

      await refreshData();
      setIsEditModalOpen(false);
      setSelectedCourtIds([]); // Reset selection
      showToast('success', isBulkEdit ? 'Đã cấu hình giá hàng loạt cho các sân thành công.' : 'Đã cập nhật thông tin cấu hình sân thành công.');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu thông tin cấu hình sân');
    }
  };

  const handleResolveBooking = (bookingId: string, action: 'refund' | 'points' | 'reschedule') => {
    resolveBooking(bookingId, action);
    showToast('success', `Đã hoàn tất xử lý: ${
      action === 'refund' ? 'Hoàn trả tiền' : action === 'points' ? 'Tặng điểm thưởng' : 'Chuyển lịch hẹn'
    }`);
  };

  const uploadNewVenueCoverFile = async (file: File) => {
    try {
      setUploadingNewVenueCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setNewVenueCoverImage(url);
      showToast('success', 'Tải ảnh bìa lên thành công!');
    } catch {
      showToast('error', 'Lỗi khi upload ảnh bìa');
    } finally {
      setUploadingNewVenueCover(false);
    }
  };

  const uploadNewVenueDetailFiles = async (files: FileList) => {
    try {
      setUploadingNewVenueDetail(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await courtService.uploadImage(files[i], 'court_detail');
        uploadedUrls.push(url);
      }
      setNewVenueDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Đã upload ${files.length} ảnh chi tiết!`);
    } catch {
      showToast('error', 'Lỗi khi upload ảnh chi tiết');
    } finally {
      setUploadingNewVenueDetail(false);
    }
  };
  return {
    venues,
    courts,
    bookings,
    selectedVenueId,
    selectedCourtIds,
    loading,
    error,
    refreshData,
    setSelectedVenueId,
    setSelectedCourtIds,
    
    mobileScreen,
    setMobileScreen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isQueueModalOpen,
    setIsQueueModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isCreateVenueModalOpen,
    setIsCreateVenueModalOpen,
    isEditVenueModalOpen,
    setIsEditVenueModalOpen,
    isVenueStatusModalOpen,
    setIsVenueStatusModalOpen,
    openVenueMenuId,
    setOpenVenueMenuId,

    editingCourt,
    editName,
    setEditName,
    editPrice,
    setEditPrice,
    editOpStatus,
    setEditOpStatus,

    hasShiftPricing,
    setHasShiftPricing,
    shiftPrices,
    setShiftPrice: (shiftKey: string, priceVal: string) => setShiftPrices(prev => ({ ...prev, [shiftKey]: priceVal })),
    removeShiftPrice: (shiftKey: string) => setShiftPrices(prev => {
      const next = { ...prev };
      delete next[shiftKey];
      return next;
    }),
    hasDayOfWeekPricing,
    setHasDayOfWeekPricing,
    selectedDayOfWeek,
    setSelectedDayOfWeek,
    dayPricingType,
    setDayPricingType,
    dayPricingValue,
    setDayPricingValue,
    isBulkEdit,
    configMode,
    setConfigMode,

    // Xuất state phụ thu tạo mới
    newVenueName, setNewVenueName,
    newVenueLocation, setNewVenueLocation,
    newVenueLatitude, setNewVenueLatitude,
    newVenueLongitude, setNewVenueLongitude,
    newVenueDescription, setNewVenueDescription,
    newVenueOpeningTime, setNewVenueOpeningTime,
    newVenueClosingTime, setNewVenueClosingTime,
    newVenueShiftDuration, setNewVenueShiftDuration,
    newVenueSportId, setNewVenueSportId,
    newVenueCoverImage, setNewVenueCoverImage,
    newVenueDetailImages, setNewVenueDetailImages,
    newVenueHasSurcharge, setNewVenueHasSurcharge,
    newVenueSurchargeAmount, setNewVenueSurchargeAmount,
    newVenueSurchargeDescription, setNewVenueSurchargeDescription,
    uploadingNewVenueCover, uploadingNewVenueDetail,

    isSurchargeModalOpen, setIsSurchargeModalOpen,
    surchargeAmount, setSurchargeAmount,
    surchargeCourtIds,
    
    activeVenue,
    activeVenueId,
    activeCourts,
    filteredVenues,
    draftVenues,
    deleteVenueDraft,
    venueBookings,
    actionRequiredBookings,
    confirmedBookings,
    todayRevenue,
    totalBookingsCount,
    avgOccupancy,
    activeCount, maintCount, closedCount, totalOpCourts,

    formatVND,
    hourDropdownOptions,
    opDropdownOptions,
    getCourtOpStatus,
    getCourtLiveStatus,
    getCourtOccupancy,
    getCourtPerformanceRevenue,
    getCourtDetails,

    pendingVenueStatus, setPendingVenueStatus,
    isConfirmStatusModalOpen, setIsConfirmStatusModalOpen,

    handleVenueStatusSelect,
    handleConfirmVenueStatusChange,
    handleCancelVenueStatusChange,
    handleOpenVenueStatusFromMenu,
    handleCreateVenue,
    handleOpenEditVenue,
    handleSelectAll,
    handleSelectCourt,
    handleOpenBulkSurcharge,
    handleApplySurcharge,
    handleOpenEditCourt,
    handleOpenBulkEdit,
    handleSaveCourtConfig,
    handleResolveBooking,

    isAddingCourt, setIsAddingCourt,
    newCourtName, setNewCourtName,
    newCourtPrice, setNewCourtPrice,
    newCourtStatus, setNewCourtStatus,
    isConfirmSubmitOpen, setIsConfirmSubmitOpen,
    newCourtValidationErrors,
    handleStartAddCourt, handleCancelAddCourt,
    handleSubmitNewCourt, handleConfirmSubmitNewCourt,

    uploadNewVenueCoverFile,
    uploadNewVenueDetailFiles,
    handleRemoveNewVenueDetailImage: (index: number) => setNewVenueDetailImages(prev => prev.filter((_, idx) => idx !== index)),
  };
};