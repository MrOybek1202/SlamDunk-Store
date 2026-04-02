import { useEffect, useRef, useState } from 'react'
import type { ScrollStage } from '../types'

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value))

const INITIAL_STAGE: ScrollStage = {
	progress: 0,
	sectionIndex: 0,
	rawScrollY: 0,
	velocity: 0,
	direction: 0,
	isLocked: false,
}

export function useScroll(sectionCount: number): ScrollStage {
	const [stage, setStage] = useState<ScrollStage>(INITIAL_STAGE)

	const frameRef = useRef<number>(0)
	const lastScrollYRef = useRef(0)
	const lastTimestampRef = useRef(0)

	useEffect(() => {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return
		}

		const update = () => {
			frameRef.current = 0

			const sections = Array.from(
				document.querySelectorAll<HTMLElement>('[data-section]'),
			)
			const totalSections = Math.max(
				sections.length > 0 ? sections.length : sectionCount,
				1,
			)
			const currentScrollY = window.scrollY
			const now = performance.now()
			const deltaY = currentScrollY - lastScrollYRef.current
			const deltaTime = Math.max(now - lastTimestampRef.current, 1)

			const velocity = Math.abs(deltaY / deltaTime)
			const direction: -1 | 0 | 1 =
				deltaY === 0 ? 0 : deltaY > 0 ? 1 : -1

			let sectionIndex = 0
			let progress = 0

			if (sections.length > 0) {
				const viewportMiddle = currentScrollY + window.innerHeight / 2
				let closestIndex = 0
				let closestDistance = Number.POSITIVE_INFINITY

				sections.forEach((section, index) => {
					const sectionMiddle = section.offsetTop + section.offsetHeight / 2
					const distance = Math.abs(viewportMiddle - sectionMiddle)

					if (distance < closestDistance) {
						closestDistance = distance
						closestIndex = index
					}
				})

				sectionIndex = closestIndex
				progress =
					totalSections > 1 ? closestIndex / (totalSections - 1) : 0
			} else {
				const root = document.documentElement
				const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1)
				progress = currentScrollY / maxScroll
				sectionIndex =
					totalSections > 1
						? clamp(
								Math.round(progress * (totalSections - 1)),
								0,
								totalSections - 1,
							)
						: 0
			}

			setStage({
				progress: clamp(progress, 0, 1),
				sectionIndex: clamp(sectionIndex, 0, totalSections - 1),
				rawScrollY: currentScrollY,
				velocity: Number.isFinite(velocity) ? velocity : 0,
				direction,
				isLocked: false,
			})

			lastScrollYRef.current = currentScrollY
			lastTimestampRef.current = now
		}

		const requestUpdate = () => {
			if (frameRef.current) return
			frameRef.current = requestAnimationFrame(update)
		}

		lastScrollYRef.current = window.scrollY
		lastTimestampRef.current = performance.now()

		update()

		window.addEventListener('scroll', requestUpdate, { passive: true })
		window.addEventListener('resize', requestUpdate)

		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current)
				frameRef.current = 0
			}

			window.removeEventListener('scroll', requestUpdate)
			window.removeEventListener('resize', requestUpdate)
		}
	}, [sectionCount])

	return stage
}
