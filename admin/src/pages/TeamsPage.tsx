import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Eye, X, ChevronLeft, ChevronRight, FileText, Table } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTeams, deleteTeam, getTeamById, exportExcel, exportCSV, downloadBlob } from '../services/adminApi'
import './DashboardPage.css'

interface Team {
  _id: string
  registrationId: string
  teamName: string
  status: 'pending_mentor' | 'completed'
  leader: { fullName: string; department: string; email: string; mobile: string; enrollmentNumber: string; semester: number; gender: string }
  members: { fullName: string; enrollmentNumber: string; department: string; semester: number; gender: string; email: string; mobile: string }[]
  mentor: { fullName: string; contactNumber: string; email: string; department: string; institute: string; officeAddress: string } | null
  createdAt: string
}

export default function TeamsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['teams', page, search, status],
    queryFn: () => getTeams({ page, limit: 15, search, status }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      toast.success('Team deleted')
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setDeleteConfirm(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleViewTeam = async (id: string) => {
    const res = await getTeamById(id)
    setSelectedTeam(res.data.data)
  }

  const handleExportExcel = async () => {
    try { const res = await exportExcel(); downloadBlob(res.data as Blob, `SIH2026_${Date.now()}.xlsx`); toast.success('Exported!') }
    catch { toast.error('Export failed') }
  }

  const handleExportCSV = async () => {
    try { const res = await exportCSV(); downloadBlob(res.data as Blob, `SIH2026_${Date.now()}.csv`); toast.success('Exported!') }
    catch { toast.error('Export failed') }
  }

  const teams: Team[] = data?.data?.teams || []
  const pagination = data?.data?.pagination

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Teams</h2>
          <p className="page-subtitle">{pagination?.total ?? 0} total registrations</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV}><FileText size={14} /> CSV</button>
          <button className="btn btn-primary btn-sm" onClick={handleExportExcel}><Table size={14} /> Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div className="teams-filters card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearch} className="filter-row">
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by team name, reg ID, leader..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select className="form-select filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="pending_mentor">Pending Mentor</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" className="btn btn-ghost btn-md">Filter</button>
          {(search || status) && (
            <button type="button" className="btn btn-ghost btn-md" onClick={() => { setSearch(''); setSearchInput(''); setStatus(''); setPage(1) }}>
              <X size={14} /> Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reg. ID</th>
                <th>Team Name</th>
                <th>Leader</th>
                <th>Department</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <h3>No teams found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : teams.map((team, i) => (
                <tr key={team._id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{(page - 1) * 15 + i + 1}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.875rem' }}>
                      {team.registrationId}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{team.teamName}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{team.leader?.fullName}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{team.leader?.department}</td>
                  <td>
                    <span className={`badge ${team.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {team.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(team.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleViewTeam(team._id)} title="View details">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(team._id)} title="Delete team">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="pagination-info">
              Page {page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="modal-overlay" onClick={() => setSelectedTeam(null)}>
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedTeam.teamName}</h3>
              <button className="modal-close" onClick={() => setSelectedTeam(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-info">{selectedTeam.registrationId}</span>
              <span className={`badge ${selectedTeam.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                {selectedTeam.status === 'completed' ? 'Complete' : 'Pending Mentor'}
              </span>
            </div>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-red)' }}>👑 Team Leader</h4>
            <div className="detail-grid">
              {Object.entries({
                'Name': selectedTeam.leader.fullName,
                'Enrollment': selectedTeam.leader.enrollmentNumber,
                'Semester': `Sem ${selectedTeam.leader.semester}`,
                'Department': selectedTeam.leader.department,
                'Gender': selectedTeam.leader.gender,
                'Mobile': selectedTeam.leader.mobile,
                'Email': selectedTeam.leader.email,
              }).map(([k, v]) => (
                <div key={k} className="detail-item">
                  <span className="detail-key">{k}</span>
                  <span className="detail-val">{v}</span>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: 'var(--color-blue)' }}>👥 Members</h4>
            {selectedTeam.members.map((m, i) => (
              <div key={i} style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '0.625rem', fontSize: '0.8125rem' }}>
                <strong>{i + 1}. {m.fullName}</strong> — {m.enrollmentNumber} | Sem {m.semester} | {m.department} | {m.gender}
              </div>
            ))}

            {selectedTeam.mentor ? (
              <>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: 'var(--color-success)' }}>🎓 Mentor</h4>
                <div className="detail-grid">
                  {Object.entries({
                    'Name': selectedTeam.mentor.fullName,
                    'Contact': selectedTeam.mentor.contactNumber,
                    'Email': selectedTeam.mentor.email,
                    'Department': selectedTeam.mentor.department,
                    'Institute': selectedTeam.mentor.institute,
                    'Address': selectedTeam.mentor.officeAddress,
                  }).map(([k, v]) => (
                    <div key={k} className="detail-item">
                      <span className="detail-key">{k}</span>
                      <span className="detail-val">{v}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginTop: '1.25rem', color: 'var(--color-warning)', fontSize: '0.875rem' }}>
                ⏳ Mentor details not yet submitted
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: '380px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Team?</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost btn-md" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger btn-md"
                style={{ flex: 1 }}
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <><div className="spinner" /> Deleting...</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
        .search-wrapper { position: relative; flex: 1; min-width: 200px; }
        .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--color-text-light); }
        .search-input { padding-left: 2.5rem; }
        .filter-select { width: auto; }
        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-top: 1px solid var(--color-border); }
        .pagination-info { font-size: 0.8125rem; color: var(--color-text-muted); }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .detail-item { display: flex; flex-direction: column; gap: 0.125rem; padding: 0.625rem; background: var(--color-bg-soft); border-radius: var(--radius-md); }
        .detail-key { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 700; }
        .detail-val { font-size: 0.8125rem; color: var(--color-text); font-weight: 500; word-break: break-all; }
      `}</style>
    </div>
  )
}
