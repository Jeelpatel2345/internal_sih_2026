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
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
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
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-badge">
            <span>SIH</span>
            <span className="logo-year">2026</span>
          </div>
          <div className="logo-text">
            <span className="logo-main">Internal SIH</span>
            <span className="logo-sub">KSV / VSITR</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links hide-mobile">
          {navLinks.map((link) =>
            link.href.startsWith('/#') ? (
              <button key={link.label} className="nav-link" onClick={() => handleHashLink(link.href)}>
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="navbar-cta hide-mobile">
          <Link to="/mentor" className="btn btn-ghost btn-sm">
            Submit Mentor
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Register Team <ExternalLink size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="navbar-hamburger hide-desktop"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) =>
            link.href.startsWith('/#') ? (
              <button
                key={link.label}
                className="mobile-link"
                onClick={() => { handleHashLink(link.href); setMenuOpen(false) }}
              >
                {link.label}
              </button>
            ) : (
              <Link key={link.label} to={link.href} className="mobile-link">
                {link.label}
              </Link>
            )
          )}
          <div className="mobile-cta">
            <Link to="/mentor" className="btn btn-ghost btn-md btn-full">Submit Mentor</Link>
            <Link to="/register" className="btn btn-primary btn-md btn-full">Register Team</Link>
          </div>
        </div>
      )}
    </header>
  )
}
