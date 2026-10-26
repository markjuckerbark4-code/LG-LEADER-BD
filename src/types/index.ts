export interface GameCategory {
  id: string;
  name: string;
  matchFoundText: string;
  matchCount: number;
  bgGradient: string;
  badge?: string;
  imageTheme: string;
  description: string;
}

export interface PlayerEntry {
  userId: string;
  gamerName: string;
  uid: string;
  slotNo: number;
  joinedAt: string;
  teamName?: string;
}

export interface MatchResultEntry {
  playerId: string;
  gamerName: string;
  uid: string;
  position: number;
  kills: number;
  points: number;
  prizeWon: number;
}

export interface TournamentMatch {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  matchNumber: number;
  entryFee: number; // in BDT
  perKill: number; // in BDT
  totalPrize: number; // in BDT
  map: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Nexterra' | 'Iron Cage';
  matchType: 'Solo' | 'Duo' | 'Squad' | '4 VS 4' | '1 VS 1' | '1 HP Mode';
  version: 'Mobile Only' | 'All Devices';
  scheduleTime: string;
  totalSlots: number;
  joinedPlayers: PlayerEntry[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'archived';
  roomId?: string;
  roomPassword?: string;
  roomReleaseTiming?: 'now' | '10min' | '15min' | 'hidden';
  isRoomVisibleToPlayers?: boolean;
  rules: string[];
  winnerName?: string;
  winnerUid?: string;
  winnerPrize?: number;
  totalKillsWinner?: number;
  results?: MatchResultEntry[];
  cancelReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  phone: string;
  freeFireUid: string;
  depositBalance: number; // BDT
  winningBalance: number; // BDT
  matchesJoined: number;
  matchesWon: number;
  totalWonBDT: number;
  avatar: string;
  status?: 'active' | 'banned';
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'match_join' | 'match_prize' | 'diamond_topup';
  amount: number;
  method?: 'bKash' | 'Nagad' | 'Rocket';
  trxId?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  note?: string;
  evidenceNote?: string;
}

export interface DiamondPackage {
  id: string;
  title: string;
  diamonds: number;
  bonus?: number;
  priceBDT: number;
  popular?: boolean;
  category: 'direct' | 'membership' | 'special';
}

export interface TopPlayer {
  rank: number;
  name: string;
  uid: string;
  wonBDT: number;
  matches: number;
  kills: number;
  badge: string;
}

export interface WebsiteSettings {
  siteName: string;
  logoText: string;
  helplinePhone: string;
  whatsappNumber: string;
  telegramUsername: string;
  supportEmail: string;
  bKashNumber: string;
  bKashNote: string;
  nagadNumber: string;
  nagadNote: string;
  rocketNumber: string;
  rocketNote: string;
  rules: string[];
  noticeText: string;
  supportNotice: string;
}
