export interface MockUserRecord {
  email: string;
  name: string;
  ndaAccepted: boolean;
}

const USERS = new Map<string, MockUserRecord>();

export function createMockToken(email: string): string {
  return `mock-token-${email.toLowerCase()}`;
}

export function upsertUserForEmail(email: string): { token: string; user: MockUserRecord } {
  const token = createMockToken(email);
  const existing = USERS.get(token);

  if (existing) {
    return { token, user: existing };
  }

  const user: MockUserRecord = {
    email,
    name: email.split("@")[0] || "Investor",
    ndaAccepted: false,
  };

  USERS.set(token, user);
  return { token, user };
}

export function getUserForToken(token: string | null | undefined): MockUserRecord | null {
  if (!token) return null;
  return USERS.get(token) ?? null;
}

export function markNdaAccepted(token: string): void {
  const user = USERS.get(token);
  if (!user) return;
  user.ndaAccepted = true;
}

export function isNdaAccepted(token: string | null | undefined): boolean {
  const user = getUserForToken(token);
  return user?.ndaAccepted ?? false;
}
