const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 'media' or 'class'
  theme: {
    fontFamily: {
      body: ['inter', 'sans-serif'],
    },
    extend: {
      colors: {
        greenPrimary: '#2EAE4E',
        'greenPrimary-700': '#217C38',
        'greenPrimary-100': '#CCF2D5',
        'greenPrimary-50': '#F2FCF5',

        'darkColor-800': '#263237',
        'darkColor-500': '#626A6E',
        'darkColor-600': '#454F54',
        'darkColor-300': '#B2B6B8',
        dark: '#282828',

        'primaryColor-900': '#232F34',
        'primaryColor-800': '#F9FAFA',
        'primaryColor-700': '#4D6666',
        'primaryColor-600': '#809191',
        'primaryColor-500': '#94ABAB',
        'primaryColor-400': '#B8CACA',
        'primaryColor-300': '#D6DBDB',
        'primaryColor-200': '#F7F7F7',
        'primaryColor-100': '#BEBEBE',
        'primaryColor-50': '#F9FAFA',

        'secondaryColor-800': '#263237',
        'secondaryColor-500': '#626A6E',
        'secondaryColor-400': '#898F92',
        'secondaryColor-300': '#B2B6B8',
        'secondaryColor-200': '#E7EBEB',

        bluePrimary: '#2196F3',
        blueSecondary: '#0C81E0',

        redColor: '#FF3E33',
        'redColor-500': '#E11900',
        'redColor-400': '#FF544A',
        'redColor-200': '#F1998E',
      },
      dropShadow: {
        xs: '0px 12px 24px -10px rgba(179, 182, 186, 0.05)',
        sm: '0px 24px 32px -15px rgba(168, 175, 182, 0.15)',
        md: '0px 32px 48px -20px rgba(100, 112, 122, 0.15)',
        lg: '0px 48px 56px -25px rgba(100, 112, 122, 0.15)',
      },
      screens: {
        md: '800px',
      },
      boderWidth: {
        xs: '0.5px',
        sm: '1px',
        md: '2px',
        lg: '3px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
