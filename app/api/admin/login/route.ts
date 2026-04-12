import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminByUsername } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkLoginAttempts, recordFailedLogin, clearLoginAttempts } from '@/lib/rate-limit';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const { allowed, remainingAttempts, lockedUntil } = checkLoginAttempts(clientIp);

    if (!allowed) {
      const waitMinutes = Math.ceil((lockedUntil! - Date.now()) / 60000);
      return NextResponse.json(
        { error: `登录尝试次数过多，请在 ${waitMinutes} 分钟后重试` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      const { remainingAttempts: remaining } = recordFailedLogin(clientIp);
      return NextResponse.json(
        { error: `无效的凭据，剩余尝试次数：${remaining}` },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      const { remainingAttempts: remaining, lockedUntil: lockUntil } = recordFailedLogin(clientIp);
      if (lockUntil) {
        const waitMinutes = Math.ceil((lockUntil - Date.now()) / 60000);
        return NextResponse.json(
          { error: `登录失败次数过多，请在 ${waitMinutes} 分钟后重试` },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `无效的凭据，剩余尝试次数：${remaining}` },
        { status: 401 }
      );
    }

    clearLoginAttempts(clientIp);

    const session = await getSession();
    session.admin = { username: admin.username };
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
