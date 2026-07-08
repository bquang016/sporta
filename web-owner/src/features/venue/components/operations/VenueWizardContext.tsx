import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOperations } from '../../../../hooks/useOperationsState';
import { useToast } from '../../../../components/ui/Toast';
import type { CourtDraftDto, VenueResponse } from '../../types';

interface VenueWizardContextType {
  step: number;
  setStep: (step: number) => void;
  venueId: string | null;
  setVenueId: (id: string | null) => void;
  
  // Step 1: Basic Info
  name: string;
  setName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  province: string;
  setProvince: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  ward: string;
  setWard: (val: string) => void;
  addressDetail: string;
  setAddressDetail: (val: string) => void;
  latitude: number | undefined;
  setLatitude: (val: number | undefined) => void;
  longitude: number | undefined;
  setLongitude: (val: number | undefined) => void;
  description: string;
  setDescription: (val: string) => void;
  
  // Step 2: Facilities
  sportId: string;
  setSportId: (val: string) => void;
  courts: CourtDraftDto[];
  setCourts: React.Dispatch<React.SetStateAction<CourtDraftDto[]>>;
  
  // Step 3: Images
  coverImage: string;
  setCoverImage: (val: string) => void;
  detailImages: string[];
  setDetailImages: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Step 4: Operating & Pricing
  openingTime: string;
  setOpeningTime: (val: string) => void;
  closingTime: string;
  setClosingTime: (val: string) => void;
  shiftDurationMinutes: number;
  setShiftDurationMinutes: (val: number) => void;
  hasSurcharge: boolean;
  setHasSurcharge: (val: boolean) => void;
  surchargeAmount: number | undefined;
  setSurchargeAmount: (val: number | undefined) => void;
  surchargeDescription: string;
  setSurchargeDescription: (val: string) => void;

  // Actions
  loading: boolean;
  saveDraft: (silent?: boolean) => Promise<string | null>;
  submitForApproval: () => Promise<boolean>;
  resetWizard: () => void;
  loadFromExistingVenue: (venue: VenueResponse, venueCourts: any[]) => void;
}

const VenueWizardContext = createContext<VenueWizardContextType | undefined>(undefined);

export const useVenueWizard = () => {
  const context = useContext(VenueWizardContext);
  if (!context) {
    throw new Error('useVenueWizard must be used within a VenueWizardProvider');
  }
  return context;
};

interface VenueWizardProviderProps {
  children: React.ReactNode;
  onClose: () => void;
  initialVenue?: VenueResponse | null;
  initialCourts?: any[];
}

export const VenueWizardProvider = ({ children, onClose, initialVenue, initialCourts = [] }: VenueWizardProviderProps) => {
  const { showToast } = useToast();
  const { createVenueDraft, updateVenueDraft, submitVenueForApproval, refreshData } = useOperations();
  
  const [step, setStep] = useState(1);
  const [venueId, setVenueId] = useState<string | null>(null);
  
  // Form State variables
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  
  const [sportId, setSportId] = useState('1');
  const [courts, setCourts] = useState<CourtDraftDto[]>([]);
  
  const [coverImage, setCoverImage] = useState('');
  const [detailImages, setDetailImages] = useState<string[]>([]);
  
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [shiftDurationMinutes, setShiftDurationMinutes] = useState(60);
  const [hasSurcharge, setHasSurcharge] = useState(false);
  const [surchargeAmount, setSurchargeAmount] = useState<number | undefined>(undefined);
  const [surchargeDescription, setSurchargeDescription] = useState('');
  
  const [loading, setLoading] = useState(false);

  const resetWizard = () => {
    setStep(1);
    setVenueId(null);
    setName('');
    setLocation('');
    setProvince('');
    setDistrict('');
    setWard('');
    setAddressDetail('');
    setLatitude(undefined);
    setLongitude(undefined);
    setDescription('');
    setSportId('1');
    setCourts([]);
    setCoverImage('');
    setDetailImages([]);
    setOpeningTime('06:00');
    setClosingTime('22:00');
    setShiftDurationMinutes(60);
    setHasSurcharge(false);
    setSurchargeAmount(undefined);
    setSurchargeDescription('');
  };

  const loadFromExistingVenue = (venue: VenueResponse, venueCourts: any[]) => {
    setVenueId(venue.id);
    setName(venue.name || '');
    setLocation(venue.location || '');
    setProvince(venue.province || '');
    setDistrict(venue.district || '');
    setWard(venue.ward || '');
    setAddressDetail(venue.addressDetail || '');
    setLatitude(venue.latitude);
    setLongitude(venue.longitude);
    setDescription(venue.description || '');
    setSportId(venue.sport?.id ? String(venue.sport.id) : '1');
    setCoverImage(venue.coverImage || '');
    setDetailImages(venue.images?.map(img => img.imageUrl) || []);
    setOpeningTime(venue.openingTime?.substring(0, 5) || '06:00');
    setClosingTime(venue.closingTime?.substring(0, 5) || '22:00');
    setShiftDurationMinutes(venue.shiftDurationMinutes || 60);
    setHasSurcharge(venue.hasSurcharge || false);
    setSurchargeAmount(venue.surchargeAmount);
    setSurchargeDescription(venue.surchargeDescription || '');
    
    // Map court price rules from global store if available
    const mappedCourts: CourtDraftDto[] = venueCourts.map(c => {
      // If the courts list doesn't have rules inline, we might fetch them or map them
      return {
        id: c.id,
        name: c.name,
        price: c.price,
        status: c.status,
        priceRules: c.priceRules || []
      };
    });
    setCourts(mappedCourts);
  };

  // Load draft from localStorage on startup if available, otherwise load default
  useEffect(() => {
    const loadState = () => {
      const key = initialVenue ? `sporta_venue_draft_${initialVenue.id}` : 'sporta_venue_draft_new';
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStep(parsed.step || 1);
          setVenueId(parsed.venueId || null);
          setName(parsed.name || '');
          setLocation(parsed.location || '');
          setProvince(parsed.province || '');
          setDistrict(parsed.district || '');
          setWard(parsed.ward || '');
          setAddressDetail(parsed.addressDetail || '');
          setLatitude(parsed.latitude);
          setLongitude(parsed.longitude);
          setDescription(parsed.description || '');
          setSportId(parsed.sportId || '1');
          setCourts(parsed.courts || []);
          setCoverImage(parsed.coverImage || '');
          setDetailImages(parsed.detailImages || []);
          setOpeningTime(parsed.openingTime || '06:00');
          setClosingTime(parsed.closingTime || '22:00');
          setShiftDurationMinutes(parsed.shiftDurationMinutes || 60);
          setHasSurcharge(parsed.hasSurcharge || false);
          setSurchargeAmount(parsed.surchargeAmount);
          setSurchargeDescription(parsed.surchargeDescription || '');
          return;
        } catch (e) {
          console.error("Lỗi khi khôi phục tiến trình nháp từ localStorage:", e);
        }
      }

      if (initialVenue) {
        loadFromExistingVenue(initialVenue, initialCourts);
      } else {
        resetWizard();
      }
    };

    loadState();
  }, [initialVenue]);

  // Clean old new-draft key when a draft is persisted (gains a venueId)
  useEffect(() => {
    if (venueId) {
      localStorage.removeItem('sporta_venue_draft_new');
    }
  }, [venueId]);

  // Auto-save form state to localStorage on any modification
  useEffect(() => {
    // Avoid saving initial default empty state
    if (!name && !location && courts.length === 0 && !coverImage && detailImages.length === 0) {
      return;
    }

    const key = venueId ? `sporta_venue_draft_${venueId}` : 'sporta_venue_draft_new';
    const draftData = {
      step,
      venueId,
      name,
      location,
      province,
      district,
      ward,
      addressDetail,
      latitude,
      longitude,
      description,
      sportId,
      courts,
      coverImage,
      detailImages,
      openingTime,
      closingTime,
      shiftDurationMinutes,
      hasSurcharge,
      surchargeAmount,
      surchargeDescription
    };

    localStorage.setItem(key, JSON.stringify(draftData));
  }, [
    step,
    venueId,
    name,
    location,
    province,
    district,
    ward,
    addressDetail,
    latitude,
    longitude,
    description,
    sportId,
    courts,
    coverImage,
    detailImages,
    openingTime,
    closingTime,
    shiftDurationMinutes,
    hasSurcharge,
    surchargeAmount,
    surchargeDescription
  ]);

  const buildPayload = () => {
    return {
      name: name || 'Cụm sân chưa đặt tên',
      location,
      province,
      district,
      ward,
      addressDetail,
      latitude,
      longitude,
      description,
      openingTime: openingTime ? `${openingTime}:00` : undefined,
      closingTime: closingTime ? `${closingTime}:00` : undefined,
      shiftDurationMinutes,
      sportId: parseInt(sportId),
      coverImage,
      detailImages,
      hasSurcharge,
      surchargeAmount,
      surchargeDescription,
      courts: courts.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        status: c.status || 'ACTIVE',
        priceRules: c.priceRules?.map(r => ({
          ruleType: r.ruleType,
          startTime: r.startTime ? (r.startTime.length === 5 ? `${r.startTime}:00` : r.startTime) : undefined,
          endTime: r.endTime ? (r.endTime.length === 5 ? `${r.endTime}:00` : r.endTime) : undefined,
          customPrice: r.customPrice,
          dayOfWeek: r.dayOfWeek,
          percentageModifier: r.percentageModifier,
          fixedModifier: r.fixedModifier
        }))
      }))
    };
  };

  const saveDraft = async (silent = false) => {
    try {
      setLoading(true);
      const payload = buildPayload();
      
      let savedVenue: VenueResponse;
      if (venueId) {
        savedVenue = await updateVenueDraft(venueId, payload);
        if (!silent) showToast('success', 'Đã lưu cập nhật bản nháp thành công!');
      } else {
        // Need at least a name to create initial draft
        if (!name.trim()) {
          if (!silent) showToast('warning', 'Vui lòng nhập tên cụm sân để tạo bản nháp');
          setLoading(false);
          return null;
        }
        savedVenue = await createVenueDraft(payload);
        setVenueId(savedVenue.id);
        if (!silent) showToast('success', 'Đã tạo bản nháp cụm sân mới!');
      }
      
      await refreshData();
      setLoading(false);
      return savedVenue.id;
    } catch (err: any) {
      console.error(err);
      if (!silent) showToast('error', err.message || 'Lỗi khi lưu bản nháp');
      setLoading(false);
      return null;
    }
  };

  const submitForApproval = async () => {
    // 1. Strict validation
    if (!name.trim() || name === 'Cụm sân chưa đặt tên') {
      showToast('error', 'Vui lòng nhập tên cụm sân hợp lệ ở Bước 1');
      setStep(1);
      return false;
    }
    if (!location.trim()) {
      showToast('error', 'Vui lòng nhập địa chỉ cụm sân ở Bước 1');
      setStep(1);
      return false;
    }
    if (courts.length === 0) {
      showToast('error', 'Cụm sân phải có ít nhất 1 sân trực thuộc ở Bước 2');
      setStep(2);
      return false;
    }
    if (!coverImage) {
      showToast('error', 'Vui lòng tải lên ảnh đại diện cụm sân ở Bước 3');
      setStep(3);
      return false;
    }

    try {
      setLoading(true);
      
      // Save current draft first to ensure backend has latest data
      const currentId = await saveDraft(true);
      const targetId = venueId || currentId;
      
      if (!targetId) {
        showToast('error', 'Không tìm thấy ID cụm sân để gửi duyệt');
        setLoading(false);
        return false;
      }
      
      await submitVenueForApproval(targetId);
      showToast('success', 'Đã gửi yêu cầu duyệt cụm sân thành công! Trạng thái hiện tại: CHỜ DUYỆT');
      
      // Clear localStorage cache on submission
      localStorage.removeItem(`sporta_venue_draft_${targetId}`);
      localStorage.removeItem('sporta_venue_draft_new');
      
      await refreshData();
      setLoading(false);
      onClose();
      return true;
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Lỗi khi gửi yêu cầu duyệt cụm sân');
      setLoading(false);
      return false;
    }
  };

  return (
    <VenueWizardContext.Provider
      value={{
        step,
        setStep,
        venueId,
        setVenueId,
        name,
        setName,
        location,
        setLocation,
        province,
        setProvince,
        district,
        setDistrict,
        ward,
        setWard,
        addressDetail,
        setAddressDetail,
        latitude,
        setLatitude,
        longitude,
        setLongitude,
        description,
        setDescription,
        sportId,
        setSportId,
        courts,
        setCourts,
        coverImage,
        setCoverImage,
        detailImages,
        setDetailImages,
        openingTime,
        setOpeningTime,
        closingTime,
        setClosingTime,
        shiftDurationMinutes,
        setShiftDurationMinutes,
        hasSurcharge,
        setHasSurcharge,
        surchargeAmount,
        setSurchargeAmount,
        surchargeDescription,
        setSurchargeDescription,
        loading,
        saveDraft,
        submitForApproval,
        resetWizard,
        loadFromExistingVenue
      }}
    >
      {children}
    </VenueWizardContext.Provider>
  );
};
