export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: string;
  referenceId?: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
