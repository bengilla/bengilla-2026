import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { ImageItem, Project, Admin } from './types';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const AUTH_FILE = path.join(process.cwd(), 'lib', 'auth.json');

export type { ImageItem, Project, Admin };
export { CATEGORIES, getCategoryLabel } from './types';

interface ProjectData {
  projects: Project[];
}

interface AuthData {
  admins: Admin[];
}

// 读取项目数据
export async function readData(): Promise<ProjectData> {
  if (!existsSync(DATA_FILE)) {
    const initial: ProjectData = { projects: [] };
    
    // 插入示例项目
    initial.projects = [
      {
        id: uuidv4(),
        name_zh: '创意平面',
        name_en: 'Graphic Design',
        category: 'graphic',
        description: 'Creative design project A',
        cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&q=80', filename: '1.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600&q=80', filename: '2.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1600&q=80', filename: '3.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80', filename: '4.jpg', created_at: new Date().toISOString() },
        ],
      },
      {
        id: uuidv4(),
        name_zh: '舞台视觉',
        name_en: 'Stage Design',
        category: 'stage',
        description: 'Visual identity project B',
        cover_image: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1600&q=80', filename: '1.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1600&q=80', filename: '2.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80', filename: '3.jpg', created_at: new Date().toISOString() },
        ],
      },
      {
        id: uuidv4(),
        name_zh: '建筑设计',
        name_en: 'Architecture',
        category: 'architecture',
        description: 'Art direction project C',
        cover_image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1600&q=80', filename: '1.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1600&q=80', filename: '2.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&q=80', filename: '3.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80', filename: '4.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1600&q=80', filename: '5.jpg', created_at: new Date().toISOString() },
        ],
      },
      {
        id: uuidv4(),
        name_zh: '产品设计',
        name_en: 'Product Design',
        category: 'product',
        description: 'Brand design project D',
        cover_image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80', filename: '1.jpg', created_at: new Date().toISOString() },
          { id: uuidv4(), project_id: '', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1600&q=80', filename: '2.jpg', created_at: new Date().toISOString() },
        ],
      },
    ];
    // 补上 project_id
    for (const p of initial.projects) {
      if (p.images) {
        for (const img of p.images) {
          img.project_id = p.id;
        }
        p.imageCount = p.images.length;
      }
    }
    await writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
    console.log('✅ Data file created with sample projects');
    return initial;
  }

  const content = await readFile(DATA_FILE, 'utf-8');
  const data: ProjectData = JSON.parse(content);

  // 迁移：给旧项目补上缺失字段
  for (const p of data.projects) {
    if (!('category' in p)) {
      (p as Project).category = 'other';
    }
    if (!('name_zh' in p)) {
      (p as Project).name_zh = (p as any).name || '';
      (p as Project).name_en = '';
    }
    if (!('name_en' in p)) {
      (p as Project).name_en = '';
    }
  }

  return data;
}

async function writeData(data: ProjectData): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// 读取认证数据
async function readAuth(): Promise<AuthData> {
  if (!existsSync(AUTH_FILE)) {
    // 自动创建默认管理员
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashed = bcrypt.hashSync(defaultPassword, 10);
    const initial: AuthData = {
      admins: [{
        id: 'admin',
        username: 'admin',
        password: hashed,
        created_at: new Date().toISOString(),
      }]
    };
    
    // 确保 lib 目录存在
    const libDir = path.dirname(AUTH_FILE);
    if (!existsSync(libDir)) {
      await mkdir(libDir, { recursive: true });
    }
    
    await writeFile(AUTH_FILE, JSON.stringify(initial, null, 2));
    console.log('✅ Auth file created with admin/admin123');
    return initial;
  }

  const content = await readFile(AUTH_FILE, 'utf-8');
  return JSON.parse(content);
}

async function writeAuth(data: AuthData): Promise<void> {
  // 确保 lib 目录存在
  const libDir = path.dirname(AUTH_FILE);
  if (!existsSync(libDir)) {
    await mkdir(libDir, { recursive: true });
  }
  await writeFile(AUTH_FILE, JSON.stringify(data, null, 2));
}

// ==================== 项目操作 ====================
export async function getAllProjects(): Promise<Project[]> {
  const data = await readData();
  return data.projects.map((p) => ({
    ...p,
    imageCount: p.images?.length || 0,
  }));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const data = await readData();
  const project = data.projects.find((p) => p.id === id);
  if (!project) return undefined;
  return { ...project, imageCount: project.images?.length || 0 };
}

export async function getProjectImages(projectId: string): Promise<ImageItem[]> {
  const data = await readData();
  const project = data.projects.find((p) => p.id === projectId);
  return project?.images || [];
}

export async function createProject(name_zh: string, name_en: string, category: string, description: string): Promise<Project> {
  const data = await readData();
  const now = new Date().toISOString();
  const project: Project = {
    id: uuidv4(),
    name_zh,
    name_en,
    category,
    description,
    cover_image: '',
    created_at: now,
    updated_at: now,
    images: [],
    imageCount: 0,
  };
  data.projects.unshift(project);
  await writeData(data);
  return project;
}

export async function updateProject(id: string, name_zh: string, name_en: string, category: string, description: string): Promise<Project | undefined> {
  const data = await readData();
  const project = data.projects.find((p) => p.id === id);
  if (!project) return undefined;
  project.name_zh = name_zh;
  project.name_en = name_en;
  project.category = category;
  project.description = description;
  project.updated_at = new Date().toISOString();
  await writeData(data);
  return { ...project, imageCount: project.images?.length || 0 };
}

export async function deleteProject(id: string): Promise<void> {
  const data = await readData();
  data.projects = data.projects.filter((p) => p.id !== id);
  await writeData(data);
}

export async function addImage(projectId: string, url: string, filename: string, thumbUrl?: string): Promise<ImageItem> {
  const data = await readData();
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const image: ImageItem = {
    id: uuidv4(),
    project_id: projectId,
    url,
    thumb_url: thumbUrl,
    filename,
    created_at: new Date().toISOString(),
  };
  if (!project.images) project.images = [];
  project.images.push(image);
  project.imageCount = project.images.length;
  if (!project.cover_image && project.images.length === 1) {
    project.cover_image = url;
  }
  await writeData(data);
  return image;
}

export async function deleteImage(id: string): Promise<void> {
  const data = await readData();
  for (const project of data.projects) {
    if (project.images) {
      project.images = project.images.filter((img) => img.id !== id);
      project.imageCount = project.images.length;
      if (project.cover_image) {
        // 重新设置封面
        project.cover_image = project.images[0]?.url || '';
      }
    }
  }
  await writeData(data);
}

// ==================== 管理员操作 ====================
export async function getAdminByUsername(username: string): Promise<Admin | undefined> {
  const auth = await readAuth();
  return auth.admins.find((a) => a.username === username);
}

export async function updateAdminPassword(username: string, newPassword: string): Promise<void> {
  const auth = await readAuth();
  const admin = auth.admins.find((a) => a.username === username);
  if (admin) {
    admin.password = bcrypt.hashSync(newPassword, 10);
    await writeAuth(auth);
  }
}
