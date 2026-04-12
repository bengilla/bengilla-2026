import { NextRequest, NextResponse } from 'next/server';
import { addImage, getProjectById } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getSession } from '@/lib/auth';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and projectId are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const baseFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${baseFilename}.${safeExt}`;
    const thumbFilename = `${baseFilename}_thumb.${safeExt}`;

    if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
      return NextResponse.json(
        { error: 'Invalid projectId format' },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', projectId);

    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);

    const thumbBuffer = await sharp(buffer)
      .resize(400, null, { withoutEnlargement: true })
      .toBuffer();
    await writeFile(path.join(uploadDir, thumbFilename), thumbBuffer);

    const url = `/uploads/${projectId}/${filename}`;
    const thumbUrl = `/uploads/${projectId}/${thumbFilename}`;
    const image = await addImage(projectId, url, filename, thumbUrl);

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
