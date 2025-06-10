// src/components/Footer.js
import React from "react";
import Link from "next/link";

const Footer = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 py-6 px-4 text-center border-t border-gray-200 dark:border-dark-600">
			<div className="container mx-auto">
				<p className="text-sm">
					© {currentYear} Karios Insight, LLC. Mission Control.
				</p>
				<div className="flex justify-center items-center gap-x-4 mt-2 text-xs">
					<Link
						href="https://kariosinsight.com"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline hover:text-primary"
					>
						Main Site
					</Link>
					<Link
						href="https://kariosinsight.com/privacy-policy"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline hover:text-primary"
					>
						Privacy Policy
					</Link>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
