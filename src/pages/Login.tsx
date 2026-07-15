import { useState } from 'react';
import { useUser } from '../store';
import { Camera, Mail, User, ArrowLeft, Lock, Loader2, Briefcase, UserCircle, Sparkles, Shield } from 'lucide-react';
import type { User as UserType } from '../types';

type LoginMode = 'login' | 'register';
type UserRole = 'freelancer' | 'client';

export default function Login() {
  const { login } = useUser();
  const [mode, setMode] = useState<LoginMode>('login');
  const [role, setRole] = useState<UserRole>('freelancer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  /**
   * دالة الدخول الرئيسية - فورية وسريعة
   */
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // Validation
    if (mode === 'register' && !form.name.trim()) {
      setError('الرجاء إدخال الاسم الكامل');
      return;
    }
    if (!form.email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    // تأخير قصير جداً (300ms) لإظهار loading state بشكل طبيعي
    setTimeout(() => {
      const userData: UserType = {
        id: 'user-' + Date.now(),
        name: form.name.trim() || 'مستخدم ScopeSnap',
        email: form.email.trim().toLowerCase(),
        role: role,
      };
      login(userData);
      // App.tsx سيتولى إعادة الرسم والتوجيه تلقائياً
    }, 300);
  };

  /**
   * دخول سريع - فوري
   */
  const quickLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError('');

    const demoUser: UserType = {
      id: 'demo-' + selectedRole + '-' + Date.now(),
      name: selectedRole === 'freelancer' ? 'أحمد المهندس' : 'سارة العميلة',
      email: selectedRole === 'freelancer' ? 'freelancer@demo.com' : 'client@demo.com',
      role: selectedRole,
    };
    // دخول فوري بدون أي تأخير
    login(demoUser);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50/50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 items-center justify-center shadow-2xl shadow-indigo-300 mb-4 animate-fade-in">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            ScopeSnap
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            نظام نطاق العمل الذكي للمشاريع
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 animate-slide-in">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? 'اختر نوع حسابك للمتابعة' : 'اختر نوع حسابك للبدء'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              نوع الحساب
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`relative p-3.5 rounded-xl border-2 transition-all ${
                  role === 'freelancer'
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {role === 'freelancer' && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <Briefcase
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    role === 'freelancer' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <div
                  className={`text-sm font-bold ${
                    role === 'freelancer' ? 'text-indigo-900' : 'text-slate-700'
                  }`}
                >
                  منفذ / مستقل
                </div>
                <div className="text-xs text-slate-500 mt-0.5">إدارة المشاريع</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('client')}
                className={`relative p-3.5 rounded-xl border-2 transition-all ${
                  role === 'client'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {role === 'client' && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <UserCircle
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    role === 'client' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div
                  className={`text-sm font-bold ${
                    role === 'client' ? 'text-emerald-900' : 'text-slate-700'
                  }`}
                >
                  عميل
                </div>
                <div className="text-xs text-slate-500 mt-0.5">مراجعة النطاقات</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: أحمد محمد"
                    className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-left"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">6 أحرف على الأقل</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl animate-fade-in flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                role === 'freelancer'
                  ? 'bg-gradient-to-l from-violet-500 to-indigo-600 hover:shadow-indigo-200'
                  : 'bg-gradient-to-l from-emerald-500 to-teal-600 hover:shadow-emerald-200'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جارٍ المعالجة...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {mode === 'login' ? 'ليس لديك حساب؟ سجّل الآن' : 'لديك حساب؟ سجّل الدخول'}
            </button>
          </div>

          {/* Quick Demo Login */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs text-center text-slate-500 font-semibold">
                دخول سريع للتجربة بنقرة واحدة
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('freelancer')}
                className="group px-3 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1"
              >
                <Briefcase className="w-4 h-4" />
                <span>دخول كمستقل</span>
                <span className="text-[10px] font-normal text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  → لوحة التحكم الكاملة
                </span>
              </button>
              <button
                onClick={() => quickLogin('client')}
                className="group px-3 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1"
              >
                <UserCircle className="w-4 h-4" />
                <span>دخول كعميل</span>
                <span className="text-[10px] font-normal text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  → منطقة العميل
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Features hint */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 backdrop-blur rounded-xl p-2.5 border border-slate-100">
            <div className="text-base mb-0.5">📋</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-700">نطاق موثق</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-2.5 border border-slate-100">
            <div className="text-base mb-0.5">✅</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-700">موافقات رسمية</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-2.5 border border-slate-100">
            <div className="text-base mb-0.5">🔄</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-700">إدارة التغيير</div>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Shield className="w-3 h-3" />
          <span>بياناتك محمية ولا تُشارك مع أطراف خارجية</span>
        </div>
      </div>
    </div>
  );
}
