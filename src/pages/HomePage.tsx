import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
	ArrowRight,
	Circle,
	Dot,
	Instagram,
	Twitter,
	Youtube,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Ball3D } from '../components/Ball3D'
import { ChampionShowcase } from '../components/ChampionShowcase'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { useScroll } from '../hooks/useScroll'
import type { BallFlightState, FlightPoint, TextureType } from '../types'
import { playCartPop } from '../utils/audio'
import { deriveBallSceneTheme } from '../utils/ballSceneTheme'

gsap.registerPlugin(ScrollTrigger)

// 1. Define types for customization
type Customization = {
	baseColor: string
	lineColor: string
	texture: TextureType
}

type BallCatalogEntry =
	| { name: string; mode: 'custom' }
	| {
		name: string
		mode: 'preset'
		baseColor: string
		lineColor: string
		texture: TextureType
	}

const BALL_CATALOG: BallCatalogEntry[] = [
	{ name: 'Lab Edition', mode: 'custom' },
	{
		name: 'Street Pro',
		mode: 'preset',
		baseColor: '#000000',
		lineColor: '#FFD700',
		texture: 'STREET',
	},
	{
		name: 'Court Elite',
		mode: 'preset',
		baseColor: '#1E90FF',
		lineColor: '#FFFFFF',
		texture: 'CLASSIC',
	},
	{
		name: 'Forest Grip',
		mode: 'preset',
		baseColor: '#00A86B',
		lineColor: '#39FF14',
		texture: 'TECH',
	},
	{
		name: 'Maroon Classic',
		mode: 'preset',
		baseColor: '#FF4DFF',
		lineColor: '#000000',
		texture: 'CROSS',
	},
]

const panels = [
	{
		eyebrow: 'Performance Metrics',
		title: 'Elite Control',
		stats: [
			['100%', 'Microfiber Composite'],
			['0.5mm', 'Pebble Depth'],
		],
		copy: 'Exclusive coating material providing superior grip management in all weather conditions.',
	},
	{
		eyebrow: 'Aerodynamics',
		title: 'Perfect Flight',
		stats: [
			['0.85', 'Drag Coefficient'],
			['28.5', 'Rotational Stability'],
		],
		copy: 'Symmetrically balanced weight distribution ensures true flight path and consistent rotational speed.',
	},
	{
		eyebrow: 'Micro-Texture',
		title: 'High-Tack',
		stats: [
			['1.2mm', 'Pebble Height'],
			['45.2 deg', 'Azimuth'],
		],
		copy: 'Pebbled surface geometry gives fingertip lock-in and clean release feel even under pressure.',
	},
	{
		eyebrow: 'Limited Edition',
		title: 'The Champion',
		stats: [
			['Elite Tier', 'Constructed for the highest level of competition.'],
			['Gold Standard', 'Meets all regulation weight and size requirements.'],
		],
	},
]

const CHAMPION_PANEL = {
	eyebrow: panels[3].eyebrow,
	title: panels[3].title,
	leftLabel: 'Rank 01',
	leftTitle: panels[3].stats[0][0],
	leftCopy: panels[3].stats[0][1],
	rightLabel: 'Certified',
	rightTitle: panels[3].stats[1][0],
	rightCopy: panels[3].stats[1][1],
}

function createArcPoint(
	start: FlightPoint,
	control: FlightPoint,
	end: FlightPoint,
	t: number,
): FlightPoint {
	const inverse = 1 - t
	return {
		x:
			inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
		y:
			inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
	}
}

function FloatingBall({
	point,
	visible,
	progress,
}: {
	point: FlightPoint
	visible: boolean
	progress?: number
}) {
	const t = progress || 0

	const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

	const baseSize = visible ? Math.max(2, 12.5 * (1 - t * 0.9)) : 2
	const size = `${baseSize}rem`

	const opacity = visible ? Math.max(0.25, 1 - t * 0.85) : 0
	let blur = t * 0.1875
	let shadowOffset = t * 2.8125

	return (
		<div
			aria-hidden='true'
			className='pointer-events-none fixed left-0 top-0 z-50'
			style={{
				transform: `translate(${point.x - parseFloat(size) * 8}px, ${point.y - parseFloat(size) * 8}px)`,
				width: `${size}`,
				height: `${size}`,
				opacity,
				filter: `blur(${blur * 16}px)`,
				willChange: 'transform, opacity, filter',
			}}
		>
			<div
				className='relative w-full h-full rounded-full'
				style={{
					background: `radial-gradient(circle at 35% 32%, 
						rgba(255,200,100,0.98) 0%, 
						rgba(255,120,40,0.95) 18%, 
						rgba(220,65,15,0.92) 38%, 
						rgba(150,35,8,0.85) 58%, 
						rgba(70,18,5,0.75) 78%, 
						transparent 100%)`,
					boxShadow: `
						inset 0 0 1.25rem rgba(255,160,60,0.7),
						0 0 1.5rem rgba(255,80,0,0.8),
						0 0 0.75rem rgba(255,120,0,0.6)
					`,
				}}
			>
				<div
					className='absolute inset-[6%] rounded-full border-[3px]'
					style={{
						borderColor: 'color-mix(in srgb, var(--ball-accent, #ff5a00) 55%, transparent)',
					}}
				/>
				<div className='absolute inset-y-[10%] left-1/2 w-[3px] -translate-x-1/2 bg-black/80' />
				<div className='absolute inset-x-[10%] top-1/2 h-[3px] -translate-y-1/2 bg-black/80' />
			</div>

			{[0, 1, 2, 3, 4].map((index) => {
				const delay = index * 0.04
				const shadowProgress = Math.max(
					0,
					Math.min(1, (t - delay) / (1 - delay))
				)

				const isActive = t >= delay

				const baseShadowSize = 320

				const shadowSize = isActive
					? Math.max(
						20,
						baseShadowSize *
						(1 - easeOut(shadowProgress) * 0.85) *
						(1 - index * 0.12)
					)
					: 0

				const offsetX = isActive
					? shadowOffset * (1 - shadowProgress) * (index + 1) * 0.4
					: 0

				const offsetY = isActive
					? shadowOffset * (1 - shadowProgress) * (index + 1) * 0.25
					: 0

				const shadowOpacity = isActive
					? Math.max(0, 0.35 - index * 0.05) * (1 - shadowProgress)
					: 0

				return (
					<div
						key={index}
						className='absolute rounded-full pointer-events-none'
						style={{
							top: '50%',
							left: '50%',
							width: `${shadowSize * 0.0625}rem`,
							height: `${shadowSize * 0.0625}rem`,
							transform: `translate(calc(-50% + ${offsetX * 0.0625}rem), calc(-50% + ${offsetY * 0.0625}rem))`,
							background: `radial-gradient(circle, 
								rgba(0,0,0,${shadowOpacity * 0.6}) 0%, 
								rgba(0,0,0,${shadowOpacity * 0.3}) 40%, 
								transparent 70%)`,
							filter: `blur(${(6 + index * 3) * 0.0625}rem)`,
							willChange: 'transform, width, height, opacity',
						}}
					/>
				)
			})}

			<div
				className='absolute rounded-full pointer-events-none'
				style={{
					top: '50%',
					left: '50%',
					width: `${parseFloat(size) * 1.6 * 16}px`,
					height: `${parseFloat(size) * 1.6 * 16}px`,
					transform: `translate(calc(-50% - ${t * 40}px), calc(-50% - ${t * 25}px))`,
					background: `radial-gradient(circle, 
						rgba(255,100,30,${0.35 * (1 - t)}) 0%, 
						transparent 70%)`,
					filter: `blur(${(10 + t * 12) * 0.0625}rem)`,
					willChange: 'transform, opacity',
				}}
			/>
		</div>
	)
}

function FooterSection() {
	return (
		<section
			data-section
			className='relative flex h-screen items-center px-4 py-4 sm:px-6 lg:px-10'
		>
			<div className='section-scrim mx-auto flex h-full max-h-[100vh] w-full max-w-[1600px] flex-col justify-between overflow-hidden rounded-[2.5rem] px-6 py-8 sm:px-10'>
				<div className='absolute inset-0 overflow-hidden'>
					{Array.from({ length: 9 }).map((_, index) => (
						<div
							key={index}
							className='absolute h-0 w-0 border-l-[24px] border-r-[24px] border-b-[42px] border-l-transparent border-r-transparent border-b-[color:color-mix(in_srgb,var(--ball-accent)_88%,transparent)]'
							style={{
								left: `${8 + ((index * 11) % 84)}%`,
								top: `${5 + ((index * 9) % 72)}%`,
								transform: `rotate(${(index % 5) * 23}deg) scale(${0.6 + (index % 4) * 0.35})`,
								opacity: index % 2 === 0 ? 0.95 : 0.35,
							}}
						/>
					))}
				</div>

				<div className='relative pt-16 text-center' data-reveal data-reveal-dir='top'>
					<div className='border-theme-accent-soft mx-auto inline-flex rounded-full border px-4 py-1 text-xs uppercase tracking-[0.35em] text-theme-accent-muted'>
						Next Level Performance
					</div>
					<div className='mt-10 font-display text-[clamp(4rem,14vw,12rem)] uppercase leading-[0.9]'>
						<div className='text-white/10 text-stroke'>Defy</div>
						<div>Gravity.</div>
					</div>
				</div>

				<div
					className='relative border-t border-white/10 pt-8'
					data-reveal
					data-reveal-dir='bottom'
				>
					<div className='flex flex-col items-center justify-between gap-6 text-sm uppercase tracking-[0.3em] text-white/55 lg:flex-row'>
						<div className='flex items-center gap-4'>
							<Dot className='text-theme-accent' />
							<span>Official Store</span>
							<span className='hidden text-white/20 md:inline'>|</span>
							<span>Global Shipping</span>
						</div>
						<div className='flex items-center gap-8 text-white/75'>
							<Twitter size={18} />
							<Instagram size={18} />
							<Youtube size={18} />
						</div>
						<div>Secure Checkout</div>
					</div>

					<div className='mt-10 flex justify-center'>
						<button
							type='button'
							className='inline-flex items-center gap-3 border border-white/20 bg-white px-8 py-5 text-lg font-bold uppercase tracking-[0.24em] text-black transition hover:bg-[color:var(--ball-accent)] hover:text-white'
						>
							Shop Collection
							<ArrowRight size={18} />
						</button>
					</div>

					<div className='mt-16 text-center text-xs uppercase tracking-[0.28em] text-white/20'>
						(c) 2026 Slam Dunk Store. Engineered For Greatness.
					</div>
				</div>
			</div>
		</section>
	)
}

export function HomePage() {
	const cartRef = useRef<HTMLButtonElement>(null)
	const ballAnchorRef = useRef<HTMLDivElement>(null)
	const pageRef = useRef<HTMLDivElement>(null)
	const [cartCount, setCartCount] = useState(0)
	const [flightProgress, setFlightProgress] = useState(0)
	const [flight, setFlight] = useState<BallFlightState>({
		isAnimatingToCart: false,
		impulse: 0,
	})
	const [flightPoint, setFlightPoint] = useState<FlightPoint>({
		x: -999,
		y: -999,
	})
	const [showFlyingBall, setShowFlyingBall] = useState(false)
	const scrollStage = useScroll(6)
	const ballScreenPointRef = useRef<FlightPoint | null>(null)
	const [ballScreenPosition, setBallScreenPosition] = useState<FlightPoint | null>(null)

	const [activeBallIndex, setActiveBallIndex] = useState(0)
	const [showCustomizePanel, setShowCustomizePanel] = useState(false)
	const [customization, setCustomization] = useState<Customization>({
		baseColor: '#ff5a00',
		lineColor: '#000000',
		texture: 'CLASSIC',
	})

	const resolvedCustomization = useMemo((): Customization => {
		const entry = BALL_CATALOG[activeBallIndex]
		if (!entry || entry.mode === 'custom') return customization
		return {
			baseColor: entry.baseColor,
			lineColor: entry.lineColor,
			texture: entry.texture,
		}
	}, [activeBallIndex, customization])

	const sceneTheme = useMemo(
		() => deriveBallSceneTheme(resolvedCustomization),
		[resolvedCustomization],
	)

	useLayoutEffect(() => {
		const r = document.documentElement
		const t = sceneTheme
		r.style.setProperty('--ball-accent', t.accent)
		r.style.setProperty('--ball-accent-muted', t.accentMuted)
		r.style.setProperty('--ball-bg-deep', t.bgDeep)
		r.style.setProperty('--ball-radial-top', t.radialTop)
		r.style.setProperty('--ball-radial-center', t.radialCenter)
		r.style.setProperty('--ball-radial-floor', t.radialFloor)
		r.style.setProperty('--ball-selection', t.selection)
		r.style.setProperty('--ball-base', resolvedCustomization.baseColor)
		r.style.setProperty('--ball-line', resolvedCustomization.lineColor)
	}, [sceneTheme, resolvedCustomization.baseColor, resolvedCustomization.lineColor])

	useEffect(() => {
		if (!flight.isAnimatingToCart) {
			let frameId: number

			const updateBallPosition = () => {
				if (ballScreenPointRef.current) {
					setBallScreenPosition(ballScreenPointRef.current)
				}
				frameId = requestAnimationFrame(updateBallPosition)
			}

			frameId = requestAnimationFrame(updateBallPosition)

			return () => {
				if (frameId) cancelAnimationFrame(frameId)
			}
		}
	}, [flight.isAnimatingToCart])

	useLayoutEffect(() => {
		if (!pageRef.current) return

		const ctx = gsap.context(() => {
			gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
				const children = Array.from(element.children).filter(
					node => node instanceof HTMLElement,
				) as HTMLElement[]
				const targets = children.length > 0 ? children : [element]
				const direction = element.dataset.revealDir ?? 'bottom'
				const fromVars =
					direction === 'left'
						? { autoAlpha: 0, x: -84, filter: 'blur(7px)' }
						: direction === 'right'
							? { autoAlpha: 0, x: 84, filter: 'blur(7px)' }
							: direction === 'top'
								? { autoAlpha: 0, y: -62, filter: 'blur(7px)' }
								: { autoAlpha: 0, y: 62, filter: 'blur(7px)' }

				gsap.fromTo(
					targets,
					fromVars,
					{
						autoAlpha: 1,
						x: 0,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.72,
						ease: 'power4.out',
						stagger: 0.06,
						scrollTrigger: {
							trigger: element,
							start: 'top 88%',
							end: 'top 58%',
							toggleActions: 'play none none reverse',
						},
					},
				)
			})

			gsap.to('.hero-panel', {
				backgroundPosition: '50% 30%',
				ease: 'none',
				scrollTrigger: {
					trigger: pageRef.current,
					start: 'top top',
					end: 'bottom bottom',
					scrub: true,
				},
			})
		}, pageRef)

		return () => {
			ctx.revert()
		}
	}, [])

	// FIXED: Instant scroll response - no delay, immediate page switching
	useEffect(() => {
		const sections = Array.from(
			document.querySelectorAll<HTMLElement>('[data-section]'),
		)
		if (sections.length === 0) return

		let isScrolling = false
		let animationFrameId: number | null = null
		let targetSectionIndex = 0

		const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
		const duration = 320 // ms

		const scrollToSection = (index: number) => {
			const clampedIndex = Math.max(0, Math.min(sections.length - 1, index))

			if (isScrolling) return
			if (clampedIndex === currentSectionIndex()) return

			isScrolling = true
			targetSectionIndex = clampedIndex

			const startY = window.scrollY
			const targetY = sections[clampedIndex].offsetTop
			const distance = targetY - startY
			const startTime = performance.now()

			const animateScroll = (currentTime: number) => {
				const elapsed = currentTime - startTime
				const progress = Math.min(1, elapsed / duration)
				const eased = easeOutCubic(progress)

				window.scrollTo(0, startY + distance * eased)

				if (progress < 1) {
					animationFrameId = requestAnimationFrame(animateScroll)
				} else {
					// Animation complete
					if (animationFrameId) cancelAnimationFrame(animationFrameId)
					animationFrameId = null

					// Small delay before allowing next scroll to prevent rapid-fire
					setTimeout(() => {
						isScrolling = false
					}, 40)
				}
			}

			if (animationFrameId) cancelAnimationFrame(animationFrameId)
			animationFrameId = requestAnimationFrame(animateScroll)
		}

		const currentSectionIndex = () => {
			const scrollPosition = window.scrollY + window.innerHeight * 0.3
			let closestIndex = 0
			let closestDistance = Infinity

			sections.forEach((section, idx) => {
				const sectionTop = section.offsetTop
				const sectionBottom = sectionTop + section.offsetHeight
				const distance = Math.min(
					Math.abs(scrollPosition - sectionTop),
					Math.abs(scrollPosition - sectionBottom)
				)

				if (distance < closestDistance) {
					closestDistance = distance
					closestIndex = idx
				}
			})

			return closestIndex
		}

		let lastScrollTime = 0
		const SCROLL_COOLDOWN = 80 // мс между скроллами

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault()

			// Защита от слишком частых скроллов
			const now = Date.now()
			if (isScrolling || now - lastScrollTime < SCROLL_COOLDOWN) return

			const direction = e.deltaY > 0 ? 1 : -1
			const currentIdx = currentSectionIndex()
			const nextIdx = currentIdx + direction

			lastScrollTime = now
			scrollToSection(nextIdx)
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.repeat) return
			if (isScrolling) return

			if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
				e.preventDefault()
				scrollToSection(currentSectionIndex() + 1)
			}

			if (e.key === 'ArrowUp' || e.key === 'PageUp') {
				e.preventDefault()
				scrollToSection(currentSectionIndex() - 1)
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('wheel', handleWheel)
			window.removeEventListener('keydown', handleKeyDown)
			if (animationFrameId) cancelAnimationFrame(animationFrameId)
		}
	}, [])

	useEffect(() => {
		if (flight.impulse <= 0) return

		const timeout = window.setTimeout(() => {
			setFlight(current => ({ ...current, impulse: 0 }))
		}, 380)

		return () => window.clearTimeout(timeout)
	}, [flight.impulse])

	const handleAddToCart = () => {
		if (!cartRef.current || flight.isAnimatingToCart) return

		const start = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		}

		const endRect = cartRef.current.getBoundingClientRect()
		const end = {
			x: endRect.left + endRect.width / 2,
			y: endRect.top + endRect.height / 2,
		}

		const control = {
			x: start.x + (end.x - start.x) * 0.5,
			y: Math.min(start.y, end.y) - 220,
		}

		setFlight({ isAnimatingToCart: true, impulse: 1 })
		setShowFlyingBall(true)
		setFlightPoint(start)

		const proxy = { t: 0 }

		gsap.to(proxy, {
			t: 1,
			duration: 0.9,
			ease: 'power3.inOut',
			onUpdate: () => {
				const currentPoint = createArcPoint(start, control, end, proxy.t)
				setFlightPoint(currentPoint)
				setFlightProgress(proxy.t)
			},
			onComplete: () => {
				setShowFlyingBall(false)
				setFlightProgress(0)
				setCartCount(c => c + 1)
				setFlight({ isAnimatingToCart: false, impulse: 0.35 })
				playCartPop()

				gsap.fromTo(
					cartRef.current,
					{ scale: 1 },
					{
						scale: 1.25,
						duration: 0.2,
						yoyo: true,
						repeat: 1,
						ease: 'back.out(2)',
					},
				)
			},
		})
	}

	return (
		<div
			ref={pageRef}
			className='relative overflow-x-hidden bg-transparent text-white transition-colors duration-700'
		>
			<div className='noise' />
			<Header
				cartCount={cartCount}
				cartRef={cartRef}
				onCustomizeClick={() => {
					setActiveBallIndex(0)
					setShowCustomizePanel(true)
				}}
			/>
			<FloatingBall
				point={flightPoint}
				visible={showFlyingBall}
				progress={flightProgress}
			/>

			<aside
				className={`fixed left-10 top-1/2 z-50 max-h-[min(90vh,40rem)] w-80 -translate-y-1/2 space-y-8 overflow-y-auto rounded-xl border border-[color:color-mix(in_srgb,var(--ball-accent)_38%,transparent)] bg-black/20 p-6 backdrop-blur-md ${showCustomizePanel ? 'flex flex-col' : 'hidden'}`}
				aria-hidden={!showCustomizePanel}
			>
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
							Design your legacy
						</p>
						<p className="mt-1 text-sm text-white/60">Tune colors and grip for the Lab ball.</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCustomizePanel(false)}
						className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70 transition hover:border-white/35 hover:text-white"
					>
						Close
					</button>
				</div>
				<div>
					<label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Base Color</label>
					<div className="mt-3 flex gap-2 flex-wrap">
						{['#ff5a00', '#004d3d', '#0070ad', '#7A172C', '#e879f9', '#1a1a1a', '#ffffff'].map(color => (
							<button
								key={color}
								onClick={() => setCustomization(prev => ({ ...prev, baseColor: color }))}
								className={`h-8 w-8 rounded-full border-2 transition-all ${customization.baseColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
								style={{ backgroundColor: color }}
								aria-label={`Select base color ${color}`}
							/>
						))}
					</div>
				</div>

				<div>
					<label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Line Color</label>
					<div className="mt-3 flex gap-2 flex-wrap">
						{['#1a1a1a', '#ffffff', '#ffb800', '#a0ff9e', '#00e0ff'].map(color => (
							<button
								key={color}
								onClick={() => setCustomization(prev => ({ ...prev, lineColor: color }))}
								className={`h-8 w-8 rounded-full border-2 transition-all ${customization.lineColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
								style={{ backgroundColor: color }}
								aria-label={`Select line color ${color}`}
							/>
						))}
					</div>
				</div>

				<div>
					<label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Grip Texture</label>
					<div className="mt-3 grid grid-cols-2 gap-2">
						{['CLASSIC', 'STREET', 'TECH', 'CROSS'].map(t => (
							<button
								key={t}
								onClick={() =>
									setCustomization(prev => ({
										...prev,
										texture: t as TextureType,
									}))
								}
								className={`py-2 text-[10px] font-bold border transition-all ${customization.texture === t ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`}
							>
								{t}
							</button>
						))}
					</div>
				</div>
			</aside>

			<div className='pointer-events-none fixed inset-0 z-20'>
				<Canvas
					style={{ pointerEvents: 'none' }}
					dpr={[1, 1.6]}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
					}}
					camera={{ position: [0, 0, 6], fov: 28 }}
				>
					<Ball3D
						scrollStage={scrollStage}
						flight={flight}
						customization={resolvedCustomization}
						lighting={{
							keyLight: sceneTheme.keyLight,
							fillLight: sceneTheme.fillLight,
							ambient: sceneTheme.ambient,
						}}
						onBallScreenPoint={(point: FlightPoint) => {
							ballScreenPointRef.current = point
							setBallScreenPosition(point)
						}}
					/>
				</Canvas>
			</div>

			<main className='relative z-10 overflow-hidden'>
				<div
					className='hero-panel bg-[length:100%_100%] transition-[background] duration-700 ease-out'
					style={{ backgroundImage: sceneTheme.heroPanelGradient }}
				>
					<Hero
						onAddToCart={handleAddToCart}
						addingToCart={flight.isAnimatingToCart}
						ballAnchorRef={ballAnchorRef}
						activeBallIndex={activeBallIndex}
						setActiveBallIndex={setActiveBallIndex}
						ballData={BALL_CATALOG.map(b => ({ name: b.name }))}
					/>
				</div>

				<section
					id='section-2'
					data-section
					className='relative flex h-screen items-center px-4 py-4 sm:px-6 lg:px-10'
				>
					<div className='section-scrim mx-auto grid h-full max-h-[100vh] w-full max-w-[1600px] overflow-hidden rounded-2xl px-6 py-12 lg:grid-cols-[420px_1fr] lg:px-10'>
						<div className='space-y-12' data-reveal data-reveal-dir='left'>
							<div>
								<div className='mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-theme-accent'>
									<Circle size={8} fill='currentColor' />
									{panels[0].eyebrow}
								</div>
								<h2 className='font-display text-[clamp(4rem,9vw,8rem)] uppercase leading-[0.88]'>
									{panels[0].title}
								</h2>
							</div>
							{panels[0].stats.map(([value, label], index) => (
								<div key={value} className='border-l border-white/15 pl-6'>
									<div className='text-6xl font-bold leading-none'>{value}</div>
									<div className='mt-2 text-xl uppercase tracking-[0.18em] text-white/55'>
										{label}
									</div>
									{index === 0 ? (
										<p className='mt-4 max-w-xs text-lg leading-relaxed text-white/48'>
											{panels[0].copy}
										</p>
									) : null}
								</div>
							))}
						</div>
						<div className='hidden bg-grid bg-[size:180px_180px] opacity-40 lg:block' />
					</div>
				</section>

				<section
					id='section-3'
					data-section
					className='relative flex h-screen items-center px-4 py-4 sm:px-6 lg:px-10'
				>
					<div className='panel-line section-scrim mx-auto h-full max-h-[100vh] w-full max-w-[1600px] overflow-hidden rounded-2xl px-6 py-12 sm:px-10'>
						<div className='grid gap-10 lg:grid-cols-[1fr_500px]'>
							<div />
							<div className='space-y-12 text-right' data-reveal data-reveal-dir='right'>
								<div className='ml-auto inline-flex rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/75'>
									{panels[1].eyebrow}
								</div>
								<h2 className='font-display text-[clamp(4rem,9vw,8rem)] uppercase leading-[0.88]'>
									{panels[1].title}
								</h2>
								{panels[1].stats.map(([value, label]) => (
									<div key={value} className='ml-auto max-w-sm'>
										<div className='text-5xl font-bold'>{value}</div>
										<div className='text-sm uppercase tracking-[0.3em] text-white/55'>
											{label}
										</div>
									</div>
								))}
								<p className='ml-auto max-w-lg text-lg leading-relaxed text-white/50'>
									{panels[1].copy}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section
					id='section-4'
					data-section
					className='relative flex h-screen items-center px-4 py-4 sm:px-6 lg:px-10'
				>
					<div className='section-scrim mx-auto h-full max-h-[100vh] w-full max-w-[1600px] overflow-hidden rounded-2xl px-6 py-10 sm:px-10'>
						<div className='grid h-full items-center gap-8 lg:grid-cols-[300px_1fr_320px]'>
							<div className='space-y-8' data-reveal data-reveal-dir='left'>
								<div className='border-l border-white/20 pl-6'>
									<div className='text-6xl font-bold'>1.2mm</div>
									<div className='text-2xl uppercase tracking-[0.18em] text-white/55'>
										Pebble Height
									</div>
								</div>
								<div className='text-xs uppercase tracking-[0.3em] text-white/38'>
									Elevation: 12.8 deg
								</div>
							</div>

							<div className='relative flex h-[35rem] items-center justify-center'>
								<div className='absolute h-[32.5rem] w-[32.5rem] rounded-full border border-white/12' />
								<div className='absolute h-[25rem] w-[25rem] rounded-full border border-white/18' />
								<div className='absolute h-[16.9rem] w-[16.9rem] rounded-full border-2 border-white/22' />
								<div className='absolute h-full w-px bg-white/25' />
								<div className='absolute w-full border-t border-white/25' />
								{Array.from({ length: 8 }).map((_, index) => (
									<span
										key={index}
										className='bg-theme-tick absolute h-2 w-[3px] rounded-full'
										style={{
											transform: `rotate(${index * 45}deg) translateY(-14.375rem)`,
										}}
									/>
								))}
							</div>

							<div className='space-y-8 text-right' data-reveal data-reveal-dir='right'>
								<div className='text-xs uppercase tracking-[0.35em] text-white/38'>
									Azimuth: 45.2 deg
								</div>
								<div>
									<h2 className='text-[clamp(2.6rem,6vw,4.3rem)] font-bold leading-none'>
										High-Tack
									</h2>
									<div className='text-xl uppercase tracking-[0.25em] text-white/50'>
										Coating Spec
									</div>
								</div>
								<div className='text-xs uppercase tracking-[0.3em] text-white/38'>
									Channel Depth
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id='section-5'
					data-section
					className='relative flex h-screen items-center px-3 py-6 sm:px-6 lg:px-10'
				>
					<div className='mx-auto w-full max-w-[1600px] px-2 py-6 sm:px-4 sm:py-8'>
						<ChampionShowcase panel={CHAMPION_PANEL} />
					</div>
				</section>

				<FooterSection />
			</main>
		</div>
	)
}