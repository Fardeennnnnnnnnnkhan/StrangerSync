/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        primary: "#5865f2", // Discord blue
        secondary: "#2f3136",
        accent: "#3ba55c",
        danger: "#ed4245",
      },
    },
  },
  plugins: [],
}
