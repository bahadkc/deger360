/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Optimize CSS output by removing unused styles
  // Tailwind automatically purges unused CSS in production builds
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // Safelist any classes that might be dynamically generated
    safelist: [],
  },
  theme: {
    extend: {
      colors: {
        'primary-orange': '#FF6B35',
        'primary-orange-hover': '#FF5722',
        'primary-blue': '#0077B6',
        'light-blue': '#90E0EF',
        'dark-blue': '#023E8A',
        'neutral-50': '#F8F9FA',
        'neutral-100': '#E9ECEF',
        'neutral-200': '#DEE2E6',
        'neutral-800': '#343A40',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

