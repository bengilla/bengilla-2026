import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护需要认证的路由
  const protectedPaths = [
    '/admin/dashboard',
    '/api/admin',
    '/api/upload',
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);

    if (!session.admin) {
      // 如果是 API 路由，返回 401 JSON 错误
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // 如果是前端页面，重定向到登录页
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 所有 /admin/ 路径都禁止浏览器缓存
  if (pathname.startsWith('/admin/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/api/admin/:path*',
    '/api/upload',
  ],
};
