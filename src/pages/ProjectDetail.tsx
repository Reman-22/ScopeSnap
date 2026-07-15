import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects, useClients, useActivities, useChangeRequests, generateId } from '../store';
import { ProjectStatusBadge, ScopeItemStatus, ChangeRequestStatusBadge, EmptyState } from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { ScopeSection, ScopeItem, ChangeRequest, ProjectStatus } from '../types';
import {
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Send,
  FileText,
  Clock,
  GitBranch,
  History,
  Users,
  Link,
  Copy,
  Check,
} from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { clients } = useClients();
  const { activities, addActivity, getProjectActivities } = useActivities();
  const { changeRequests, addChangeRequest, updateChangeRequest } = useChangeRequests();

  const project = projects.find(p => p.id === id);
  const projectActivities = getProjectActivities(id || '');
  const projectChangeRequests = changeRequests.filter(cr => cr.projectId === id);
  void activities; // used for reactivity

  const [activeTab, setActiveTab] = useState<'scope' | 'changes' | 'timeline'>('scope');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ScopeSection | null>(null);
  const [editingItem, setEditingItem] = useState<{ sectionId: string; item: ScopeItem } | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);

  const [sectionForm, setSectionForm] = useState({ title: '' });
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    status: 'included' as ScopeItem['status'],
  });
  const [changeForm, setChangeForm] = useState({
    title: '',
    description: '',
    itemId: '',
  });

  if (!project) {
    return (
      <div className="text-center py-16">
        <EmptyState
          icon={FileText}
          title="المشروع غير موجود"
          description="المشروع الذي تبحث عنه غير موجود أو تم حذفه"
          action={
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للمشاريع
            </button>
          }
        />
      </div>
    );
  }

  const client = clients.find(c => c.id === project.clientId);

  // Section handlers
  const openAddSection = () => {
    setEditingSection(null);
    setSectionForm({ title: '' });
    setShowSectionModal(true);
  };

  const openEditSection = (section: ScopeSection) => {
    setEditingSection(section);
    setSectionForm({ title: section.title });
    setShowSectionModal(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.title) return;

    const sections = [...project.scopeSections];
    if (editingSection) {
      const index = sections.findIndex(s => s.id === editingSection.id);
      sections[index] = { ...sections[index], title: sectionForm.title };
      updateProject(project.id, { scopeSections: sections });
      addActivity({
        projectId: project.id,
        type: 'project_updated',
        description: `تم تعديل القسم: ${sectionForm.title}`,
      });
    } else {
      const newSection: ScopeSection = {
        id: generateId(),
        title: sectionForm.title,
        items: [],
      };
      sections.push(newSection);
      updateProject(project.id, { scopeSections: sections });
      addActivity({
        projectId: project.id,
        type: 'project_updated',
        description: `تم إضافة قسم جديد: ${sectionForm.title}`,
      });
    }
    setShowSectionModal(false);
  };

  const handleDeleteSection = (section: ScopeSection) => {
    if (!confirm(`هل أنت متأكد من حذف القسم "${section.title}" وجميع عناصره؟`)) return;
    const sections = project.scopeSections.filter(s => s.id !== section.id);
    updateProject(project.id, { scopeSections: sections });
    addActivity({
      projectId: project.id,
      type: 'project_updated',
      description: `تم حذف القسم: ${section.title}`,
    });
  };

  // Item handlers
  const openAddItem = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setEditingItem(null);
    setItemForm({ title: '', description: '', status: 'included' });
    setShowItemModal(true);
  };

  const openEditItem = (sectionId: string, item: ScopeItem) => {
    setCurrentSectionId(sectionId);
    setEditingItem({ sectionId, item });
    setItemForm({
      title: item.title,
      description: item.description || '',
      status: item.status,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title) return;

    const sections = [...project.scopeSections];
    const sectionIndex = sections.findIndex(s => s.id === currentSectionId);
    const items = [...sections[sectionIndex].items];

    if (editingItem) {
      const itemIndex = items.findIndex(i => i.id === editingItem.item.id);
      items[itemIndex] = { ...items[itemIndex], ...itemForm };
      sections[sectionIndex].items = items;
      updateProject(project.id, { scopeSections: sections });
      addActivity({
        projectId: project.id,
        type: 'item_updated',
        description: `تم تعديل العنصر: ${itemForm.title}`,
      });
    } else {
      const newItem: ScopeItem = {
        id: generateId(),
        ...itemForm,
      };
      items.push(newItem);
      sections[sectionIndex].items = items;
      updateProject(project.id, { scopeSections: sections });
      addActivity({
        projectId: project.id,
        type: 'item_added',
        description: `تم إضافة عنصر: ${itemForm.title}`,
      });
    }
    setShowItemModal(false);
  };

  const handleDeleteItem = (sectionId: string, item: ScopeItem) => {
    if (!confirm(`هل أنت متأكد من حذف العنصر "${item.title}"؟`)) return;
    const sections = [...project.scopeSections];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    sections[sectionIndex].items = sections[sectionIndex].items.filter(i => i.id !== item.id);
    updateProject(project.id, { scopeSections: sections });
    addActivity({
      projectId: project.id,
      type: 'item_deleted',
      description: `تم حذف العنصر: ${item.title}`,
    });
  };

  // Send to client
  const handleSendToClient = () => {
    updateProject(project.id, { status: 'sent' });
    addActivity({
      projectId: project.id,
      type: 'scope_sent',
      description: 'تم إرسال النطاق للعميل للمراجعة',
    });
  };

  // Copy share link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/client-view/${project.shareLink}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Change request handlers
  const openAddChangeRequest = () => {
    setChangeForm({ title: '', description: '', itemId: '' });
    setShowChangeModal(true);
  };

  const handleSaveChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeForm.title || !changeForm.description) return;

    addChangeRequest({
      projectId: project.id,
      title: changeForm.title,
      description: changeForm.description,
      itemId: changeForm.itemId || undefined,
      status: 'pending',
    });

    addActivity({
      projectId: project.id,
      type: 'change_requested',
      description: `طلب تغيير: ${changeForm.title}`,
    });

    setShowChangeModal(false);
  };

  const handleUpdateChangeRequest = (cr: ChangeRequest, status: 'accepted' | 'rejected') => {
    const reason = prompt(`سبب ${status === 'accepted' ? 'الموافقة' : 'الرفض'} (اختياري):`);
    updateChangeRequest(cr.id, { status, reason: reason || undefined });
    addActivity({
      projectId: project.id,
      type: status === 'accepted' ? 'change_accepted' : 'change_rejected',
      description: `${status === 'accepted' ? 'تمت الموافقة على' : 'تم رفض'} طلب التغيير: ${cr.title}`,
    });
  };

  // Update project status
  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(project.id, { status: newStatus });
    if (newStatus === 'approved') {
      addActivity({
        projectId: project.id,
        type: 'scope_approved',
        description: 'تمت الموافقة على نطاق العمل رسمياً',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium text-sm"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للمشاريع
      </button>

      {/* Project header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-slate-600 mb-4">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{client?.name || 'بدون عميل'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3">
            <ProjectStatusBadge status={project.status} />
            {project.status !== 'approved' && project.status !== 'in-progress' && project.status !== 'completed' && (
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">مسودة</option>
                <option value="sent">أُرسل للعميل</option>
                <option value="approved">تمت الموافقة</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
              </select>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleSendToClient}
            disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
            className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            إرسال للعميل
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:border-indigo-300 transition-all"
          >
            {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? 'تم النسخ!' : 'نسخ رابط المشاركة'}
          </button>
          <button
            onClick={() => window.open(`/#/client-view/${project.shareLink}`, '_blank')}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:border-indigo-300 transition-all"
          >
            <Link className="w-4 h-4" />
            عرض العميل
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <TabButton
            active={activeTab === 'scope'}
            onClick={() => setActiveTab('scope')}
            icon={FileText}
            label="نطاق العمل"
          />
          <TabButton
            active={activeTab === 'changes'}
            onClick={() => setActiveTab('changes')}
            icon={GitBranch}
            label="طلبات التغيير"
            count={projectChangeRequests.filter(cr => cr.status === 'pending').length}
          />
          <TabButton
            active={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            icon={History}
            label="السجل الزمني"
          />
        </div>

        <div className="p-6">
          {/* Scope tab */}
          {activeTab === 'scope' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">الأقسام والعناصر</h2>
                <button
                  onClick={openAddSection}
                  disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قسم
                </button>
              </div>

              {project.scopeSections.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="لا توجد أقسام"
                  description="ابدأ بإضافة أقسام وعناصر لتحديد نطاق العمل"
                  action={
                    <button
                      onClick={openAddSection}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة أول قسم
                    </button>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {project.scopeSections.map(section => (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">{section.title}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAddItem(section.id)}
                            disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + إضافة عنصر
                          </button>
                          <button
                            onClick={() => openEditSection(section)}
                            disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                            className="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section)}
                            disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                            className="w-7 h-7 rounded hover:bg-rose-100 flex items-center justify-center text-slate-500 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {section.items.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            لا توجد عناصر في هذا القسم
                          </div>
                        ) : (
                          section.items.map(item => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 mb-2">
                                    <ScopeItemStatus status={item.status} />
                                    <h4 className="font-semibold text-slate-900 flex-1">{item.title}</h4>
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-slate-600 mr-20">{item.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditItem(section.id, item)}
                                    disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                                    className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(section.id, item)}
                                    disabled={project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed'}
                                    className="w-8 h-8 rounded hover:bg-rose-50 flex items-center justify-center text-slate-500 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Changes tab */}
          {activeTab === 'changes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">طلبات التغيير</h2>
                {project.status === 'approved' || project.status === 'in-progress' ? (
                  <button
                    onClick={openAddChangeRequest}
                    className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    طلب تغيير
                  </button>
                ) : (
                  <p className="text-sm text-slate-500">
                    يمكن إضافة طلبات التغيير بعد موافقة العميل على النطاق
                  </p>
                )}
              </div>

              {projectChangeRequests.length === 0 ? (
                <EmptyState
                  icon={GitBranch}
                  title="لا توجد طلبات تغيير"
                  description="سيتم عرض طلبات التغيير هنا بعد موافقة العميل على النطاق"
                />
              ) : (
                <div className="space-y-3">
                  {projectChangeRequests.map(cr => (
                    <div key={cr.id} className="border border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-900">{cr.title}</h4>
                            <ChangeRequestStatusBadge status={cr.status} />
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{cr.description}</p>
                          {cr.reason && (
                            <div className="bg-slate-50 rounded-lg p-3 text-sm">
                              <span className="font-semibold text-slate-700">السبب: </span>
                              <span className="text-slate-600">{cr.reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {cr.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleUpdateChangeRequest(cr, 'accepted')}
                            className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleUpdateChangeRequest(cr, 'rejected')}
                            className="flex-1 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg font-semibold hover:bg-rose-100 transition-colors"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(cr.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">السجل الزمني</h2>
              {projectActivities.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="لا يوجد سجل"
                  description="سيتم تسجيل جميع الأنشطة هنا"
                />
              ) : (
                <div className="space-y-4">
                  {projectActivities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-indigo-100' : 'bg-slate-100'
                        }`}>
                          <History className={`w-5 h-5 ${index === 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
                        </div>
                        {index < projectActivities.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-semibold text-slate-900 mb-1">{activity.description}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        title={editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اسم القسم <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ title: e.target.value })}
              required
              placeholder="مثال: واجهة المستخدم الرئيسية"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSectionModal(false)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-l from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              {editingSection ? 'حفظ التعديلات' : 'إضافة القسم'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              عنوان العنصر <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={itemForm.title}
              onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
              required
              placeholder="مثال: الصفحة الرئيسية مع عرض المنتجات"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="وصف تفصيلي للعنصر..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              الحالة <span className="text-rose-500">*</span>
            </label>
            <select
              value={itemForm.status}
              onChange={(e) => setItemForm({ ...itemForm, status: e.target.value as ScopeItem['status'] })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            >
              <option value="included">مشمول ضمن المشروع</option>
              <option value="excluded">غير مشمول</option>
              <option value="pending">قيد المراجعة</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowItemModal(false)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-l from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              {editingItem ? 'حفظ التعديلات' : 'إضافة العنصر'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Request Modal */}
      <Modal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        title="طلب تغيير جديد"
      >
        <form onSubmit={handleSaveChangeRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              عنوان التغيير <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={changeForm.title}
              onChange={(e) => setChangeForm({ ...changeForm, title: e.target.value })}
              required
              placeholder="مثال: إضافة ميزة الدفع الإلكتروني"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              وصف التغيير <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={changeForm.description}
              onChange={(e) => setChangeForm({ ...changeForm, description: e.target.value })}
              required
              placeholder="وصف تفصيلي للتغيير المطلوب..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowChangeModal(false)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-l from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              إرسال الطلب
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
        active
          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
