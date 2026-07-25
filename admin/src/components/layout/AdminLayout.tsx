import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Settings, FileText,
  LogOut, Menu, X, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { authLogout } from '../../services/adminApi'
import toast from 'react-hot-toast'
import './AdminLayout.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/mentors', icon: UserCheck, label: 'Mentors' },
  { to: '/admins', icon: ShieldCheck, label: 'Admins' },
  { to: '/logs', icon: FileText, label: 'Activity Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authLogout() } catch { /* ignore */ }
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-badge">
              <span>SIH</span>
              <span>2026</span>
            </div>
            {sidebarOpen && (
              <div className="sidebar-logo-text">
                <span className="sidebar-logo-title">Admin Panel</span>
                <span className="sidebar-logo-sub">KSV / VSITR</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && <ChevronRight size={14} className="sidebar-arrow" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-role">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="topbar-title">SIH 2026 Admin</h1>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-user-avatar">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="topbar-user-name">{user?.name}</span>
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
