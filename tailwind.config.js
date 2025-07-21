// karios-mission-control/tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/pages/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				background: "rgb(var(--color-background))",
				content: "rgb(var(--color-content))",
				"text-primary": "rgb(var(--color-text-primary))",
				"text-muted": "rgb(var(--color-text-muted))",
				accent: "rgb(var(--color-accent))",
				destructive: "rgb(var(--color-destructive))",
				border: "rgb(var(--color-border))",
			},
			fontFamily: {
				sans: ["var(--font-roboto)", ...fontFamily.sans],
				heading: ["var(--font-lato)", ...fontFamily.sans],
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
	],
};
