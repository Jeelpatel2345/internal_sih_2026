import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { SIH_RULES } from '../../constants'
import './Sections.css'

// ─── Scroll Reveal Hook ─────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

export function RulesSection() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, visible } = useReveal()

  return (
    <section className="section bg-soft" id="rules">
      <div className="container">
        <div className={`section-header reveal ${visible ? 'visible' : ''}`} ref={ref}>
          <div className="section-badge">📋 Participation Rules</div>
          <h2 className="section-title">
            Rules & <span>Guidelines</span>
          </h2>
          <p className="section-subtitle">
            Please read all rules carefully before registering. Non-compliance may result in disqualification.
          </p>
        </div>

        <div className="rules-grid">
          {SIH_RULES.map((rule, idx) => (
            <RuleItem key={rule.id} rule={rule} index={idx} open={open} setOpen={setOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RuleItem({
  rule,
  index,
  open,
  setOpen,
}: {
  rule: { id: number; title: string; content: string }
  index: number
  open: number | null
  setOpen: (id: number | null) => void
}) {
  const { ref, visible } = useReveal(0.05)
  const isOpen = open === rule.id

  return (
    <div
      ref={ref}
      className={`accordion-item reveal ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.06}s` }}
    >
      <button
        className={`accordion-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setOpen(isOpen ? null : rule.id)}
        aria-expanded={isOpen}
      >
        <span>
          <span className="rule-num">Rule {rule.id}.</span> {rule.title}
        </span>
        <ChevronDown size={18} className="accordion-icon" />
      </button>
      <div className={`accordion-body ${isOpen ? 'open' : ''}`}>
        <div className="accordion-body-inner">
          <div className="accordion-content">{rule.content}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  const { ref, visible } = useReveal()

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
        <div className={`section-header reveal ${visible ? 'visible' : ''}`} ref={ref}>
          <div className="section-badge">❓ Frequently Asked</div>
          <h2 className="section-title">Common <span>Questions</span></h2>
          <p className="section-subtitle">
            Everything you need to know about Internal SIH 2026 registration.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} open={open} setOpen={setOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({
  faq,
  index,
  open,
  setOpen,
}: {
  faq: { q: string; a: string }
  index: number
  open: number | null
  setOpen: (i: number | null) => void
}) {
  const { ref, visible } = useReveal(0.05)
  const isOpen = open === index

  return (
    <div
      ref={ref}
      className={`accordion-item reveal ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.05}s` }}
    >
      <button
        className={`accordion-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setOpen(isOpen ? null : index)}
      >
        <span>{faq.q}</span>
        <ChevronDown size={18} className="accordion-icon" />
      </button>
      <div className={`accordion-body ${isOpen ? 'open' : ''}`}>
        <div className="accordion-body-inner">
          <div className="accordion-content">{faq.a}</div>
        </div>
      </div>
    </div>
  )
}

export function ClubsSection() {
  const { ref, visible } = useReveal()

  const clubs = [
    {
      name: 'Research Club',
      subtitle: 'Innovation & Research Excellence',
      coordinator: 'Amit Modi',
      email: 'research.club@vsitr.ac.in',
      color: 'var(--color-red)',
      gradientFrom: '#C1272D',
      gradientTo: '#ff6b6b',
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
      gradientFrom: '#1B3F8B',
      gradientTo: '#4c8fd6',
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
      gradientFrom: '#7C3AED',
      gradientTo: '#c4b5fd',
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
      gradientFrom: '#D97706',
      gradientTo: '#fbbf24',
      description: 'Empowering students with essential soft skills — communication, teamwork, leadership, and professional etiquette.',
      icon: '🌟',
      tag: 'Co-Organizer',
    },
  ]

  return (
    <section className="section bg-soft" id="clubs">
      <div className="container">
        <div className={`section-header reveal ${visible ? 'visible' : ''}`} ref={ref}>
          <div className="section-badge">🏛️ Organizing Bodies</div>
          <h2 className="section-title">Clubs & <span>Organizers</span></h2>
          <p className="section-subtitle">
            Internal SIH 2026 is organized by the vibrant technical clubs of VSITR / KSV.
          </p>
        </div>

        <div className="grid-4">
          {clubs.map((club, idx) => (
            <ClubCard key={club.name} club={club} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ClubCard({ club, index }: { club: {
  name: string; subtitle: string; coordinator: string; email: string;
  color: string; gradientFrom: string; gradientTo: string;
  description: string; icon: string; tag: string;
}; index: number }) {
  const { ref, visible } = useReveal(0.08)
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      ref={ref}
      className={`club-flip-container reveal ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className={`club-flip-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="club-card card club-front">
          <div className="club-header">
            <div
              className="club-icon"
              style={{ background: `linear-gradient(135deg, ${club.gradientFrom}, ${club.gradientTo})` }}
            >
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
          </div>
        </div>

        {/* Back */}
        <div
          className="club-card club-back"
          style={{ background: `linear-gradient(135deg, ${club.gradientFrom}, ${club.gradientTo})` }}
        >
          <div className="club-back-icon">{club.icon}</div>
          <h3 className="club-back-name">{club.name}</h3>
          <p className="club-back-coord">{club.coordinator}</p>
          <a href={`mailto:${club.email}`} className="club-back-email">
            ✉ {club.email}
          </a>
          <div className="club-back-tag">{club.tag}</div>
        </div>
      </div>
    </div>
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
