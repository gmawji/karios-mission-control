// karios-mission-control/src/components/NavigationOverlay.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { FiX, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const overlayVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
	exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const navListVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.3,
		},
	},
};

const navItemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
};

/**
 * Renders a full-screen navigation overlay, always in dark mode.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the overlay is open.
 * @param {Function} props.onClose - Function to call to close the overlay.
 * @returns {JSX.Element} The rendered navigation overlay.
 */
const NavigationOverlay = ({ isOpen, onClose }) => {
	const { theme, setTheme } = useTheme();
	const { user, logout } = useAuth();

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					variants={overlayVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					className="dark fixed inset-0 bg-[#1A1A1A]/95 backdrop-blur-sm z-[100] p-4 sm:p-6 md:p-8 overflow-y-auto"
				>
					<div className="container mx-auto max-w-7xl h-full flex flex-col">
						{/* Top Bar */}
						<div className="flex justify-between items-center mb-6 flex-shrink-0">
							<Link href="/dashboard" onClick={onClose}>
								<Image
									src="/logo-header-dark.svg"
									alt="Karios Mission Control Logo"
									width={120}
									height={32}
									priority
								/>
							</Link>
							<div className="flex items-center gap-x-2">
								<button
									onClick={() =>
										setTheme(
											theme === "dark" ? "light" : "dark"
										)
									}
									className="p-2 text-text-muted hover:text-text-primary"
									aria-label="Toggle theme"
								>
									{theme === "dark" ? (
										<FiSun size={25} />
									) : (
										<FiMoon size={25} />
									)}
								</button>
								<button
									onClick={onClose}
									className="p-2 text-text-muted hover:text-text-primary"
									aria-label="Close navigation"
								>
									<FiX size={32} />
								</button>
							</div>
						</div>

						{/* Main Content */}
						<div className="flex-grow overflow-y-auto">
							<motion.div
								variants={{
									visible: {
										transition: { staggerChildren: 0.1 },
									},
								}}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 md:grid-cols-12 gap-8"
							>
								<div className="md:col-span-4">
									<h2 className="font-heading text-sm uppercase text-text-muted tracking-widest border-b border-border pb-2">
										Navigation
									</h2>
									<motion.ul
										className="mt-4 space-y-2"
										variants={navListVariants}
										initial="hidden"
										animate="visible"
									>
										<motion.li variants={navItemVariants}>
											<Link
												href="/dashboard"
												onClick={onClose}
												className="font-heading text-3xl text-text-primary hover:text-accent transition-colors"
											>
												Dashboard
											</Link>
										</motion.li>
									</motion.ul>
								</div>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5, duration: 0.5 }}
									className="md:col-span-8 space-y-12"
								>
									<div>
										<h2 className="font-heading text-sm uppercase text-text-muted tracking-widest border-b border-border pb-2">
											Quick Stats
										</h2>
										<div className="mt-4 grid sm:grid-cols-2 gap-6">
											<div className="bg-content border border-border rounded-xl p-4 text-text-muted">
												Placeholder for User Count
											</div>
											<div className="bg-content border border-border rounded-xl p-4 text-text-muted">
												Placeholder for Active
												Subscriptions
											</div>
										</div>
									</div>
								</motion.div>
							</motion.div>
						</div>

						{/* Bottom Auth Section */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="flex-shrink-0 pt-6 mt-6 border-t border-border"
						>
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-3">
									<Image
										src={
											user?.picture ||
											"/default-avatar.svg"
										}
										alt="User Avatar"
										width={40}
										height={40}
										className="rounded-full bg-gray-700"
									/>
									<div>
										<p className="font-semibold text-text-primary">
											{user?.name}
										</p>
										<p className="text-sm text-text-muted">
											Mission Control Admin
										</p>
									</div>
								</div>
								<button
									onClick={logout}
									className="flex items-center gap-2 p-2 text-text-muted hover:text-destructive transition-colors"
								>
									<FiLogOut size={20} />
									<span>Logout</span>
								</button>
							</div>
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default NavigationOverlay;
