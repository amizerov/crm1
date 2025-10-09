// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // если нашли сессию — пропускаем
  const hasSession =
    req.cookies.get('userId')?.value?.trim();

  if (hasSession) {
    return NextResponse.next();
  }

  // редирект на /login c возвратом на изначальный URL после авторизации
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

// исключаем из перехвата статику, системные пути и публичные страницы
export const config = {
  matcher: [
    // перехватываем всё, КРОМЕ перечисленного
    '/((?!_next|static|public|favicon.ico|robots.txt|sitemap.xml|images|api/auth|login|signup|register|verify).*)',
  ],
};