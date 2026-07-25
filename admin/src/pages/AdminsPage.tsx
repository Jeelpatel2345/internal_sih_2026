import { useEffect, useState } from 'react'
import { UserPlus, Shield, Trash2, CheckCircle2, User, Mail, Lock } from 'lucide-react'
import { getAdminUsers, createAdminUser, deleteAdminUserApi } from '../services/adminApi'
import { useAuthStore } from '../stores/useAuthStore'
import toast from 'react-hot-toast'
import './DashboardPage.css' // uses shared admin styles

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin'
  is_active: boolean
  last_login: string | null
  created_at: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [submitting, setSubmitting] = useState(false)

  const currentUser = useAuthStore((s) => s.user)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await getAdminUsers()
      setAdmins(res.data.data || [])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch admin accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }

    try {
      setSubmitting(true)
      await createAdminUser(form)
      toast.success(`Admin account "${form.name}" created successfully!`)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'admin' })
      fetchAdmins()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete admin "${name}"?`)) return

    try {
      await deleteAdminUserApi(id)
      toast.success(`Admin "${name}" deleted.`)
      fetchAdmins()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete admin.')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main, #f1f5f9)', margin: 0 }}>
            Manage Admin Users
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', marginTop: '4px', fontSize: '14px' }}>
            Add, view, and manage administrator access accounts stored in Neon PostgreSQL.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'transform 0.15s ease',
          }}
        >
          <UserPlus size={18} />
          Add New Admin
        </button>
      </div>

      {/* ── Admin Table Card ── */}
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Admin accounts...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Admin</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Last Login</th>
                <th style={{ padding: '14px 20px' }}>Created At</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: a.role === 'super_admin' ? '#8b5cf6' : '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                      {a.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      {a.name}
                      {currentUser?.email === a.email && (
                        <span style={{ fontSize: '11px', background: '#334155', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>You</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{a.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600',
                      background: a.role === 'super_admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: a.role === 'super_admin' ? '#c084fc' : '#60a5fa',
                      border: `1px solid ${a.role === 'super_admin' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                    }}>
                      <Shield size={12} />
                      {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4ade80' }}>
                      <CheckCircle2 size={14} /> Active
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px' }}>
                    {a.last_login ? new Date(a.last_login).toLocaleString('en-IN') : 'Never'}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px' }}>
                    {new Date(a.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {currentUser?.email !== a.email && (
                      <button
                        onClick={() => handleDelete(a.id, a.name)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Admin Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={22} color="#6366f1" /> Create Admin Account
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Add a new administrator. Account credentials will be created directly in Neon PostgreSQL.
            </p>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tirth Shah"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '10px 12px 10px 38px', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    placeholder="admin@sih2026.ac.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '10px 12px 10px 38px', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '10px 12px 10px 38px', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                  Role Permission
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="admin">Admin (Manage Teams & View Reports)</option>
                  <option value="super_admin">Super Admin (Full Access + Settings & Admin Creation)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#6366f1', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
