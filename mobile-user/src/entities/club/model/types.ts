export interface Club {
  id: string;
  name: string;
  sport: string; // 'Bóng đá' | 'Bóng rổ' | 'Cầu lông' | 'Pickle ball'
  members: number;
  memberLimit?: number;
  isPrivate?: boolean;
  area?: string; // Active area
  description: string;
  joined?: boolean;
  canJoin?: boolean;
  avatar?: string;
  coverImage?: string;
  membersList?: string[];
}
