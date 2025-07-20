/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./utils/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
        display: ['Bricolage Grotesque', 'sans-serif'],
      }
    },
  },
  plugins: [
    // Typography plugin is already in devDependencies
  ],
}