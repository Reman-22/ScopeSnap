import { useState } from 'react';
import { useUser, useProjects, useChangeRequests, useClients, getRelativeTime } from '../store';
import { ProjectStatusBadge, ScopeItemStatus, ChangeRequestStatusBadge, EmptyState } from '../components/StatusBadge';
import {
  Camera,
  FolderKanban,
  Calendar,
  LogOut,
  CheckCircle2,
  Clock,
  GitBranch,
  Eye,
  MessageCircle,
  AlertCircle,
  Check,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import Modal from '../components/Modal';

export default function ClientDashboard() {
  const { user, logout } = useUser();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { changeRequests, addChangeRequest, updateChangeRequest } = useChangeRequests();

  const [showChangeModal, setShowChangeModal] = useState<string | null>(null);
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find the client that matches the current user
  // In production: match by email. For demo: show all projects for the first client
  const myClient = clients.find(c => c.email === user?.email) || clients[0];

  // Get projects for this client
  const myProjects = projects.filter(p => p.clientId === myClient?.id);

  // Get change requests for my projects
  const myChangeRequests = changeRequests.filter(cr =>
    myProjects.some(p => p.id === cr.projectId)
  );

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTitle.trim() || !changeDescription.trim() || !showChangeModal) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    addChangeRequest({
      projectId: showChangeModal,
      title: changeTitle,
      description: changeDescription,
      status: 'pending',
    });

    setChangeTitle('');
    setChangeDescription('');
    setShowChangeModal(null);
    setSubmitting(false);
  };

  const handleAcceptChange = (crId: string) => {
    if (confirm('هل تريد الموافقة على طلب التغيير هذا؟')) {
      updateChangeRequest(crId, { status: 'accepted' });
    }
  };

  const handleRejectChange = (crId: string) => {
    const reason = prompt('سبب الرفض:');
    if (reason) {
      updateChangeRequest(crId, { status: 'rejected', reason });
    }
  };

  const handleViewAsClient = (shareLink: string) => {
    window.open(`/#/client-view/${shareLink}`, '_blank');
  };

  // Stats
  const totalProjects = myProjects.length;
  const approvedProjects = myProjects.filter(p => p.status === 'approved' || p.status === 'in-progress' || p.status === 'completed').length;
  const pendingProjects = myProjects.filter(p => p.status === 'sent').length;
  const pendingChanges = myChangeRequests.filter(cr => cr.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg">ScopeSnap</h1>
              <p className="text-xs text-slate-500">منطقة العميل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span>عميل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'ع'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-l from-violet-500 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 translate-x-24" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">مرحباً، {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-indigo-100 mb-1">منطقة العميل الخاصة بك</p>
            <p className="text-sm text-indigo-200">
              هنا يمكنك مراجعة جميع مشاريعك، متابعة حالة الموافقات، وطلب التعديلات
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={FolderKanban}
            label="مشاريعي"
            value={totalProjects}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle2}
            label="معتمدة"
            value={approvedProjects}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="بانتظار المراجعة"
            value={pendingProjects}
            color="amber"
          />
          <StatCard
            icon={GitBranch}
            label="طلبات تغيير"
            value={pendingChanges}
            color="rose"
          />
        </div>

        {/* Projects */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">مشاريعي</h2>
            <span className="text-sm text-slate-500">({myProjects.length})</span>
          </div>

          {myProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="لا توجد مشاريع بعد"
              description="سيظهر هنا أي مشروع جديد ينشئه المنفذ لك"
            />
          ) : (
            <div className="space-y-4">
              {myProjects.map(project => {
                const allItems = project.scopeSections.flatMap(s => s.items);
                const included = allItems.filter(i => i.status === 'included').length;
                const excluded = allItems.filter(i => i.status === 'excluded').length;
                const pending = allItems.filter(i => i.status === 'pending').length;
                const projectChanges = myChangeRequests.filter(cr => cr.projectId === project.id);

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>

                    {/* Stats */}
                    {allItems.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                          <p className="text-xl font-bold text-emerald-700">{included}</p>
                          <p className="text-xs text-emerald-600">مشمول</p>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-2.5 text-center">
                          <p className="text-xl font-bold text-rose-700">{excluded}</p>
                          <p className="text-xs text-rose-600">مستبعد</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                          <p className="text-xl font-bold text-amber-700">{pending}</p>
                          <p className="text-xs text-amber-600">قيد المراجعة</p>
                        </div>
                      </div>
                    )}

                    {/* Sections preview */}
                    {project.scopeSections.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 mb-2">الأقسام:</p>
                        {project.scopeSections.slice(0, 3).map(section => (
                          <div key={section.id} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-slate-800 mb-1.5">
                              {section.title}
                            </p>
                            <div className="space-y-1">
                              {section.items.slice(0, 2).map(item => (
                                <div key={item.id} className="flex items-start gap-2 text-xs">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <ScopeItemStatus status={item.status} />
                                  </div>
                                  <span className="text-slate-700 line-clamp-1">{item.title}</span>
                                </div>
                              ))}
                              {section.items.length > 2 && (
                                <p className="text-xs text-slate-400 mr-1">
                                  +{section.items.length - 2} عناصر أخرى
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {project.scopeSections.length > 3 && (
                          <p className="text-xs text-slate-400 text-center">
                            +{project.scopeSections.length - 3} أقسام أخرى
                          </p>
                        )}
                      </div>
                    )}

                    {/* Change requests count */}
                    {projectChanges.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-900">
                              {projectChanges.length} طلبات تغيير
                            </span>
                          </div>
                          <span className="text-xs text-indigo-600">
                            {projectChanges.filter(cr => cr.status === 'pending').length} قيد الدراسة
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleViewAsClient(project.shareLink)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        عرض النطاق
                      </button>
                      <button
                        onClick={() => setShowChangeModal(project.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        طلب تغيير
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Change requests */}
        {myChangeRequests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">طلبات التغيير</h2>
              <span className="text-sm text-slate-500">({myChangeRequests.length})</span>
            </div>

            <div className="space-y-3">
              {myChangeRequests.map(cr => {
                const project = myProjects.find(p => p.id === cr.projectId);
                return (
                  <div
                    key={cr.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900">{cr.title}</h3>
                          <ChangeRequestStatusBadge status={cr.status} />
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          📁 {project?.name}
                        </p>
                        <p className="text-sm text-slate-600">{cr.description}</p>
                        {cr.reason && (
                          <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm">
                            <span className="font-semibold text-slate-700">ملاحظة: </span>
                            <span className="text-slate-600">{cr.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {getRelativeTime(cr.createdAt)}
                      </span>
                      {cr.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptChange(cr.id)}
                            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            موافقة
                          </button>
                          <button
                            onClick={() => handleRejectChange(cr.id)}
                            className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Help / Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">تحتاج مساعدة؟</h3>
              <p className="text-sm text-slate-600 mb-3">
                إذا كان لديك أي استفسار حول مشروعك أو نطاق العمل، يمكنك التواصل مع المنفذ مباشرة أو طلب تغيير من خلال النظام.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-50 rounded-md">💡 استخدم زر "طلب تغيير" لطلب تعديل رسمي</span>
                <span className="px-2 py-1 bg-slate-50 rounded-md">👁️ اضغط "عرض النطاق" لمراجعة التفاصيل</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Request Modal */}
      <Modal
        isOpen={!!showChangeModal}
        onClose={() => setShowChangeModal(null)}
        title="طلب تغيير جديد"
        size="md"
      >
        <form onSubmit={handleSubmitChangeRequest} className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900">
              اطلب التعديلات أو الإضافات التي تحتاجها. سيتم مراجعة طلبك من قبل المنفذ والرد عليه.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              عنوان الطلب <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={changeTitle}
              onChange={(e) => setChangeTitle(e.target.value)}
              required
              placeholder="مثال: إضافة ميزة جديدة"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              وصف التغيير <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              required
              rows={4}
              minLength={20}
              placeholder="اشرح التعديل المطلوب بالتفصيل (20 حرف على الأقل)..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {changeDescription.length} / 20 حرف كحد أدنى
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowChangeModal(null)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || changeTitle.length < 3 || changeDescription.length < 20}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الطلب
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
    rose: 'from-rose-500 to-rose-600 shadow-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <p className="text-xs sm:text-sm text-slate-500 mb-0.5">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
