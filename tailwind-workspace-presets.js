const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: ({ colors }) => ({
        neutral: colors.zinc,
        primary: colors.cyan,
        secondary: colors.sky,
        accent: colors.teal,
        danger: colors.rose,
        warning: colors.amber,
        success: colors.emerald,
        white: '#fafafa',
        black: '#0a0a0a',
      }),
      fontFamily: {
        book: [...fontFamily.sans],
        display: [...fontFamily.sans],
        code: [...fontFamily.mono],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
