export interface ImageItem {
  id: string;
  project_id: string;
  url: string;
  thumb_url?: string;
  filename: string;
  created_at: string;
}

export interface Project {
  id: string;
  name_zh: string;
  name_en: string;
  category: string;
  description: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
  images?: ImageItem[];
  imageCount?: number;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export const CATEGORIES = [
  { value: 'stage', label: '舞台设计' },
  { value: 'lighting', label: '灯光设计' },
  { value: 'exhibition', label: '展会设计' },
  { value: 'architecture', label: '建筑设计' },
  { value: 'product', label: '产品设计' },
  { value: 'graphic', label: '平面设计' },
  { value: 'photography', label: '摄影' },
  { value: 'illustration', label: '插画' },
  { value: 'other', label: '其他' },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label || '其他';
}
