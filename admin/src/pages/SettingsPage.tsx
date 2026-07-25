import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSettings, updateSettings } from '../services/adminApi'
import './DashboardPage.css'

interface SettingsData {
  registrationOpen: boolean
  registrationDeadline: string
  maintenanceMode: boolean
  siteTitle: string
  announcementBanner: string
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings().then((r) => r.data.data as SettingsData),
  })

  const [form, setForm] = useState<Partial<SettingsData>>({})

  useEffect(() => {
    if (data) {
      setForm({
        registrationOpen: data.registrationOpen,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString().slice(0, 16) : '',
        maintenanceMode: data.maintenanceMode,
        siteTitle: data.siteTitle || '',
        announcementBanner: data.announcementBanner || '',
      })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (d: Partial<SettingsData>) => updateSettings({
      ...d,
      registrationDeadline: d.registrationDeadline ? new Date(d.registrationDeadline).toISOString() : undefined,
    }),
    onSuccess: () => {
      toast.success('Settings saved successfully')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const handleChange = (key: keyof SettingsData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => updateMutation.mutate(form)

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading settings...</div>

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage portal configuration</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <><div className="spinner" /> Saving...</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Registration Control */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
            🎛️ Registration Control
          </h3>

          <div className="settings-toggle-row">
            <div>
              <p className="settings-label">Registration Open</p>
              <p className="settings-desc">Allow teams to register on the portal</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.registrationOpen ?? true}
                onChange={(e) => handleChange('registrationOpen', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-toggle-row">
            <div>
              <p className="settings-label">Maintenance Mode</p>
              <p className="settings-desc">Show maintenance page to all visitors</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.maintenanceMode ?? false}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Registration Deadline</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.registrationDeadline || ''}
              onChange={(e) => handleChange('registrationDeadline', e.target.value)}
            />
          </div>
        </div>

        {/* Site Configuration */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
            ⚙️ Site Configuration
          </h3>

          <div className="form-group">
            <label className="form-label">Site Title</label>
            <input
              type="text"
              className="form-input"
              value={form.siteTitle || ''}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              placeholder="Internal SIH 2026 — KSV / VSITR"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Banner</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.announcementBanner || ''}
              onChange={(e) => handleChange('announcementBanner', e.target.value)}
              placeholder="Leave empty to hide banner. e.g. 'Registrations closing soon!'"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              This text will be displayed as an announcement bar on the portal.
            </p>
          </div>
        </div>

        {/* Current Status Summary */}
        <div className="card" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
          <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
            📊 Current Status
          </h3>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {form.registrationOpen
                ? <><CheckCircle size={16} color="var(--color-success)" /> <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>Registration is OPEN</span></>
                : <><AlertCircle size={16} color="var(--color-error)" /> <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 600 }}>Registration is CLOSED</span></>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {form.maintenanceMode
                ? <><AlertCircle size={16} color="var(--color-warning)" /> <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 600 }}>Maintenance Mode ON</span></>
                : <><CheckCircle size={16} color="var(--color-success)" /> <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>Portal Live</span></>
              }
            </div>
            {form.registrationDeadline && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Deadline: <strong style={{ color: 'var(--color-text)' }}>
                  {new Date(form.registrationDeadline).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .settings-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 1rem;
        }
        .settings-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.125rem; }
        .settings-desc { font-size: 0.75rem; color: var(--color-text-muted); }

        /* Toggle Switch */
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider {
          position: absolute; inset: 0; cursor: pointer;
          background: var(--color-border); border-radius: 12px;
          transition: 0.3s;
        }
        .toggle-slider::before {
          content: ''; position: absolute; height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background: white; border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle-switch input:checked + .toggle-slider { background: var(--color-success); }
        .toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); }

        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
