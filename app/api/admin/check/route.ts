import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({ loggedIn: !!session.admin });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
