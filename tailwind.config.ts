import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  // Force class-based dark mode (we never add "dark", so UI stays light)
  darkMode: 'class',

  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: { extend: {} },
  plugins: [forms],
} satisfies Config