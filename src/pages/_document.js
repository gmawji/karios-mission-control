import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Traditional Favicon */}
				{/* <link rel="shortcut icon" href="/favicon.ico" />
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/> */}
				{/* <link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/> */}
				{/* Apple Touch Icon */}
				{/* <link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/> */}
				{/* <link rel="preload" href="/logo-header-light.svg" as="image" /> */}
				{/* <link rel="preload" href="/logo-header-dark.svg" as="image" /> */}
				{/* Web App Manifest (for PWA-like features, Android icons) */}
				{/* <link rel="manifest" href="/manifest.json" /> */}
				{/* Theme Color for Browser UI */}
				<meta name="theme-color" content="#1f3a5f" />{" "}
				{/* Primary color from your theme */}
				{/* You can also add a dark mode theme color if your brand has one distinct for browser UI */}
				{/* <meta name="theme-color" content="#1a202c" media="(prefers-color-scheme: dark)" /> */}
				{/* Add any other global static meta tags or link tags here */}
			</Head>
			<body className="antialiased">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
