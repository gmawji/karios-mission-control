// karios-mission-control/src/components/Footer.js
import React from "react";
import Link from "next/link";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

/**
 * Renders the site-wide footer.
 * Includes copyright info, social media links, navigation links, and a disclaimer.
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-content border-t border-border">
			<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
					{/* Left side: Copyright and social */}
					<div className="mb-6 md:mb-0">
						<p className="text-sm text-text-muted">
							© {currentYear} Karios Insight, LLC. All rights
							reserved.
						</p>
						<div className="mt-4 flex justify-center md:justify-start space-x-4">
							<a
								href="https://instagram.com/kariosinsight"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Link to Karios Insight on Instagram"
								className="text-text-muted hover:text-accent transition-colors"
							>
								<FaInstagram size={20} />
							</a>
							<a
								href="https://twitter.com/KariosInsight"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Link to Karios Insight on X"
								className="text-text-muted hover:text-accent transition-colors"
							>
								<FaXTwitter size={20} />
							</a>
						</div>
					</div>

					{/* Right side: Links */}
					<div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
						<Link
							href="https://kariosinsight.com/about"
							target="_blank"
							rel="noopener noreferrer"
							className="text-text-muted hover:text-text-primary transition-colors"
						>
							About
						</Link>
						<Link
							href="https://kariosinsight.com/privacy-policy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-text-muted hover:text-text-primary transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							href="https://kariosinsight.com/terms-of-service"
							target="_blank"
							rel="noopener noreferrer"
							className="text-text-muted hover:text-text-primary transition-colors"
						>
							Terms of Service
						</Link>
					</div>
				</div>

				{/* Disclaimer below */}
				<div className="mt-12 pt-8 border-t border-border text-center">
					<p className="text-xs text-text-muted max-w-4xl mx-auto">
						Karios Mission Control is an internal application for
						Karios Insight, LLC. All materials are for research
						purposes only.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
