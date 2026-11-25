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
  AppNotification,
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
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocFromServer,
  arrayUnion,
} from 'firebase/firestore';

interface TournamentContextType {
  categories: GameCategory[];
  matches: TournamentMatch[];
  user: UserProfile | null;
  players: UserProfile[];
  registeredUsers: UserProfile[];
  transactions: Transaction[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  diamondPackages: DiamondPackage[];
  topPlayers: TopPlayer[];
  settings: WebsiteSettings;
  selectedCategory: GameCategory | null;
  setSelectedCategory: (cat: GameCategory | null) => void;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;

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
  adjustPlayerBalance: (
    playerId: string,
    accountOrMode: 'main' | 'game' | 'add' | 'remove' | 'edit' | 'delta',
    modeOrAmount?: 'add' | 'remove' | 'edit' | 'delta' | number,
    amountOrSecond?: number
  ) => void;

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
  ACTIVE_USER: 'lg_leader_active_user_v6',
  DELETED_MATCHES: 'lg_deleted_match_ids',
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<GameCategory[]>(INITIAL_CATEGORIES);

  // Deleted matches tracking to strictly prevent auto re-adding
  const [deletedMatchIds, setDeletedMatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_MATCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [matches, setMatches] = useState<TournamentMatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_MATCHES);
      const deleted: string[] = saved ? JSON.parse(saved) : [];
      return INITIAL_MATCHES.filter((m) => !deleted.includes(m.id));
    } catch {
      return INITIAL_MATCHES;
    }
  });
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(INITIAL_PLAYERS);
  const [players, setPlayers] = useState<UserProfile[]>(INITIAL_PLAYERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
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

  // 2. Real-time Deleted Matches Listener (Syncs removals across all devices immediately)
  useEffect(() => {
    const unsubDeleted = onSnapshot(
      doc(db, 'system', 'deleted_matches'),
      (snap) => {
        if (snap.exists()) {
          const ids: string[] = snap.data()?.deletedIds || [];
          setDeletedMatchIds(ids);
          try {
            localStorage.setItem(STORAGE_KEYS.DELETED_MATCHES, JSON.stringify(ids));
          } catch {}
        }
      },
      (err) => console.warn('Deleted matches listener error:', err)
    );
    return () => unsubDeleted();
  }, []);

  // 3. Real-time Matches Listener (Guaranteed never to auto re-add removed matches)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'matches'),
      async (snapshot) => {
        try {
          const seedDocRef = doc(db, 'system', 'matches_seed');
          const seedSnap = await getDoc(seedDocRef).catch(() => null);
          const alreadySeeded = seedSnap?.exists() && seedSnap.data()?.seeded === true;

          if (snapshot.empty) {
            if (!alreadySeeded) {
              // Initial run only: seed initial matches
              for (const m of INITIAL_MATCHES) {
                if (!deletedMatchIds.includes(m.id)) {
                  await setDoc(doc(db, 'matches', m.id), m).catch(() => {});
                }
              }
              await setDoc(seedDocRef, { seeded: true, timestamp: Date.now() }).catch(() => {});
              setMatches(INITIAL_MATCHES.filter((m) => !deletedMatchIds.includes(m.id)));
            } else {
              // Matches were intentionally deleted by admin: NEVER recreate them!
              setMatches([]);
            }
          } else {
            if (!alreadySeeded) {
              await setDoc(seedDocRef, { seeded: true, timestamp: Date.now() }).catch(() => {});
            }
            const list = snapshot.docs
              .map((d) => d.data() as TournamentMatch & { isDeleted?: boolean })
              .filter((m) => !m.isDeleted && !deletedMatchIds.includes(m.id));
            list.sort((a, b) => (b.matchNumber || 0) - (a.matchNumber || 0));
            setMatches(list);
          }
        } catch (err) {
          console.warn('Real-time matches processing error:', err);
        }
      },
      (err) => {
        console.warn('Real-time matches snapshot error:', err);
      }
    );
    return () => unsub();
  }, [deletedMatchIds]);

  // 3. Real-time Users Listener (Single unified account balance)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as UserProfile);
          setRegisteredUsers(list);
          setPlayers(list);

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

  // 4. Real-time Transactions Listener
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Transaction);
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

  // 5. Real-time Settings Listener
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

  // 6. Real-time Notifications Listener
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AppNotification);
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAllNotifications(list);
      },
      (err) => {
        console.warn('Real-time notifications error:', err);
      }
    );
    return () => unsub();
  }, []);

  // Filter notifications belonging to current logged-in user
  const notifications = user
    ? allNotifications.filter(
        (n) => n.userId === user.id || n.userId === user.freeFireUid || n.userId === 'ALL'
      )
    : [];

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const createNotification = async (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'timestamp'>) => {
    const now = Date.now();
    const fullNotif: AppNotification = {
      ...notif,
      id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
      createdAt: new Date().toLocaleString(),
      timestamp: now,
    };

    setAllNotifications((prev) => [fullNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', fullNotif.id), fullNotif);
    } catch (err) {
      console.warn('Error saving notification in Firestore:', err);
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setAllNotifications((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
    );

    unreadIds.forEach((id) => {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
    });
  };

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

    const existsEmail = registeredUsers.some((u) => u.email?.toLowerCase() === cleanEmail);
    if (existsEmail) {
      return {
        success: false,
        message: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে! অনুগ্রহ করে লগইন করুন।',
      };
    }

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

    setDoc(doc(db, 'users', newUser.id), newUser).catch((e) => {
      console.warn('Error saving user to Firestore:', e);
    });

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

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  };

  // -------------------------------------------------------------
  // USER ACTION: Join Match (Unified Balance)
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

    const currentDeposit = user.depositBalance || 0;
    const currentWinning = user.winningBalance || 0;
    const currentTotalBalance = currentDeposit + currentWinning;

    if (currentTotalBalance < match.entryFee) {
      return {
        success: false,
        message: `পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ৳${match.entryFee}, আপনার সর্বমোট ব্যালেন্স ৳${currentTotalBalance} (মেইন: ৳${currentDeposit}, গেম: ৳${currentWinning})।`,
      };
    }

    // Deduct entry fee from Main Account (deposit) first; remainder from Game Account (winning)
    let newDeposit = currentDeposit;
    let newWinning = currentWinning;
    if (newDeposit >= match.entryFee) {
      newDeposit -= match.entryFee;
    } else {
      const rem = match.entryFee - newDeposit;
      newDeposit = 0;
      newWinning = Math.max(0, newWinning - rem);
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
      matchesJoined: (user.matchesJoined || 0) + 1,
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
  // USER ACTION: Submit Deposit (Add Money, Minimum 50 BDT)
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
    const minDep = settings.minDeposit ?? 50;
    const maxDep = settings.maxDeposit ?? 25000;

    if (amount < minDep) {
      return { success: false, message: `সর্বনিম্ন ডিপোজিট ৳${minDep} টাকা।` };
    }
    if (maxDep > 0 && amount > maxDep) {
      return { success: false, message: `একবারে সর্বোচ্চ ডিপোজিট ৳${maxDep} টাকা।` };
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
  // USER ACTION: Submit Withdraw (Strictly ONLY from Winning Account)
  // -------------------------------------------------------------
  const submitWithdraw = (
    method: 'bKash' | 'Nagad' | 'Rocket',
    amount: number,
    phone: string
  ) => {
    if (!user) {
      return { success: false, message: 'টাকা তুলতে অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
    const minWith = settings.minWithdraw ?? 50;
    const maxDaily = settings.maxWithdrawPerDay ?? 1000;

    if (amount < minWith) {
      return { success: false, message: `সর্বনিম্ন উত্তোলন ৳${minWith} টাকা।` };
    }

    const currentWinning = user.winningBalance || 0;
    if (currentWinning < amount) {
      return {
        success: false,
        message: `আপনার উইনিং একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! শুধুমাত্র ম্যাচ জয়ের টাকা (উইনিং একাউন্ট: ৳${currentWinning}) উত্তোলন করা যাবে।`,
      };
    }

    // Check daily withdrawal limit (dynamic max per day)
    const today = new Date().toDateString();
    const todayWithdrawn = transactions
      .filter((t) => {
        if (t.userId !== user.id || t.type !== 'withdraw' || t.status === 'rejected') return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.toDateString() === today;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const remainingDailyLimit = Math.max(0, maxDaily - todayWithdrawn);
    if (amount > remainingDailyLimit) {
      return {
        success: false,
        message: `দৈনিক সর্বোচ্চ ৳${maxDaily} টাকা উত্তোলন করা যাবে। আজ আপনি ইতোমধ্যে ৳${todayWithdrawn} উত্তোলন করেছেন, আর সর্বোচ্চ ৳${remainingDailyLimit} উত্তোলন করতে পারবেন।`,
      };
    }

    if (!phone || phone.trim().length < 11) {
      return { success: false, message: 'সঠিক বিকাশ/নগদ নাম্বার দিন।' };
    }

    // Deduct strictly from Winning Account ONLY (Main Account depositBalance stays untouched)
    const newWinning = Math.max(0, currentWinning - amount);

    const updatedUser = {
      ...user,
      winningBalance: newWinning,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedUser));
    } catch {}
    setPlayers((prev) => prev.map((p) => (p.id === user.id ? updatedUser : p)));
    setRegisteredUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

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
      note: `Winning Account Cashout to ${method}: ${phone}`,
    };

    updateDoc(doc(db, 'users', user.id), {
      winningBalance: newWinning,
    }).catch((err) =>
      console.warn('Error updating winning balance on withdraw in Firestore:', err)
    );
    setDoc(doc(db, 'transactions', tx.id), tx).catch((err) =>
      console.warn('Error writing withdraw to Firestore:', err)
    );

    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `উইনিং একাউন্ট থেকে ৳${amount} উত্তোলন রিকোয়েস্ট জমা হয়েছে! এডমিন দ্রুত টাকা পাঠিয়ে দেবে।`,
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
  // ADMIN MODULE 1: TOURNAMENT CONTROL
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

    if (m.entryFee > 0 && m.joinedPlayers.length > 0) {
      m.joinedPlayers.forEach(async (player) => {
        const u = registeredUsers.find((userDoc) => userDoc.id === player.userId);
        if (u) {
          // Refund entry fee back into user's Main Account (depositBalance)
          const newDeposit = (u.depositBalance || 0) + m.entryFee;
          try {
            await updateDoc(doc(db, 'users', u.id), { depositBalance: newDeposit });
          } catch (e) {}
        }
      });
    }

    const cancelUpdate = {
      status: 'cancelled' as const,
      cancelReason: reason || 'ম্যাচ বাতিল করা হয়েছে এবং এন্ট্রি ফি মেইন একাউন্টে রিফান্ড করা হয়েছে।',
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), cancelUpdate);
    } catch (err) {
      console.warn('Error cancelling match in Firestore:', err);
    }

    setMatches((prev) => prev.map((item) => (item.id === matchId ? { ...item, ...cancelUpdate } : item)));
  };

  const deleteMatch = async (matchId: string) => {
    // 1. Immediately remove from local state
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setDeletedMatchIds((prev) => {
      const next = prev.includes(matchId) ? prev : [...prev, matchId];
      try {
        localStorage.setItem(STORAGE_KEYS.DELETED_MATCHES, JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Delete document from Firestore
    try {
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (err) {
      console.warn('Error deleting match in Firestore:', err);
    }

    // 3. Mark in deleted_matches system doc so it can NEVER auto re-add on any device
    try {
      await setDoc(
        doc(db, 'system', 'deleted_matches'),
        { deletedIds: arrayUnion(matchId) },
        { merge: true }
      );
      await setDoc(doc(db, 'system', 'matches_seed'), { seeded: true }, { merge: true });
    } catch (err) {
      console.warn('Error recording deleted match ID:', err);
    }
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
  // ADMIN MODULE 2: PLAYER MANAGEMENT (3 Options: Add, Remove, Edit)
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

  const adjustPlayerBalance = async (
    playerId: string,
    accountOrMode: 'main' | 'game' | 'add' | 'remove' | 'edit' | 'delta',
    modeOrAmount?: 'add' | 'remove' | 'edit' | 'delta' | number,
    amountOrSecond?: number
  ) => {
    const target = registeredUsers.find((u) => u.id === playerId);
    if (!target) return;

    let targetAccount: 'main' | 'game' = 'main';
    let mode: 'add' | 'remove' | 'edit' = 'add';
    let amount = 0;

    if (accountOrMode === 'main' || accountOrMode === 'game') {
      targetAccount = accountOrMode;
      mode = (modeOrAmount as 'add' | 'remove' | 'edit') || 'add';
      amount = typeof amountOrSecond === 'number' ? amountOrSecond : 0;
    } else {
      // Legacy fallback
      targetAccount = 'main';
      mode = accountOrMode as 'add' | 'remove' | 'edit';
      amount = typeof modeOrAmount === 'number' ? modeOrAmount : 0;
    }

    let newDeposit = target.depositBalance || 0;
    let newWinning = target.winningBalance || 0;
    const absAmount = Math.abs(amount);

    if (targetAccount === 'main') {
      if (mode === 'add') {
        newDeposit = newDeposit + absAmount;
      } else if (mode === 'remove') {
        newDeposit = Math.max(0, newDeposit - absAmount);
      } else if (mode === 'edit') {
        newDeposit = Math.max(0, amount);
      }
    } else {
      // game account (winnings)
      if (mode === 'add') {
        newWinning = newWinning + absAmount;
      } else if (mode === 'remove') {
        newWinning = Math.max(0, newWinning - absAmount);
      } else if (mode === 'edit') {
        newWinning = Math.max(0, amount);
      }
    }

    try {
      await updateDoc(doc(db, 'users', playerId), {
        depositBalance: newDeposit,
        winningBalance: newWinning,
      });
    } catch (err) {
      console.warn('Error adjusting balance in Firestore:', err);
    }

    const updatedTarget: UserProfile = {
      ...target,
      depositBalance: newDeposit,
      winningBalance: newWinning,
    };

    setPlayers((prev) => prev.map((p) => (p.id === playerId ? updatedTarget : p)));
    setRegisteredUsers((prev) => prev.map((u) => (u.id === playerId ? updatedTarget : u)));

    if (user && playerId === user.id) {
      setUser(updatedTarget);
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedTarget));
      } catch {}
    }
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 3: bKASH / NAGAD PAYMENT APPROVALS
  // -------------------------------------------------------------
  const approveDeposit = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    const approvedNote = 'এডমিন কর্তৃক ভেরিফাইড ও অনুমোদিত (মেইন একাউন্টে যোগ হয়েছে)';
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'approved',
        note: approvedNote,
      });

      let userTarget = registeredUsers.find((u) => u.id === tx.userId);
      if (!userTarget) {
        const snap = await getDoc(doc(db, 'users', tx.userId)).catch(() => null);
        if (snap && snap.exists()) {
          userTarget = snap.data() as UserProfile;
        }
      }

      if (userTarget) {
        // Always add approved deposit to Main Account (depositBalance)
        const newDeposit = (userTarget.depositBalance || 0) + tx.amount;
        await updateDoc(doc(db, 'users', tx.userId), { depositBalance: newDeposit });

        const updatedTarget = { ...userTarget, depositBalance: newDeposit };
        setPlayers((prev) => prev.map((p) => (p.id === tx.userId ? updatedTarget : p)));
        setRegisteredUsers((prev) => prev.map((u) => (u.id === tx.userId ? updatedTarget : u)));

        if (user && user.id === tx.userId) {
          setUser(updatedTarget);
          try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedTarget));
          } catch {}
        }

        await createNotification({
          userId: tx.userId,
          type: 'deposit_approved',
          title: '✅ ডিপোজিট অনুমোদিত হয়েছে!',
          message: `আপনার ৳${tx.amount} (${tx.method || 'Payment'}) ডিপোজিট সফলভাবে অনুমোদন হয়ে মেইন একাউন্টে যোগ হয়েছে।`,
        });
      }
    } catch (err) {
      console.warn('Error approving deposit in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId ? { ...t, status: 'approved', note: approvedNote } : t
      )
    );
  };

  const rejectDeposit = async (txId: string, reason = 'ভুল TrxID বা অ্যাকাউন্টে টাকা ক্রেডিট হয়নি') => {
    const tx = transactions.find((t) => t.id === txId);
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'rejected',
        note: reason,
      });
      if (tx) {
        await createNotification({
          userId: tx.userId,
          type: 'deposit_rejected',
          title: '❌ ডিপোজিট বাতিল হয়েছে',
          message: `আপনার ৳${tx.amount} ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে। কারণ: ${reason}`,
        });
      }
    } catch (err) {
      console.warn('Error rejecting deposit in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  const approveWithdraw = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    try {
      await updateDoc(doc(db, 'transactions', txId), {
        status: 'approved',
        note: 'টাকা বিকাশ/নগদ একাউন্টে সফলভাবে পাঠানো হয়েছে',
      });
      if (tx) {
        await createNotification({
          userId: tx.userId,
          type: 'withdraw_approved',
          title: '💸 টাকা উত্তোলন সফল হয়েছে!',
          message: `আপনার উইনিং একাউন্ট থেকে ৳${tx.amount} (${tx.method || ''} - ${tx.phone || ''}) সফলভাবে পাঠানো হয়েছে।`,
        });
      }
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

      // Refund back to player's Winning Account (winningBalance)
      let userTarget = registeredUsers.find((u) => u.id === tx.userId);
      if (!userTarget) {
        const snap = await getDoc(doc(db, 'users', tx.userId)).catch(() => null);
        if (snap && snap.exists()) {
          userTarget = snap.data() as UserProfile;
        }
      }

      if (userTarget) {
        const refundedWinning = (userTarget.winningBalance || 0) + tx.amount;
        await updateDoc(doc(db, 'users', tx.userId), { winningBalance: refundedWinning });

        const updatedTarget = { ...userTarget, winningBalance: refundedWinning };
        if (user && tx.userId === user.id) {
          setUser(updatedTarget);
          try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedTarget));
          } catch {}
        }
        setPlayers((prev) =>
          prev.map((p) => (p.id === tx.userId ? updatedTarget : p))
        );
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === tx.userId ? updatedTarget : u))
        );

        await createNotification({
          userId: tx.userId,
          type: 'withdraw_rejected',
          title: '⚠️ উত্তোলন বাতিল ও টাকা রিফান্ড',
          message: `আপনার ৳${tx.amount} উত্তোলন রিকোয়েস্ট বাতিল করে উইনিং একাউন্টে ফেরত দেওয়া হয়েছে। কারণ: ${reason}`,
        });
      }
    } catch (err) {
      console.warn('Error rejecting withdraw in Firestore:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: reason } : t))
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 4: ROOM ID & PASSWORD (WITH TIMING & NOTIFICATIONS)
  // -------------------------------------------------------------
  const setRoomDetailsWithTiming = async (
    matchId: string,
    roomId: string,
    roomPassword: string,
    timing: 'now' | '10min' | '15min' | 'hidden',
    isVisible: boolean
  ) => {
    const cleanRoomId = roomId.trim();
    const cleanRoomPassword = roomPassword.trim();

    const update = {
      roomId: cleanRoomId,
      roomPassword: cleanRoomPassword,
      roomReleaseTiming: timing,
      isRoomVisibleToPlayers: isVisible,
      status: isVisible && cleanRoomId ? ('ongoing' as const) : undefined,
    };

    const cleanUpdate: Record<string, any> = {
      roomId: cleanRoomId,
      roomPassword: cleanRoomPassword,
      roomReleaseTiming: timing,
      isRoomVisibleToPlayers: isVisible,
    };
    if (isVisible && cleanRoomId) {
      cleanUpdate.status = 'ongoing';
    }

    try {
      await updateDoc(doc(db, 'matches', matchId), cleanUpdate);

      // Send real-time Notification to ALL joined players of this match when Room ID & Pass are published
      if (isVisible && cleanRoomId) {
        let targetMatch = matches.find((m) => m.id === matchId);
        if (!targetMatch) {
          const snap = await getDoc(doc(db, 'matches', matchId)).catch(() => null);
          if (snap && snap.exists()) {
            targetMatch = snap.data() as TournamentMatch;
          }
        }

        if (targetMatch && targetMatch.joinedPlayers && targetMatch.joinedPlayers.length > 0) {
          const notifiedUserIds = new Set<string>();
          for (const playerEntry of targetMatch.joinedPlayers) {
            const targetUserId = playerEntry.userId || playerEntry.uid;
            if (!targetUserId || notifiedUserIds.has(targetUserId)) continue;
            notifiedUserIds.add(targetUserId);

            await createNotification({
              userId: targetUserId,
              type: 'room_details',
              title: `🔑 রুম আইডি ও পাসওয়ার্ড প্রকাশ হয়েছে!`,
              message: `${targetMatch.title} (#${targetMatch.matchNumber}) ম্যাচের কাস্টম রুম আইডি ও পাসওয়ার্ড দেওয়া হয়েছে। দ্রুত রুমে প্রবেশ করুন!`,
              matchId: targetMatch.id,
              matchTitle: targetMatch.title,
              roomId: cleanRoomId,
              roomPassword: cleanRoomPassword,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error setting room details in Firestore:', err);
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              ...update,
              status: isVisible && cleanRoomId ? 'ongoing' : m.status,
            }
          : m
      )
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 5: RESULT MANAGEMENT (Winnings go strictly to Winning Account)
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

      for (const entry of results) {
        if (entry.prizeWon > 0) {
          const target = registeredUsers.find(
            (u) =>
              u.id === entry.playerId ||
              u.freeFireUid === entry.uid ||
              u.username.toLowerCase() === entry.gamerName.toLowerCase()
          );
          if (target) {
            // Winning money always goes strictly to Winning Account (winningBalance)
            const updatedWinning = (target.winningBalance || 0) + entry.prizeWon;
            const updatedTotalWon = (target.totalWonBDT || 0) + entry.prizeWon;
            const updatedMatchesWon =
              entry.position === 1 ? (target.matchesWon || 0) + 1 : (target.matchesWon || 0);

            await updateDoc(doc(db, 'users', target.id), {
              winningBalance: updatedWinning,
              totalWonBDT: updatedTotalWon,
              matchesWon: updatedMatchesWon,
            });

            const updatedTarget = {
              ...target,
              winningBalance: updatedWinning,
              totalWonBDT: updatedTotalWon,
              matchesWon: updatedMatchesWon,
            };
            setPlayers((prev) => prev.map((p) => (p.id === target.id ? updatedTarget : p)));
            setRegisteredUsers((prev) => prev.map((u) => (u.id === target.id ? updatedTarget : u)));
            if (user && user.id === target.id) {
              setUser(updatedTarget);
              try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedTarget));
              } catch {}
            }

            const tx: Transaction = {
              id: `tx-${Date.now()}-${entry.uid}`,
              userId: target.id,
              userName: target.username,
              type: 'match_prize',
              amount: entry.prizeWon,
              status: 'approved',
              date: new Date().toLocaleString(),
              note: `Tournament Prize: Rank #${entry.position}, ${entry.kills} Kills (${entry.points} Pts) - ক্রেডিট করা হয়েছে উইনিং একাউন্টে`,
            };
            await setDoc(doc(db, 'transactions', tx.id), tx);

            await createNotification({
              userId: target.id,
              type: 'match_prize',
              title: '🏆 ম্যাচ উইনিং প্রাইজ যুক্ত হয়েছে!',
              message: `অভিনন্দন! #${entry.position} স্থান (${entry.kills} Kills) অর্জন করে ৳${entry.prizeWon} আপনার উইনিং একাউন্টে যোগ হয়েছে।`,
              matchId,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error publishing results in Firestore:', err);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...matchUpdate } : m))
    );
  };

  // -------------------------------------------------------------
  // ADMIN MODULE 6: WEBSITE SETTINGS
  // -------------------------------------------------------------
  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await Promise.race([
        setDoc(doc(db, 'settings', 'global'), updated),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Settings sync timeout')), 4000)),
      ]);
    } catch (err) {
      console.warn('Error updating settings in Firestore:', err);
    }
  };

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
        notifications,
        unreadNotificationCount,
        diamondPackages,
        topPlayers,
        settings,
        selectedCategory,
        setSelectedCategory,
        markNotificationAsRead,
        markAllNotificationsAsRead,
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
