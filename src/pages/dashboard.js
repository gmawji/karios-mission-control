// src/pages/dashboard.js
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, Tab } from "@/components/ui/Tabs";
import UserTable from "@/components/UserTable";

const TABS = ["websiteUsers", "adminUsers", "otherUsers", "botUsers"];
const TAB_NAMES = {
	websiteUsers: "Website Users",
	adminUsers: "Admins",
	otherUsers: "Other Server Members",
	botUsers: "Bots",
};

/**
 * Renders the main dashboard for viewing and managing community members.
 * @returns {JSX.Element} The rendered DashboardPage component.
 */
export default function DashboardPage() {
	const { isLoggedIn, loading: authLoading, token } = useAuth();
	const router = useRouter();

	const [categorizedUsers, setCategorizedUsers] = useState({
		adminUsers: [],
		websiteUsers: [],
		botUsers: [],
		otherUsers: [],
	});
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);
	const [activeTab, setActiveTab] = useState("websiteUsers");

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

	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
		if (isLoggedIn) {
			fetchAllServerMembers();
		}
	}, [isLoggedIn, authLoading, router, fetchAllServerMembers]);

	if (authLoading || !isLoggedIn) {
		return (
			<div className="flex items-center justify-center h-screen bg-background text-text-primary">
				Loading...
			</div>
		);
	}

	const activeUsers = categorizedUsers[activeTab] || [];
	const tableType =
		activeTab === "botUsers"
			? "bot"
			: activeTab === "otherUsers"
			? "basic"
			: "full";

	return (
		<>
			<PageHeader
				title="Community Dashboard"
				description="View and manage all members of your Discord server."
			/>

			<Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
				{TABS.map((tabName) => (
					<Tab
						key={tabName}
						label={TAB_NAMES[tabName]}
						name={tabName}
						count={categorizedUsers[tabName]?.length || 0}
					/>
				))}
			</Tabs>

			<div className="mt-6">
				{fetchLoading ? (
					<div className="w-full h-96 bg-content rounded-xl border border-border animate-pulse" />
				) : fetchError ? (
					<div className="text-center p-8 bg-content rounded-xl border border-border">
						<p className="text-destructive font-semibold">Error</p>
						<p className="text-text-muted">{fetchError}</p>
					</div>
				) : (
					<div className="bg-content rounded-xl shadow-lg border border-border overflow-hidden">
						<UserTable users={activeUsers} type={tableType} />
					</div>
				)}
			</div>
		</>
	);
}
