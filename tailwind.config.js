/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b5998',
        secondary: '#f5f5f5',
      },
    },
  },
  plugins: [],
};
