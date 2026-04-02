import { useState } from 'react'

type ChampionPanel = {
	eyebrow: string
	title: string
	leftLabel: string
	leftTitle: string
	leftCopy: string
	rightLabel: string
	rightTitle: string
	rightCopy: string
}

type ChampionShowcaseProps = {
	panel: ChampionPanel
}

/** PNG в `public/podium.png` (фото постамента); при ошибке — `public/podium.svg`. */
const PODIUM_PNG = '/podium.png'
const PODIUM_SVG = '/podium.svg'

/**
 * Limited Edition / The Champion — CSS-сфера + фото-постамент снизу.
 */
export function ChampionShowcase({ panel }: ChampionShowcaseProps) {
	return (
		<div
			className='relative mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-[1.75rem] border border-[color:color-mix(in_srgb,var(--ball-accent)_42%,transparent)] bg-black/25 backdrop-blur-xl sm:rounded-[2.25rem]'
			data-reveal
			data-reveal-dir='bottom'
		>
			<div
				className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,color-mix(in_srgb,var(--ball-accent)_14%,transparent),transparent_58%)]'
				aria-hidden
			/>
			<div
				className='pointer-events-none absolute inset-0 opacity-40'
				style={{
					boxShadow: 'inset 0 0 120px color-mix(in srgb, var(--ball-accent) 25%, transparent)',
				}}
				aria-hidden
			/>

			<div className='relative flex h-full flex-col justify-center px-4 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-10 md:px-12 md:pb-14 md:pt-12'>
				<div className='text-center' data-reveal data-reveal-dir='top'>
					<p className='text-[10px] uppercase tracking-[0.55em] text-white/55 sm:text-xs sm:tracking-[0.5em]'>
						{panel.eyebrow}
					</p>
					<h2 className='mt-3 font-display text-[clamp(2.6rem,9vw,6.5rem)] uppercase leading-[0.92] tracking-wide text-white'>
						{panel.title}
					</h2>
				</div>

				<div className='mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-[1fr_minmax(260px,400px)_1fr] lg:gap-6'>
					<div className='order-2 space-y-4 text-center lg:order-1 lg:max-w-sm lg:justify-self-end lg:text-left' data-reveal data-reveal-dir='left'>
						<p className='font-mono text-[11px] uppercase tracking-[0.38em] text-[color:var(--ball-accent)] sm:text-sm sm:tracking-[0.32em]'>
							{panel.leftLabel}
						</p>
						<p className='text-3xl font-bold leading-tight text-white sm:text-4xl'>
							{panel.leftTitle}
						</p>
						<p className='mx-auto max-w-sm text-sm leading-relaxed text-white/48 sm:text-base lg:mx-0'>
							{panel.leftCopy}
						</p>
					</div>

					<div
						className='order-1 relative flex min-h-[240px] flex-col items-center justify-end sm:min-h-[320px] lg:order-2 lg:min-h-[380px]'
						data-reveal
						data-reveal-dir='bottom'
					>
						<ChampionSpherePedestal />
					</div>

					<div className='order-3 space-y-4 text-center lg:max-w-sm lg:text-right' data-reveal data-reveal-dir='right'>
						<p className='font-mono text-[11px] uppercase tracking-[0.38em] text-[color:var(--ball-accent)] sm:text-sm sm:tracking-[0.32em]'>
							{panel.rightLabel}
						</p>
						<p className='text-3xl font-bold leading-tight text-white sm:text-4xl lg:ml-auto'>
							{panel.rightTitle}
						</p>
						<p className='mx-auto max-w-sm text-sm leading-relaxed text-white/48 sm:text-base lg:ml-auto'>
							{panel.rightCopy}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

function ChampionSpherePedestal() {
	const [src, setSrc] = useState(PODIUM_PNG)
	const isSvg = src.endsWith('.svg')

	return (
		<div className='relative mx-auto flex w-full max-w-[min(100%,440px)] flex-col items-center justify-end'>
			{/* Сфера — над постаментом */}
			<div
				className='relative z-20 -mb-[min(12vw,38px)] aspect-square w-[min(40vw,150px)] rounded-full sm:-mb-12 sm:w-[min(42vw,200px)] lg:-mb-16 lg:w-[min(48vw,240px)]'
				style={{
					background: `
						radial-gradient(circle at 32% 28%,
							color-mix(in srgb, var(--ball-base) 75%, white) 0%,
							var(--ball-base) 42%,
							color-mix(in srgb, var(--ball-base) 35%, black) 100%)`,
					boxShadow: `
						inset 0 -20px 50px rgba(0,0,0,0.55),
						inset 0 0 30px color-mix(in srgb, var(--ball-base) 40%, transparent),
						0 0 50px color-mix(in srgb, var(--ball-base) 38%, transparent),
						0 28px 50px rgba(0,0,0,0.7)`,
				}}
			>
				<div
					className='absolute inset-[7%] rounded-full border border-white/10 opacity-50'
					aria-hidden
				/>
				<div
					className='absolute inset-y-[10%] left-1/2 w-[2px] -translate-x-1/2 sm:w-[3px]'
					style={{
						background: 'var(--ball-line)',
						boxShadow:
							'0 0 14px var(--ball-line), 0 0 28px color-mix(in srgb, var(--ball-line) 60%, transparent)',
					}}
				/>
				<div
					className='absolute inset-x-[10%] top-1/2 h-[2px] -translate-y-1/2 sm:h-[3px]'
					style={{
						background: 'var(--ball-line)',
						boxShadow:
							'0 0 14px var(--ball-line), 0 0 28px color-mix(in srgb, var(--ball-line) 60%, transparent)',
					}}
				/>
			</div>

			{/* Фото постамента: белый фон убираем через multiply; подсветка снизу */}
			<div className='relative z-10 w-full max-w-[320px] px-2 sm:max-w-[360px]'>
				<div className='pointer-events-none absolute -bottom-3 left-1/2 h-12 w-[88%] -translate-x-1/2 rounded-full bg-black/50 blur-xl sm:-bottom-4 sm:h-16 sm:blur-2xl' aria-hidden />
				<img
					src={src}
					alt=''
					width={400}
					height={320}
					draggable={false}
					onError={() => {
						if (src !== PODIUM_SVG) setSrc(PODIUM_SVG)
					}}
					className={
						isSvg
							? 'relative mx-auto w-full max-w-[min(92vw,360px)] object-contain object-bottom opacity-[0.96]'
							: 'relative mx-auto w-full max-w-[min(92vw,360px)] object-contain object-bottom [mix-blend-mode:multiply]'
					}
				/>
			</div>
		</div>
	)
}
