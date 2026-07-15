import { useState } from 'react';
import { useProjects, useClients } from '../store';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { EmptyState, ProjectStatusBadge } from '../components/StatusBadge';
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'draft' as ProjectStatus,
  });

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', clientId: clients[0]?.id || '', status: 'draft' });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      clientId: project.clientId,
      status: project.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) return;

    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject({ ...formData, scopeSections: [] });
    }
    setShowModal(false);
  };

  const handleDelete = (project: Project) => {
    if (!confirm(`هل أنت متأكد من حذف المشروع "${project.name}"؟ سيتم حذف جميع نطاقات العمل والبيانات المرتبطة.`)) return;
    deleteProject(project.id);
  };

  const getStatusCount = (status: ProjectStatus) =>
    projects.filter(p => p.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المشاريع</h1>
          <p className="text-sm text-slate-500 mt-1">إدارة مشاريعك وبناء نطاقات عمل واضحة</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={clients.length === 0}
          className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          مشروع جديد
        </button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
          label="الكل"
          count={projects.length}
        />
        <FilterButton
          active={filterStatus === 'draft'}
          onClick={() => setFilterStatus('draft')}
          label="مسودة"
          count={getStatusCount('draft')}
        />
        <FilterButton
          active={filterStatus === 'sent'}
          onClick={() => setFilterStatus('sent')}
          label="أُرسل للعميل"
          count={getStatusCount('sent')}
        />
        <FilterButton
          active={filterStatus === 'approved'}
          onClick={() => setFilterStatus('approved')}
          label="تمت الموافقة"
          count={getStatusCount('approved')}
        />
        <FilterButton
          active={filterStatus === 'in-progress'}
          onClick={() => setFilterStatus('in-progress')}
          label="قيد التنفيذ"
          count={getStatusCount('in-progress')}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="ابحث عن مشروع..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد مشاريع'}
          description={
            searchQuery || filterStatus !== 'all'
              ? 'جرب تغيير معايير البحث'
              : 'ابدأ بإنشاء مشروعك الأول وبناء نطاق العمل'
          }
          action={
            !searchQuery && filterStatus === 'all' && (
              <button
                onClick={openAddModal}
                disabled={clients.length === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                إنشاء أول مشروع
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const totalItems = project.scopeSections.flatMap(s => s.items).length;
            const includedItems = project.scopeSections.flatMap(s => s.items).filter(i => i.status === 'included').length;
            const excludedItems = project.scopeSections.flatMap(s => s.items).filter(i => i.status === 'excluded').length;
            const pendingItems = project.scopeSections.flatMap(s => s.items).filter(i => i.status === 'pending').length;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500">{client?.name || 'بدون عميل'}</p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </div>

                {project.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{project.scopeSections.length} أقسام</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{totalItems} بنود</span>
                  </div>
                </div>

                {/* Item breakdown */}
                {totalItems > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-emerald-700">{includedItems}</p>
                      <p className="text-xs text-emerald-600">مشمول</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-2 text-center">
                      <XCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-rose-700">{excludedItems}</p>
                      <p className="text-xs text-rose-600">مستبعد</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                      <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-700">{pendingItems}</p>
                      <p className="text-xs text-amber-600">قيد المراجعة</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition-colors text-sm"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => openEditModal(project)}
                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="w-9 h-9 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProject ? 'تعديل المشروع' : 'إنشاء مشروع جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اسم المشروع <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="مثال: متجر إلكتروني لبيع الملابس"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              وصف المشروع
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر للمشروع..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              العميل <span className="text-rose-500">*</span>
            </label>
            {clients.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">
                يجب إضافة عميل أولاً قبل إنشاء مشروع.
              </p>
            ) : (
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
              >
                <option value="">اختر عميلاً</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            )}
          </div>
          {editingProject && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                حالة المشروع
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
              >
                <option value="draft">مسودة</option>
                <option value="sent">أُرسل للعميل</option>
                <option value="approved">تمت الموافقة</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={clients.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-l from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {editingProject ? 'حفظ التعديلات' : 'إنشاء المشروع'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
      }`}
    >
      {label} <span className={`mr-1 ${active ? 'text-indigo-200' : 'text-slate-400'}`}>({count})</span>
    </button>
  );
}
