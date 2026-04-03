export interface User {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  password: string;
  invitationCode: string;
  referredBy: string | null;
  referralCount: number;
  balance: number;
  profits: number;
  totalEarned: number;
  subscriptionLevel: number;
  isSubscribed: boolean;
  subscriptionPaid: boolean;
  subscriptionAccepted: boolean;
  createdAt: string;
  lastTaskTime: string | null;
  isActive: boolean;
}

export interface Store {
  id: number;
  name: string;
  price: number;
  dailyProfit: number;
  category: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  storeId: number;
  name: string;
  description: string;
  price: number;
  profitMargin: number;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  commission: number;
  commissionPercent: number;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
  completedAt: string | null;
  scheduledFor: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  recipientPhone: string;
  senderPhone: string;
  amount: number;
  transferNumber: string;
  image: string | null;
  adminNotes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt: string | null;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  paymentPhone: string;
  adminNotes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt: string | null;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredPhone: string;
  status: "pending" | "approved" | "rejected";
  reward: number;
  createdAt: string;
  processedAt: string | null;
}

export interface Notification {
  id: string;
  type: "withdrawal" | "reward" | "prize" | "welcome" | "info";
  message: string;
  messageAr: string;
  userName: string;
  amount: number;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  welcomeMessage: string;
  adminPhone: string;
  adminPassword: string;
  commissionRates: number[];
  storePrices: number[];
  storeProfits: number[];
  depositPhones: string[];
}

export interface Session {
  userId: string;
  isAdmin: boolean;
  expiresAt: string;
}
