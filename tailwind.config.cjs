/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      ugent: "#1E64C8",
      white: "#FFFFFF",
    },
    extend: {
      fontFamily: {
        body: ["var(--fontBody)"],
      },
    },
    plugins: [],
  },
};
