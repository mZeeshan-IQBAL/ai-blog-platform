// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",        // Updated: src/app instead of just app
    "./src/components/**/*.{js,jsx}",  // Updated: src/components instead of just components
    "./components/**/*.{js,jsx}",      // Keep this if you still have components at root level
  ],
  theme: { 
    extend: {} 
  },
  plugins: [require("@tailwindcss/typography")],
};