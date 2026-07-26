import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getLogs } from '../services/adminApi'
import './DashboardPage.css'

interface Log {
  _id: string
  adminId: string
  adminName: string
  action: string
  target: string
  details: string
  ip: string
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'badge-info',
  LOGOUT: 'badge-gray',
  UPDATE_TEAM: 'badge-warning',
  DELETE_TEAM: 'badge-error',
  UPDATE_SETTINGS: 'badge-success',
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function LogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['logs', page, action],
    queryFn: () => getLogs({ page, limit: 30, action }).then((r) => r.data),
  })

  const logs: Log[] = data?.data?.logs || []
  const pagination = data?.data?.pagination

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Activity Logs</h2>
          <p className="page-subtitle">All admin actions are recorded here</p>
        </div>
        <div className="header-actions">
          <select className="form-select" style={{ width: 'auto' }} value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}>
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="UPDATE_TEAM">Update Team</option>
            <option value="DELETE_TEAM">Delete Team</option>
            <option value="UPDATE_SETTINGS">Update Settings</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">!</div><h3>Unable to load activity logs</h3><p>Please refresh the page or check your connection.</p></div></td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <h3>No activity logs yet</h3>
                      <p>Logs will appear here as admins use the panel.</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.adminName}</td>
                  <td><span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                  <td style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--color-blue)' }}>{log.target}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>{log.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="pagination-info">Page {page} of {pagination.totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
