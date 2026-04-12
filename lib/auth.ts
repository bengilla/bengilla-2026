import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  admin?: {
    username: string;
  };
}

function getSessionPassword(): string {
  const password = process.env.SESSION_PASSWORD;
  if (!password) {
    throw new Error('SESSION_PASSWORD environment variable is not set. Please set it in your .env.local file.');
  }
  if (password.length < 32) {
    throw new Error('SESSION_PASSWORD must be at least 32 characters long for security.');
  }
  return password;
}

const SESSION_PASSWORD = getSessionPassword();

export const sessionOptions: SessionOptions = {
  password: SESSION_PASSWORD,
  cookieName: 'bengilla_session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}
