import { ShoppingBag, UserRound } from 'lucide-react'
import type { RefObject } from 'react'
import { useMemo } from 'react'

type HeaderProps = {
	cartCount: number
	cartRef: RefObject<HTMLButtonElement | null>
	onCustomizeClick?: () => void
}

const nav = ['Products', 'Customize', 'Contacts']

export function Header({ cartCount, cartRef, onCustomizeClick }: HeaderProps) {
	const count = useMemo(() => String(cartCount).padStart(2, '0'), [cartCount])

	return (
		<header className='absolute inset-x-0 top-0 z-40'>
			<div className='mx-auto flex max-w-[1600px] items-center justify-between px-4 py-5 sm:px-6 lg:px-10'>
				<div className='flex items-center gap-4'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/6'>
						<div className='flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-sm font-bold'>
							e
						</div>
					</div>
					<div className='font-display text-2xl uppercase leading-none tracking-wide'>
						<div>Slam</div>
						<div>Dunk</div>
					</div>
				</div>

				<nav className='hidden items-center gap-10 text-lg font-medium text-white/75 md:flex'>
					{nav.map((item, index) =>
						item === 'Customize' ? (
							<button
								key={item}
								type='button'
								onClick={() => onCustomizeClick?.()}
								className='transition hover:text-white'
							>
								{item}
							</button>
						) : (
							<a
								key={item}
								href={`#section-${index + 1}`}
								className={`transition hover:text-white ${index === 0 ? 'text-theme-accent' : ''}`}
							>
								{item}
							</a>
						),
					)}
				</nav>

				<div className='flex items-center gap-3'>
					<button
						type='button'
						className='flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/35 hover:text-white'
						aria-label='User account'
					>
						<UserRound size={18} />
					</button>
					<button
						ref={cartRef}
						type='button'
						className='relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/35 hover:text-white'
						aria-label='Shopping cart'
					>
						<ShoppingBag size={18} />
						<span className='absolute -right-1 -top-1 rounded-full bg-theme-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_0_12px_color-mix(in_srgb,var(--ball-accent)_55%,transparent)]'>
							{count}
						</span>
					</button>
				</div>
			</div>
		</header>
	)
}
