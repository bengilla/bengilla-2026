const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 分钟

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

export function checkLoginAttempts(ip: string): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null };
  }

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: attempt.lockedUntil };
  }

  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null };
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count, lockedUntil: null };
}

export function recordFailedLogin(ip: string): { remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  let attempt = loginAttempts.get(ip);

  if (!attempt || (attempt.lockedUntil && now >= attempt.lockedUntil)) {
    attempt = { count: 0, firstAttempt: now, lockedUntil: null };
  }

  attempt.count += 1;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(ip, attempt);
    return { remainingAttempts: 0, lockedUntil: attempt.lockedUntil };
  }

  loginAttempts.set(ip, attempt);
  return { remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count, lockedUntil: null };
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
