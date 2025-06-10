// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,jsx}",
		"./src/components/**/*.{js,jsx}",
		// Add other paths if needed, e.g., "./src/layouts/**/*.{js,jsx}"
	],
	darkMode: "class",
	theme: {
		extend: {
			// --- Logo Animation ---
			animation: {
				scaleLoading: "scaleLoading 0.5s ease-out backwards",
			},
			keyframes: {
				scaleLoading: {
					"0%": { transform: "scaleY(0)" },
					"100%": { transform: "scaleY(1)" },
				},
			},
			// --- Color Palette ---
			colors: {
				// --- Brand Primary (Deep Muted Blue) ---
				primary: "rgb(var(--colors-primary-500))", // Base Primary (#1f3a5f)
				"primary-lighter": "rgb(var(--colors-primary-100))", // Significantly lighter
				"primary-light": "rgb(var(--colors-primary-300))", // Light
				"primary-darker": "rgb(var(--colors-primary-700))", // Darker
				// You can also map the full primary scale (50-950) here if needed:
				// primary: {
				//   DEFAULT: "rgb(var(--colors-primary-500))",
				//   50: "rgb(var(--colors-primary-50))",
				//   100: "rgb(var(--colors-primary-100))",
				//   // ... and so on up to 950
				// },

				// --- Brand Accent/Secondary (Emerald Green) ---
				secondary: "rgb(var(--colors-secondary-500))", // Base Accent/Secondary (#2ecc71)
				"secondary-lighter": "rgb(var(--colors-secondary-100))",
				"secondary-light": "rgb(var(--colors-secondary-300))",
				"secondary-darker": "rgb(var(--colors-secondary-700))",
				// Full secondary scale can be mapped similarly if desired.

				// --- Semantic Colors ---
				info: "rgb(var(--colors-info))",
				"info-lighter": "rgb(var(--colors-info-lighter))",
				"info-light": "rgb(var(--colors-info-light))",
				"info-darker": "rgb(var(--colors-info-darker))",

				success: "rgb(var(--colors-success))", // Now maps to Accent Green base
				"success-lighter": "rgb(var(--colors-success-lighter))",
				"success-light": "rgb(var(--colors-success-light))",
				"success-darker": "rgb(var(--colors-success-darker))",

				warning: "rgb(var(--colors-warning))",
				"warning-lighter": "rgb(var(--colors-warning-lighter))",
				"warning-light": "rgb(var(--colors-warning-light))",
				"warning-darker": "rgb(var(--colors-warning-darker))",

				error: "rgb(var(--colors-error))",
				"error-lighter": "rgb(var(--colors-error-lighter))",
				"error-light": "rgb(var(--colors-error-light))",
				"error-darker": "rgb(var(--colors-error-darker))",

				// --- Gray Palette (for Light Mode & General UI) ---
				// Maps to your new --colors-gray-* scale
				gray: {
					50: "rgb(var(--colors-gray-50))",
					100: "rgb(var(--colors-gray-100))", // Brand Neutral Gray
					150: "rgb(var(--colors-gray-150))",
					200: "rgb(var(--colors-gray-200))",
					300: "rgb(var(--colors-gray-300))",
					400: "rgb(var(--colors-gray-400))",
					500: "rgb(var(--colors-gray-500))",
					600: "rgb(var(--colors-gray-600))",
					700: "rgb(var(--colors-gray-700))",
					800: "rgb(var(--colors-gray-800))", // Brand Text Gray
					900: "rgb(var(--colors-gray-900))",
					950: "rgb(var(--colors-gray-950))",
				},

				// --- Dark Palette (for Dark Mode elements) ---
				// Maps to your new --colors-dark-* scale
				dark: {
					50: "rgb(var(--colors-dark-50))",
					100: "rgb(var(--colors-dark-100))",
					200: "rgb(var(--colors-dark-200))",
					300: "rgb(var(--colors-dark-300))",
					400: "rgb(var(--colors-dark-400))",
					450: "rgb(var(--colors-dark-450))",
					500: "rgb(var(--colors-dark-500))",
					600: "rgb(var(--colors-dark-600))",
					700: "rgb(var(--colors-dark-700))",
					750: "rgb(var(--colors-dark-750))",
					800: "rgb(var(--colors-dark-800))",
					900: "rgb(var(--colors-dark-900))",
				},

				// --- Surface Colors (from tailux.css or global styles) ---
				// These assume --surface-1, --surface-2, --surface-3 are defined in your CSS
				// and will have appropriate values for light and dark modes.
				surface: {
					1: "rgb(var(--surface-1))",
					2: "rgb(var(--surface-2))",
					3: "rgb(var(--surface-3))",
				},

				// --- 'this' Theme Colors (from tailux.css or global styles) ---
				// These assume --this, --this-lighter, etc. are defined in your CSS
				// for dynamically themed components.
				this: {
					DEFAULT: "rgb(var(--this))",
					lighter: "rgb(var(--this-lighter))",
					light: "rgb(var(--this-light))",
					darker: "rgb(var(--this-darker))",
				},
			},

			// --- Font Family ---
			fontFamily: {
				sans: ["var(--font-roboto)", ...fontFamily.sans],
				heading: ["var(--font-lato)", ...fontFamily.sans],
			},

			// --- Other Customizations ---
			fontWeight: {
				normal: "400",
				bold: "700",
			},
			fontSize: {
				base: "16px",
			},
			lineHeight: {
				normal: "1.5",
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
