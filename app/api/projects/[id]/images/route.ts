import { NextRequest, NextResponse } from 'next/server';
import { getProjectImages, deleteImage, addImage } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const images = await getProjectImages(id);
    return NextResponse.json({ images });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { url, thumb_url, filename } = body;
    if (!url || !filename) {
      return NextResponse.json({ error: 'url and filename are required' }, { status: 400 });
    }
    const image = await addImage(projectId, url, filename, thumb_url);
    const images = await getProjectImages(projectId);
    return NextResponse.json({ image, images }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { imageId } = body;
    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }
    await deleteImage(imageId);
    const images = await getProjectImages(projectId);
    return NextResponse.json({ images });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
