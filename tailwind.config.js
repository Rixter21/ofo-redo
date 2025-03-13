module.exports = {
  mode: "jit",
  content: ["./**/*.html", "./public/**/*.html"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: "#111827",
        secondary: "#6b7280",
        gold: {
          500: "#ffd700",
          600: "#ffa500",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(45deg, #ffd700, #ffa500)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
