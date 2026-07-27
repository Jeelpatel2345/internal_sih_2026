import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/hero/Hero'
import { RulesSection, FAQSection, ClubsSection, MentorStatusCard } from '../components/sections/Sections'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MentorStatusCard />

        {/* ── Organised By — Logo Showcase ──────────────────── */}
        <section className="logos-section">
          <div className="container">
            <p className="logos-section-label">Organised & Hosted By</p>
            <div className="logos-showcase">

              <a href="https://www.ksv.ac.in" target="_blank" rel="noopener noreferrer" className="logo-showcase-card">
                <div className="logo-showcase-img-wrap">
                  <img src="/logos/ksv.jpg" alt="Kadi Sarva Vishwavidyalaya" />
                </div>
                <div className="logo-showcase-info">
                  <span className="logo-showcase-abbr">KSV</span>
                  <span className="logo-showcase-fullname">Kadi Sarva Vishwavidyalaya</span>
                </div>
              </a>

              <div className="logo-showcase-x">×</div>

              <a href="https://www.vsitr.ac.in" target="_blank" rel="noopener noreferrer" className="logo-showcase-card">
                <div className="logo-showcase-img-wrap">
                  <img src="/logos/vsitr.jpg" alt="Vidush Somany Institute of Technology & Research" />
                </div>
                <div className="logo-showcase-info">
                  <span className="logo-showcase-abbr">VSITR</span>
                  <span className="logo-showcase-fullname">Vidush Somany Institute of Technology &amp; Research</span>
                </div>
              </a>

              <div className="logo-showcase-x">×</div>

              <a href="https://www.sih.gov.in" target="_blank" rel="noopener noreferrer" className="logo-showcase-card">
                <div className="logo-showcase-img-wrap logo-showcase-img-wrap--sih">
                  <img src="/logos/sih.jpg" alt="Smart India Hackathon 2026" />
                </div>
                <div className="logo-showcase-info">
                  <span className="logo-showcase-abbr">SIH 2026</span>
                  <span className="logo-showcase-fullname">Smart India Hackathon</span>
                </div>
              </a>

            </div>
          </div>
        </section>

        {/* About / What is SIH */}
        <section className="section" id="about">
          <div className="container">
            <div className="about-grid">
              <div className="about-content">
                <div className="section-badge" style={{ justifyContent: 'flex-start' }}>🏆 About SIH 2026</div>
                <h2 className="section-title" style={{ textAlign: 'left' }}>
                  What is <span>Smart India Hackathon?</span>
                </h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                  Smart India Hackathon (SIH) is the world's largest open innovation model and hackathon, organized by the Government of India. It brings together students, innovators, and industry experts to solve pressing challenges across various domains.
                </p>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  Internal SIH 2026 is our college-level selection round where teams compete to represent <strong>VSITR / KSV</strong> at the national level. Every team of 6 students (including at least one female member) is eligible.
                </p>

                <div className="about-stats">
                  {[
                    { num: '6', label: 'Members per team' },
                    { num: '1+', label: 'Female participant required' },
                    { num: '2', label: 'Registration phases' },
                    { num: '∞', label: 'Innovation potential' },
                  ].map((s) => (
                    <div key={s.label} className="about-stat">
                      <span className="about-stat-num gradient-text">{s.num}</span>
                      <span className="about-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="about-phases">
                <h3 className="about-phases-title">Registration in 2 Phases</h3>
                {[
                  {
                    phase: 'Phase 1',
                    title: 'Team Registration',
                    desc: 'Register team name, leader details, and all 5 members. Get your unique Registration ID.',
                    color: 'var(--color-red)',
                  },
                  {
                    phase: 'Phase 2',
                    title: 'Mentor Details',
                    desc: 'Submit your faculty mentor\'s details using your Registration ID. This completes your registration.',
                    color: 'var(--color-blue)',
                  },
                ].map((p) => (
                  <div key={p.phase} className="phase-card card" style={{ borderLeft: `3px solid ${p.color}` }}>
                    <span className="phase-badge" style={{ background: p.color }}>{p.phase}</span>
                    <h4 className="phase-title">{p.title}</h4>
                    <p className="phase-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <RulesSection />
        <FAQSection />
        <ClubsSection />

        {/* Final CTA */}
        <section className="section cta-section">
          <div className="container">
            <div className="cta-card">
              <div className="cta-glow" />
              <div className="section-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                🚀 Ready to Innovate?
              </div>
              <h2 className="section-title" style={{ color: 'white', marginTop: '0.5rem' }}>
                Register Your Team Today
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
                Deadline: <strong style={{ color: 'white' }}>August 2, 2026, 11:59 PM IST</strong>. Don't miss your chance to represent VSITR at the national level.
              </p>
              <a href="/register" className="btn btn-xl" style={{ background: 'white', color: 'var(--color-red)', fontWeight: 700 }}>
                Register Now →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; gap: 2.5rem; } }
        .about-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .about-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          background: var(--color-bg-soft);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .about-stat-num {
          font-family: var(--font-primary);
          font-size: 2rem;
          font-weight: 900;
        }
        .about-stat-label {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .about-phases { display: flex; flex-direction: column; gap: 1.25rem; }
        .about-phases-title {
          font-family: var(--font-primary);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }
        .phase-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .phase-badge {
          display: inline-block;
          width: fit-content;
          padding: 0.2rem 0.75rem;
          border-radius: var(--radius-full);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .phase-title {
          font-family: var(--font-primary);
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .phase-desc { font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.6; }
        .cta-section { background: transparent; }
        .cta-card {
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-xl), var(--shadow-glow-blue);
        }
        .cta-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Logos Section ────────────────── */
        .logos-section {
          background: white;
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .logos-section-label {
          text-align: center;
          font-size: 0.6875rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
          margin-bottom: 1.75rem;
        }
        .logos-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
          align-items: stretch;
          justify-items: center;
        }
        .logo-showcase-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
          text-decoration: none;
          padding: 1.5rem 1.75rem;
          border-radius: var(--radius-xl);
          border: 1.5px solid var(--color-border);
          background: white;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 260px;
          min-width: 0;
        }
        .logo-showcase-card:hover {
          border-color: var(--color-red);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(193,39,45,0.12);
        }
        .logo-showcase-img-wrap {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-showcase-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .logo-showcase-img-wrap--sih img {
          border-radius: 50%;
        }
        .logo-showcase-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .logo-showcase-abbr {
          font-family: var(--font-primary);
          font-size: 1rem;
          font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-showcase-fullname {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 500;
          text-align: center;
          max-width: 100%;
          line-height: 1.4;
        }
        .logo-showcase-x {
          font-size: 1.5rem;
          color: var(--color-border);
          font-weight: 300;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
        }
        @media (max-width: 960px) {
          .logos-showcase {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }
          .logo-showcase-img-wrap {
            width: 70px;
            height: 70px;
          }
        }
        @media (max-width: 640px) {
          .logos-showcase {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .logo-showcase-card {
            padding: 1rem 1.25rem;
            max-width: 100%;
          }
          .logo-showcase-img-wrap {
            width: 60px;
            height: 60px;
          }
          .logo-showcase-fullname {
            font-size: 0.72rem;
          }
          .logo-showcase-x {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
