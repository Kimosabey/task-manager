import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: { 50: '#faf8f5', 100: '#f2ede4', 500: '#c4a882' },
        ink: { 900: '#1a1714', 700: '#3d3830' },
        ember: { 500: '#d4622a', 400: '#e07a4a' },
      },
      boxShadow: {
        card: '0 1px 0 rgba(26,23,20,0.08), 0 12px 30px rgba(26,23,20,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
