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
