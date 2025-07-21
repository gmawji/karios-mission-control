// karios-mission-control/src/components/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Provides the main layout structure (Header, Footer) for a page.
 * This component is typically used by individual pages via a getLayout function.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The page content to be rendered within the layout.
 * @returns {JSX.Element} The rendered layout component.
 */
const Layout = ({ children }) => {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<Header />
			<main className="flex-grow pt-28">
				<div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					{children}
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default Layout;
