export interface VenueImageDto {
  id: number;
  imageUrl: string;
}

export interface VenueResponse {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  description: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  // TRẠNG THÁI MỚI
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  hasPendingRevision?: boolean;

  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  sport?: {
    id: number;
    name: string;
  };
  coverImage?: string;
  images?: VenueImageDto[];
  shiftDurationMinutes: number;
  
  // TÍNH NĂNG MỚI: PHỤ THU
  hasSurcharge: boolean;
  surchargeAmount?: number;
  surchargeDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface VenueRequest {
  name: string;
  location: string;
  description: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  sportId: number;
  coverImage: string;
  detailImages: string[];
  shiftDurationMinutes: number;
  
  // TÍNH NĂNG MỚI: PHỤ THU
  hasSurcharge: boolean;
  surchargeAmount?: number;
  surchargeDescription?: string;
}

export interface CourtResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  price: number;
  venueId: string;
  venueName: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

export interface CourtRequest {
  name: string;
  price: number;
  venueId: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}