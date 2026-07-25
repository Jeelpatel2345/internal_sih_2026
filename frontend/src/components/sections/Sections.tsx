import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SIH_RULES } from '../../constants'
import './Sections.css'

export function RulesSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="section bg-soft" id="rules">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📋 Participation Rules</div>
          <h2 className="section-title">
            Rules & <span>Guidelines</span>
          </h2>
          <p className="section-subtitle">
            Please read all rules carefully before registering. Non-compliance may result in disqualification.
          </p>
        </div>

        <div className="rules-grid">
          {SIH_RULES.map((rule) => (
            <div key={rule.id} className="accordion-item">
              <button
                className={`accordion-trigger ${open === rule.id ? 'open' : ''}`}
                onClick={() => setOpen(open === rule.id ? null : rule.id)}
                aria-expanded={open === rule.id}
              >
                <span>
                  <span className="rule-num">Rule {rule.id}.</span> {rule.title}
                </span>
                <ChevronDown size={18} className="accordion-icon" />
              </button>
              {open === rule.id && (
                <div className="accordion-content">{rule.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    { q: 'What is Internal SIH 2026?', a: 'Internal SIH 2026 is the college-level selection round for Smart India Hackathon 2026, organized by KSV / VSITR. Top teams from this internal round will represent our college at the national level.' },
    { q: 'Who can participate?', a: 'Any currently enrolled student of VSITR / KSV (any department, any semester) can participate. Cross-semester and cross-department teams are highly encouraged.' },
    { q: 'How do I register my team?', a: "Click \"Register Your Team\" on the homepage. Complete Step 1 (team name), Step 2 (leader details), and Step 3 (all 5 member details). After successful registration, you'll receive a unique Registration ID to submit mentor details." },
    { q: 'What happens after Phase 1 registration?', a: "After Phase 1, you'll receive a Registration ID. Use this ID on the Mentor page to submit your faculty mentor's details. Registration is only complete after mentor details are submitted." },
    { q: 'Can I edit my registration after submission?', a: 'No. Once submitted, registrations cannot be edited through the portal. For corrections, contact the organizing committee with your Registration ID.' },
    { q: 'What is the registration deadline?', a: 'The deadline is August 2, 2026 at 11:59 PM IST. Both Phase 1 (team) and Phase 2 (mentor) must be completed before this time.' },
    { q: 'Is there a registration fee?', a: 'No. Participation in Internal SIH 2026 is completely free for all VSITR / KSV students.' },
    { q: 'I lost my Registration ID. What should I do?', a: "Your Registration ID was sent to the Team Leader's email address immediately after registration. Check your inbox (including spam). If not found, contact the organizing committee." },
  ]

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">❓ Frequently Asked</div>
          <h2 className="section-title">Common <span>Questions</span></h2>
          <p className="section-subtitle">
            Everything you need to know about Internal SIH 2026 registration.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <button
                className={`accordion-trigger ${open === i ? 'open' : ''}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className="accordion-icon" />
              </button>
              {open === i && (
                <div className="accordion-content">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ClubsSection() {
  const clubs = [
    {
      name: 'Research Club',
      subtitle: 'Innovation & Research Excellence',
      coordinator: 'Amit Modi',
      email: 'research.club@vsitr.ac.in',
      color: 'var(--color-red)',
      description: 'Driving academic curiosity and cutting-edge research, guiding students to explore new frontiers in science and technology.',
      icon: '🔬',
      tag: 'Organizer',
    },
    {
      name: 'Coding Club',
      subtitle: 'Development & Problem Solving',
      coordinator: 'Ankit Vaghela',
      email: 'coding.club@vsitr.ac.in',
      color: 'var(--color-blue)',
      description: 'Building the next generation of coders and developers through hackathons, workshops, and competitive programming.',
      icon: '💻',
      tag: 'Co-Organizer',
    },
    {
      name: 'Design Club',
      subtitle: 'UI/UX & Creative Design',
      coordinator: 'Prof. Sanjay Makwana',
      email: 'design.club@vsitr.ac.in',
      color: '#7C3AED',
      description: 'Fostering creative thinking and visual communication skills through UI/UX design, branding, and digital art.',
      icon: '🎨',
      tag: 'Co-Organizer',
    },
    {
      name: 'SoftSkill Club',
      subtitle: 'Communication & Leadership',
      coordinator: 'Nehal Shah',
      email: 'softskill.club@vsitr.ac.in',
      color: '#D97706',
      description: 'Empowering students with essential soft skills — communication, teamwork, leadership, and professional etiquette.',
      icon: '🌟',
      tag: 'Co-Organizer',
    },
  ]

  return (
    <section className="section bg-soft" id="clubs">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🏛️ Organizing Bodies</div>
          <h2 className="section-title">Clubs & <span>Organizers</span></h2>
          <p className="section-subtitle">
            Internal SIH 2026 is organized by the vibrant technical clubs of VSITR / KSV.
          </p>
        </div>

        <div className="grid-4">
          {clubs.map((club) => (
            <div key={club.name} className="club-card card">
              <div className="club-header">
                <div className="club-icon" style={{ background: club.color }}>
                  {club.icon}
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{club.tag}</span>
              </div>
              <h3 className="club-name">{club.name}</h3>
              <p className="club-subtitle">{club.subtitle}</p>
              <p className="club-desc">{club.description}</p>
              <div className="club-footer">
                <div className="club-coord">
                  <span className="club-coord-label">Coordinator</span>
                  <span className="club-coord-name">{club.coordinator}</span>
                </div>
                <a href={`mailto:${club.email}`} className="club-email">
                  {club.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function MentorStatusCard() {
  const regId = localStorage.getItem('sih2026_reg_id')
  const teamName = localStorage.getItem('sih2026_team_name')
  const mentorStatus = localStorage.getItem('sih2026_mentor_status')

  if (!regId) return null

  const isComplete = mentorStatus === 'completed'

  return (
    <section className="mentor-status-banner">
      <div className="container">
        <div className={`mentor-status-card ${isComplete ? 'complete' : 'pending'}`}>
          <div className="mentor-status-icon">{isComplete ? '✅' : '⏳'}</div>
          <div className="mentor-status-body">
            <p className="mentor-status-team">{teamName || 'Your Team'}</p>
            <p className="mentor-status-reg">Registration ID: <strong>{regId}</strong></p>
            <p className="mentor-status-msg">
              {isComplete
                ? 'Your registration is complete! Mentor details submitted.'
                : 'Phase 1 complete. Submit mentor details to complete registration.'}
            </p>
          </div>
          {!isComplete && (
            <a href="/mentor" className="btn btn-warning btn-md">Submit Mentor →</a>
          )}
        </div>
      </div>
    </section>
  )
}
