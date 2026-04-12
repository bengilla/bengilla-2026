import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminByUsername, updateAdminPassword } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { validatePasswordStrength } from '@/lib/password-validation';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码都不能为空' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: '新密码不能与当前密码相同' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: `新密码不符合要求：${passwordValidation.errors.join('；')}` },
        { status: 400 }
      );
    }

    const admin = await getAdminByUsername(session.admin.username);
    if (!admin) {
      return NextResponse.json({ error: '管理员账户不存在' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 401 }
      );
    }

    await updateAdminPassword(admin.username, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 });
  }
}
