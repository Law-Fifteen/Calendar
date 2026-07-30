/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.12)',
          hover: 'rgba(255, 255, 255, 0.15)',
          active: 'rgba(255, 255, 255, 0.2)',
        },
        cal: {
          google: '#4285F4',
          calendly: '#006BFF',
          proton: '#646DFF',
          inflated: '#FF6B9D',
          'inflated-dim': 'rgba(255, 107, 157, 0.4)',
        }
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px rgba(100, 109, 255, 0.3)',
      },
      animation: {
        'glass-shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
