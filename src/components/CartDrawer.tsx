import type { CartItem } from '../types'

type CartDrawerProps = {
  items: CartItem[]
  message: string
  total: number
  onClose: () => void
  onUpdateQuantity: (courseId: string, quantity: number) => void
  onCheckout: () => void
  onExploreCourses: () => void
}

function CartDrawer({
  items,
  message,
  total,
  onClose,
  onUpdateQuantity,
  onCheckout,
  onExploreCourses,
}: CartDrawerProps) {
  return (
    <div className="cart-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="cart-drawer" aria-label="Shopping cart" onMouseDown={(event) => event.stopPropagation()}>
        <div className="cart-heading">
          <div>
            <span className="eyebrow">YOUR TRAINING LOADOUT</span>
            <h2>Your cart</h2>
          </div>
          <button type="button" className="auth-close" onClick={onClose} aria-label="Close cart">×</button>
        </div>
        {message && <p className="cart-message" role="status">{message}</p>}
        {items.length ? (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-image" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="cart-item-info">
                    <strong>{item.title}</strong>
                    <span>{item.price}</span>
                    <div className="quantity-control">
                      <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.title}`}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title}`}>+</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-total">
              <span>Total</span>
              <strong>R{total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong>
            </div>
            <button type="button" className="btn btn-primary cart-checkout" onClick={onCheckout}>
              Checkout with EFT
            </button>
            <p className="cart-note">You can upload your payment proof after the order is created.</p>
          </>
        ) : (
          <div className="cart-empty">
            <span className="cart-empty-mark">+</span>
            <h3>Your cart is waiting.</h3>
            <p>Add a course and build your training loadout.</p>
            <button type="button" className="btn btn-primary" onClick={onExploreCourses}>
              Explore courses
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer