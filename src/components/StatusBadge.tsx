import type { ProjectStatus, ChangeRequestStatus } from '../types';
import { CheckCircle, XCircle, Clock, FileCheck, Send, FileEdit, Loader2 } from 'lucide-react';

export function ScopeItemStatus({ status }: { status: 'included' | 'excluded' | 'pending' }) {
  const styles = {
    included: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    excluded: 'bg-rose-50 text-rose-700 border-rose-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const labels = {
    included: 'مشمول',
    excluded: 'غير مشمول',
    pending: 'قيد المراجعة',
  };

  const icons = {
    included: CheckCircle,
    excluded: XCircle,
    pending: Clock,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{labels[status]}</span>
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in-progress': 'bg-violet-50 text-violet-700 border-violet-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const labels = {
    draft: 'مسودة',
    sent: 'أُرسل للعميل',
    approved: 'تمت الموافقة',
    'in-progress': 'قيد التنفيذ',
    completed: 'مكتمل',
  };

  const icons = {
    draft: FileEdit,
    sent: Send,
    approved: CheckCircle,
    'in-progress': Loader2,
    completed: FileCheck,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'in-progress' ? 'animate-spin' : ''}`} />
      <span>{labels[status]}</span>
    </span>
  );
}

export function ChangeRequestStatusBadge({ status }: { status: ChangeRequestStatus }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const labels = {
    pending: 'قيد الدراسة',
    accepted: 'مقبول',
    rejected: 'مرفوض',
  };

  const icons = {
    pending: Clock,
    accepted: CheckCircle,
    rejected: XCircle,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{labels[status]}</span>
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
