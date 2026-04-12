import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name_zh, name_en, category, description } = body;
    if (!name_zh) {
      return NextResponse.json({ error: 'Name (Chinese) is required' }, { status: 400 });
    }
    const project = await createProject(name_zh, name_en || '', category || 'other', description || '');
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
