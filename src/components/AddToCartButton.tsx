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
      className="group relative inline-flex min-w-[12rem] cursor-pointer items-center justify-center overflow-hidden border border-[color:color-mix(in_srgb,var(--ball-accent)_42%,transparent)] bg-[color:var(--ball-accent)] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-theme-glow transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_52px_color-mix(in_srgb,var(--ball-accent)_58%,transparent)] disabled:cursor-wait disabled:opacity-70 sm:min-w-56 sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.35em]"
    >
      <span className="relative flex items-center gap-2 sm:gap-3">
        <ShoppingBag size={16} />
        Add To Cart
      </span>
    </button>
  )
}
