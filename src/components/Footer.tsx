import { brandName } from '../data/site'

type FooterProps = {
  onGoHome: () => void
  onGoCourses: () => void
  onGoAbout: () => void
  onGoFaq: () => void
  onGoLearning: () => void
  onGoPayments: () => void
}

function Footer({ onGoHome, onGoCourses, onGoAbout, onGoFaq, onGoLearning, onGoPayments }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <div className="brand-wrap">
            <span className="brand-mark">P</span>
            <span className="brand-text">{brandName}</span>
          </div>
          <p>PUBG coaching built around recoil, rotations, and real match review — so you climb instead of guessing.</p>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Explore</span>
          <button type="button" className="footer-link" onClick={onGoHome}>Home</button>
          <button type="button" className="footer-link" onClick={onGoCourses}>Courses</button>
          <button type="button" className="footer-link" onClick={onGoAbout}>About</button>
          <button type="button" className="footer-link" onClick={onGoFaq}>FAQ</button>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Account</span>
          <button type="button" className="footer-link" onClick={onGoLearning}>My Courses</button>
          <button type="button" className="footer-link" onClick={onGoPayments}>Payment Center</button>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Training areas</span>
          <span className="footer-text">Gunplay lab</span>
          <span className="footer-text">Zone rotations</span>
          <span className="footer-text">Match analysis</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {brandName}. All rights reserved.</span>
        <span>Not affiliated with KRAFTON, Inc.</span>
      </div>
    </footer>
  )
}

export default Footer