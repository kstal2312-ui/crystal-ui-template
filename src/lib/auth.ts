import { cookies } from "next/headers";
import { getSession, getUserById } from "./data";
import type { User } from "./types";

export async function getCurrentUser(): Promise<{
  user: User | null;
  isAdmin: boolean;
  session: { userId: string; isAdmin: boolean } | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return { user: null, isAdmin: false, session: null };

  const session = getSession(token);
  if (!session) return { user: null, isAdmin: false, session: null };

  if (session.isAdmin) {
    return { user: null, isAdmin: true, session };
  }

  const user = getUserById(session.userId);
  if (!user) return { user: null, isAdmin: false, session: null };

  return { user, isAdmin: false, session };
}

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const patterns = [
    /^(\+20|0020|0)?1[0125]\d{8}$/,
    /^(\+966|00966|0)?5\d{8}$/,
    /^(\+971|00971|0)?[2-9]\d{7,8}$/,
    /^(\+965|00965)?[2-9]\d{6,7}$/,
    /^(\+218|00218|0)?[2-9]\d{7,9}$/,
  ];
  return patterns.some((p) => p.test(cleaned));
}

export function getPhoneCountry(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (/^(\+20|0020|0)?1[0125]\d{8}$/.test(cleaned)) return "EG";
  if (/^(\+966|00966|0)?5\d{8}$/.test(cleaned)) return "SA";
  if (/^(\+971|00971|0)?[2-9]\d{7,8}$/.test(cleaned)) return "AE";
  if (/^(\+965|00965)?[2-9]\d{6,7}$/.test(cleaned)) return "KW";
  if (/^(\+218|00218|0)?[2-9]\d{7,9}$/.test(cleaned)) return "LY";
  return null;
}
