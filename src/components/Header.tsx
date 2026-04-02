import { ShoppingBag, UserRound } from 'lucide-react'
import type { RefObject } from 'react'
import { useMemo } from 'react'

type HeaderProps = {
	cartCount: number
	cartRef: RefObject<HTMLButtonElement | null>
	onCustomizeClick?: () => void
}

const nav = [
	{ label: 'Products', href: '#section-2' },
	{ label: 'Customize', action: 'customize' },
	{ label: 'Contacts', href: '#section-6' },
]

export function Header({ cartCount, cartRef, onCustomizeClick }: HeaderProps) {
	const count = useMemo(() => String(cartCount).padStart(2, '0'), [cartCount])

	return (
		<header className='absolute inset-x-0 top-0 z-40'>
			<div className='mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10'>
				<div className='flex min-w-0 items-center gap-3 sm:gap-4'>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/6 sm:h-12 sm:w-12'>
						<div className='flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white text-xs font-bold sm:h-8 sm:w-8 sm:text-sm sm:border-4'>
							e
						</div>
					</div>
					<div className='min-w-0 font-display text-lg uppercase leading-none tracking-wide sm:text-2xl'>
						<div>Slam</div>
						<div>Dunk</div>
					</div>
				</div>

				<nav className='hidden items-center gap-6 text-base font-medium text-white/75 lg:flex xl:gap-10 xl:text-lg'>
					{nav.map(item =>
						item.action === 'customize' ? (
							<button
								key={item.label}
								type='button'
								onClick={() => onCustomizeClick?.()}
								className='transition hover:text-white'
							>
								{item.label}
							</button>
						) : (
							<a
								key={item.label}
								href={item.href}
								className={`transition hover:text-white ${item.label === 'Products' ? 'text-theme-accent' : ''}`}
							>
								{item.label}
							</a>
						),
					)}
				</nav>

				<div className='flex shrink-0 items-center gap-2 sm:gap-3'>
					<button
						type='button'
						className='hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/35 hover:text-white sm:flex sm:h-11 sm:w-11'
						aria-label='User account'
					>
						<UserRound size={18} />
					</button>
					<button
						ref={cartRef}
						type='button'
						className='relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/35 hover:text-white sm:h-11 sm:w-11'
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
