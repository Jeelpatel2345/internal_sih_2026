import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Trophy, Clock, ChevronDown } from 'lucide-react'
import { useCountdown } from '../../hooks/useCountdown'
import './Hero.css'

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&auto=format&fit=crop',
    alt: 'Team collaboration at hackathon',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop',
    alt: 'Students coding together',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop',
    alt: 'Hackathon presentation',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop',
    alt: 'Innovation and technology',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&auto=format&fit=crop',
    alt: 'Student innovation',
  },
]

const StatCard = ({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) => (
  <div className="hero-stat">
    <div className="hero-stat-icon">
      <Icon size={18} />
    </div>
    <div>
      <p className="hero-stat-value">{value}</p>
      <p className="hero-stat-label">{label}</p>
    </div>
  </div>
)

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="countdown-unit">
    <div className="countdown-num">{String(value).padStart(2, '0')}</div>
    <div className="countdown-label">{label}</div>
  </div>
)

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { days, hours, minutes, seconds, isExpired } = useCountdown()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero" id="home">
      {/* Slider */}
      <div className="hero-slider">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`hero-slide ${i === currentSlide ? 'active' : ''}`}
            aria-hidden={i !== currentSlide}
          >
            <img src={slide.image} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        {/* Overlay */}
        <div className="hero-overlay" />
      </div>

      {/* Particle dots */}
      <div className="hero-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* Content */}
      <div className="container hero-content">
        <div className="hero-badge animate-fade-in-up">
          <span className="badge-dot" />
          Smart India Hackathon 2026 — Internal Selection
        </div>

        <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Build. Innovate.<br />
          <span className="hero-title-gradient">Represent VSITR.</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Register your team for the Internal SIH 2026 Selection Round at KSV / VSITR.
          Top teams will represent our college at the <strong>national level</strong>.
        </p>

        {/* Countdown */}
        <div className="hero-countdown animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="countdown-label-top">
            <Clock size={14} />
            {isExpired ? 'Registration Closed' : 'Registration closes in'}
          </div>
          {!isExpired ? (
            <div className="countdown-units">
              <CountdownUnit value={days} label="Days" />
              <span className="countdown-sep">:</span>
              <CountdownUnit value={hours} label="Hours" />
              <span className="countdown-sep">:</span>
              <CountdownUnit value={minutes} label="Mins" />
              <span className="countdown-sep">:</span>
              <CountdownUnit value={seconds} label="Secs" />
            </div>
          ) : (
            <p className="countdown-expired">Registration is now closed.</p>
          )}
        </div>

        {/* CTAs */}
        <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {!isExpired ? (
            <Link to="/register" className="btn btn-primary btn-xl">
              Register Your Team <ArrowRight size={18} />
            </Link>
          ) : (
            <button className="btn btn-primary btn-xl" disabled>
              Registration Closed
            </button>
          )}
          <Link to="/mentor" className="btn btn-ghost btn-xl">
            Submit Mentor Details
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <StatCard value="6" label="Members / Team" icon={Users} />
          <StatCard value="Aug 2" label="Deadline" icon={Clock} />
          <StatCard value="SIH 2026" label="National Level" icon={Trophy} />
        </div>

        {/* Slide indicators */}
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#about" className="hero-scroll-indicator">
        <ChevronDown size={20} />
      </a>
    </section>
  )
}
