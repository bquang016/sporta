export type ComplexId = 'all' | 'q7' | 'tb' | 'bt';
export type PitchStatus = 'available' | 'busy' | 'maintenance';
export type ChartPeriod = 'day' | 'quarter' | 'year';

export interface Complex {
  id: ComplexId;
  name: string;
  location: string;
}

export interface Pitch {
  id: string;
  name: string;
  type: '5v5' | '7v7' | '11v11';
  complexId: Exclude<ComplexId, 'all'>;
  status: PitchStatus;
  price: number;
}

export interface Booking {
  id: string;
  pitchName: string;
  complexId: Exclude<ComplexId, 'all'>;
  time: string;
  customerName: string;
  phone: string;
  amount: number;
  status: 'checked-in' | 'pending-checkin';
}

export interface Activity {
  id: string;
  time: string;
  message: string;
  type: 'check-in' | 'status-change' | 'system';
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface DashboardStats {
  revenue: number;
  revenueK: number;
  occupancy: number;
  activeRatio: string;
  pendingCount: number;
}
