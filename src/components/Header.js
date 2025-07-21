// karios-mission-control/src/components/Header.js
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import NavigationOverlay from "./NavigationOverlay";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

/**
 * Renders the main application header.
 * @returns {JSX.Element} The rendered Header component.
 */
const Header = () => {
	const [isNavOpen, setIsNavOpen] = useState(false);
	useBodyScrollLock(isNavOpen);

	return (
		<>
			<div className="fixed top-0 left-0 right-0 z-50 p-4">
				<header className="container mx-auto max-w-7xl bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-md">
					<nav className="flex justify-between items-center h-16 px-6">
						<Link href="/dashboard">
							<Image
								src="/logo-header-light.svg"
								alt="Logo"
								width={150}
								height={40}
								className="dark:hidden"
								priority
							/>
							<Image
								src="/logo-header-dark.svg"
								alt="Logo"
								width={150}
								height={40}
								className="hidden dark:block"
								priority
							/>
						</Link>
						<button
							onClick={() => setIsNavOpen(true)}
							className="p-2 rounded-md text-text-primary"
							aria-label="Open navigation menu"
						>
							<FiMenu size={24} />
						</button>
					</nav>
				</header>
			</div>
			<NavigationOverlay
				isOpen={isNavOpen}
				onClose={() => setIsNavOpen(false)}
			/>
		</>
	);
};

export default Header;
