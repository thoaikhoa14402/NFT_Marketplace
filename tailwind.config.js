module.exports = {
  content: [
    "./src/**/*.tsx", "./src/styles/*"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundColor: {
        primary: '#0373AA',
        'body-primary': '#F0F8FF',
      },
      textColor: {
        primary: '#0373AA',
      },
      borderColor: {
        primary: '#0373AA',
      },
      outlineColor: {
        primary: '#0373AA',
      },
      zIndex: {
        '0': '0',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '999': '999',
      },
    },
  },
  plugins: [],
};
