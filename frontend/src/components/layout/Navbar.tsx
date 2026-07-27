import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ExternalLink } from 'lucide-react'
import './Navbar.css'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rules', href: '/#rules' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Clubs', href: '/#clubs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight

      const progress = height > 0 ? (winScroll / height) * 100 : 0

      setScrollProgress(progress)
      setScrolled(winScroll > 60)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const handleHashLink = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.slice(2)
      const el = document.getElementById(id)

      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = href
      }
    }
  }

  return (
    <>
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Left Brand */}
          <Link to="/" className="navbar-brand">

            <div className="navbar-brand-logos">
              <img src="/logos/ksv.jpg" alt="KSV" />
              <img src="/logos/vsitr.jpg" alt="VSITR" />
              <img
                src="/logos/sih.jpg"
                alt="SIH"
                className="round-logo"
              />
            </div>

            <div className="navbar-brand-divider" />

            <div className="navbar-brand-text">
              <h2>Internal SIH 2026</h2>
              <span>KSV / VSITR</span>
            </div>

          </Link>

          {/* Center Navigation */}
          <nav className="navbar-links hide-mobile">
            {navLinks.map((link) =>
              link.href.startsWith('/#') ? (
                <button
                  key={link.label}
                  className="nav-link"
                  onClick={() => handleHashLink(link.href)}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`nav-link ${
                    location.pathname === link.href ? 'active' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right Buttons */}
          <div className="navbar-cta hide-mobile">
            <Link
              to="/mentor"
              className="btn btn-ghost btn-sm"
            >
              Submit Mentor
            </Link>

            <Link
              to="/register"
              className="btn btn-primary btn-sm"
            >
              Register Team
              <ExternalLink size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar-hamburger hide-desktop"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {menuOpen && (
          <div className="mobile-menu">

            {navLinks.map((link) =>
              link.href.startsWith('/#') ? (
                <button
                  key={link.label}
                  className="mobile-link"
                  onClick={() => {
                    handleHashLink(link.href)
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="mobile-link"
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="mobile-cta">
              <Link
                to="/mentor"
                className="btn btn-ghost btn-md btn-full"
              >
                Submit Mentor
              </Link>

              <Link
                to="/register"
                className="btn btn-primary btn-md btn-full"
              >
                Register Team
              </Link>
            </div>

          </div>
        )}
      </header>
    </>
  )
}