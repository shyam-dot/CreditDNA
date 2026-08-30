/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        space: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        command: {
          bg: '#0B0F19',
          card: '#111827',
          surface: '#151D2F',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cyan: {
          accent: '#00D4FF',
          teal: '#2DD4BF',
          glow: '#06B6D4',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.4)',
        },
        // Brand neutrals
        ink: {
          DEFAULT: '#0A0A0F',
          light: '#1A1A2E',
        },
        slate: {
          950: '#0B0F1A',
        },
        // Score band colors
        strong: {
          DEFAULT: '#10B981',
          light: '#DCFCE7',
          muted: '#34D399',
        },
        moderate: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          muted: '#FBBF24',
        },
        weak: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          muted: '#F87171',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'score-fill': 'scoreFill 1.2s ease-out forwards',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'matrix-stream': 'matrixStream 10s linear infinite',
        'border-beam': 'borderBeam calc(var(--duration)*1s) infinite linear',
      },
      keyframes: {
        borderBeam: {
          '100%': {
            offsetDistance: '100%',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scoreFill: {
          from: { strokeDashoffset: '339.3' },
          to: { strokeDashoffset: 'var(--target-offset)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(0,212,255,0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.8))' },
        },
      },
    },
  },
  plugins: [],
}
