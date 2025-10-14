// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

/**
 * Middleware для защиты приватных маршрутов
 * Проверяет наличие сессии пользователя и перенаправляет на /login если сессии нет
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  
  // Проверяем наличие сессии
  const userId = req.cookies.get('userId')?.value?.trim();
  const hasSession = !!userId;

  // Если сессия есть — пропускаем
  if (hasSession) {
    return NextResponse.next();
  }

  // Если сессии нет — редиректим на /login с возвратом на исходный URL
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('returnTo', pathname + search);
  
  return NextResponse.redirect(url);
}

/**
 * Конфигурация путей для middleware
 * Перехватываем все маршруты КРОМЕ:
 * - Технические пути Next.js (_next, static, favicon и т.д.)
 * - Публичные страницы аутентификации (login, register, verify)
 * - Страницы принятия приглашений (acceptinvitation)
 * - API маршруты аутентификации
 */
export const config = {
  matcher: [
    '/((?!_next|static|public|favicon.ico|robots.txt|sitemap.xml|images|api/auth|login|signup|register|verify|employees/acceptinvitation|^/$).*)',
  ],
};