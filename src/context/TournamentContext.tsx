import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GameCategory,
  TournamentMatch,
  UserProfile,
  Transaction,
  DiamondPackage,
  TopPlayer,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MATCHES,
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_DIAMONDS,
  INITIAL_TOP_PLAYERS,
  INITIAL_NOTICE,
} from '../data/initialData';

interface TournamentContextType {
  categories: GameCategory[];
  matches: TournamentMatch[];
  user: UserProfile;
  transactions: Transaction[];
  diamondPackages: DiamondPackage[];
  topPlayers: TopPlayer[];
  notice: string;
  selectedCategory: GameCategory | null;
  setSelectedCategory: (cat: GameCategory | null) => void;
  // User Actions
  joinMatch: (matchId: string, gamerName: string, uid: string) => { success: boolean; message: string };
  submitDeposit: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, trxId: string, phone: string) => { success: boolean; message: string };
  submitWithdraw: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, phone: string) => { success: boolean; message: string };
  buyDiamondTopup: (pkg: DiamondPackage, playerUid: string, method: 'bKash' | 'Nagad' | 'Rocket', trxId: string, phone: string) => { success: boolean; message: string };
  updateProfile: (data: Partial<UserProfile>) => void;
  // Admin Actions
  createMatch: (match: Omit<TournamentMatch, 'id' | 'joinedPlayers' | 'status'>) => void;
  updateMatchRoom: (matchId: string, roomId: string, roomPassword: string) => void;
  completeMatch: (matchId: string, winnerName: string, winnerUid: string, winnerPrize: number, kills: number) => void;
  deleteMatch: (matchId: string) => void;
  approveDeposit: (txId: string) => void;
  rejectDeposit: (txId: string, reason?: string) => void;
  approveWithdraw: (txId: string) => void;
  rejectWithdraw: (txId: string, reason?: string) => void;
  updateNotice: (text: string) => void;
  resetAllData: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: 'lg_leader_categories_v1',
  MATCHES: 'lg_leader_matches_v1',
  USER: 'lg_leader_user_v1',
  TRANSACTIONS: 'lg_leader_transactions_v1',
  NOTICE: 'lg_leader_notice_v1',
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<GameCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [matches, setMatches] = useState<TournamentMatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notice, setNotice] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTICE);
    return saved ? saved : INITIAL_NOTICE;
  });

  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const diamondPackages = INITIAL_DIAMONDS;
  const topPlayers = INITIAL_TOP_PLAYERS;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTICE, notice);
  }, [notice]);

  // Recalculate match counts for categories dynamically
  useEffect(() => {
    setCategories((prev) =>
      prev.map((cat) => {
        const count = matches.filter((m) => m.categoryId === cat.id && m.status !== 'cancelled').length;
        return {
          ...cat,
          matchCount: count,
          matchFoundText: count > 0 ? `${count} Match Found` : 'No Match Found',
        };
      })
    );
  }, [matches]);

  // USER ACTION: Join Match
  const joinMatch = (matchId: string, gamerName: string, uid: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return { success: false, message: 'ম্যাচ পাওয়া যায়নি!' };

    if (match.status !== 'upcoming') {
      return { success: false, message: 'এই ম্যাচটি এখন চলমান অথবা সমাপ্ত হয়েছে।' };
    }

    if (match.joinedPlayers.length >= match.totalSlots) {
      return { success: false, message: 'দুঃখিত, এই ম্যাচের সব স্লট পূর্ণ হয়ে গেছে!' };
    }

    const alreadyJoined = match.joinedPlayers.some((p) => p.userId === user.id || p.uid === uid);
    if (alreadyJoined) {
      return { success: false, message: 'আপনি ইতোমধ্যে এই ম্যাচে জয়েন করেছেন!' };
    }

    const totalBalance = user.depositBalance + user.winningBalance;
    if (totalBalance < match.entryFee) {
      return {
        success: false,
        message: `পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ৳${match.entryFee}, আপনার ব্যালেন্স ৳${totalBalance}। ওয়ালেটে টাকা এড করুন।`,
      };
    }

    // Deduct fee: first from depositBalance, then from winningBalance
    let feeRemaining = match.entryFee;
    let newDeposit = user.depositBalance;
    let newWinning = user.winningBalance;

    if (newDeposit >= feeRemaining) {
      newDeposit -= feeRemaining;
      feeRemaining = 0;
    } else {
      feeRemaining -= newDeposit;
      newDeposit = 0;
      newWinning -= feeRemaining;
    }

    // Add entry
    const newEntry = {
      userId: user.id,
      gamerName: gamerName || user.username,
      uid: uid || user.freeFireUid,
      slotNo: match.joinedPlayers.length + 1,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, joinedPlayers: [...m.joinedPlayers, newEntry] } : m))
    );

    setUser((prev) => ({
      ...prev,
      depositBalance: newDeposit,
      winningBalance: newWinning,
      matchesJoined: prev.matchesJoined + 1,
      freeFireUid: uid || prev.freeFireUid,
    }));

    if (match.entryFee > 0) {
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        userId: user.id,
        userName: user.username,
        type: 'match_join',
        amount: match.entryFee,
        status: 'approved',
        date: new Date().toLocaleString(),
        note: `Joined match: ${match.title}`,
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    return { success: true, message: 'সফলভাবে ম্যাচে জয়েন সম্পন্ন হয়েছে! রুম ডিটেলস সময়মতো চেক করুন।' };
  };

  // USER ACTION: Submit Deposit (Add Money)
  const submitDeposit = (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, trxId: string, phone: string) => {
    if (amount < 20) {
      return { success: false, message: 'সর্বনিম্ন ডিপোজিট ২০ টাকা।' };
    }
    if (!trxId || trxId.trim().length < 6) {
      return { success: false, message: 'সঠিক ট্রানজেকশন আইডি (TrxID) দিন।' };
    }
    if (!phone || phone.trim().length < 11) {
      return { success: false, message: 'সঠিক বিকাশ/নগদ নাম্বার দিন।' };
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'deposit',
      amount,
      method,
      trxId: trxId.trim().toUpperCase(),
      phone: phone.trim(),
      status: 'pending',
      date: new Date().toLocaleString(),
    };

    setTransactions((prev) => [tx, ...prev]);
    return {
      success: true,
      message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন যাচাই করে ২-৫ মিনিটের মধ্যে ব্যালেন্স যোগ করে দেবে।',
    };
  };

  // USER ACTION: Submit Withdraw
  const submitWithdraw = (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, phone: string) => {
    if (amount < 50) {
      return { success: false, message: 'সর্বনিম্ন উত্তোলন ৫০ টাকা।' };
    }
    if (user.winningBalance < amount) {
      return {
        success: false,
        message: `আপনার উইনিং ব্যালেন্স ৳${user.winningBalance}। উইনিং ব্যালেন্স থেকে টাকা তুলতে পারবেন।`,
      };
    }
    if (!phone || phone.trim().length < 11) {
      return { success: false, message: 'সঠিক বিকাশ/নগদ নাম্বার দিন।' };
    }

    // Reserve balance
    setUser((prev) => ({
      ...prev,
      winningBalance: prev.winningBalance - amount,
    }));

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'withdraw',
      amount,
      method,
      phone: phone.trim(),
      status: 'pending',
      date: new Date().toLocaleString(),
      note: `Requested cashout to ${method}: ${phone}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    return {
      success: true,
      message: `৳${amount} উত্তোলন রিকোয়েস্ট জমা হয়েছে! এডমিন দ্রুত টাকা পাঠিয়ে দেবে।`,
    };
  };

  // USER ACTION: Diamond Top-up
  const buyDiamondTopup = (
    pkg: DiamondPackage,
    playerUid: string,
    method: 'bKash' | 'Nagad' | 'Rocket',
    trxId: string,
    phone: string
  ) => {
    if (!playerUid || playerUid.length < 7) {
      return { success: false, message: 'সঠিক Free Fire Player UID দিন!' };
    }
    if (!trxId || trxId.length < 6) {
      return { success: false, message: 'সঠিক TrxID প্রদান করুন!' };
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'diamond_topup',
      amount: pkg.priceBDT,
      method,
      trxId: trxId.toUpperCase(),
      phone,
      status: 'pending',
      date: new Date().toLocaleString(),
      note: `Diamond Order: ${pkg.title} (${pkg.diamonds} Diamonds) for UID: ${playerUid}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    return {
      success: true,
      message: `${pkg.title} অর্ডার সম্পন্ন হয়েছে! এডমিন দ্রুত আপনার UID তে ডায়মন্ড টপআপ করে দিবে।`,
    };
  };

  // USER ACTION: Update Profile
  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  // ADMIN ACTION: Create Tournament Match
  const createMatch = (matchData: Omit<TournamentMatch, 'id' | 'joinedPlayers' | 'status'>) => {
    const newMatch: TournamentMatch = {
      ...matchData,
      id: `match-${Date.now()}`,
      joinedPlayers: [],
      status: 'upcoming',
    };
    setMatches((prev) => [newMatch, ...prev]);
  };

  // ADMIN ACTION: Set Room ID & Password
  const updateMatchRoom = (matchId: string, roomId: string, roomPassword: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              roomId: roomId.trim(),
              roomPassword: roomPassword.trim(),
              status: roomId ? 'ongoing' : m.status,
            }
          : m
      )
    );
  };

  // ADMIN ACTION: Complete Match & Distribute Prize
  const completeMatch = (
    matchId: string,
    winnerName: string,
    winnerUid: string,
    winnerPrize: number,
    kills: number
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed',
              winnerName,
              winnerUid,
              winnerPrize,
              totalKillsWinner: kills,
            }
          : m
      )
    );

    // If winner is current active user, credit winnings
    if (winnerUid === user.freeFireUid || winnerName.toLowerCase() === user.username.toLowerCase()) {
      setUser((prev) => ({
        ...prev,
        winningBalance: prev.winningBalance + winnerPrize,
        totalWonBDT: prev.totalWonBDT + winnerPrize,
        matchesWon: prev.matchesWon + 1,
      }));

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        userId: user.id,
        userName: user.username,
        type: 'match_prize',
        amount: winnerPrize,
        status: 'approved',
        date: new Date().toLocaleString(),
        note: `Tournament Prize Won: ৳${winnerPrize}`,
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  // ADMIN ACTION: Delete Match
  const deleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  // ADMIN ACTION: Approve Deposit
  const approveDeposit = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'approved' } : t))
    );

    // Credit to user deposit balance if matches
    if (tx.userId === user.id) {
      setUser((prev) => ({
        ...prev,
        depositBalance: prev.depositBalance + tx.amount,
      }));
    }
  };

  // ADMIN ACTION: Reject Deposit
  const rejectDeposit = (txId: string, reason = 'ভুল TrxID বা টাকা আসেনি') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  // ADMIN ACTION: Approve Withdraw
  const approveWithdraw = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'approved', note: 'টাকা পাঠিয়ে দেওয়া হয়েছে' } : t))
    );
  };

  // ADMIN ACTION: Reject Withdraw (Refunds to user winning balance)
  const rejectWithdraw = (txId: string, reason = 'নাম্বার ভুল ছিল বা ট্রানজেকশন ফেইল্ড') => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );

    if (tx.userId === user.id) {
      setUser((prev) => ({
        ...prev,
        winningBalance: prev.winningBalance + tx.amount,
      }));
    }
  };

  // ADMIN ACTION: Update Notice
  const updateNotice = (text: string) => {
    setNotice(text);
  };

  // Reset all data to defaults
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTICE);
    setCategories(INITIAL_CATEGORIES);
    setMatches(INITIAL_MATCHES);
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotice(INITIAL_NOTICE);
  };

  return (
    <TournamentContext.Provider
      value={{
        categories,
        matches,
        user,
        transactions,
        diamondPackages,
        topPlayers,
        notice,
        selectedCategory,
        setSelectedCategory,
        joinMatch,
        submitDeposit,
        submitWithdraw,
        buyDiamondTopup,
        updateProfile,
        createMatch,
        updateMatchRoom,
        completeMatch,
        deleteMatch,
        approveDeposit,
        rejectDeposit,
        approveWithdraw,
        rejectWithdraw,
        updateNotice,
        resetAllData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
