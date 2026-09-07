import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#121212',
          surface: '#181818',
          card: '#181818',
          'card-hover': '#282828',
          button: '#1f1f1f',
          'button-hover': '#2a2a2a',
          elevated: '#252525',
          green: '#1ed760',
          'green-dark': '#1db954',
          'green-glow': '#1ed76040',
          white: '#ffffff',
          light: '#fdfdfd',
          silver: '#b3b3b3',
          'near-white': '#cbcbcb',
          border: '#4d4d4d',
          'border-light': '#7c7c7c',
          negative: '#f3727f',
          warning: '#ffa42b',
          announcement: '#539df5',
        },
      },
      borderRadius: {
        pill: '9999px',
        'large-pill': '500px',
        card: '8px',
      },
      boxShadow: {
        heavy: '0px 8px 24px rgba(0, 0, 0, 0.5)',
        card: '0px 8px 8px rgba(0, 0, 0, 0.3)',
        glow: '0px 0px 20px rgba(30, 215, 96, 0.35)',
        inset: 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
      },
      fontFamily: {
        sans: [
          'SpotifyMixUI',
          'CircularSp',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        title: [
          'SpotifyMixUITitle',
          'CircularSp',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        label: '1.6px',
      },
    },
  },
  plugins: [],
};

export default config;
