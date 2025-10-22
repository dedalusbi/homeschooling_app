/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'azul-sereno': '#3A5A92',
        'verde-crescimento': '#4CAF50',
        'amarelo-foco': '#FFC107',
        'fundo-neutro': '#F7F9FC',
        'texto-profundo': '#2C3E50',
        'texto-suave': '#8A9AAF',
        'linha-sutil': '#E0E6ED',
        'vermelho-erro': '#DC3545',
      }
    },
  },
  plugins: [],
}

