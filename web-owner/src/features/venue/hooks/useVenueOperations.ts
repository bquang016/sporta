import React, { useState, useEffect } from 'react';
import { courtService } from '../services/courtService';
import type { VenueResponse, CourtResponse } from '../types';
import { useToast } from '../../../components/ui/Toast';

export const useVenueOperations = () => {
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats Toggle State
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('showFacilityStats');
    return saved !== 'false';
  });

  // Modal States - Create
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [venueLatitude, setVenueLatitude] = useState<number | undefined>(undefined);
  const [venueLongitude, setVenueLongitude] = useState<number | undefined>(undefined);
  const [venueDescription, setVenueDescription] = useState('');
  const [venueValidationErrors, setVenueValidationErrors] = useState<Record<string, string>>({});

  // Modal States - Edit
  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editVenueName, setEditVenueName] = useState('');
  const [editVenueLocation, setEditVenueLocation] = useState('');
  const [editVenueLatitude, setEditVenueLatitude] = useState<number | undefined>(undefined);
  const [editVenueLongitude, setEditVenueLongitude] = useState<number | undefined>(undefined);
  const [editVenueDescription, setEditVenueDescription] = useState('');

  // Modal States - Status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetVenueId, setTargetVenueId] = useState<string | null>(null);

  // 3-dot menu state (tracks which card's menu is open)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Toast
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedVenues, fetchedCourts] = await Promise.all([
        courtService.getVenues(),
        courtService.getCourts()
      ]);
      setVenues(fetchedVenues);
      setCourts(fetchedCourts);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Khong the ket noi API he thong. Vui long thu lai sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStats = () => {
    localStorage.setItem('showFacilityStats', (!showStats).toString());
    setShowStats(!showStats);
  };

  const validateVenue = (): boolean => {
    const errors: Record<string, string> = {};
    if (!venueName.trim()) errors.name = 'Ten cum san khong duoc de trong';
    if (!venueLocation.trim()) errors.location = 'Dia chi cum san khong duoc de trong';
    setVenueValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenVenueCreate = () => {
    setVenueName('');
    setVenueLocation('');
    setVenueLatitude(undefined);
    setVenueLongitude(undefined);
    setVenueDescription('');
    setVenueValidationErrors({});
    setIsVenueModalOpen(true);
  };

  const handleSubmitVenue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateVenue()) return;
    try {
      const created = await courtService.createVenue({
        name: venueName,
        location: venueLocation,
        latitude: venueLatitude,
        longitude: venueLongitude,
        description: venueDescription
      });
      setVenues(prev => [...prev, created]);
      showToast('success', 'Them cum san moi thanh cong!');
      setIsVenueModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Khong the tao cum san');
    }
  };

  const handleOpenEditVenue = (venue: VenueResponse) => {
    setEditingVenueId(venue.id);
    setEditVenueName(venue.name);
    setEditVenueLocation(venue.location);
    setEditVenueLatitude(venue.latitude);
    setEditVenueLongitude(venue.longitude);
    setEditVenueDescription(venue.description || '');
    setIsEditVenueModalOpen(true);
  };

  const handleSubmitEditVenue = async () => {
    if (!editVenueName.trim() || !editVenueLocation.trim()) {
      showToast('error', 'Vui long dien du Ten va Dia chi');
      return;
    }
    try {
      const updated = await courtService.updateVenue(editingVenueId!, {
        name: editVenueName,
        location: editVenueLocation,
        latitude: editVenueLatitude,
        longitude: editVenueLongitude,
        description: editVenueDescription,
      });
      setVenues(prev => prev.map(v => v.id === editingVenueId ? updated : v));
      showToast('success', 'Cap nhat thong tin cum san thanh cong!');
      setIsEditVenueModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Loi khi cap nhat thong tin cum san');
    }
  };

  const handleOpenStatusModal = (venueId: string) => {
    setTargetVenueId(venueId);
    setIsStatusModalOpen(true);
  };

  const handleChangeStatus = async (status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
    if (!targetVenueId) return;
    try {
      const updated = await courtService.updateVenueStatus(targetVenueId, status);
      setVenues(prev => prev.map(v => v.id === targetVenueId ? updated : v));
      setIsStatusModalOpen(false);
      const label = status === 'ACTIVE' ? 'Hoạt động' : status === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa';
      showToast('success', `Da chuyen trang thai cum san thanh: ${label}`);
    } catch (err: any) {
      showToast('error', err.message || 'Loi khi cap nhat trang thai cum san');
    }
  };

  // Calculations
  const totalVenues = venues.length;
  const totalCourts = courts.length;
  const activeCourts = courts.filter(c => c.status === 'APPROVED').length;

  return {
    venues,
    courts,
    loading,
    error,
    showStats,
    toggleStats,
    isVenueModalOpen,
    setIsVenueModalOpen,
    venueName,
    setVenueName,
    venueLocation,
    setVenueLocation,
    venueLatitude,
    setVenueLatitude,
    venueLongitude,
    setVenueLongitude,
    venueDescription,
    setVenueDescription,
    venueValidationErrors,
    isEditVenueModalOpen,
    setIsEditVenueModalOpen,
    editVenueName,
    setEditVenueName,
    editVenueLocation,
    setEditVenueLocation,
    editVenueLatitude,
    setEditVenueLatitude,
    editVenueLongitude,
    setEditVenueLongitude,
    editVenueDescription,
    setEditVenueDescription,
    isStatusModalOpen,
    setIsStatusModalOpen,
    openMenuId,
    setOpenMenuId,
    totalVenues,
    totalCourts,
    activeCourts,
    handleOpenVenueCreate,
    handleSubmitVenue,
    handleOpenEditVenue,
    handleSubmitEditVenue,
    handleOpenStatusModal,
    handleChangeStatus
  };
};
