/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slow-zoom': {
          'from': { transform: 'scale(1)' },
          'to': { transform: 'scale(1.1)' }
        },
        'pan-left': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-5%)' }
        },
        'pan-right': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(5%)' }
        },
        'fade-cutscene': {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        'slow-zoom': 'slow-zoom var(--animation-duration, 5s) ease-in-out forwards',
        'pan-left': 'pan-left var(--animation-duration, 5s) ease-in-out forwards',
        'pan-right': 'pan-right var(--animation-duration, 5s) ease-in-out forwards',
        'fade-cutscene': 'fade-cutscene var(--animation-duration, 5s) ease-in-out forwards'
      }
    },
  },
  plugins: [],
}

