import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
	ArrowRight,
	Circle,
	Dot,
	Github,
	Instagram,
	Linkedin,
	Send,
	Twitter,
	Youtube,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Ball3D, BallPreview3D } from '../components/Ball3D'
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
	| {
		name: string
		mode: 'custom'
		baseColor: string
		lineColor: string
		texture: TextureType
	}
	| {
		name: string
		mode: 'preset'
		baseColor: string
		lineColor: string
		texture: TextureType
	}

const BALL_CATALOG: BallCatalogEntry[] = [
	{
		name: 'Lab Edition',
		mode: 'custom',
		baseColor: '#ff5a00',
		lineColor: '#000000',
		texture: 'CLASSIC',
	},
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

const CONTACT_LINKS = [
	{
		label: 'Telegram',
		href: 'https://t.me/',
		icon: Send,
	},
	{
		label: 'GitHub',
		href: 'https://github.com/',
		icon: Github,
	},
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/',
		icon: Linkedin,
	},
]

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
	const viewportWidth =
		typeof window === 'undefined' ? 1440 : window.innerWidth
	const sizeMultiplier =
		viewportWidth < 640 ? 0.56 : viewportWidth < 1024 ? 0.76 : 1

	const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

	const baseSize = visible
		? Math.max(1.6, 12.5 * sizeMultiplier * (1 - t * 0.9))
		: 1.6
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
					className='absolute inset-[6%] rounded-full border-[2px] sm:border-[3px]'
					style={{
						borderColor: 'color-mix(in srgb, var(--ball-accent, #ff5a00) 55%, transparent)',
					}}
				/>
				<div className='absolute inset-y-[10%] left-1/2 w-[2px] -translate-x-1/2 bg-black/80 sm:w-[3px]' />
				<div className='absolute inset-x-[10%] top-1/2 h-[2px] -translate-y-1/2 bg-black/80 sm:h-[3px]' />
			</div>

			{[0, 1, 2, 3, 4].map((index) => {
				const delay = index * 0.04
				const shadowProgress = Math.max(
					0,
					Math.min(1, (t - delay) / (1 - delay))
				)

				const isActive = t >= delay

				const baseShadowSize = 320 * sizeMultiplier

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
			id='section-6'
			data-section
			className='relative flex h-[100svh] items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10'
		>
			<div className='section-scrim mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 lg:rounded-[2.5rem] lg:px-10'>
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

				<div className='relative pt-10 text-center sm:pt-16' data-reveal data-reveal-dir='top'>
					<div className='border-theme-accent-soft mx-auto inline-flex rounded-full border px-4 py-1 text-xs uppercase tracking-[0.35em] text-theme-accent-muted'>
						Next Level Performance
					</div>
					<div className='mt-8 font-display text-[clamp(2.8rem,14vw,12rem)] uppercase leading-[0.9] sm:mt-10'>
						<div className='text-white/10 text-stroke'>Defy</div>
						<div>Gravity.</div>
					</div>
				</div>

				<div className='relative mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3'>
					{CONTACT_LINKS.map(({ label, href, icon: Icon }) => (
						<a
							key={label}
							href={href}
							target='_blank'
							rel='noreferrer'
							className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-theme-accent-soft hover:bg-white/[0.05]'
						>
							<div>
								<div className='text-[10px] uppercase tracking-[0.28em] text-white/40'>Contact</div>
								<div className='mt-2 text-lg font-semibold text-white'>{label}</div>
							</div>
							<Icon className='text-theme-accent' size={20} />
						</a>
					))}
				</div>

				<div
					className='relative border-t border-white/10 pt-8'
					data-reveal
					data-reveal-dir='bottom'
				>
					<div className='flex flex-col items-center justify-between gap-5 text-[11px] uppercase tracking-[0.24em] text-white/55 sm:text-sm sm:tracking-[0.3em] lg:flex-row'>
						<div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
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

					<div className='mt-8 flex justify-center sm:mt-10'>
						<button
							type='button'
							className='inline-flex items-center gap-3 border border-white/20 bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[color:var(--ball-accent)] hover:text-white sm:px-8 sm:py-5 sm:text-lg sm:tracking-[0.24em]'
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

	const [ballCatalog, setBallCatalog] = useState<BallCatalogEntry[]>(BALL_CATALOG)
	const [activeBallIndex, setActiveBallIndex] = useState(0)
	const [showCustomizePanel, setShowCustomizePanel] = useState(false)
	const [draftBallName, setDraftBallName] = useState('Lab Edition')
	const [draftCustomization, setDraftCustomization] = useState<Customization>({
		baseColor: '#ff5a00',
		lineColor: '#000000',
		texture: 'CLASSIC',
	})

	const resolvedCustomization = useMemo((): Customization => {
		if (showCustomizePanel) return draftCustomization
		const entry = ballCatalog[activeBallIndex]
		if (!entry) return BALL_CATALOG[0]
		return {
			baseColor: entry.baseColor,
			lineColor: entry.lineColor,
			texture: entry.texture,
		}
	}, [activeBallIndex, ballCatalog, draftCustomization, showCustomizePanel])

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

	useEffect(() => {
		const sections = Array.from(
			document.querySelectorAll<HTMLElement>('[data-section]')
		)

		if (!sections.length) return

		let isScrolling = false
		let lastGestureDirection = 0
		let resetGestureTimer: number | undefined
		let unlockTimer: number | undefined
		let targetScrollY: number | null = null

		const getSectionIndex = () => {
			const scrollY = window.scrollY
			let currentIndex = 0

			sections.forEach((section, index) => {
				if (scrollY >= section.offsetTop - window.innerHeight * 0.35) {
					currentIndex = index
				}
			})

			return currentIndex
		}

		const scrollToSection = (index: number) => {
			if (isScrolling) return

			const clampedIndex = Math.max(0, Math.min(sections.length - 1, index))
			const targetSection = sections[clampedIndex]

			if (!targetSection) return

			isScrolling = true
			targetScrollY = targetSection.offsetTop

			window.scrollTo({
				top: targetScrollY,
				behavior: 'smooth',
			})

			if (unlockTimer) {
				window.clearTimeout(unlockTimer)
			}

			// unlock через время
			unlockTimer = window.setTimeout(() => {
				if (targetScrollY !== null) {
					window.scrollTo({
						top: targetScrollY,
						behavior: 'auto',
					})
				}

				isScrolling = false
				targetScrollY = null
			}, 1100)
		}

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault()

			if (isScrolling) return
			if (Math.abs(e.deltaY) < 12) return

			const direction = e.deltaY > 0 ? 1 : -1
			if (direction === lastGestureDirection) return

			lastGestureDirection = direction
			if (resetGestureTimer) {
				window.clearTimeout(resetGestureTimer)
			}

			resetGestureTimer = window.setTimeout(() => {
				lastGestureDirection = 0
			}, 900)

			scrollToSection(getSectionIndex() + direction)
		}

		const handleScroll = () => {
			if (!isScrolling || targetScrollY === null) return

			if (Math.abs(window.scrollY - targetScrollY) <= 4) {
				window.scrollTo({
					top: targetScrollY,
					behavior: 'auto',
				})

				isScrolling = false
				targetScrollY = null

				if (unlockTimer) {
					window.clearTimeout(unlockTimer)
					unlockTimer = undefined
				}
			}
		}

		const handleKey = (e: KeyboardEvent) => {
			if (isScrolling) return

			if (e.key === 'ArrowDown') {
				e.preventDefault()
				scrollToSection(getSectionIndex() + 1)
			}

			if (e.key === 'ArrowUp') {
				e.preventDefault()
				scrollToSection(getSectionIndex() - 1)
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('keydown', handleKey)

		return () => {
			window.removeEventListener('wheel', handleWheel)
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('keydown', handleKey)
			if (resetGestureTimer) {
				window.clearTimeout(resetGestureTimer)
			}
			if (unlockTimer) {
				window.clearTimeout(unlockTimer)
			}
		}
	}, [])
	useEffect(() => {
		if (flight.impulse <= 0) return

		const timeout = window.setTimeout(() => {
			setFlight(current => ({ ...current, impulse: 0 }))
		}, 380)

		return () => window.clearTimeout(timeout)
	}, [flight.impulse])

	const openCustomizePanel = () => {
		const currentBall = ballCatalog[activeBallIndex]
		if (!currentBall) return

		setDraftBallName(currentBall.name)
		setDraftCustomization({
			baseColor: currentBall.baseColor,
			lineColor: currentBall.lineColor,
			texture: currentBall.texture,
		})
		setShowCustomizePanel(true)
	}

	const handleAddNewBall = () => {
		const trimmedName = draftBallName.trim()
		const nextBall: BallCatalogEntry = {
			name: trimmedName || `Custom Ball ${ballCatalog.length + 1}`,
			mode: 'custom',
			baseColor: draftCustomization.baseColor,
			lineColor: draftCustomization.lineColor,
			texture: draftCustomization.texture,
		}

		setBallCatalog(current => {
			const nextCatalog = [...current, nextBall]
			setActiveBallIndex(nextCatalog.length - 1)
			return nextCatalog
		})
		setShowCustomizePanel(false)
	}

	const previewTextureOverlay = useMemo(() => {
		if (draftCustomization.texture === 'STREET') {
			return {
				background:
					'repeating-linear-gradient(135deg, rgba(0,0,0,0.18) 0 12px, rgba(255,255,255,0.04) 12px 22px), radial-gradient(circle at 30% 28%, rgba(255,255,255,0.12), transparent 24%)',
			}
		}

		if (draftCustomization.texture === 'TECH') {
			return {
				background:
					'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 14px), repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 4px, transparent 4px 18px)',
			}
		}

		if (draftCustomization.texture === 'CROSS') {
			return {
				background:
					'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0 5px, transparent 5px 18px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.2) 0 6px, transparent 6px 18px)',
			}
		}

		return {
			background:
				'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.12), transparent 24%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0 2px, transparent 2px 11px)',
		}
	}, [draftCustomization.texture])

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
				onCustomizeClick={openCustomizePanel}
			/>
			<FloatingBall
				point={flightPoint}
				visible={showFlyingBall}
				progress={flightProgress}
			/>

			{showCustomizePanel ? (
				<div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-md sm:px-6'>
					<div className='relative flex h-full max-h-[min(92svh,52rem)] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[color:color-mix(in_srgb,var(--ball-accent)_45%,transparent)] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--ball-accent)_12%,transparent),transparent_42%),rgba(10,10,10,0.96)]'>
						<div className='grid h-full w-full gap-0 lg:grid-cols-[minmax(0,1.15fr)_26rem]'>
							<div className='flex min-h-[16rem] flex-col gap-6 overflow-y-auto border-b border-white/10 p-5 sm:p-8 lg:border-b-0 lg:border-r'>
								<div>
									<p className='text-[10px] uppercase tracking-[0.36em] text-theme-accent-muted'>
										Ball Lab
									</p>
									<h2 className='mt-3 font-display text-[clamp(1.9rem,5vw,4rem)] uppercase leading-[0.92] text-white'>
										Customize
									</h2>
									<p className='mt-2 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base'>
										Create a new ball, tune its finish, then add it to the main ball list.
									</p>
								</div>
								<div className='flex flex-col'>
									<div className='relative flex  py-[15px] min-h-[15rem] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)] sm:min-h-[18rem]'>
										<div className='pointer-events-none  absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_34%)]' />
										<div className='pointer-events-none absolute bottom-6 h-8 w-[52%] rounded-full bg-black/50 blur-xl sm:h-10' />
										<Canvas
											dpr={[1, 1.6]}
											camera={{ position: [0, 0, 4.2], fov: 32 }}
										>
											<BallPreview3D
												customization={draftCustomization}
												lighting={{
													keyLight: sceneTheme.keyLight,
													fillLight: sceneTheme.fillLight,
													ambient: Math.max(sceneTheme.ambient, 0.16),
												}}
											/>
										</Canvas>
										<div
											className='pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(46vw,16rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 mix-blend-soft-light sm:w-[min(40vw,18rem)]'
											style={{ background: previewTextureOverlay.background }}
										/>
										<div
											className='pointer-events-none absolute left-1/2 top-[75%] w-[min(34vw,11rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-center backdrop-blur-sm sm:w-[min(30vw,12rem)]'
										>
											<div className='font-display text-[clamp(0.7rem,1.4vw,1rem)] uppercase tracking-[0.16em] text-white/90'>
												{draftBallName || 'New Ball'}
											</div>
										</div>
									</div>
								</div>
								<div className='rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6'>
									<p className='text-[10px] uppercase tracking-[0.3em] text-white/40'>
										Preview Stats
									</p>
									<div className='mt-4 grid gap-4 sm:grid-cols-3'>
										<div>
											<div className='text-[10px] uppercase tracking-[0.25em] text-white/35'>Base</div>
											<div className='mt-2 flex items-center gap-3'>
												<span className='h-5 w-5 rounded-full border border-white/20' style={{ backgroundColor: draftCustomization.baseColor }} />
												<span className='text-sm text-white/80'>{draftCustomization.baseColor}</span>
											</div>
										</div>
										<div>
											<div className='text-[10px] uppercase tracking-[0.25em] text-white/35'>Lines</div>
											<div className='mt-2 flex items-center gap-3'>
												<span className='h-5 w-5 rounded-full border border-white/20' style={{ backgroundColor: draftCustomization.lineColor }} />
												<span className='text-sm text-white/80'>{draftCustomization.lineColor}</span>
											</div>
										</div>
										<div>
											<div className='text-[10px] uppercase tracking-[0.25em] text-white/35'>Texture</div>
											<div className='mt-2 text-sm text-white/80'>{draftCustomization.texture}</div>
										</div>
									</div>
								</div>
							</div>

							<div className='flex h-full flex-col gap-6 overflow-y-auto p-5 sm:p-8'>
								<div className='flex items-start justify-between gap-3'>
									<div>
										<p className='text-[10px] uppercase tracking-[0.28em] text-white/45'>
											Design your legacy
										</p>
										<p className='mt-1 text-xs text-white/60 sm:text-sm'>
											Build a custom ball and push it into the carousel.
										</p>
									</div>
									<button
										type='button'
										onClick={() => setShowCustomizePanel(false)}
										className='shrink-0 rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70 transition hover:border-white/35 hover:text-white'
									>
										Back
									</button>
								</div>

								<div>
									<label className='text-[10px] uppercase tracking-[0.2em] text-white/40'>
										Ball Name
									</label>
									<input
										type='text'
										value={draftBallName}
										onChange={event => setDraftBallName(event.target.value)}
										placeholder='My Signature Ball'
										className='mt-3 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/35'
									/>
								</div>

								<div>
									<label className='text-[10px] uppercase tracking-[0.2em] text-white/40'>Base Color</label>
									<div className='mt-3 flex flex-wrap gap-2'>
										{['#ff5a00', '#004d3d', '#0070ad', '#7A172C', '#e879f9', '#1a1a1a', '#ffffff'].map(color => (
											<button
												key={color}
												onClick={() => setDraftCustomization(prev => ({ ...prev, baseColor: color }))}
												className={`h-9 w-9 rounded-full border-2 transition-all ${draftCustomization.baseColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
												style={{ backgroundColor: color }}
												aria-label={`Select base color ${color}`}
											/>
										))}
									</div>
								</div>

								<div>
									<label className='text-[10px] uppercase tracking-[0.2em] text-white/40'>Line Color</label>
									<div className='mt-3 flex flex-wrap gap-2'>
										{['#1a1a1a', '#ffffff', '#ffb800', '#a0ff9e', '#00e0ff'].map(color => (
											<button
												key={color}
												onClick={() => setDraftCustomization(prev => ({ ...prev, lineColor: color }))}
												className={`h-9 w-9 rounded-full border-2 transition-all ${draftCustomization.lineColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
												style={{ backgroundColor: color }}
												aria-label={`Select line color ${color}`}
											/>
										))}
									</div>
								</div>

								<div>
									<label className='text-[10px] uppercase tracking-[0.2em] text-white/40'>Grip Texture</label>
									<div className='mt-3 grid grid-cols-2 gap-3'>
										{['CLASSIC', 'STREET', 'TECH', 'CROSS'].map(t => (
											<button
												key={t}
												onClick={() =>
													setDraftCustomization(prev => ({
														...prev,
														texture: t as TextureType,
													}))
												}
												className={`border py-3 text-[10px] font-bold tracking-[0.24em] transition-all ${draftCustomization.texture === t ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`}
											>
												{t}
											</button>
										))}
									</div>
								</div>

								<div className='mt-auto flex flex-col gap-3 pt-4 sm:flex-row'>
									<button
										type='button'
										onClick={() => setShowCustomizePanel(false)}
										className='flex-1 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:border-white/35 hover:text-white'
									>
										Back
									</button>
									<button
										type='button'
										onClick={handleAddNewBall}
										className='flex-1 rounded-xl border border-[color:color-mix(in_srgb,var(--ball-accent)_45%,transparent)] bg-[color:var(--ball-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110'
									>
										Add New Ball
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}

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
						ballData={ballCatalog.map(b => ({ name: b.name }))}
					/>
				</div>

				<section
					id='section-2'
					data-section
					className='relative flex h-[100svh] items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10'
				>
					<div className='section-scrim mx-auto grid h-full w-full max-w-[1600px] overflow-hidden rounded-2xl px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:px-10 lg:py-12'>
						<div className='space-y-8 sm:space-y-10 lg:space-y-12' data-reveal data-reveal-dir='left'>
							<div>
								<div className='mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-theme-accent sm:text-sm'>
									<Circle size={8} fill='currentColor' />
									{panels[0].eyebrow}
								</div>
								<h2 className='font-display text-[clamp(2.8rem,12vw,8rem)] uppercase leading-[0.9] sm:leading-[0.88]'>
									{panels[0].title}
								</h2>
							</div>
							<div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
								{panels[0].stats.map(([value, label], index) => (
									<div key={value} className='border-l border-white/15 pl-4 sm:pl-6'>
										<div className='text-4xl font-bold leading-none sm:text-6xl'>{value}</div>
										<div className='mt-2 text-sm uppercase tracking-[0.18em] text-white/55 sm:text-xl'>
											{label}
										</div>
										{index === 0 ? (
											<p className='mt-4 max-w-xs text-sm leading-relaxed text-white/48 sm:text-lg'>
												{panels[0].copy}
											</p>
										) : null}
									</div>
								))}
							</div>
						</div>
						<div className='hidden bg-grid bg-[size:180px_180px] opacity-40 lg:block' />
					</div>
				</section>

				<section
					id='section-3'
					data-section
					className='relative flex h-[100svh] items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10'
				>
					<div className='panel-line section-scrim mx-auto h-full w-full max-w-[1600px] overflow-hidden rounded-2xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12'>
						<div className='grid gap-8 lg:grid-cols-[1fr_minmax(320px,500px)] lg:gap-10'>
							<div />
							<div className='space-y-8 text-left sm:space-y-10 lg:space-y-12 lg:text-right' data-reveal data-reveal-dir='right'>
								<div className='ml-auto inline-flex rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/75'>
									{panels[1].eyebrow}
								</div>
								<h2 className='font-display text-[clamp(2.8rem,12vw,8rem)] uppercase leading-[0.9] sm:leading-[0.88]'>
									{panels[1].title}
								</h2>
								<div className="flex flex-col gap-5 sm:flex-row sm:justify-end sm:gap-8">
									{panels[1].stats.map(([value, label]) => (
										<div key={value} className='max-w-sm lg:ml-auto'>
											<div className='text-4xl font-bold sm:text-6xl'>{value}</div>
											<div className='text-sm uppercase tracking-[0.3em] text-white/55'>
												{label}
											</div>
										</div>
									))}
								</div>
								<p className='max-w-lg text-sm leading-relaxed text-white/50 sm:text-lg lg:ml-auto'>
									{panels[1].copy}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section
					id='section-4'
					data-section
					className='relative flex h-[100svh] items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10'
				>
					<div className='section-scrim mx-auto h-full w-full max-w-[1600px] overflow-hidden rounded-2xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10'>
						<div className='grid h-full items-center gap-8 lg:grid-cols-[240px_minmax(0,1fr)_260px] xl:grid-cols-[300px_minmax(0,1fr)_320px]'>
							<div className='order-2 space-y-6 text-center lg:order-1 lg:space-y-8 lg:text-left' data-reveal data-reveal-dir='left'>
								<div className='border-l border-white/20 pl-6'>
									<div className='text-4xl font-bold sm:text-6xl'>1.2mm</div>
									<div className='text-lg uppercase tracking-[0.18em] text-white/55 sm:text-2xl'>
										Pebble Height
									</div>
								</div>
								<div className='text-xs uppercase tracking-[0.3em] text-white/38'>
									Elevation: 12.8 deg
								</div>
							</div>

							<div className='order-1 relative flex h-[18rem] items-center justify-center sm:h-[24rem] lg:order-2 lg:h-[30rem] xl:h-[35rem]'>
								<div className='absolute h-[16rem] w-[16rem] rounded-full border border-white/12 sm:h-[22rem] sm:w-[22rem] lg:h-[28rem] lg:w-[28rem] xl:h-[32.5rem] xl:w-[32.5rem]' />
								<div className='absolute h-[12rem] w-[12rem] rounded-full border border-white/18 sm:h-[16rem] sm:w-[16rem] lg:h-[22rem] lg:w-[22rem] xl:h-[25rem] xl:w-[25rem]' />
								<div className='absolute h-[8rem] w-[8rem] rounded-full border-2 border-white/22 sm:h-[11rem] sm:w-[11rem] lg:h-[14.5rem] lg:w-[14.5rem] xl:h-[16.9rem] xl:w-[16.9rem]' />
								<div className='absolute h-full w-px bg-white/25' />
								<div className='absolute w-full border-t border-white/25' />
								{Array.from({ length: 8 }).map((_, index) => (
									<span
										key={index}
										className='bg-theme-tick absolute h-2 w-[3px] rounded-full'
										style={{
											transform: `rotate(${index * 45}deg) translateY(clamp(-7rem, -16vw, -14.375rem))`,
										}}
									/>
								))}
							</div>

							<div className='order-3 space-y-6 text-center lg:space-y-8 lg:text-right' data-reveal data-reveal-dir='right'>
								<div className='text-xs uppercase tracking-[0.35em] text-white/38'>
									Azimuth: 45.2 deg
								</div>
								<div>
									<h2 className='text-[clamp(2.6rem,6vw,4.3rem)] font-bold leading-none'>
										High-Tack
									</h2>
									<div className='text-sm uppercase tracking-[0.25em] text-white/50 sm:text-xl'>
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
					className='relative flex h-[100svh] items-center px-3 py-6 sm:px-6 sm:py-8 lg:px-10'
				>
					<div className='mx-auto flex h-full w-full max-w-[1600px] px-2 py-4 sm:px-4 sm:py-8'>
						<ChampionShowcase panel={CHAMPION_PANEL} />
					</div>
				</section>

				<FooterSection />
			</main>
		</div>
	)
}
