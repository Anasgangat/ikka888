type FooterProps = {
  onGoHome: () => void
  onGoLearning: () => void
  onGoPayments: () => void
}

function Footer({ onGoHome, onGoLearning, onGoPayments }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <div className="brand-wrap">
            <span className="brand-mark">G</span>
            <span className="brand-text">GameBoost Academy</span>
          </div>
          <p>Competitive gaming courses built around clear structure, deliberate practice, and measurable progress.</p>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Explore</span>
          <button type="button" className="footer-link" onClick={onGoHome}>Courses</button>
          <button type="button" className="footer-link" onClick={onGoHome}>Benefits</button>
          <button type="button" className="footer-link" onClick={onGoHome}>About</button>
          <button type="button" className="footer-link" onClick={onGoHome}>FAQ</button>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Account</span>
          <button type="button" className="footer-link" onClick={onGoLearning}>My Learning</button>
          <button type="button" className="footer-link" onClick={onGoPayments}>Payment Center</button>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Training areas</span>
          <span className="footer-text">Mechanics lab</span>
          <span className="footer-text">Ranked room</span>
          <span className="footer-text">Review suite</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 GameBoost Academy. All rights reserved.</span>
        <span>Built for players who want to improve.</span>
      </div>
    </footer>
  )
}

export default Footer