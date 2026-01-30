/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#342b2b',
        'accent-cyan': '#23d5c0',
        'accent-pink': '#ee7752',
        'bg-dark': '#2e2a2a',
      },
      screens: {
        'sm': '720px',
        'lg': '1080px',
      },
    },
  },
  plugins: [],
}
