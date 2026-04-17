import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readData } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Project } from '@/lib/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ orphaned: [] });
    }

    const entries = fs.readdirSync(uploadDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

    const data = await readData();
    const validProjectIds = new Set<string>(data.projects.map((p: Project) => p.id));

    const orphaned: { projectId: string; files: string[] }[] = [];

    for (const dir of dirs) {
      if (!validProjectIds.has(dir)) {
        const dirPath = path.join(uploadDir, dir);
        const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
        if (files.length > 0) {
          orphaned.push({ projectId: dir, files });
        }
      }
    }

    for (const projectId of Array.from(validProjectIds)) {
      const projectDir = path.join(uploadDir, projectId);
      if (fs.existsSync(projectDir)) {
        const dirEntries = fs.readdirSync(projectDir, { withFileTypes: true });
        const physicalFiles = dirEntries
          .filter(e => e.isFile() && !e.name.startsWith('.'))
          .map(e => e.name);

        const project = data.projects.find((p: Project) => p.id === projectId);
        if (project) {
          const validFiles = new Set<string>();
          if (project.images) {
            for (const img of project.images) {
              const urlPath = img.url.split('/').pop();
              const thumbPath = img.thumb_url?.split('/').pop();
              if (urlPath) validFiles.add(urlPath);
              if (thumbPath) validFiles.add(thumbPath);
            }
          }

          const orphanedFiles = physicalFiles.filter(f => !validFiles.has(f));
          if (orphanedFiles.length > 0) {
            const existing = orphaned.find(o => o.projectId === projectId);
            if (existing) {
              existing.files.push(...orphanedFiles);
            } else {
              orphaned.push({ projectId, files: orphanedFiles });
            }
          }
        }
      }
    }

    return NextResponse.json({ orphaned });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, files } = await request.json() as { projectId: string; files?: string[] };
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!projectId || (projectId !== '*' && !/^[a-zA-Z0-9_-]+$/.test(projectId))) {
      return NextResponse.json(
        { error: 'Invalid projectId' },
        { status: 400 }
      );
    }

    const deleted: string[] = [];

    if (projectId === '*') {
      const entries = fs.readdirSync(uploadDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
      const data = await readData();
      const validProjectIds = new Set<string>(data.projects.map((p: Project) => p.id));

      for (const dir of dirs) {
        if (!validProjectIds.has(dir)) {
          const dirPath = path.join(uploadDir, dir);
          const subEntries = fs.readdirSync(dirPath);
          for (const f of subEntries) {
            const filePath = path.join(dirPath, f);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
              deleted.push(`${dir}/${f}`);
            }
          }
          fs.rmdirSync(dirPath);
          deleted.push(dir);
        } else {
          const projectDir = path.join(uploadDir, dir);
          const dirEntries = fs.readdirSync(projectDir, { withFileTypes: true });
          const physicalFiles = dirEntries
            .filter(e => e.isFile() && !e.name.startsWith('.'))
            .map(e => e.name);

          const project = data.projects.find((p: Project) => p.id === dir);
          if (project) {
            const validFiles = new Set<string>();
            if (project.images) {
              for (const img of project.images) {
                const urlPath = img.url.split('/').pop();
                const thumbPath = img.thumb_url?.split('/').pop();
                if (urlPath) validFiles.add(urlPath);
                if (thumbPath) validFiles.add(thumbPath);
              }
            }

            const orphanedFiles = physicalFiles.filter(f => !validFiles.has(f));
            for (const f of orphanedFiles) {
              const filePath = path.join(projectDir, f);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                deleted.push(`${dir}/${f}`);
              }
            }

            let remaining = 0;
            if (fs.existsSync(projectDir)) {
              remaining = fs.readdirSync(projectDir).filter(f => !f.startsWith('.')).length;
            }
            if (remaining === 0) {
              fs.rmdirSync(projectDir);
              deleted.push(`(empty dir ${dir})`);
            }
          }
        }
      }
    } else if (files && Array.isArray(files)) {
      const projectDir = path.join(uploadDir, projectId);

      for (const file of files) {
        if (!file || typeof file !== 'string' || file.includes('/') || file.includes('\\') || file.includes('..')) {
          continue;
        }

        const safeFilename = file.replace(/[^a-zA-Z0-9._-]/g, '');
        if (!safeFilename || safeFilename !== file) {
          continue;
        }

        const filePath = path.join(projectDir, safeFilename);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          deleted.push(`${projectId}/${safeFilename}`);
        }
      }

      let remaining = 0;
      if (fs.existsSync(projectDir)) {
        remaining = fs.readdirSync(projectDir).filter(f => !f.startsWith('.')).length;
      }
      if (remaining === 0) {
        fs.rmdirSync(projectDir);
        deleted.push(`(empty dir ${projectId})`);
      }
    }

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
