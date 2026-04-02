/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        ember: 'var(--ball-accent, #ff5a00)',
        mist: '#b7b7b7',
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        sans: ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        ember: '0 0 32px color-mix(in srgb, var(--ball-accent, #ff5a00) 38%, transparent)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
