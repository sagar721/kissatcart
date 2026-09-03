import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon:      { DEFAULT: '#7A1E2B', deep: '#5E1420', ink: '#4A0F19' },
        ground:      '#F4EFEA',
        card:        '#FFFFFF',
        ink:         '#1A1A1A',
        muted:       '#6B6560',
        line:        '#E7E1DA',
        promo:       '#1E8449',
        gold:        '#F5B301',
        strike:      '#B0A9A3'
      },
      fontFamily: {
        serif:  ['var(--font-serif)',  'Playfair Display', 'Georgia', 'serif'],
        sans:   ['var(--font-sans)',   'Inter', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'Dancing Script', 'cursive']
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,15,25,.04), 0 8px 24px rgba(26,15,25,.06)',
        fab:  '0 10px 24px rgba(122,30,43,.35)'
      },
      borderRadius: { xl2: '14px' },
      maxWidth: { container: '1280px' }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
export default config;
