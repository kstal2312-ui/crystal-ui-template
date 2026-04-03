import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import type {
  User,
  Store,
  Product,
  Task,
  Deposit,
  Withdrawal,
  Referral,
  Notification,
  SiteSettings,
  Session,
} from "./types";

const DATA_DIR = path.join(os.tmpdir(), "crystal-ui-data");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create data directory:", error);
  }
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filename, defaultValue);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Failed to read JSON:", filename, error);
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write JSON:", filename, error);
  }
}

function generateInvitationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Users
export function getUsers(): User[] {
  return readJSON<User[]>("users.json", []);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByPhone(phone: string): User | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function getUserByInvitationCode(code: string): User | undefined {
  return getUsers().find((u) => u.invitationCode === code);
}

export function createUser(data: {
  name: string;
  phone: string;
  countryCode: string;
  password: string;
  referredBy: string | null;
}): User {
  const users = getUsers();
  const user: User = {
    id: uuidv4(),
    name: data.name,
    phone: data.phone,
    countryCode: data.countryCode || "+20",
    password: data.password,
    invitationCode: generateInvitationCode(),
    referredBy: data.referredBy,
    referralCount: 0,
    balance: 0,
    profits: 0,
    totalEarned: 0,
    subscriptionLevel: 0,
    isSubscribed: false,
    subscriptionPaid: false,
    subscriptionAccepted: false,
    createdAt: new Date().toISOString(),
    lastTaskTime: null,
    isActive: true,
  };
  users.push(user);
  writeJSON("users.json", users);
  return user;
}

export function updateUser(id: string, data: Partial<User>): User | undefined {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...data };
  writeJSON("users.json", users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeJSON("users.json", filtered);
  return true;
}

// Stores: Level 1=FREE($2/day), Level 2=$80, Level 3=$200, then doubles
export function getStores(): Store[] {
  const prices = [0, 80, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
  const profits = [2, 4, 10, 20, 40, 80, 160, 320, 640, 1280];
  const defaults: Store[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Store Level ${i + 1}`,
    price: prices[i],
    dailyProfit: profits[i],
    category: "Skincare Products & Devices",
    isActive: true,
  }));
  return readJSON<Store[]>("stores.json", defaults);
}

export function getStoreById(id: number): Store | undefined {
  return getStores().find((s) => s.id === id);
}

export function updateStore(id: number, data: Partial<Store>): Store | undefined {
  const stores = getStores();
  const idx = stores.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  stores[idx] = { ...stores[idx], ...data };
  writeJSON("stores.json", stores);
  return stores[idx];
}

// Products
export function getProducts(): Product[] {
  return readJSON<Product[]>("products.json", []);
}

export function getProductsByStore(storeId: number): Product[] {
  return getProducts().filter((p) => p.storeId === storeId);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id" | "createdAt">): Product {
  const products = getProducts();
  const product: Product = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  writeJSON("products.json", products);
  return product;
}

export function updateProduct(id: string, data: Partial<Product>): Product | undefined {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  products[idx] = { ...products[idx], ...data };
  writeJSON("products.json", products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeJSON("products.json", filtered);
  return true;
}

// Tasks
export function getTasks(): Task[] {
  return readJSON<Task[]>("tasks.json", []);
}

export function getTasksByUser(userId: string): Task[] {
  return getTasks().filter((t) => t.userId === userId);
}

export function getTaskById(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function createTask(data: Omit<Task, "id" | "createdAt" | "completedAt">): Task {
  const tasks = getTasks();
  const task: Task = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  tasks.push(task);
  writeJSON("tasks.json", tasks);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): Task | undefined {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...data };
  writeJSON("tasks.json", tasks);
  return tasks[idx];
}

// Deposits
export function getDeposits(): Deposit[] {
  return readJSON<Deposit[]>("deposits.json", []);
}

export function getDepositsByUser(userId: string): Deposit[] {
  return getDeposits().filter((d) => d.userId === userId);
}

export function createDeposit(data: Omit<Deposit, "id" | "createdAt" | "processedAt">): Deposit {
  const deposits = getDeposits();
  const deposit: Deposit = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    processedAt: null,
  };
  deposits.push(deposit);
  writeJSON("deposits.json", deposits);
  return deposit;
}

export function updateDeposit(id: string, data: Partial<Deposit>): Deposit | undefined {
  const deposits = getDeposits();
  const idx = deposits.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  deposits[idx] = { ...deposits[idx], ...data };
  writeJSON("deposits.json", deposits);
  return deposits[idx];
}

// Withdrawals
export function getWithdrawals(): Withdrawal[] {
  return readJSON<Withdrawal[]>("withdrawals.json", []);
}

export function getWithdrawalsByUser(userId: string): Withdrawal[] {
  return getWithdrawals().filter((w) => w.userId === userId);
}

export function createWithdrawal(data: Omit<Withdrawal, "id" | "createdAt" | "processedAt">): Withdrawal {
  const withdrawals = getWithdrawals();
  const withdrawal: Withdrawal = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    processedAt: null,
  };
  withdrawals.push(withdrawal);
  writeJSON("withdrawals.json", withdrawals);
  return withdrawal;
}

export function updateWithdrawal(id: string, data: Partial<Withdrawal>): Withdrawal | undefined {
  const withdrawals = getWithdrawals();
  const idx = withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) return undefined;
  withdrawals[idx] = { ...withdrawals[idx], ...data };
  writeJSON("withdrawals.json", withdrawals);
  return withdrawals[idx];
}

// Referrals
export function getReferrals(): Referral[] {
  return readJSON<Referral[]>("referrals.json", []);
}

export function getReferralsByUser(userId: string): Referral[] {
  return getReferrals().filter((r) => r.referrerId === userId);
}

export function createReferral(data: Omit<Referral, "id" | "createdAt" | "processedAt">): Referral {
  const referrals = getReferrals();
  const referral: Referral = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    processedAt: null,
  };
  referrals.push(referral);
  writeJSON("referrals.json", referrals);
  return referral;
}

export function updateReferral(id: string, data: Partial<Referral>): Referral | undefined {
  const referrals = getReferrals();
  const idx = referrals.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  referrals[idx] = { ...referrals[idx], ...data };
  writeJSON("referrals.json", referrals);
  return referrals[idx];
}

// Notifications
export function getNotifications(): Notification[] {
  return readJSON<Notification[]>("notifications.json", []);
}

export function createNotification(data: Omit<Notification, "id" | "createdAt">): Notification {
  const notifications = getNotifications();
  const notification: Notification = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  if (notifications.length > 100) notifications.splice(100);
  writeJSON("notifications.json", notifications);
  return notification;
}

export function getRecentNotifications(count: number = 20): Notification[] {
  return getNotifications().slice(0, count);
}

// Site Settings
export function getSettings(): SiteSettings {
  const defaults: SiteSettings = {
    siteName: "Crystal One",
    logo: "",
    welcomeMessage: "Welcome to Crystal One - Your trusted shopping platform",
    adminPhone: "01026541250",
    adminPassword: "abdallah112021",
    commissionRates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    storePrices: [0, 80, 200, 400, 800, 1600, 3200, 6400, 12800, 25600],
    storeProfits: [2, 4, 10, 20, 40, 80, 160, 320, 640, 1280],
    depositPhones: [],
  };
  return readJSON<SiteSettings>("settings.json", defaults);
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  const settings = getSettings();
  const updated = { ...settings, ...data };
  writeJSON("settings.json", updated);
  return updated;
}

// Sessions
export function getSessions(): Record<string, Session> {
  return readJSON<Record<string, Session>>("sessions.json", {});
}

export function createSession(userId: string, isAdmin: boolean): string {
  const sessions = getSessions();
  const token = uuidv4();
  sessions[token] = {
    userId,
    isAdmin,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  writeJSON("sessions.json", sessions);
  return token;
}

export function getSession(token: string): Session | undefined {
  const sessions = getSessions();
  const session = sessions[token];
  if (!session) return undefined;
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeJSON("sessions.json", sessions);
    return undefined;
  }
  return session;
}

export function deleteSession(token: string): void {
  const sessions = getSessions();
  delete sessions[token];
  writeJSON("sessions.json", sessions);
}
