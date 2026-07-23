import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F4156',
          50: '#eef2f6',
          100: '#d5e0ea',
          200: '#abc1d4',
          300: '#82a2bf',
          400: '#5883a9',
          500: '#2F4156',
          600: '#263548',
          700: '#1d293a',
          800: '#141d2b',
          900: '#0b111d',
        },
        secondary: {
          DEFAULT: '#567C8D',
          50: '#edf3f6',
          100: '#d2e4eb',
          200: '#a5c9d6',
          300: '#79aec2',
          400: '#4c93ae',
          500: '#567C8D',
          600: '#456471',
          700: '#354c55',
          800: '#253439',
          900: '#141c1d',
        },
        accent: {
          DEFAULT: '#C8D9E6',
          light: '#E8F1F8',
          dark: '#a0bbd0',
        },
        highlight: {
          DEFAULT: '#F5EFEB',
          dark: '#e8ddd5',
        },
        figo: {
          navy: '#2F4156',
          teal: '#567C8D',
          cloud: '#C8D9E6',
          sand: '#F5EFEB',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '64px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(47, 65, 86, 0.12)',
        'glass-lg': '0 16px 64px rgba(47, 65, 86, 0.18)',
        'glass-xl': '0 24px 80px rgba(47, 65, 86, 0.25)',
        glow: '0 0 24px rgba(86, 124, 141, 0.4)',
        'glow-lg': '0 0 48px rgba(86, 124, 141, 0.5)',
        card: '0 4px 24px rgba(47, 65, 86, 0.08), 0 1px 4px rgba(47, 65, 86, 0.04)',
        premium: '0 20px 60px rgba(47, 65, 86, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'cloud-move': 'cloud-move 30s linear infinite',
        'cloud-move-slow': 'cloud-move 50s linear infinite',
        'sunrise': 'sunrise 8s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'typing': 'typing 1.2s steps(3, end) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(86, 124, 141, 0.4)' },
          '50%': { boxShadow: '0 0 48px rgba(86, 124, 141, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'cloud-move': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        sunrise: {
          '0%': { background: 'linear-gradient(to top, #1a0a00, #2F4156, #1a1a2e)' },
          '50%': { background: 'linear-gradient(to top, #ff6b35, #f7c59f, #567C8D)' },
          '100%': { background: 'linear-gradient(to top, #2F4156, #567C8D, #C8D9E6)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        typing: {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
        'figo-gradient': 'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)',
        'figo-gradient-light': 'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
