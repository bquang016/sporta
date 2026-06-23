export interface CourtImageDto {
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
  createdAt: string;
  updatedAt: string;
}

export interface VenueRequest {
  name: string;
  location: string;
  description: string;
}

export interface CourtResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  price: number;
  description: string;
  coverImage: string;
  openingTime: string;
  closingTime: string;
  location: string;
  sportId: number;
  sportName: string;
  venueId: string | null;
  venueName: string | null;
  rejectionReason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  detailImages: CourtImageDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CourtRequest {
  name: string;
  price: number;
  description: string;
  coverImage: string;
  openingTime: string;
  closingTime: string;
  location: string;
  sportId: number;
  venueId: string | null;
  detailImages: string[];
}
