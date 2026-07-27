import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-gradient-border" />

      <div className="container footer-inner">

        {/* ================= Brand ================= */}
        <div className="footer-brand">

          <div className="footer-logo">

            <div className="footer-logo-images">
              <img src="/logos/ksv.jpg" alt="KSV" />
              <img src="/logos/vsitr.jpg" alt="VSITR" />
              <img
                src="/logos/sih.jpg"
                alt="SIH 2026"
                className="footer-logo-round"
              />
            </div>

            <div className="footer-logo-content">
              <h2 className="footer-logo-title">
                Internal SIH 2026
              </h2>
              <p className="footer-logo-sub">
                KSV / VSITR
              </p>
            </div>

          </div>

          <p className="footer-desc">
            Internal Selection Round for Smart India Hackathon 2026.
            Build innovative solutions, collaborate with your team,
            and represent VSITR at the national level.
          </p>

          <div className="footer-contact">

            <a
              href="mailto:sih2026@vsitr.ac.in"
              className="footer-contact-item"
            >
              <Mail size={16} />
              sih2026@vsitr.ac.in
            </a>

            <a
              href="tel:+9179XXXXXXXX"
              className="footer-contact-item"
            >
              <Phone size={16} />
              +91 79-XXXX XXXX
            </a>

            <div className="footer-contact-item">
              <MapPin size={16} />
              Kadi, Gujarat – 382715
            </div>

          </div>

        </div>

        {/* ================= Quick Links ================= */}

        <div className="footer-links-section">

          <h4 className="footer-links-title">
            Quick Links
          </h4>

          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/register">Register Team</Link></li>
            <li><Link to="/mentor">Submit Mentor</Link></li>
            <li><a href="/#rules">Rules</a></li>
            <li><a href="/#faq">FAQ</a></li>
            <li><a href="/#clubs">Clubs</a></li>
          </ul>

        </div>

        {/* ================= Resources ================= */}

        <div className="footer-links-section">

          <h4 className="footer-links-title">
            Resources
          </h4>

          <ul className="footer-links">

            <li>
              <a
                href="https://www.sih.gov.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                SIH Official Website
                <ExternalLink size={12} />
              </a>
            </li>

            <li>
              <a
                href="https://www.vsitr.ac.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                VSITR Website
                <ExternalLink size={12} />
              </a>
            </li>

            <li>
              <a href="/#rules">
                Participation Rules
              </a>
            </li>

            <li>
              <a href="/#faq">
                FAQs
              </a>
            </li>

          </ul>

        </div>

        {/* ================= Important Dates ================= */}

        <div className="footer-info">

          <h4 className="footer-links-title">
            Important Dates
          </h4>

          <div className="footer-dates">

            <div className="footer-date-item">
              <span className="footer-date-label">
                Registration Opens
              </span>
              <span className="footer-date-value">
                July 25, 2026
              </span>
            </div>

            <div className="footer-date-item">
              <span className="footer-date-label">
                Registration Deadline
              </span>
              <span className="footer-date-value footer-date-red">
                August 2, 2026
              </span>
            </div>

            <div className="footer-date-item">
              <span className="footer-date-label">
                Internal Presentation
              </span>
              <span className="footer-date-value">
                To Be Announced
              </span>
            </div>

            <div className="footer-date-item">
              <span className="footer-date-label">
                SIH National Round
              </span>
              <span className="footer-date-value">
                August 2026
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ================= Bottom ================= */}

      <div className="footer-bottom">

        <div className="container footer-bottom-inner">

          <p className="footer-copyright">
            © 2026 Internal SIH • KSV / VSITR • All Rights Reserved.
          </p>

        </div>

      </div>

    </footer>
  )
}