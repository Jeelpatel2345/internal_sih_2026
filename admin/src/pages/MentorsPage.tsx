import { useQuery } from '@tanstack/react-query'
import { getMentors } from '../services/adminApi'
import './DashboardPage.css'

interface MentorTeam {
  _id: string
  registrationId: string
  teamName: string
  mentor: {
    fullName: string
    contactNumber: string
    email: string
    department: string
    institute: string
    officeAddress: string
    submittedAt: string
  }
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function MentorsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => getMentors().then((r) => r.data),
  })

  const mentors: MentorTeam[] = data?.data || []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mentors</h2>
          <p className="page-subtitle">{mentors.length} mentor submissions</p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reg. ID</th>
                <th>Team Name</th>
                <th>Mentor Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Institute</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : isError ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">!</div><h3>Unable to load mentors</h3><p>Please refresh the page or check your connection.</p></div></td></tr>
              ) : mentors.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🎓</div>
                      <h3>No mentor submissions yet</h3>
                      <p>Mentor details will appear here once teams submit them.</p>
                    </div>
                  </td>
                </tr>
              ) : mentors.map((item, i) => (
                <tr key={item._id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{i + 1}</td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-blue)', fontSize: '0.875rem' }}>{item.registrationId}</span></td>
                  <td style={{ fontWeight: 600 }}>{item.teamName}</td>
                  <td>{item.mentor?.fullName}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{item.mentor?.contactNumber}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{item.mentor?.department}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{item.mentor?.institute}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {formatDate(item.mentor?.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
