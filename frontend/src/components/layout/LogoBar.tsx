import './LogoBar.css'

export default function LogoBar() {
  return (
    <div className="logo-corner">
      <div className="logo-corner-inner">
        <div className="logo-corner-item">
          <img src="/logos/ksv.jpg" alt="KSV" className="logo-corner-img" />
          <span className="logo-corner-name">KSV</span>
        </div>
        <div className="logo-corner-divider" />
        <div className="logo-corner-item">
          <img src="/logos/vsitr.jpg" alt="VSITR" className="logo-corner-img" />
          <span className="logo-corner-name">VSITR</span>
        </div>
        <div className="logo-corner-divider" />
        <div className="logo-corner-item">
          <img src="/logos/sih.jpg" alt="SIH 2026" className="logo-corner-img logo-corner-img--round" />
          <span className="logo-corner-name">SIH 2026</span>
        </div>
      </div>
    </div>
  )
}
