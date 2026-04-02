import { useMemo, useRef } from 'react'
import type { BallFlightState, ScrollStage } from '../types'

type BallPose = {
	position: [number, number, number]
	scale: number
	rotationBoost: number
	emissive: number
	rollSpeed: number // Добавляем скорость вращения для каждой позы
}

const poses: BallPose[] = [
	{
		position: [0, 0, 0],
		scale: 0.68,
		rotationBoost: 0.5,
		emissive: 0.4,
		rollSpeed: 0.8,
	},
	{
		position: [2.9, 0.02, -1],
		scale: 1.7,
		rotationBoost: 1.2,
		emissive: 0.6,
		rollSpeed: 1.5,
	},
	{
		position: [-2.9, 0.02, -1],
		scale: 1.7,
		rotationBoost: 1.6,
		emissive: 0.3,
		rollSpeed: 1.5,
	},
	{
		position: [-0.05, 0, 0],
		scale: 0.76,
		rotationBoost: 1.4,
		emissive: 0.6,
		rollSpeed: 1.2,
	},
	{
		position: [0, 0.17, 0],
		scale: 0.6,
		rotationBoost: 0.9,
		emissive: 0.4,
		rollSpeed: 1.0,
	},
	{
		position: [10, 10, -0.5],
		scale: 0,
		rotationBoost: 0.3,
		emissive: 0.2,
		rollSpeed: 1.6,
	},
]

function mix(a: number, b: number, t: number) {
	return a + (b - a) * t
}

function mixPose(a: BallPose, b: BallPose, t: number): BallPose {
	return {
		position: [
			mix(a.position[0], b.position[0], t),
			mix(a.position[1], b.position[1], t),
			mix(a.position[2], b.position[2], t),
		],
		scale: mix(a.scale, b.scale, t),
		rotationBoost: mix(a.rotationBoost, b.rotationBoost, t),
		emissive: mix(a.emissive, b.emissive, t),
		rollSpeed: mix(a.rollSpeed, b.rollSpeed, t),
	}
}

export function useBallAnimation(
	scrollStage: ScrollStage,
	flight: BallFlightState,
) {
	const prevProgressRef = useRef(scrollStage.progress)
	const accumulatedRollRef = useRef(0)

	return useMemo(() => {
		const scaled = scrollStage.progress * (poses.length - 1)
		const index = Math.min(poses.length - 2, Math.max(0, Math.floor(scaled)))
		const localT = scaled - index
		const pose = mixPose(poses[index], poses[index + 1], localT)

		// Вычисляем скорость скролла для анимации качения
		const progressDelta = scrollStage.progress - prevProgressRef.current
		prevProgressRef.current = scrollStage.progress

		// Накопление вращения от скролла
		const scrollRoll = Math.abs(progressDelta) * 12 // Множитель для реалистичного качения
		accumulatedRollRef.current += scrollRoll
		accumulatedRollRef.current = Math.min(accumulatedRollRef.current, 15) // Ограничиваем максимальное вращение

		// Плавное затухание вращения
		const rollDecay = 0.92
		accumulatedRollRef.current *= rollDecay

		// Итоговая скорость вращения: базовая + от скролла + от импульса
		const finalRollSpeed =
			pose.rollSpeed + accumulatedRollRef.current + flight.impulse * 2

		return {
			...pose,
			scale: pose.scale * (flight.isAnimatingToCart ? 0.7 : 1),
			rotationBoost:
				pose.rotationBoost +
				flight.impulse * 0.45 +
				accumulatedRollRef.current * 0.3,
			emissive: pose.emissive + flight.impulse * 0.08,
			rollSpeed: finalRollSpeed, // Передаем скорость вращения в компонент
		}
	}, [flight.impulse, flight.isAnimatingToCart, scrollStage.progress])
}
