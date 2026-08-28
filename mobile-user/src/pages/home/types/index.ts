export interface MatchInvitation {
  id: string;
  sport: string;
  title: string;
  location: string;
  time: string;
  slots: { current: number; max: number };
  gradient: readonly [string, string];
  emoji: string;
  imageUrl?: string;
}

export interface PromoEvent {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient: readonly [string, string];
  icon: string;
  imageUrl?: string;
}
