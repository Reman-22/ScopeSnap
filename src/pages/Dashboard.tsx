import { useProjects, useClients, useActivities, useChangeRequests } from '../store';
import { ProjectStatusBadge } from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Plus,
  ArrowLeft,
  Activity,
  FileText,
} from 'lucide-react';

export default function Dashboard() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { activities } = useActivities();
  const { changeRequests } = useChangeRequests();
  const navigate = useNavigate();

  // Stats
  const totalProjects = projects.length;
  const approvedProjects = projects.filter(p => p.status === 'approved' || p.status === 'in-progress' || p.status === 'completed').length;
  const pendingApprovals = projects.filter(p => p.status === 'sent').length;
  const pendingChanges = changeRequests.filter(cr => cr.status === 'pending').length;

  // Count all scope items
  const allItems = projects.flatMap(p => p.scopeSections.flatMap(s => s.items));
  const includedItems = allItems.filter(i => i.status === 'included').length;
  const excludedItems = allItems.filter(i => i.status === 'excluded').length;
  const pendingItems = allItems.filter(i => i.status === 'pending').length;

  // Recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Recent activities
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-l from-violet-500 via-indigo-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 translate-x-24" />
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">مرحباً بك في ScopeSnap 👋</h1>
          <p className="text-indigo-100 mb-6 max-w-xl">
            نظام ذكي لتوثيق نطاق العمل، الحصول على موافقات العملاء، وإدارة طلبات التغيير بطريقة احترافية ومنظمة.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            إنشاء مشروع جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="إجمالي المشاريع"
          value={totalProjects}
          color="indigo"
        />
        <StatCard
          icon={Users}
          label="العملاء"
          value={clients.length}
          color="violet"
        />
        <StatCard
          icon={CheckCircle2}
          label="مشاريع معتمدة"
          value={approvedProjects}
          color="emerald"
        />
        <StatCard
          icon={AlertCircle}
          label="بانتظار الموافقة"
          value={pendingApprovals + pendingChanges}
          color="amber"
        />
      </div>

      {/* Scope items overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">بنود مشمولة</p>
              <p className="text-3xl font-bold text-emerald-600">{includedItems}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500"
              style={{ width: allItems.length ? `${(includedItems / allItems.length) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">بنود مستبعدة</p>
              <p className="text-3xl font-bold text-rose-600">{excludedItems}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-rose-400 to-rose-500"
              style={{ width: allItems.length ? `${(excludedItems / allItems.length) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">قيد المراجعة</p>
              <p className="text-3xl font-bold text-amber-600">{pendingItems}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-amber-400 to-amber-500"
              style={{ width: allItems.length ? `${(pendingItems / allItems.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">أحدث المشاريع</h3>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                لا توجد مشاريع بعد. ابدأ بإنشاء مشروعك الأول.
              </div>
            ) : (
              recentProjects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full text-right p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700">
                        {project.name}
                      </h4>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {client?.name || 'بدون عميل'} · {project.scopeSections.length} أقسام · {project.scopeSections.flatMap(s => s.items).length} بند
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Recent activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">آخر النشاطات</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                لا توجد نشاطات بعد.
              </div>
            ) : (
              recentActivities.map(activity => {
                const project = projects.find(p => p.id === activity.projectId);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project?.name} · {new Date(activity.timestamp).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'indigo' | 'violet' | 'emerald' | 'amber';
}) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
    violet: 'from-violet-500 to-violet-600 shadow-violet-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
