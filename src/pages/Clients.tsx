import { useState } from 'react';
import { useClients, useProjects } from '../store';
import Modal from '../components/Modal';
import { EmptyState } from '../components/StatusBadge';
import { Users, Plus, Mail, Building2, Edit2, Trash2, FolderKanban, Search } from 'lucide-react';
import type { Client } from '../types';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { projects } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', company: '' });
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (client: Client) => {
    const clientProjects = projects.filter(p => p.clientId === client.id);
    if (clientProjects.length > 0) {
      if (!confirm(`هذا العميل مرتبط بـ ${clientProjects.length} مشروع. هل تريد المتابعة؟`)) return;
    } else {
      if (!confirm(`هل أنت متأكد من حذف العميل "${client.name}"؟`)) return;
    }
    deleteClient(client.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">العملاء</h1>
          <p className="text-sm text-slate-500 mt-1">إدارة بيانات عملائك وربطهم بالمشاريع</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="ابحث عن عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Clients grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'لا توجد نتائج' : 'لا يوجد عملاء'}
          description={searchQuery ? 'جرب كلمات بحث مختلفة' : 'ابدأ بإضافة أول عميل لربطه بمشاريعك'}
          action={
            !searchQuery && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                إضافة أول عميل
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const clientProjects = projects.filter(p => p.clientId === client.id);
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{client.name}</h3>
                {client.company && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{client.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="ltr" dir="ltr">{client.email}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FolderKanban className="w-4 h-4 text-indigo-500" />
                    <span>{clientProjects.length} مشروع</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                  </span>
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
        title={editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              الاسم الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="مثال: أحمد محمد"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              البريد الإلكتروني <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="email@example.com"
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-left"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اسم الشركة (اختياري)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="مثال: شركة التقنية"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            />
          </div>
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
              className="flex-1 px-4 py-3 bg-gradient-to-l from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
