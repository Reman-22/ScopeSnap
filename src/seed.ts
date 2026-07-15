import type { Client, Project, ChangeRequest, Activity, User } from './types';

export const SEED_USER: User = {
  id: 'user-1',
  name: 'أحمد المهندس',
  email: 'ahmad@example.com',
  role: 'freelancer',
};

export const SEED_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'سارة الخالدي',
    email: 'sara@clothing-store.com',
    company: 'متجر الملابس العصرية',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'client-2',
    name: 'خالد العتيبي',
    email: 'khalid@techstart.io',
    company: 'TechStart Solutions',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'client-3',
    name: 'نورة الفهد',
    email: 'noura@designstudio.sa',
    company: 'استوديو التصميم الإبداعي',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'متجر إلكتروني لبيع الملابس',
    description: 'تطوير متجر إلكتروني كامل لبيع الملابس النسائية مع نظام إدارة متكامل',
    clientId: 'client-1',
    status: 'approved',
    shareLink: 'share-project-1-abc123',
    approvedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    scopeSections: [
      {
        id: 'section-1-1',
        title: 'واجهة المستخدم الرئيسية',
        items: [
          { id: 'item-1-1-1', title: 'الصفحة الرئيسية مع عرض المنتجات المميزة', description: 'تصميم جذاب يعرض أحدث المنتجات والعروض', status: 'included' },
          { id: 'item-1-1-2', title: 'صفحة عرض المنتجات مع فلاتر', description: 'بحث متقدم وفلترة حسب الفئة والسعر', status: 'included' },
          { id: 'item-1-1-3', title: 'دعم اللغة العربية والإنجليزية', status: 'included' },
          { id: 'item-1-1-4', title: 'تطبيق موبايل أصلي', status: 'excluded' },
        ],
      },
      {
        id: 'section-1-2',
        title: 'سلة الشراء والدفع',
        items: [
          { id: 'item-1-2-1', title: 'سلة شراء تفاعلية', status: 'included' },
          { id: 'item-1-2-2', title: 'الدفع عند الاستلام', status: 'included' },
          { id: 'item-1-2-3', title: 'الدفع عبر البطاقات البنكية', description: 'تكامل مع بوابة دفع إلكترونية', status: 'excluded' },
          { id: 'item-1-2-4', title: 'الدفع عبر PayPal', status: 'pending' },
        ],
      },
      {
        id: 'section-1-3',
        title: 'لوحة تحكم الأدمن',
        items: [
          { id: 'item-1-3-1', title: 'إدارة المنتجات والفئات', status: 'included' },
          { id: 'item-1-3-2', title: 'إدارة الطلبات والشحن', status: 'included' },
          { id: 'item-1-3-3', title: 'تقارير المبيعات والإحصائيات', status: 'included' },
          { id: 'item-1-3-4', title: 'نظام إدارة المخزون المتقدم', status: 'excluded' },
        ],
      },
    ],
  },
  {
    id: 'project-2',
    name: 'موقع شركة تقنية',
    description: 'تصميم وتطوير موقع تعريفي احترافي لشركة ناشئة في مجال التقنية',
    clientId: 'client-2',
    status: 'sent',
    shareLink: 'share-project-2-def456',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    scopeSections: [
      {
        id: 'section-2-1',
        title: 'الصفحات الأساسية',
        items: [
          { id: 'item-2-1-1', title: 'صفحة من نحن', status: 'included' },
          { id: 'item-2-1-2', title: 'صفحة الخدمات', status: 'included' },
          { id: 'item-2-1-3', title: 'صفحة التواصل', status: 'included' },
          { id: 'item-2-1-4', title: 'مدونة تقنية', status: 'pending' },
        ],
      },
      {
        id: 'section-2-2',
        title: 'الميزات التقنية',
        items: [
          { id: 'item-2-2-1', title: 'تصميم متجاوب', status: 'included' },
          { id: 'item-2-2-2', title: 'تحسين محركات البحث SEO', status: 'included' },
          { id: 'item-2-2-3', title: 'نظام حجز مواعيد', status: 'excluded' },
        ],
      },
    ],
  },
  {
    id: 'project-3',
    name: 'هوية بصرية لمطعم',
    description: 'تصميم هوية بصرية كاملة لمطعم جديد يشمل الشعار والمواد التسويقية',
    clientId: 'client-3',
    status: 'draft',
    shareLink: 'share-project-3-ghi789',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    scopeSections: [
      {
        id: 'section-3-1',
        title: 'عناصر الهوية',
        items: [
          { id: 'item-3-1-1', title: 'تصميم الشعار الرئيسي', status: 'included' },
          { id: 'item-3-1-2', title: 'دليل استخدام الهوية', status: 'included' },
          { id: 'item-3-1-3', title: 'تصميم بطاقة العمل', status: 'pending' },
        ],
      },
    ],
  },
];

export const SEED_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'cr-1',
    projectId: 'project-1',
    title: 'إضافة الدفع عبر البطاقات البنكية',
    description: 'العميل يطلب إضافة خيار الدفع عبر البطاقات البنكية بعد الموافقة الأصلية. سيحتاج ذلك إلى تكامل مع بوابة دفع إلكترونية.',
    itemId: 'item-1-2-3',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cr-2',
    projectId: 'project-1',
    title: 'إضافة ميزة القائمة المفضلة',
    description: 'إمكانية حفظ المنتجات في قائمة مفضلة للعميل',
    status: 'accepted',
    reason: 'تمت الموافقة مقابل رسوم إضافية',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'cr-3',
    projectId: 'project-1',
    title: 'إضافة دردشة مباشرة',
    description: 'نظام دردشة مباشرة بين العملاء وفريق الدعم',
    status: 'rejected',
    reason: 'خارج نطاق المشروع الحالي، يمكن تنفيذه كمشروع منفصل',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    projectId: 'project-1',
    type: 'project_created',
    description: 'تم إنشاء المشروع',
    timestamp: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'act-2',
    projectId: 'project-1',
    type: 'scope_sent',
    description: 'تم إرسال النطاق للعميل للمراجعة',
    timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'act-3',
    projectId: 'project-1',
    type: 'scope_approved',
    description: 'وافق العميل على نطاق العمل رسمياً',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'act-4',
    projectId: 'project-1',
    type: 'change_requested',
    description: 'طلب تغيير: إضافة ميزة القائمة المفضلة',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'act-5',
    projectId: 'project-1',
    type: 'change_accepted',
    description: 'تمت الموافقة على طلب التغيير: القائمة المفضلة',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'act-6',
    projectId: 'project-1',
    type: 'change_rejected',
    description: 'تم رفض طلب التغيير: الدردشة المباشرة',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'act-7',
    projectId: 'project-1',
    type: 'change_requested',
    description: 'طلب تغيير: إضافة الدفع عبر البطاقات',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'act-8',
    projectId: 'project-2',
    type: 'project_created',
    description: 'تم إنشاء المشروع',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'act-9',
    projectId: 'project-2',
    type: 'scope_sent',
    description: 'تم إرسال النطاق للعميل للمراجعة',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'act-10',
    projectId: 'project-3',
    type: 'project_created',
    description: 'تم إنشاء المشروع',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export function seedDataIfNeeded() {
  if (!localStorage.getItem('scopesnap_clients')) {
    localStorage.setItem('scopesnap_clients', JSON.stringify(SEED_CLIENTS));
  }
  if (!localStorage.getItem('scopesnap_projects')) {
    localStorage.setItem('scopesnap_projects', JSON.stringify(SEED_PROJECTS));
  }
  if (!localStorage.getItem('scopesnap_change_requests')) {
    localStorage.setItem('scopesnap_change_requests', JSON.stringify(SEED_CHANGE_REQUESTS));
  }
  if (!localStorage.getItem('scopesnap_activities')) {
    localStorage.setItem('scopesnap_activities', JSON.stringify(SEED_ACTIVITIES));
  }
  if (!localStorage.getItem('scopesnap_user')) {
    localStorage.setItem('scopesnap_user', JSON.stringify(SEED_USER));
  }
}
