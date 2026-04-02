import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { RefObject } from 'react'
import { AddToCartButton } from './AddToCartButton'

type HeroProps = {
	onAddToCart: () => void
	addingToCart: boolean
	ballAnchorRef: RefObject<HTMLDivElement | null>
	activeBallIndex: number
	setActiveBallIndex: (index: number | ((prev: number) => number)) => void
	ballData: Array<{ name: string }>
}

export function Hero({
	onAddToCart,
	addingToCart,
	ballAnchorRef,
	activeBallIndex,
	setActiveBallIndex,
	ballData
}: HeroProps) {
	const nextBall = () => setActiveBallIndex((prev: number) => (prev + 1) % ballData.length)
	const prevBall = () => setActiveBallIndex((prev: number) => (prev - 1 + ballData.length) % ballData.length)

	return (
		<section
			id='section-1'
			data-section
			className='relative flex h-screen items-center overflow-hidden px-4 py-4 sm:px-6 lg:px-10'
		>
			<div className='mx-auto grid h-full max-h-[100vh] w-full max-w-[1600px] grid-cols-1 rounded-[2.5rem]  px-5 py-8 backdrop-blur-[2px] sm:px-8 lg:grid-cols-[220px_1fr_220px] lg:px-10'>
				<div className='order-2 flex items-start justify-between pt-12 lg:order-1 lg:flex-col'>
					<button
						type='button'
						className='hidden items-center gap-4 text-left text-white/75 transition hover:text-white sm:flex'
					>
						<span className='flex h-14 w-14 items-center justify-center rounded-full border border-white/20'>
							<Play size={15} className='ml-1' />
						</span>
						<span className='text-base uppercase tracking-[0.18em]'>
							Promotion
							<br />
							video
						</span>
					</button>

					<div className='pb-5'>
						<div className='text-[clamp(3.75rem,8vw,5.5rem)] font-medium uppercase leading-none text-theme-accent drop-shadow-[0_0_28px_color-mix(in_srgb,var(--ball-accent)_35%,transparent)]'>
							$34.99
						</div>
						<div className='mt-2 text-sm uppercase tracking-[0.3em] text-white/55'>
							Size: 29.5 in - Official
						</div>
					</div>
				</div>

				<div className='order-1 flex flex-col items-center justify-center lg:order-2'>
					<div className='relative flex w-full flex-col items-center justify-center text-center'>
						<div className='font-display text-[clamp(5rem,21vw,14rem)] uppercase text-white/38 hero-word'>
							<div className='relative'><div>SPA</div>LDING</div>

						</div>
					</div>

					{/* Ball name carousel (synced with chevrons + 3D) */}
					<div
						className='mt-4 w-full max-w-md overflow-hidden'
						aria-live='polite'
						aria-label='Selected ball'
					>
						<div
							className='flex transition-transform duration-500 ease-out'
							style={{
								transform: `translateX(-${activeBallIndex * 100}%)`,
							}}
						>
							{ballData.map(entry => (
								<div
									key={entry.name}
									className='w-full shrink-0 font-display text-[clamp(2rem,5vw,3rem)] uppercase text-white/50'
								>
									{entry.name}
								</div>
							))}
						</div>
					</div>

					<div className='mt-8'>
						<AddToCartButton onClick={onAddToCart} disabled={addingToCart} />
					</div>
				</div>

				<div className='order-3 mt-8 flex items-end justify-between lg:mt-0 lg:flex-col'>
					<div className='hidden rotate-180 text-xs uppercase tracking-[0.45em] text-theme-accent-muted [writing-mode:vertical-rl] lg:block'>
						90/10
					</div>

					<div className='ml-auto flex items-center gap-3'>
						<button
							type='button'
							onClick={prevBall}
							className='flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-theme-accent-soft hover:bg-[color:color-mix(in_srgb,var(--ball-accent)_12%,transparent)] hover:text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--ball-accent)_25%,transparent)]'
						>
							<ChevronLeft />
						</button>
						<button
							type='button'
							onClick={nextBall}
							className='flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-theme-accent-soft hover:bg-[color:color-mix(in_srgb,var(--ball-accent)_12%,transparent)] hover:text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--ball-accent)_25%,transparent)]'
						>
							<ChevronRight />
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}