// src/pages/dashboard.js

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import UserTable from "@/components/UserTable"; // Import our new reusable component

const TABS = ["websiteUsers", "adminUsers", "otherUsers", "botUsers"];
const TAB_NAMES = {
	websiteUsers: "Website Users",
	adminUsers: "Admins",
	otherUsers: "Other Server Members",
	botUsers: "Bots",
};

export default function DashboardPage() {
	const { isLoggedIn, loading: authLoading, token } = useAuth();
	const router = useRouter();

	const { adminUser, isOwner } = useAuth();
	console.log("Auth Context State:", { adminUser, isOwner });

	// --- State for categorized user data ---
	const [categorizedUsers, setCategorizedUsers] = useState({
		adminUsers: [],
		websiteUsers: [],
		botUsers: [],
		otherUsers: [],
	});
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);
	const [activeTab, setActiveTab] = useState("websiteUsers");

	// Route protection
	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
	}, [isLoggedIn, authLoading, router]);

	// Data fetching logic, now targets the new endpoint
	const fetchAllServerMembers = useCallback(async () => {
		if (token) {
			setFetchLoading(true);
			setFetchError(null);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/server-members`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message || "Failed to fetch server members."
					);
				}
				const data = await response.json();
				setCategorizedUsers(data);
			} catch (error) {
				setFetchError(error.message);
			} finally {
				setFetchLoading(false);
			}
		}
	}, [token]);

	// Effect to fetch users on initial load
	useEffect(() => {
		fetchAllServerMembers();
	}, [fetchAllServerMembers]);

	if (authLoading || !isLoggedIn) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	const activeUsers = categorizedUsers[activeTab] || [];

	// Determine the table type for the reusable component
	const tableType =
		activeTab === "botUsers"
			? "bot"
			: activeTab === "otherUsers"
			? "basic"
			: "full";

	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<header className="mb-8">
				<h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-gray-50">
					Community Dashboard
				</h1>
				<p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
					View and manage all members of your Discord server.
				</p>
			</header>

			<main>
				{/* Tab Navigation */}
				<div className="border-b border-gray-200 dark:border-dark-600 mb-6">
					<nav className="-mb-px flex space-x-6" aria-label="Tabs">
						{TABS.map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`${
									activeTab === tab
										? "border-primary dark:border-indigo-400 text-primary dark:text-indigo-400"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-dark-500"
								} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
							>
								{TAB_NAMES[tab]}
								<span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200">
									{categorizedUsers[tab]?.length || 0}
								</span>
							</button>
						))}
					</nav>
				</div>

				{/* Table Display */}
				{fetchLoading ? (
					<p className="text-gray-500 dark:text-gray-400">
						Loading all server members...
					</p>
				) : fetchError ? (
					<p className="text-red-500">Error: {fetchError}</p>
				) : (
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
						<UserTable users={activeUsers} type={tableType} />
					</div>
				)}
			</main>
		</div>
	);
}
