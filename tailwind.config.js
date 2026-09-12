/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#04050A', 900: '#06070D', 850: '#090B13', 800: '#0C0F18',
          750: '#10131E', 700: '#141826', 600: '#1B2130', 500: '#242B3D',
        },
        brand: { DEFAULT: '#7C5CFF', 600: '#6A4BE6', 400: '#9B85FF', 300: '#BCADFF', soft: 'rgba(124,92,255,.14)' },
        neon: { cyan: '#22D3EE', lime: '#A3E635', pink: '#F472B6', amber: '#FBBF24' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 48px -14px rgba(124,92,255,.6)',
        panel: 'inset 0 1px 0 0 rgba(255,255,255,.045), 0 24px 48px -28px rgba(0,0,0,.85)',
      },
      keyframes: {
        eq: { '0%,100%': { transform: 'scaleY(.3)' }, '50%': { transform: 'scaleY(1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGlow: { '0%,100%': { opacity: '.5' }, '50%': { opacity: '1' } },
      },
      animation: {
        eq: 'eq 1.2s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        rise: 'rise .6s cubic-bezier(.2,.7,.2,1) both',
        shimmer: 'shimmer 2.6s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
