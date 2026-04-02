import type { Customization, TextureType } from '../types'

export type BallSceneTheme = {
	accent: string
	accentMuted: string
	bgDeep: string
	radialTop: string
	radialCenter: string
	radialFloor: string
	heroPanelGradient: string
	selection: string
	keyLight: string
	fillLight: string
	ambient: number
}

type RGB = { r: number; g: number; b: number }

function hexToRgb(hex: string): RGB | null {
	const h = hex.replace('#', '').trim()
	if (h.length !== 6) return null
	const n = Number.parseInt(h, 16)
	if (Number.isNaN(n)) return null
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }: RGB): string {
	const c = (x: number) =>
		Math.max(0, Math.min(255, Math.round(x)))
			.toString(16)
			.padStart(2, '0')
	return `#${c(r)}${c(g)}${c(b)}`
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
	const u = Math.min(1, Math.max(0, t))
	return {
		r: a.r + (b.r - a.r) * u,
		g: a.g + (b.g - a.g) * u,
		b: a.b + (b.b - a.b) * u,
	}
}

function lighten(c: RGB, amount: number): RGB {
	return {
		r: c.r + (255 - c.r) * amount,
		g: c.g + (255 - c.g) * amount,
		b: c.b + (255 - c.b) * amount,
	}
}

function darken(c: RGB, amount: number): RGB {
	const u = Math.min(1, Math.max(0, amount))
	return {
		r: c.r * (1 - u),
		g: c.g * (1 - u),
		b: c.b * (1 - u),
	}
}

function rgba(c: RGB, a: number): string {
	return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`
}

/** Luminance 0–1 */
function luminance(c: RGB): number {
	return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255
}

function textureBias(
	texture: TextureType,
): { topMix: number; centerBoost: number; coolShift: number; warmShift: number } {
	switch (texture) {
		case 'STREET':
			return { topMix: 0.5, centerBoost: 0.14, coolShift: 0, warmShift: 0.08 }
		case 'TECH':
			return { topMix: 0.38, centerBoost: 0.1, coolShift: 0.12, warmShift: 0 }
		case 'CROSS':
			return { topMix: 0.42, centerBoost: 0.12, coolShift: 0.06, warmShift: 0.04 }
		default:
			return { topMix: 0.35, centerBoost: 0.1, coolShift: 0, warmShift: 0.05 }
	}
}

/**
 * Full-page atmosphere + Three.js lights from the active ball colors.
 */
export function deriveBallSceneTheme(c: Customization): BallSceneTheme {
	const base = hexToRgb(c.baseColor) ?? { r: 255, g: 90, b: 0 }
	const line = hexToRgb(c.lineColor) ?? { r: 26, g: 26, b: 26 }
	const bias = textureBias(c.texture)

	const isDarkBall = luminance(base) < 0.22

	// Top veil: mix base with line + optional cool (forest / court) or warm (sunset)
	const topA = mixRgb(base, line, bias.topMix)
	let topB = topA
	if (bias.coolShift > 0) {
		topB = mixRgb(topB, { r: 40, g: 120, b: 140 }, bias.coolShift)
	}
	if (bias.warmShift > 0) {
		topB = mixRgb(topB, { r: 255, g: 200, b: 120 }, bias.warmShift)
	}

	const radialTop = rgba(topB, isDarkBall ? 0.28 : 0.2)

	const centerGlow = lighten(base, isDarkBall ? 0.15 : 0.25)
	const radialCenter = rgba(
		darken(centerGlow, isDarkBall ? 0.35 : 0.15),
		0.09 + bias.centerBoost,
	)

	// Floor tint (subtle, behind content)
	const floorMix = mixRgb(darken(base, 0.55), line, 0.25)
	const radialFloor = rgba(floorMix, isDarkBall ? 0.12 : 0.07)

	// Page base: near-black with a hint of the ball
	const bgMix = mixRgb({ r: 5, g: 5, b: 8 }, darken(base, 0.45), isDarkBall ? 0.35 : 0.22)
	const bgDeep = rgbToHex(bgMix)

	// Accent for UI (price, dots, borders using text-ember)
	const accent = rgbToHex(lighten(mixRgb(base, line, 0.12), 0.08))
	const accentMuted = rgba(lighten(base, 0.35), 0.55)

	const heroPanelGradient = [
		`radial-gradient(circle at 50% 14%, ${radialTop}, transparent 32%)`,
		`radial-gradient(circle at 50% 48%, ${radialCenter}, transparent 22%)`,
		`radial-gradient(ellipse at 50% 100%, ${radialFloor}, transparent 42%)`,
		`linear-gradient(180deg, ${rgba(darken(base, 0.2), 0.06)} 0%, transparent 38%)`,
	].join(',')

	const selection = rgba(
		mixRgb(lighten(base, 0.15), { r: 255, g: 255, b: 255 }, 0.22),
		0.88,
	)

	// Three.js — key warm, fill tinted by ball
	const keyLight = rgbToHex(
		mixRgb({ r: 255, g: 250, b: 240 }, lighten(base, 0.45), 0.35),
	)
	const fillLight = rgbToHex(
		mixRgb(lighten(base, 0.2), mixRgb(line, { r: 180, g: 210, b: 255 }, 0.3), 0.5),
	)

	const ambient = isDarkBall ? 0.1 : 0.13

	return {
		accent,
		accentMuted,
		bgDeep,
		radialTop,
		radialCenter,
		radialFloor,
		heroPanelGradient,
		selection,
		keyLight,
		fillLight,
		ambient,
	}
}
