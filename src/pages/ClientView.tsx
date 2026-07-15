import { useParams } from 'react-router-dom';
import { useProjects, useClients, useActivities, getRelativeTime } from '../store';
import { ScopeItemStatus } from '../components/StatusBadge';
import {
  Camera,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  Calendar,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ClientView() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const { projects, updateProject } = useProjects();
  const { clients } = useClients();
  const { addActivity } = useActivities();
  const [approved, setApproved] = useState(false);
  const [clientName, setClientName] = useState('');

  const project = projects.find(p => p.shareLink === shareLink);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">رابط غير صالح</h2>
          <p className="text-slate-600 mb-6">
            الرابط الذي تحاول الوصول إليه غير موجود أو منتهي الصلاحية.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  const client = clients.find(c => c.id === project.clientId);
  const allItems = project.scopeSections.flatMap(s => s.items);
  const includedItems = allItems.filter(i => i.status === 'included').length;
  const excludedItems = allItems.filter(i => i.status === 'excluded').length;
  const pendingItems = allItems.filter(i => i.status === 'pending').length;

  const isAlreadyApproved = project.status === 'approved' || project.status === 'in-progress' || project.status === 'completed';

  const handleApprove = () => {
    if (!clientName.trim()) {
      alert('يرجى إدخال اسمك للموافقة');
      return;
    }
    if (!confirm('هل أنت متأكد من الموافقة على نطاق العمل؟ هذه الموافقة ستكون مرجعاً رسمياً أثناء التنفيذ.')) return;
    
    updateProject(project.id, { 
      status: 'approved',
      approvedAt: new Date().toISOString(),
    });
    addActivity({
      projectId: project.id,
      type: 'scope_approved',
      description: `وافق العميل "${clientName}" على نطاق العمل رسمياً`,
    });
    setApproved(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">ScopeSnap</h1>
              <p className="text-xs text-slate-500">نظام نطاق العمل الذكي</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.updatedAt).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Project header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold mb-3">
            <FileText className="w-4 h-4" />
            <span>نطاق العمل</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 mb-6">{project.description}</p>
          )}
          {client && (
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                {client.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{client.name}</p>
                <p className="text-xs text-slate-500">{client.company || client.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">بنود مشمولة</p>
                <p className="text-2xl font-bold text-emerald-600">{includedItems}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">سيتم تنفيذها ضمن الاتفاق</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">بنود مستبعدة</p>
                <p className="text-2xl font-bold text-rose-600">{excludedItems}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">خارج نطاق الاتفاق الحالي</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">قيد المراجعة</p>
                <p className="text-2xl font-bold text-amber-600">{pendingItems}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">تحتاج قرار أو توضيح</p>
          </div>
        </div>

        {/* Approval notice */}
        {(isAlreadyApproved || approved) && (
          <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-3xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">تمت الموافقة على نطاق العمل</h2>
                <p className="text-emerald-50 mb-3">
                  تمت موافقة العميل على نطاق العمل رسمياً. هذا الاتفاق يعتبر مرجعاً لجميع الأطراف أثناء التنفيذ.
                </p>
                {project.approvedAt && (
                  <p className="text-sm text-emerald-100">
                    تاريخ الموافقة: {new Date(project.approvedAt).toLocaleString('ar-SA')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scope sections */}
        {project.scopeSections.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد نطاق عمل بعد</h3>
            <p className="text-slate-500">سيتم إضافة تفاصيل النطاق قريباً</p>
          </div>
        ) : (
          <div className="space-y-6">
            {project.scopeSections.map(section => (
              <div key={section.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <div className="bg-gradient-to-l from-indigo-50 to-violet-50 px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{section.items.length} عنصر</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {section.items.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      لا توجد عناصر في هذا القسم
                    </div>
                  ) : (
                    section.items.map(item => (
                      <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <ScopeItemStatus status={item.status} />
                              <h3 className="font-semibold text-slate-900 flex-1">{item.title}</h3>
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-600 mr-20 leading-relaxed">
                                {item.description}
                              </p>
                            )}
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

        {/* Approval section */}
        {!isAlreadyApproved && !approved && allItems.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-indigo-100">
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Check className="w-6 h-6 text-indigo-600" />
              الموافقة على نطاق العمل
            </h2>
            <p className="text-slate-600 mb-6">
              بمراجعتك لهذا النطاق وموافقتك عليه، فإنك تؤكد قبولك لجميع البنود المذكورة أعلاه. 
              سيتم استخدام هذا النطاق كمرجع رسمي أثناء تنفيذ المشروع، وأي طلب إضافي خارج هذا النطاق 
              سيتم التعامل معه كطلب تغيير منفصل.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  اسمك الكامل للموافقة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={client?.name || 'أدخل اسمك'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                />
              </div>

              <button
                onClick={handleApprove}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all text-lg"
              >
                <Send className="w-5 h-5" />
                أوافق على نطاق العمل
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              بالموافقة، فإنك تقر بأنك قد راجعت جميع البنود أعلاه وتوافق عليها
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-slate-500">
          <p>مدعوم بواسطة <span className="font-bold text-indigo-600">ScopeSnap</span></p>
          <p className="text-xs mt-1">نظام نطاق العمل الذكي</p>
          {getRelativeTime && (
            <p className="text-xs mt-2">
              آخر تحديث: {getRelativeTime(project.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
