// src/pages/_app.js

import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes"; // Import the ThemeProvider
import Layout from "@/components/Layout"; // Import our new Layout

function MyApp({ Component, pageProps }) {
	return (
		// The ThemeProvider enables dark mode switching across the app.
		<ThemeProvider attribute="class" defaultTheme="dark">
			<AuthProvider>
				{/* The Layout component provides the consistent Header and Footer */}
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default MyApp;
