/**
 * Утилиты для работы с iron-session
 * Криптографически защищенные сессии вместо простых cookies
 */

import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

/**
 * Интерфейс данных сессии
 */
export interface SessionData {
  userId?: number;
  userNicName?: string;
  isLoggedIn: boolean;
}

/**
 * Конфигурация iron-session
 * КРИТИЧНО: SESSION_SECRET должен быть установлен в .env.local
 */
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'crm_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  },
};

/**
 * Получить текущую сессию
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Создать сессию для пользователя
 */
export async function createSession(userId: number, userNicName: string) {
  const session = await getSession();
  session.userId = userId;
  session.userNicName = userNicName;
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Удалить сессию (logout)
 */
export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

/**
 * Проверить наличие активной сессии
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true && !!session.userId;
}
