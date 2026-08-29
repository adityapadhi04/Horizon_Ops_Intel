/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'command-base': '#070B14',
        'command-card': '#111A2C',
        'command-card-hover': '#16233A',
        'command-secondary': '#0D1321',
        'accent-cyan': '#22D3EE',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
        'success-green': '#10B981',
        'warning-amber': '#F59E0B',
        'danger-red': '#EF4444',
        'text-primary': '#F4F7FB',
        'text-secondary': '#94A3B8'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'subtle-pulse 3s infinite ease-in-out',
        'spin-slow': 'spin 8s linear infinite'
      }
    },
  },
  plugins: [],
}
