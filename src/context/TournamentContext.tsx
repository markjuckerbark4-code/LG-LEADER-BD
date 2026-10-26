import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GameCategory,
  TournamentMatch,
  UserProfile,
  Transaction,
  DiamondPackage,
  TopPlayer,
  WebsiteSettings,
  MatchResultEntry,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MATCHES,
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_DIAMONDS,
  INITIAL_TOP_PLAYERS,
  INITIAL_SETTINGS,
  INITIAL_PLAYERS,
} from '../data/initialData';

interface TournamentContextType {
  categories: GameCategory[];
  matches: TournamentMatch[];
  user: UserProfile;
  players: UserProfile[];
  transactions: Transaction[];
  diamondPackages: DiamondPackage[];
  topPlayers: TopPlayer[];
  settings: WebsiteSettings;
  selectedCategory: GameCategory | null;
  setSelectedCategory: (cat: GameCategory | null) => void;

  // User Actions
  joinMatch: (matchId: string, gamerName: string, uid: string) => { success: boolean; message: string };
  submitDeposit: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, trxId: string, phone: string) => { success: boolean; message: string };
  submitWithdraw: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, phone: string) => { success: boolean; message: string };
  buyDiamondTopup: (pkg: DiamondPackage, playerUid: string, method: 'bKash' | 'Nagad' | 'Rocket', trxId: string, phone: string) => { success: boolean; message: string };
  updateProfile: (data: Partial<UserProfile>) => void;

  // Module 1: Tournament Control
  createMatch: (match: Omit<TournamentMatch, 'id' | 'joinedPlayers' | 'status'>) => void;
  editMatch: (matchId: string, updated: Partial<TournamentMatch>) => void;
  cancelMatch: (matchId: string, reason: string) => void;
  deleteMatch: (matchId: string) => void;
  archiveMatch: (matchId: string) => void;

  // Module 2: Player Management
  updatePlayerStatus: (playerId: string, status: 'active' | 'banned') => void;
  adjustPlayerBalance: (playerId: string, depositDelta: number, winningDelta: number) => void;

  // Module 3: bKash / Nagad Payment
  approveDeposit: (txId: string) => void;
  rejectDeposit: (txId: string, reason?: string) => void;
  approveWithdraw: (txId: string) => void;
  rejectWithdraw: (txId: string, reason?: string) => void;

  // Module 4: Room ID & Password
  setRoomDetailsWithTiming: (
    matchId: string,
    roomId: string,
    roomPassword: string,
    timing: 'now' | '10min' | '15min' | 'hidden',
    isVisible: boolean
  ) => void;

  // Module 5: Result Management
  publishResults: (
    matchId: string,
    results: MatchResultEntry[],
    booyahWinnerName: string,
    booyahWinnerUid: string,
    booyahPrize: number,
    totalKillsWinner: number
  ) => void;

  // Module 6: Website Settings
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;

  // Utility
  resetAllData: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: 'lg_leader_categories_v2',
  MATCHES: 'lg_leader_matches_v2',
  USER: 'lg_leader_user_v2',
  PLAYERS: 'lg_leader_players_v2',
  TRANSACTIONS: 'lg_leader_transactions_v2',
  SETTINGS: 'lg_leader_settings_v2',
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

  const [players, setPlayers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
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
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Sync matches count with categories
  useEffect(() => {
    setCategories((prev) =>
      prev.map((cat) => {
        const count = matches.filter(
          (m) => m.categoryId === cat.id && m.status !== 'cancelled' && m.status !== 'archived'
        ).length;
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

    // Update in players directory
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === user.id
          ? {
              ...p,
              depositBalance: newDeposit,
              winningBalance: newWinning,
              matchesJoined: p.matchesJoined + 1,
              freeFireUid: uid || p.freeFireUid,
            }
          : p
      )
    );

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
      evidenceNote: `User submitted from phone: ${phone}, Method: ${method}`,
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

    setUser((prev) => ({
      ...prev,
      winningBalance: prev.winningBalance - amount,
    }));

    setPlayers((prev) =>
      prev.map((p) => (p.id === user.id ? { ...p, winningBalance: p.winningBalance - amount } : p))
    );

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
    setPlayers((prev) => prev.map((p) => (p.id === user.id ? { ...p, ...data } : p)));
  };

  // ADMIN MODULE 1: TOURNAMENT CONTROL
  const createMatch = (matchData: Omit<TournamentMatch, 'id' | 'joinedPlayers' | 'status'>) => {
    const newMatch: TournamentMatch = {
      ...matchData,
      id: `match-${Date.now()}`,
      joinedPlayers: [],
      status: 'upcoming',
      roomReleaseTiming: '10min',
      isRoomVisibleToPlayers: false,
    };
    setMatches((prev) => [newMatch, ...prev]);
  };

  const editMatch = (matchId: string, updated: Partial<TournamentMatch>) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...updated } : m)));
  };

  const cancelMatch = (matchId: string, reason: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          // Refund joined players automatically if entry fee > 0
          if (m.entryFee > 0 && m.joinedPlayers.length > 0) {
            m.joinedPlayers.forEach((player) => {
              if (player.userId === user.id) {
                setUser((u) => ({ ...u, depositBalance: u.depositBalance + m.entryFee }));
              }
              setPlayers((ps) =>
                ps.map((p) =>
                  p.id === player.userId ? { ...p, depositBalance: p.depositBalance + m.entryFee } : p
                )
              );
            });
          }
          return {
            ...m,
            status: 'cancelled',
            cancelReason: reason || 'ম্যাচ বাতিল করা হয়েছে এবং এন্ট্রি ফি রিফান্ড করা হয়েছে।',
          };
        }
        return m;
      })
    );
  };

  const deleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const archiveMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'archived' } : m))
    );
  };

  // ADMIN MODULE 2: PLAYER MANAGEMENT
  const updatePlayerStatus = (playerId: string, status: 'active' | 'banned') => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, status } : p)));
    if (playerId === user.id) {
      setUser((prev) => ({ ...prev, status }));
    }
  };

  const adjustPlayerBalance = (playerId: string, depositDelta: number, winningDelta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              depositBalance: Math.max(0, p.depositBalance + depositDelta),
              winningBalance: Math.max(0, p.winningBalance + winningDelta),
            }
          : p
      )
    );

    if (playerId === user.id) {
      setUser((prev) => ({
        ...prev,
        depositBalance: Math.max(0, prev.depositBalance + depositDelta),
        winningBalance: Math.max(0, prev.winningBalance + winningDelta),
      }));
    }
  };

  // ADMIN MODULE 3: bKASH / NAGAD PAYMENT APPROVALS
  const approveDeposit = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'approved', note: 'এডমিন কর্তৃক ভেরিফাইড ও অনুমোদিত' } : t))
    );

    // Credit to user deposit balance
    if (tx.userId === user.id) {
      setUser((prev) => ({
        ...prev,
        depositBalance: prev.depositBalance + tx.amount,
      }));
    }
    setPlayers((prev) =>
      prev.map((p) => (p.id === tx.userId ? { ...p, depositBalance: p.depositBalance + tx.amount } : p))
    );
  };

  const rejectDeposit = (txId: string, reason = 'ভুল TrxID বা অ্যাকাউন্টে টাকা ক্রেডিট হয়নি') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  const approveWithdraw = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'approved', note: 'টাকা বিকাশ/নগদ একাউন্টে সফলভাবে পাঠানো হয়েছে' } : t))
    );
  };

  const rejectWithdraw = (txId: string, reason = 'নাম্বার অকার্যকর বা তথ্য অমিল থাকায় রিফান্ড করা হলো') => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );

    // Refund to user winning balance
    if (tx.userId === user.id) {
      setUser((prev) => ({
        ...prev,
        winningBalance: prev.winningBalance + tx.amount,
      }));
    }
    setPlayers((prev) =>
      prev.map((p) => (p.id === tx.userId ? { ...p, winningBalance: p.winningBalance + tx.amount } : p))
    );
  };

  // ADMIN MODULE 4: ROOM ID & PASSWORD (WITH RELEASE TIMING)
  const setRoomDetailsWithTiming = (
    matchId: string,
    roomId: string,
    roomPassword: string,
    timing: 'now' | '10min' | '15min' | 'hidden',
    isVisible: boolean
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              roomId: roomId.trim(),
              roomPassword: roomPassword.trim(),
              roomReleaseTiming: timing,
              isRoomVisibleToPlayers: isVisible,
              status: isVisible && roomId ? 'ongoing' : m.status,
            }
          : m
      )
    );
  };

  // ADMIN MODULE 5: RESULT MANAGEMENT (KILL, POSITION, POINTS, WINNER)
  const publishResults = (
    matchId: string,
    results: MatchResultEntry[],
    booyahWinnerName: string,
    booyahWinnerUid: string,
    booyahPrize: number,
    totalKillsWinner: number
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed',
              winnerName: booyahWinnerName,
              winnerUid: booyahWinnerUid,
              winnerPrize: booyahPrize,
              totalKillsWinner,
              results,
            }
          : m
      )
    );

    // Credit prizes to players in results
    results.forEach((entry) => {
      if (entry.prizeWon > 0) {
        if (entry.uid === user.freeFireUid || entry.gamerName.toLowerCase() === user.username.toLowerCase()) {
          setUser((u) => ({
            ...u,
            winningBalance: u.winningBalance + entry.prizeWon,
            totalWonBDT: u.totalWonBDT + entry.prizeWon,
            matchesWon: entry.position === 1 ? u.matchesWon + 1 : u.matchesWon,
          }));

          const tx: Transaction = {
            id: `tx-${Date.now()}-${entry.uid}`,
            userId: user.id,
            userName: user.username,
            type: 'match_prize',
            amount: entry.prizeWon,
            status: 'approved',
            date: new Date().toLocaleString(),
            note: `Tournament Prize: Rank #${entry.position}, ${entry.kills} Kills (${entry.points} Pts)`,
          };
          setTransactions((prev) => [tx, ...prev]);
        }

        setPlayers((ps) =>
          ps.map((p) =>
            p.freeFireUid === entry.uid
              ? {
                  ...p,
                  winningBalance: p.winningBalance + entry.prizeWon,
                  totalWonBDT: p.totalWonBDT + entry.prizeWon,
                  matchesWon: entry.position === 1 ? p.matchesWon + 1 : p.matchesWon,
                }
              : p
          )
        );
      }
    });
  };

  // ADMIN MODULE 6: WEBSITE SETTINGS
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Reset demo data
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setMatches(INITIAL_MATCHES);
    setUser(INITIAL_USER);
    setPlayers(INITIAL_PLAYERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <TournamentContext.Provider
      value={{
        categories,
        matches,
        user,
        players,
        transactions,
        diamondPackages,
        topPlayers,
        settings,
        selectedCategory,
        setSelectedCategory,
        joinMatch,
        submitDeposit,
        submitWithdraw,
        buyDiamondTopup,
        updateProfile,
        createMatch,
        editMatch,
        cancelMatch,
        deleteMatch,
        archiveMatch,
        updatePlayerStatus,
        adjustPlayerBalance,
        approveDeposit,
        rejectDeposit,
        approveWithdraw,
        rejectWithdraw,
        setRoomDetailsWithTiming,
        publishResults,
        updateSettings,
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
