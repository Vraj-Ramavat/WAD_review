/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#05070D',
        deepspace: '#0B0F1A',
        starwhite: '#F4F2ED',
        slate: '#8A93A6',
        amber: '#E8A33D',      // primary accent / healthy data / searched repo star / Sun core
        copper: '#C4573B',     // risk / warning
        brass: '#B08D57',      // borders, chrome, dividers
        databhlue: '#4C7A9E',  // secondary data category / famous repos / dependency threads
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
