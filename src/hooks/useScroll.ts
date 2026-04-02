import { useEffect, useRef, useState } from 'react'
import type { ScrollStage } from '../types'

export function useScroll(sectionCount: number): ScrollStage {
	const [stage, setStage] = useState<ScrollStage>({
		progress: 0,
		sectionIndex: 0,
		rawScrollY: 0,
		velocity: 0,
		direction: 0,
		isLocked: false,
	})
	const frameRef = useRef<number>(0)
	const sectionsRef = useRef<HTMLElement[]>([])

	useEffect(() => {
		// Получаем все секции
		const sections = Array.from(
			document.querySelectorAll<HTMLElement>('[data-section]'),
		)
		sectionsRef.current = sections

		// Если секций нет, используем прогресс по скроллу
		const actualSectionCount =
			sections.length > 0 ? sections.length : sectionCount

		const update = () => {
			frameRef.current = 0

			// Если есть data-section, используем позиционирование по секциям
			if (sections.length > 0) {
				const viewportMiddle = window.scrollY + window.innerHeight / 2
				let currentIndex = 0
				let bestDistance = Infinity

				sections.forEach((section, idx) => {
					const sectionTop = section.offsetTop
					const sectionBottom = sectionTop + section.offsetHeight
					const sectionMiddle = (sectionTop + sectionBottom) / 2
					const distance = Math.abs(viewportMiddle - sectionMiddle)

					if (distance < bestDistance) {
						bestDistance = distance
						currentIndex = idx
					}
				})

				// Прогресс на основе текущей секции
				const progress = currentIndex / (actualSectionCount - 1)
				const clampedProgress = Math.min(1, Math.max(0, progress))

				setStage({
					progress: clampedProgress,
					sectionIndex: currentIndex,
					rawScrollY: window.scrollY,
					velocity: 0, // We don't calculate velocity here
					direction: 0, // We don't calculate direction here
					isLocked: false,
				})
			} else {
				// Fallback: стандартный прогресс скролла
				const root = document.documentElement
				const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1)
				const progress = window.scrollY / maxScroll
				const sectionIndex = Math.min(
					actualSectionCount - 1,
					Math.floor(progress * actualSectionCount),
				)
				const clampedProgress = Math.min(1, Math.max(0, progress))

				setStage({
					progress: clampedProgress,
					sectionIndex: sectionIndex,
					rawScrollY: window.scrollY,
					velocity: 0, // We don't calculate velocity here
					direction: 0, // We don't calculate direction here
					isLocked: false,
				})
			}
		}

		const onScroll = () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current) // отменяем старый
			frameRef.current = requestAnimationFrame(update)
		}

		// Обновляем при изменении размера окна
		const onResize = () => {
			if (frameRef.current) return
			frameRef.current = window.requestAnimationFrame(update)
		}

		// Инициализация
		update()

		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onResize)

		return () => {
			if (frameRef.current) {
				window.cancelAnimationFrame(frameRef.current)
			}
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onResize)
		}
	}, [sectionCount])

	return stage
}
