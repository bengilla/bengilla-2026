/**
 * Internationalization utilities
 * Handles localization for UI text based on browser language
 */

type Locale =
  | 'zh' | 'ja' | 'ko' | 'de' | 'fr' | 'es'
  | 'it' | 'pt' | 'ru' | 'ar' | 'en';

const LOCALES: Locale[] = [
  'zh', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar',
];

/**
 * Get current browser locale
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const lang = navigator.language || 'en';
  const locale = lang.toLowerCase();

  if (locale.startsWith('zh')) return 'zh';
  if (locale.startsWith('ja')) return 'ja';
  if (locale.startsWith('ko')) return 'ko';
  if (locale.startsWith('de')) return 'de';
  if (locale.startsWith('fr')) return 'fr';
  if (locale.startsWith('es')) return 'es';
  if (locale.startsWith('it')) return 'it';
  if (locale.startsWith('pt')) return 'pt';
  if (locale.startsWith('ru')) return 'ru';
  if (locale.startsWith('ar')) return 'ar';

  return 'en';
}

/**
 * Category translations for HeroSlider
 */
export const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
  zh: {
    stage: '舞台设计',
    lighting: '灯光设计',
    exhibition: '展会设计',
    architecture: '建筑设计',
    product: '产品设计',
    graphic: '平面设计',
    photography: '摄影',
    illustration: '插画',
    other: '其他',
  },
  ja: {
    stage: 'ステージデザイン',
    lighting: '照明デザイン',
    exhibition: '展示会デザイン',
    architecture: '建築デザイン',
    product: 'プロダクトデザイン',
    graphic: 'グラフィックデザイン',
    photography: '写真',
    illustration: 'イラストレーション',
    other: 'その他',
  },
  ko: {
    stage: '무대 디자인',
    lighting: '조명 디자인',
    exhibition: '전시회 디자인',
    architecture: '건축 디자인',
    product: '제품 디자인',
    graphic: '그래픽 디자인',
    photography: '사진',
    illustration: '일러스트레이션',
    other: '기타',
  },
  en: {
    stage: 'Stage Design',
    lighting: 'Lighting Design',
    exhibition: 'Exhibition Design',
    architecture: 'Architecture',
    product: 'Product Design',
    graphic: 'Graphic Design',
    photography: 'Photography',
    illustration: 'Illustration',
    other: 'Other',
  },
  de: {
    stage: 'Bühnengestaltung',
    lighting: 'Lichtgestaltung',
    exhibition: 'Ausstellungsdesign',
    architecture: 'Architektur',
    product: 'Produktdesign',
    graphic: 'Grafikdesign',
    photography: 'Fotografie',
    illustration: 'Illustration',
    other: 'Andere',
  },
  fr: {
    stage: 'Conception de scène',
    lighting: 'Conception éclairage',
    exhibition: 'Design d\'exposition',
    architecture: 'Architecture',
    product: 'Design de produit',
    graphic: 'Design graphique',
    photography: 'Photographie',
    illustration: 'Illustration',
    other: 'Autre',
  },
  es: {
    stage: 'Diseño de escenario',
    lighting: 'Diseño de iluminación',
    exhibition: 'Diseño de exposición',
    architecture: 'Arquitectura',
    product: 'Diseño de producto',
    graphic: 'Diseño gráfico',
    photography: 'Fotografía',
    illustration: 'Ilustración',
    other: 'Otro',
  },
  it: {
    stage: 'Progettazione del palco',
    lighting: 'Progettazione luci',
    exhibition: 'Design di esposizione',
    architecture: 'Architettura',
    product: 'Progettazione del prodotto',
    graphic: 'Design grafico',
    photography: 'Fotografia',
    illustration: 'Illustrazione',
    other: 'Altro',
  },
  pt: {
    stage: 'Design de palco',
    lighting: 'Design de iluminação',
    exhibition: 'Design de exposição',
    architecture: 'Arquitetura',
    product: 'Design de produto',
    graphic: 'Design gráfico',
    photography: 'Fotografia',
    illustration: 'Ilustração',
    other: 'Outro',
  },
  ru: {
    stage: 'Дизайн сцены',
    lighting: 'Дизайн освещения',
    exhibition: 'Дизайн выставки',
    architecture: 'Архитектура',
    product: 'Дизайн продукта',
    graphic: 'Графический дизайн',
    photography: 'Фотография',
    illustration: 'Иллюстрация',
    other: 'Другое',
  },
  ar: {
    stage: 'تصميم المسرح',
    lighting: 'تصميم الإضاءة',
    exhibition: 'تصميم المعرض',
    architecture: 'هندسة معمارية',
    product: 'تصميم المنتج',
    graphic: 'التصميم الجرافيكي',
    photography: 'التصوير',
    illustration: 'الرسوم التوضيحية',
    other: 'أخرى',
  },
};

/**
 * Get localized category text
 */
export function tCategory(category: string): string {
  const locale = getLocale();
  const labels = CATEGORY_LABELS[locale] || CATEGORY_LABELS.en;
  return labels[category] || CATEGORY_LABELS.en[category] || category;
}

/**
 * UI text translations for Header
 */
export const UI_LABELS: Record<Locale, {
  projects: string;
  selected: (n: number) => string;
  contactMe: string;
}> = {
  zh: {
    projects: '项目',
    selected: (n) => `已选 · ${n} 个项目`,
    contactMe: '欢迎联系我',
  },
  ja: {
    projects: 'プロジェクト',
    selected: (n) => `選択中 · ${n} プロジェクト`,
    contactMe: 'お問い合わせ',
  },
  ko: {
    projects: '프로젝트',
    selected: (n) => `선택됨 · ${n} 프로젝트`,
    contactMe: '연락처',
  },
  en: {
    projects: 'Projects',
    selected: (n) => `Selected · ${n} Projects`,
    contactMe: 'Contact me',
  },
  de: {
    projects: 'Projekte',
    selected: (n) => `Ausgewählt · ${n} Projekte`,
    contactMe: 'Kontakt',
  },
  fr: {
    projects: 'Projets',
    selected: (n) => `Sélectionné · ${n} projets`,
    contactMe: 'Contactez-moi',
  },
  es: {
    projects: 'Proyectos',
    selected: (n) => `Seleccionado · ${n} proyectos`,
    contactMe: 'Contáctame',
  },
  it: {
    projects: 'Progetti',
    selected: (n) => `Selezionato · ${n} progetti`,
    contactMe: 'Contattami',
  },
  pt: {
    projects: 'Projetos',
    selected: (n) => `Selecionado · ${n} projetos`,
    contactMe: 'Entre em contato',
  },
  ru: {
    projects: 'Проекты',
    selected: (n) => `Выбрано · ${n} проектов`,
    contactMe: 'Свяжитесь со мной',
  },
  ar: {
    projects: 'المشاريع',
    selected: (n) => `محدد · ${n} مشاريع`,
    contactMe: 'تواصل معي',
  },
};

/**
 * Get "Projects" text
 */
export function tProjects(): string {
  return UI_LABELS[getLocale()]?.projects || 'Projects';
}

/**
 * Get "Selected X Projects" text
 */
export function tSelected(count: number): string {
  return UI_LABELS[getLocale()]?.selected(count) || `Selected · ${count} Projects`;
}

/**
 * Get "Contact me" text
 */
export function tContactMe(): string {
  return UI_LABELS[getLocale()]?.contactMe || 'Contact me';
}
