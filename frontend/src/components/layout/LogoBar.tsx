import './LogoBar.css'

export default function LogoBar() {
  return (
    <div className="logo-corner">
      <img src="/logos/ksv.jpg" alt="KSV" className="logo-corner-img" />
      <img src="/logos/vsitr.jpg" alt="VSITR" className="logo-corner-img" />
      <img
        src="/logos/sih.jpg"
        alt="SIH 2026"
        className="logo-corner-img logo-corner-img--round"
      />
    </div>
  )
}