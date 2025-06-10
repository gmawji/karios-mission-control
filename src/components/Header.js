// src/components/Header.js
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faLightbulb as faLightbulbSolid,
	faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faLightbulb as faLightbulbRegular } from "@fortawesome/free-regular-svg-icons";

const Header = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const { logout } = useAuth(); // Get the logout function from our auth context

	useEffect(() => setMounted(true), []);

	const handleThemeToggle = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const currentThemeToggleIcon = mounted
		? theme === "dark"
			? faLightbulbSolid
			: faLightbulbRegular
		: null;

	// Logic to switch the logo based on the theme
	const logoSrc =
		mounted && theme === "dark"
			? "/logo-header-dark.svg"
			: "/logo-header-light.svg";
	const logoDisplayHeight = 40;
	const logoDisplayWidth = (300 / 80) * logoDisplayHeight;

	return (
		<header className="bg-white dark:bg-dark-800 py-3 px-4 sticky top-0 z-50 border-b border-gray-200 dark:border-dark-600 shadow-sm">
			<div className="container mx-auto flex justify-between items-center">
				{/* Logo */}
				<Link
					href="/dashboard"
					className="flex items-center"
					aria-label="Mission Control Dashboard"
				>
					{mounted && (
						<Image
							key={logoSrc}
							src={logoSrc}
							alt="Karios Insight Logo"
							width={logoDisplayWidth}
							height={logoDisplayHeight}
							priority
						/>
					)}
				</Link>

				{/* Actions */}
				<div className="flex items-center space-x-4">
					<button
						onClick={handleThemeToggle}
						className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
						aria-label={`Switch to ${
							theme === "dark" ? "light" : "dark"
						} mode`}
					>
						{mounted && (
							<FontAwesomeIcon
								icon={currentThemeToggleIcon}
								className="w-5 h-5"
							/>
						)}
					</button>
					<button
						onClick={logout}
						className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
						aria-label="Logout"
						title="Logout"
					>
						<FontAwesomeIcon
							icon={faSignOutAlt}
							className="w-5 h-5"
						/>
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
