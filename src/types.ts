// types.ts
export type TextureType = 'CLASSIC' | 'STREET' | 'TECH' | 'CROSS'

export interface Customization {
	baseColor: string      // основной цвет мяча
	lineColor: string      // цвет линий/швов
	texture: TextureType   // тип текстуры
}

// Существующие типы...
export interface ScrollStage {
	progress: number
	sectionIndex: number
	rawScrollY: number
	velocity: number
	direction: -1 | 0 | 1
	isLocked: boolean
}

export interface BallFlightState {
	isAnimatingToCart: boolean
	impulse: number
}

export interface FlightPoint {
	x: number
	y: number
}