// proxy.ts
import { NextResponse, NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

/**
 * Proxy для защиты приватных маршрутов
 * Проверяет наличие криптографически защищенной сессии (iron-session)
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  
  // Разрешаем доступ к корневой странице без авторизации
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Проверяем наличие защищенной сессии
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(req, response, sessionOptions);
  const hasSession = session.isLoggedIn === true && !!session.userId;

  // Если сессия есть — пропускаем
  if (hasSession) {
    return response;
  }

  // Если сессии нет — редиректим на /login с возвратом на исходный URL
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('returnTo', pathname + search);
  
  return NextResponse.redirect(url);
}

/**
 * Конфигурация путей для proxy
 * Перехватываем все маршруты КРОМЕ:
 * - Технические пути Next.js (_next, static, favicon и т.д.)
 * - Публичные страницы аутентификации (login, register, verify)
 * - Страницы принятия приглашений (acceptinvitation)
 * - API маршруты аутентификации
 */
export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|robots.txt|sitemap.xml|logo|screenshots|api/auth|login|signup|register|verify|employees/acceptinvitation).+)',
  ],
};