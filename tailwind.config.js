/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0f4b80',
        'primary-light': '#1e6091',
        'primary-dark': '#0a355c',
        'background-warm': '#F0F7FF',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(#94a3b8 1px, transparent 1px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
