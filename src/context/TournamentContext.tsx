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
  INITIAL_TRANSACTIONS,
  INITIAL_DIAMONDS,
  INITIAL_TOP_PLAYERS,
  INITIAL_SETTINGS,
  INITIAL_PLAYERS,
} from '../data/initialData';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';

interface TournamentContextType {
  categories: GameCategory[];
  matches: TournamentMatch[];
  user: UserProfile | null;
  players: UserProfile[];
  registeredUsers: UserProfile[];
  transactions: Transaction[];
  diamondPackages: DiamondPackage[];
  topPlayers: TopPlayer[];
  settings: WebsiteSettings;
  selectedCategory: GameCategory | null;
  setSelectedCategory: (cat: GameCategory | null) => void;

  // Authentication
  registerUser: (data: {
    username: string;
    email: string;
    freeFireUid: string;
    password: string;
  }) => { success: boolean; message: string };
  loginUser: (emailOrUsername: string, password: string) => { success: boolean; message: string };
  logoutUser: () => void;

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
  ACTIVE_USER: 'lg_leader_active_user_v5',
  LOCAL_BACKUP_SETTINGS: 'lg_leader_settings_v5',
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<GameCategory[]>(INITIAL_CATEGORIES);
  const [matches, setMatches] = useState<TournamentMatch[]>(INITIAL_MATCHES);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(INITIAL_PLAYERS);
  const [players, setPlayers] = useState<UserProfile[]>(INITIAL_PLAYERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  // Active user session saved locally on device
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      return null;
    }
    return null;
  });

  const diamondPackages = INITIAL_DIAMONDS;
  const topPlayers = INITIAL_TOP_PLAYERS;

  // 1. Test Firestore Connection per Skill specifications
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firestore offline fallback active.');
        }
      }
    }
    testConnection();
  }, []);

  // 2. Real-time Matches Listener (All devices sync instantly when admin edits/adds matches)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        if (snapshot.empty) {
          // Initial seeding to Firestore so matches exist across all phones
          INITIAL_MATCHES.forEach((m) => {
            setDoc(doc(db, 'matches', m.id), m).catch(() => {});
          });
          setMatches(INITIAL_MATCHES);
        } else {
          const list = snapshot.docs.map((d) => d.data() as TournamentMatch);
          list.sort((a, b) => (b.matchNumber || 0) - (a.matchNumber || 0));
          setMatches(list);
        }
      },
      (err) => {
        console.warn('Real-time matches error:', err);
      }
    );
    return () => unsub();
  }, []);

  // 3. Real-time Users Listener (Accounts created on any phone appear in Admin Panel immediately)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as UserProfile);
          setRegisteredUsers(list);
          setPlayers(list);

          // If current logged-in user exists, update their balance in real-time!
          if (user?.id) {
            const current = list.find((u) => u.id === user.id);
            if (current) {
              setUser(current);
              localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(current));
            }
          }
        } else {
          INITIAL_PLAYERS.forEach((p) => {
            setDoc(doc(db, 'users', p.id), p).catch(() => {});
          });
          setRegisteredUsers(INITIAL_PLAYERS);
          setPlayers(INITIAL_PLAYERS);
        }
      },
      (err) => {
        console.warn('Real-time users error:', err);
      }
    );
    return () => unsub();
  }, [user?.id]);

  // 4. Real-time Transactions Listener (Payment requests from any device sync to Admin in real-time)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Transaction);
          // Sort newest first
          list.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
          });
          setTransactions(list);
        } else {
          INITIAL_TRANSACTIONS.forEach((t) => {
            setDoc(doc(db, 'transactions', t.id), t).catch(() => {});
          });
          setTransactions(INITIAL_TRANSACTIONS);
        }
      },
      (err) => {
        console.warn('Real-time transactions error:', err);
      }
    );
    return () => unsub();
  }, []);

  // 5. Real-time Settings Listener (Admin updates hotlines, bKash numbers, marquee notices -> all phones update)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as WebsiteSettings);
        } else {
          setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS).catch(() => {});
          setSettings(INITIAL_SETTINGS);
        }
      },
      (err) => {
        console.warn('Real-time settings error:', err);
      }
    );
    return () => unsub();
  }, []);

  // Sync category match counts dynamically
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

  // Persist current session locally
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }, [user]);

  // -------------------------------------------------------------
  // AUTHENTICATION: REGISTER
  // -------------------------------------------------------------
  const registerUser = (data: {
    username: string;
    email: string;
    freeFireUid: string;
    password: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim();
    const cleanUid = data.freeFireUid.trim();

    // Check if email already registered across all devices
    const existsEmail = registeredUsers.some((u) => u.email?.toLowerCase() === cleanEmail);
    if (existsEmail) {
      return {
        success: false,
        message: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে! অনুগ্রহ করে লগইন করুন।',
      };
    }

    // Check if username already registered
    const existsUser = registeredUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existsUser) {
      return {
        success: false,
        message: 'এই ইউজারনেমটি অন্য কেউ ব্যবহার করছে! ভিন্ন ইউজারনেম পছন্দ করুন।',
      };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: cleanUsername,
      username: cleanUsername,
      email: cleanEmail,
      freeFireUid: cleanUid,
      password: data.password,
      phone: '',
      depositBalance: 0,
      winningBalance: 0,
      matchesJoined: 0,
      matchesWon: 0,
      totalWonBDT: 0,
      avatar: '',
      status: 'active',
      registeredAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // 1. Write to Cloud Firestore so it shows on Admin Panel across ANY device instantly!
    setDoc(doc(db, 'users', newUser.id), newUser).catch((e) => {
      console.warn('Error saving user to Firestore:', e);
    });

    // 2. Set as active user on this phone
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newUser));
    setRegisteredUsers((prev) => [newUser, ...prev]);
    setPlayers((prev) => [newUser, ...prev]);

    return {
      success: true,
      message: 'রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।',
    };
  };

  // -------------------------------------------------------------
  // AUTHENTICATION: LOGIN
  // -------------------------------------------------------------
  const loginUser = (emailOrUsername: string, password: string) => {
    const query = emailOrUsername.trim().toLowerCase();
    const found = registeredUsers.find(
      (u) =>
        (u.email?.toLowerCase() === query || u.username.toLowerCase() === query) &&
        u.password === password
    );

    if (!found) {
      return {
        success: false,
        message: 'ভুল ইমেইল বা পাসওয়ার্ড! সঠিক তথ্য দিন অথবা নতুন রেজিস্ট্রেশন করুন।',
      };
    }

    if (found.status === 'banned') {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে! অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।',
      };
    }

    setUser(found);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(found));

    return {
      success: true,
      message: `স্বাগতম ${found.username}! সফলভাবে লগইন হয়েছে।`,
    };
  };

  // -------------------------------------------------------------
  // AUTHENTICATION: LOGOUT
  // -------------------------------------------------------------
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  };

  // -------------------------------------------------------------
  // USER ACTION: Join Match (Deducts balance & syncs to cloud)
  // -------------------------------------------------------------
  const joinMatch = (matchId: string, gamerName: string, uid: string) => {
    if (!user) {
      return { success: false, message: 'ম্যাচে জয়েন করতে অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }

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

    const updatedJoinedPlayers = [...match.joinedPlayers, newEntry];

    const updatedUser: UserProfile = {
      ...user,
      depositBalance: newDeposit,
      winningBalance: newWinning,
      matchesJoined: user.matchesJoined + 1,
      freeFireUid: uid || user.freeFireUid,
    };
    setUser(updatedUser);

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

    // Sync to Firestore in real-time
    updateDoc(doc(db, 'matches', matchId), { joinedPlayers: updatedJoinedPlayers }).catch((err) =>
      console.warn('Error syncing join match to Firestore:', err)
    );
    updateDoc(doc(db, 'users', user.id), {
      depositBalance: newDeposit,
      winningBalance: newWinning,
      matchesJoined: updatedUser.matchesJoined,
      freeFireUid: updatedUser.freeFireUid,
    }).catch((err) => console.warn('Error updating user on join:', err));

    if (match.entryFee > 0) {
      setDoc(doc(db, 'transactions', tx.id), tx).catch((err) =>
        console.warn('Error saving join tx:', err)
      );
    }

    return { success: true, message: 'সফলভাবে ম্যাচে জয়েন সম্পন্ন হয়েছে! রুম ডিটেলস সময়মতো চেক করুন।' };
  };

  // -------------------------------------------------------------
  // USER ACTION: Submit Deposit (Add Money)
  // -------------------------------------------------------------
  const submitDeposit = (
    method: 'bKash' | 'Nagad' | 'Rocket',
    amount: number,
    trxId: string,
    phone: string
  ) => {
    if (!user) {
      return { success: false, message: 'ডিপোজিট করতে অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
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

    // Save to Firestore so Admin sees payment request INSTANTLY on any device!
    setDoc(doc(db, 'transactions', tx.id), tx).catch((err) =>
      console.warn('Error writing deposit to Firestore:', err)
    );

    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন যাচাই করে ২-৫ মিনিটের মধ্যে ব্যালেন্স যোগ করে দেবে।',
    };
  };

  // -------------------------------------------------------------
  // USER ACTION: Submit Withdraw
  // -------------------------------------------------------------
  const submitWithdraw = (
    method: 'bKash' | 'Nagad' | 'Rocket',
    amount: number,
    phone: string
  ) => {
    if (!user) {
      return { success: false, message: 'টাকা তুলতে অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
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

    const newWinningBalance = user.winningBalance - amount;
    const updatedUser = {
      ...user,
      winningBalance: newWinningBalance,
    };
    setUser(updatedUser);

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

    updateDoc(doc(db, 'users', user.id), { winningBalance: newWinningBalance }).catch((err) =>
      console.warn('Error updating winning balance on withdraw:', err)
    );
    setDoc(doc(db, 'transactions', tx.id), tx).catch((err) =>
      console.warn('Error writing withdraw to Firestore:', err)
    );

    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `৳${amount} উত্তোলন রিকোয়েস্ট জমা হয়েছে! এডমিন দ্রুত টাকা পাঠিয়ে দেবে।`,
    };
  };

  // -------------------------------------------------------------
  // USER ACTION: Diamond Top-up
  // -------------------------------------------------------------
  const buyDiamondTopup = (
    pkg: DiamondPackage,
    playerUid: string,
    method: 'bKash' | 'Nagad' | 'Rocket',
    trxId: string,
    phone: string
  ) => {
    if (!user) {
      return { success: false, message: 'ডায়মন্ড অর্ডার করতে অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
    if (!playerUid || playerUid.length < 5) {
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

    setDoc(doc(db, 'transactions', tx.id), tx).catch((err) =>
      console.warn('Error writing diamond topup to Firestore:', err)
    );

    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `${pkg.title} অর্ডার সম্পন্ন হয়েছে! এডমিন দ্রুত আপনার UID তে ডায়মন্ড টপআপ করে দিবে।`,
    };
  };

  // -------------------------------------------------------------
  // USER ACTION: Update Profile
  // -------------------------------------------------------------
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
      await updateDoc(doc(db, 'users', user.id), data);
    } catch (err) {
      console.warn('Error updating profile in Firestore:', err);
    }
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 1: TOURNAMENT CONTROL (Instant sync across all devices)
  // -------------------------------------------------------------
  const createMatch = async (matchData: Omit<TournamentMatch, 'id' | 'joinedPlayers' | 'status'>) => {
    const newMatch: TournamentMatch = {
      ...matchData,
      id: `match-${Date.now()}`,
      joinedPlayers: [],
      status: 'upcoming',
      roomReleaseTiming: '10min',
      isRoomVisibleToPlayers: false,
    };

    try {
      await setDoc(doc(db, 'matches', newMatch.id), newMatch);
    } catch (err) {
      console.warn('Error creating match in Firestore:', err);
    }

    setMatches((prev) => [newMatch, ...prev]);
  };

  const editMatch = async (matchId: string, updated: Partial<TournamentMatch>) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), updated);
    } catch (err) {
      console.warn('Error updating match in Firestore:', err);
    }

    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...updated } : m)));
  };

  const cancelMatch = async (matchId: string, reason: string) => {
    const m = matches.find((match) => match.id === matchId);
    if (!m) return;

    // Refund joined players
    if (m.entryFee > 0 && m.joinedPlayers.length > 0) {
      m.joinedPlayers.forEach(async (player) => {
        const u = registeredUsers.find((userDoc) => userDoc.id === player.userId);
        if (u) {
          const newBalance = u.depositBalance + m.entryFee;
          try {
            await updateDoc(doc(db, 'users', u.id), { depositBalance: newBalance });
          } catch (e) {}
        }
      });
    }

    const cancelUpdate = {
      status: 'cancelled' as const,
      cancelReason: reason || 'ম্যাচ বাতিল করা হয়েছে এবং এন্ট্রি ফি রিফান্ড করা হয়েছে।',
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), cancelUpdate);
    } catch (err) {
      console.warn('Error cancelling match in Firestore:', err);
    }

    setMatches((prev) => prev.map((item) => (item.id === matchId ? { ...item, ...cancelUpdate } : item)));
  };

  const deleteMatch = async (matchId: string) => {
    try {
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (err) {
      console.warn('Error deleting match in Firestore:', err);
    }

    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const archiveMatch = async (matchId: string) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), { status: 'archived' });
    } catch (err) {
      console.warn('Error archiving match in Firestore:', err);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'archived' } : m))
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 2: PLAYER MANAGEMENT (Instant balance & ban sync)
  // -------------------------------------------------------------
  const updatePlayerStatus = async (playerId: string, status: 'active' | 'banned') => {
    try {
      await updateDoc(doc(db, 'users', playerId), { status });
    } catch (err) {
      console.warn('Error updating player status in Firestore:', err);
    }

    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, status } : p)));
    setRegisteredUsers((prev) => prev.map((u) => (u.id === playerId ? { ...u, status } : u)));
  };

  const adjustPlayerBalance = async (playerId: string, depositDelta: number, winningDelta: number) => {
    const target = registeredUsers.find((u) => u.id === playerId);
    if (!target) return;

    const newDeposit = Math.max(0, target.depositBalance + depositDelta);
    const newWinning = Math.max(0, target.winningBalance + winningDelta);

    try {
      await updateDoc(doc(db, 'users', playerId), {
        depositBalance: newDeposit,
        winningBalance: newWinning,
      });
    } catch (err) {
      console.warn('Error adjusting balance in Firestore:', err);
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, depositBalance: newDeposit, winningBalance: newWinning } : p
      )
    );
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.id === playerId ? { ...u, depositBalance: newDeposit, winningBalance: newWinning } : u
      )
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 3: bKASH / NAGAD PAYMENT APPROVALS
  // -------------------------------------------------------------
  const approveDeposit = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'approved',
        note: 'এডমিন কর্তৃক ভেরিফাইড ও অনুমোদিত',
      });

      const userTarget = registeredUsers.find((u) => u.id === tx.userId);
      if (userTarget) {
        const newBalance = userTarget.depositBalance + tx.amount;
        await updateDoc(doc(db, 'users', tx.userId), { depositBalance: newBalance });
      }
    } catch (err) {
      console.warn('Error approving deposit in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId ? { ...t, status: 'approved', note: 'এডমিন কর্তৃক ভেরিফাইড ও অনুমোদিত' } : t
      )
    );
  };

  const rejectDeposit = async (txId: string, reason = 'ভুল TrxID বা অ্যাকাউন্টে টাকা ক্রেডিট হয়নি') => {
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'rejected',
        note: reason,
      });
    } catch (err) {
      console.warn('Error rejecting deposit in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  const approveWithdraw = async (txId: string) => {
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'approved',
        note: 'টাকা বিকাশ/নগদ একাউন্টে সফলভাবে পাঠানো হয়েছে',
      });
    } catch (err) {
      console.warn('Error approving withdraw in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? { ...t, status: 'approved', note: 'টাকা বিকাশ/নগদ একাউন্টে সফলভাবে পাঠানো হয়েছে' }
          : t
      )
    );
  };

  const rejectWithdraw = async (
    txId: string,
    reason = 'নাম্বার অকার্যকর বা তথ্য অমিল থাকায় রিফান্ড করা হলো'
  ) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'rejected',
        note: reason,
      });

      const userTarget = registeredUsers.find((u) => u.id === tx.userId);
      if (userTarget) {
        const newWinning = userTarget.winningBalance + tx.amount;
        await updateDoc(doc(db, 'users', tx.userId), { winningBalance: newWinning });
      }
    } catch (err) {
      console.warn('Error rejecting withdraw in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 4: ROOM ID & PASSWORD (WITH TIMING)
  // -------------------------------------------------------------
  const setRoomDetailsWithTiming = async (
    matchId: string,
    roomId: string,
    roomPassword: string,
    timing: 'now' | '10min' | '15min' | 'hidden',
    isVisible: boolean
  ) => {
    const update = {
      roomId: roomId.trim(),
      roomPassword: roomPassword.trim(),
      roomReleaseTiming: timing,
      isRoomVisibleToPlayers: isVisible,
      status: isVisible && roomId ? ('ongoing' as const) : undefined,
    };

    // Clean undefined fields for Firestore
    const cleanUpdate: Record<string, any> = {
      roomId: roomId.trim(),
      roomPassword: roomPassword.trim(),
      roomReleaseTiming: timing,
      isRoomVisibleToPlayers: isVisible,
    };
    if (isVisible && roomId) {
      cleanUpdate.status = 'ongoing';
    }

    try {
      await updateDoc(doc(db, 'matches', matchId), cleanUpdate);
    } catch (err) {
      console.warn('Error setting room details in Firestore:', err);
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              ...update,
              status: isVisible && roomId ? 'ongoing' : m.status,
            }
          : m
      )
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 5: RESULT MANAGEMENT (Prizes credited & results declared)
  // -------------------------------------------------------------
  const publishResults = async (
    matchId: string,
    results: MatchResultEntry[],
    booyahWinnerName: string,
    booyahWinnerUid: string,
    booyahPrize: number,
    totalKillsWinner: number
  ) => {
    const matchUpdate = {
      status: 'completed' as const,
      winnerName: booyahWinnerName,
      winnerUid: booyahWinnerUid,
      winnerPrize: booyahPrize,
      totalKillsWinner,
      results,
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), matchUpdate);

      // Credit prizes in Firestore
      results.forEach(async (entry) => {
        if (entry.prizeWon > 0) {
          const target = registeredUsers.find(
            (u) =>
              u.freeFireUid === entry.uid ||
              u.username.toLowerCase() === entry.gamerName.toLowerCase()
          );
          if (target) {
            const updatedWon = target.winningBalance + entry.prizeWon;
            const updatedTotalWon = target.totalWonBDT + entry.prizeWon;
            const updatedMatchesWon = entry.position === 1 ? target.matchesWon + 1 : target.matchesWon;

            await updateDoc(doc(db, 'users', target.id), {
              winningBalance: updatedWon,
              totalWonBDT: updatedTotalWon,
              matchesWon: updatedMatchesWon,
            });

            const tx: Transaction = {
              id: `tx-${Date.now()}-${entry.uid}`,
              userId: target.id,
              userName: target.username,
              type: 'match_prize',
              amount: entry.prizeWon,
              status: 'approved',
              date: new Date().toLocaleString(),
              note: `Tournament Prize: Rank #${entry.position}, ${entry.kills} Kills (${entry.points} Pts)`,
            };
            await setDoc(doc(db, 'transactions', tx.id), tx);
          }
        }
      });
    } catch (err) {
      console.warn('Error publishing results in Firestore:', err);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...matchUpdate } : m))
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 6: WEBSITE SETTINGS (bKash/Nagad number, marquee notice)
  // -------------------------------------------------------------
  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'global'), updated);
    } catch (err) {
      console.warn('Error updating settings in Firestore:', err);
    }
    setSettings(updated);
  };

  // Utility reset
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    setUser(null);
  };

  return (
    <TournamentContext.Provider
      value={{
        categories,
        matches,
        user,
        players,
        registeredUsers,
        transactions,
        diamondPackages,
        topPlayers,
        settings,
        selectedCategory,
        setSelectedCategory,
        registerUser,
        loginUser,
        logoutUser,
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
