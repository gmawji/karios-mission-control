// karios-mission-control/src/pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/Layout";
import { Roboto, Lato } from "next/font/google";

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-roboto",
	display: "swap",
});

const lato = Lato({
	subsets: ["latin"],
	weight: ["400", "700", "900"],
	variable: "--font-lato",
	display: "swap",
});

/**
 * The root component for the Next.js application.
 * Sets up global providers for theming and authentication.
 * @param {object} props - The component props.
 * @param {React.ElementType} props.Component - The active page component.
 * @param {object} props.pageProps - The props for the active page.
 * @returns {JSX.Element} The rendered application.
 */
function MyApp({ Component, pageProps }) {
	// getLayout allows pages to specify their own layout structure.
	const getLayout = Component.getLayout || ((page) => page);

	return (
		<ThemeProvider attribute="class" defaultTheme="light">
			<AuthProvider>
				<Layout>
					<main
						className={`${roboto.variable} ${lato.variable} font-sans`}
					>
						{getLayout(<Component {...pageProps} />)}
					</main>
				</Layout>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default MyApp;
