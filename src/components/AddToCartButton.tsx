import { ShoppingBag } from 'lucide-react'
import { playHoverTick } from '../utils/audio'

type AddToCartButtonProps = {
  onClick: () => void
  disabled?: boolean
}

export function AddToCartButton({ onClick, disabled }: AddToCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={playHoverTick}
      disabled={disabled}
      className="group relative inline-flex min-w-56 cursor-pointer items-center justify-center overflow-hidden rounded-none border border-[color:color-mix(in_srgb,var(--ball-accent)_42%,transparent)] bg-[color:var(--ball-accent)] px-8 py-5 text-sm font-bold uppercase tracking-[0.35em] text-white shadow-theme-glow transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_52px_color-mix(in_srgb,var(--ball-accent)_58%,transparent)] disabled:cursor-wait disabled:opacity-70"
    >
      <span className="relative flex items-center gap-3">
        <ShoppingBag size={16} />
        Add To Cart
      </span>
    </button>
  )
}
