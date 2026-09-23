import type { User } from '../types'

type HeaderProps = {
  user: User | null
  isAdmin: boolean
  cartCount: number
  onGoHome: () => void
  onGoAccount: () => void
  onGoLearning: () => void
  onGoPayments: () => void
  onOpenCart: () => void
  onOpenAuth: (mode: 'login' | 'signup') => void
  onLogout: () => void
}

function Header({
  user,
  isAdmin,
  cartCount,
  onGoHome,
  onGoAccount,
  onGoLearning,
  onGoPayments,
  onOpenCart,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="brand-wrap brand-home"
        onClick={onGoHome}
        aria-label="Go to GameBoost Academy home"
      >
        <span className="brand-mark">G</span>
        <span className="brand-text">GameBoost Academy</span>
      </button>

      <nav className="main-nav" aria-label="Main navigation">
        <a href="#courses" onClick={onGoHome}>Courses</a>
        <a href="#benefits">Benefits</a>
        <a href="#about">About</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div className="nav-actions">
        {user && !isAdmin && (
          <>
            <button type="button" className="payment-nav-button" onClick={onGoAccount}>
              My Account
            </button>
            <button type="button" className="payment-nav-button" onClick={onGoLearning}>
              My Learning
            </button>
            <button type="button" className="payment-nav-button" onClick={onGoPayments}>
              Payment Center
            </button>
          </>
        )}
        <button type="button" className="cart-button" onClick={onOpenCart} aria-label={`Open cart with ${cartCount} items`}>
          <span className="cart-icon">▱</span>
          Cart <strong>{cartCount}</strong>
        </button>
        {user ? (
          <>
            <span className="signed-in-user">{user.email}</span>
            <button type="button" className="btn btn-ghost" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => onOpenAuth('login')}>
              Log in
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onOpenAuth('signup')}>
              Join now
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header