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
			className='relative flex h-[100svh] items-center overflow-hidden px-4 pb-6 sm:px-6 sm:pb-8 lg:px-10 '
		>
			<div className='mx-auto grid h-full w-full max-w-[1600px] grid-cols-1 gap-8 rounded-[2rem] px-4 py-6 backdrop-blur-[2px] sm:px-8 sm:py-8 lg:grid-cols-[200px_minmax(0,1fr)_200px] lg:gap-4 lg:rounded-[2.5rem] lg:px-10'>
				<div className='order-2 flex items-end mt-16 justify-between gap-4 lg:order-1 lg:flex-col lg:items-start lg:justify-between lg:pt-10'>
					<button
						type='button'
						className='hidden items-center gap-4 text-left text-white/75 transition hover:text-white lg:flex'
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

					<div className='max-w-[14rem] pb-1 sm:max-w-none lg:pb-5'>
						<div className='text-[clamp(2.5rem,10vw,5.5rem)] font-medium uppercase leading-none text-theme-accent drop-shadow-[0_0_28px_color-mix(in_srgb,var(--ball-accent)_35%,transparent)]'>
							$34.99
						</div>
						<div className='mt-2 text-[10px] uppercase tracking-[0.24em] text-white/55 sm:text-sm sm:tracking-[0.3em]'>
							Size: 29.5 in - Official
						</div>
					</div>
				</div>

				<div className='order-1 flex min-w-0 flex-col items-center justify-center pt-6 lg:order-2 lg:pt-12'>
					<div className='relative flex w-full max-w-[min(100%,52rem)] flex-col items-center justify-center text-center'>
						<div className='font-display mt-12 text-[clamp(3.75rem,19vw,14rem)] uppercase text-white/32 hero-word sm:text-[clamp(5rem,21vw,14rem)]'>
							<div className='relative'>
								<div>Slam</div>
								<div>Dunk</div>
							</div>
						</div>
					</div>

					<div
						className='mt-3 w-full max-w-[16rem] overflow-hidden text-center sm:mt-2 sm:max-w-md'
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
									className='min-w-full shrink-0 px-2 font-display text-[clamp(.9rem,2.2vw,2.4rem)] uppercase leading-tight text-white/55'
								>
									{entry.name}
								</div>
							))}
						</div>
					</div>

					<div className='mt-4 sm:mt-6'>
						<AddToCartButton onClick={onAddToCart} disabled={addingToCart} />
					</div>
				</div>

				<div className='order-3 flex items-center justify-between gap-4 lg:mt-0 lg:flex-col lg:items-end lg:justify-between'>
					<div className='hidden rotate-180 text-xs uppercase tracking-[0.45em] text-theme-accent-muted [writing-mode:vertical-rl] lg:block'>
						90/10
					</div>

					<div className='ml-auto flex items-center gap-2 sm:gap-3'>
						<button
							type='button'
							onClick={prevBall}
							className='flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-theme-accent-soft hover:bg-[color:color-mix(in_srgb,var(--ball-accent)_12%,transparent)] hover:text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--ball-accent)_25%,transparent)] sm:h-14 sm:w-14'
						>
							<ChevronLeft />
						</button>
						<button
							type='button'
							onClick={nextBall}
							className='flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-theme-accent-soft hover:bg-[color:color-mix(in_srgb,var(--ball-accent)_12%,transparent)] hover:text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--ball-accent)_25%,transparent)] sm:h-14 sm:w-14'
						>
							<ChevronRight />
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}
