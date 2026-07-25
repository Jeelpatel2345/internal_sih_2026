import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, Clock, TrendingUp, FileText, Table } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getDashboardStats, exportExcel, exportCSV, downloadBlob } from '../services/adminApi'
import toast from 'react-hot-toast'
import './DashboardPage.css'

const DEPT_COLORS = ['#C1272D', '#1B3F8B', '#D97706', '#16A34A', '#7C3AED', '#DC2626', '#2563EB', '#D97706']
const GENDER_COLORS = { Male: '#1B3F8B', Female: '#C1272D', Other: '#D97706' }

interface StatsData {
  stats: {
    totalTeams: number
    completedTeams: number
    pendingTeams: number
    totalParticipants: number
  }
  charts: {
    departmentDistribution: { name: string; value: number }[]
    genderRatio: { name: string; value: number }[]
    dailyRegistrations: { date: string; registrations: number }[]
  }
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => getDashboardStats().then((r) => r.data.data as StatsData),
    refetchInterval: 30000,
  })

  const handleExportExcel = async () => {
    try {
      const res = await exportExcel()
      downloadBlob(res.data as Blob, `SIH2026_Teams_${Date.now()}.xlsx`)
      toast.success('Excel exported!')
    } catch { toast.error('Export failed') }
  }

  const handleExportCSV = async () => {
    try {
      const res = await exportCSV()
      downloadBlob(res.data as Blob, `SIH2026_Teams_${Date.now()}.csv`)
      toast.success('CSV exported!')
    } catch { toast.error('Export failed') }
  }

  const stats = data?.stats
  const charts = data?.charts

  const statCards = [
    { label: 'Total Teams', value: stats?.totalTeams ?? '—', icon: Users, color: '#1B3F8B', bg: '#EFF6FF' },
    { label: 'Completed', value: stats?.completedTeams ?? '—', icon: UserCheck, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Pending Mentor', value: stats?.pendingTeams ?? '—', icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Total Participants', value: stats?.totalParticipants ?? '—', icon: TrendingUp, color: '#C1272D', bg: '#FEF2F2' },
  ]

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Internal SIH 2026 Registration Overview</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV}>
            <FileText size={14} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportExcel}>
            <Table size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card card">
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="stat-card-body">
              <p className="stat-card-value" style={{ color: card.color }}>
                {isLoading ? <span className="skeleton-text" /> : card.value}
              </p>
              <p className="stat-card-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Daily Registrations Line Chart */}
        <div className="chart-card card">
          <div className="chart-card-header">
            <h3>Daily Registrations (Last 14 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts?.dailyRegistrations || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="registrations" stroke="#C1272D" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Bar Chart */}
        <div className="chart-card card">
          <div className="chart-card-header">
            <h3>Department Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.departmentDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {charts?.departmentDistribution?.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Pie Chart */}
        <div className="chart-card chart-card-sm card">
          <div className="chart-card-header">
            <h3>Gender Ratio</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts?.genderRatio || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {charts?.genderRatio?.map((entry) => (
                  <Cell key={entry.name} fill={(GENDER_COLORS as Record<string, string>)[entry.name] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
