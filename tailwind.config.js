/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './public/**/*.html',
    './scripts/*.js',
  ],
  safelist: [
    // Masonry / grid patterns generated dynamically in JS
    'col-span-6','col-span-3','col-span-4','col-span-8','col-span-9','col-span-12',
    'lg:col-span-3','lg:col-span-4','lg:col-span-6','lg:col-span-8','lg:col-span-9',
    'md:col-span-4','md:col-span-8','md:col-span-12',
    'lg:-mt-8','lg:-mt-16',
    'aspect-square','aspect-video','aspect-[4/5]','aspect-[4/3]','aspect-[16/9]',
    'grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-12',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#e6b319',
        'background-light': '#f9f8f4',
        'background-dark': '#211d11',
        'charcoal': '#1b180e',
        'archive-gray': '#97854e',
        'ivory': '#fdfcf8',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'serif': ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'DEFAULT': '0px',
        'lg': '0px',
        'xl': '0px',
        'full': '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
