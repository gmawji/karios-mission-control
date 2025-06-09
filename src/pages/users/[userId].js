// src/pages/users/[userId].js

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

// Helper to format dates nicely
const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

export default function UserProfilePage() {
	const { isLoggedIn, loading: authLoading, token } = useAuth();
	const router = useRouter();
	const { userId } = router.query;

	// --- State for page data ---
	const [profileData, setProfileData] = useState(null);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	// --- state for the notes feature ---
	const [newNoteText, setNewNoteText] = useState("");
	const [isSubmittingNote, setIsSubmittingNote] = useState(false);
	const [noteError, setNoteError] = useState("");

	// --- state for role management actions ---
	const [actionStatus, setActionStatus] = useState({
		loading: false,
		message: "",
		type: "", // 'success' or 'error'
		action: null, // e.g., 'sync', 'assign-data', 'revoke-alerts'
	});

	// --- Data fetching function, now wrapped in useCallback ---
	const fetchUserProfile = useCallback(async () => {
		// Only fetch if we have a token and a userId
		if (token && userId) {
			setFetchLoading(true);
			setFetchError(null);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users/${userId}/profile`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message || "Failed to fetch user profile."
					);
				}
				const data = await response.json();
				setProfileData(data);
			} catch (error) {
				console.error("Fetch user profile error:", error);
				setFetchError(error.message);
			} finally {
				setFetchLoading(false);
			}
		}
	}, [token, userId]);

	// Initial data fetch effect
	useEffect(() => {
		fetchUserProfile();
	}, [fetchUserProfile]);

	// --- Action Handlers for Role Management ---
	const performRoleAction = async (
		endpoint,
		body,
		successMessage,
		actionType
	) => {
		setActionStatus({
			loading: true,
			message: "",
			type: "",
			action: actionType,
		});
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users/${userId}/${endpoint}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: body ? JSON.stringify(body) : undefined,
				}
			);
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Action failed.");

			setActionStatus({
				loading: false,
				message: data.message || successMessage,
				type: "success",
				action: actionType,
			});
			await fetchUserProfile(); // Re-fetch data to update the UI with new roles
		} catch (err) {
			console.error(`Error during ${actionType}:`, err);
			setActionStatus({
				loading: false,
				message: err.message,
				type: "error",
				action: actionType,
			});
		}
		setTimeout(
			() =>
				setActionStatus({
					loading: false,
					message: "",
					type: "",
					action: null,
				}),
			4000
		);
	};

	const handleSyncRoles = () =>
		performRoleAction(
			"sync-roles",
			null,
			"Roles synced successfully!",
			"sync"
		);
	const handleAssignRole = (roleId, roleName) =>
		performRoleAction(
			"assign-role",
			{ roleId, roleName },
			`${roleName} assigned!`,
			`assign-${roleId}`
		);
	const handleRevokeRole = (roleId, roleName) =>
		performRoleAction(
			"revoke-role",
			{ roleId, roleName },
			`${roleName} revoked!`,
			`revoke-${roleId}`
		);

	// Route protection effect
	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
	}, [isLoggedIn, authLoading, router]);

	// Data fetching effect
	useEffect(() => {
		// Only fetch if we have a token and a userId from the router
		if (token && userId) {
			const fetchUserProfile = async () => {
				setFetchLoading(true);
				setFetchError(null);
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users/${userId}/profile`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.message || "Failed to fetch user profile."
						);
					}
					const data = await response.json();
					setProfileData(data);
				} catch (error) {
					console.error("Fetch user profile error:", error);
					setFetchError(error.message);
				} finally {
					setFetchLoading(false);
				}
			};
			fetchUserProfile();
		}
	}, [token, userId]); // Re-run if token or userId changes

	// Handler for submitting a note
	const handleSaveNote = async (e) => {
		e.preventDefault();
		if (!newNoteText.trim()) return;

		setIsSubmittingNote(true);
		setNoteError("");

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users/${userId}/notes`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ noteText: newNoteText.trim() }),
				}
			);

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to save note.");
			}

			// Optimistic UI Update: Add the new note to our local state so it appears instantly.
			setProfileData((prevData) => ({
				...prevData,
				db: {
					...prevData.db,
					// Add the new note returned from the API to the top of the list
					adminNotes: [data.note, ...prevData.db.adminNotes],
				},
			}));

			// Clear the input field
			setNewNoteText("");
		} catch (error) {
			console.error("Save note error:", error);
			setNoteError(error.message);
		} finally {
			setIsSubmittingNote(false);
		}
	};

	// Main loading state
	if (authLoading || fetchLoading) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				Loading User Profile...
			</div>
		);
	}

	// Error state
	if (fetchError) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				Error: {fetchError}
			</div>
		);
	}

	// No data state
	if (!profileData) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				User data not found.
			</div>
		);
	}

	// Destructure for easier access
	const { db: user, posthog } = profileData;

	// --- Get Role IDs from Environment Variables ---
	const discordRoleIds = {
		data: process.env.NEXT_PUBLIC_KARIOS_WEEKLY_CORE_ROLE_ID,
		alerts: process.env.NEXT_PUBLIC_KARIOS_WEEKLY_ALERTS_ROLE_ID,
		bias: process.env.NEXT_PUBLIC_KARIOS_WEEKLY_BIAS_ROLE_ID,
	};
	const isDataRoleAssigned = user.assignedRoleIds?.includes(
		discordRoleIds.data
	);
	const isAlertsRoleAssigned = user.assignedRoleIds?.includes(
		discordRoleIds.alerts
	);
	const isBiasRoleAssigned = user.assignedRoleIds?.includes(
		discordRoleIds.bias
	);

	return (
		<div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
			<header className="mb-8">
				<Link
					href="/dashboard"
					className="text-indigo-400 hover:text-indigo-300"
				>
					&larr; Back to Dashboard
				</Link>
				<div className="flex items-center mt-4">
					<Image
						src={
							user.avatar
								? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
								: "/default-avatar.png"
						}
						alt="User avatar"
						width={64}
						height={64}
						className="rounded-full mr-4"
					/>
					<div>
						<h1 className="text-3xl font-bold">
							{user.globalName || user.username}
						</h1>
						<p className="text-sm text-gray-400">
							{user.discordEmail}
						</p>
					</div>
				</div>
			</header>

			<main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: DB Info & PostHog Properties */}
				<div className="lg:col-span-1 space-y-6">
					{/* DB Info Card */}
					<div className="bg-gray-800 rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
							User Information
						</h2>
						<ul className="space-y-2 text-sm">
							<li>
								<strong>Subscription Status:</strong>{" "}
								<span className="font-mono bg-gray-700 px-2 py-1 rounded">
									{user.subscriptionStatus}
								</span>
							</li>
							<li>
								<strong>Stripe Customer ID:</strong>{" "}
								<span className="font-mono">
									{user.stripeCustomerId || "N/A"}
								</span>
							</li>
							<li>
								<strong>Joined:</strong>{" "}
								{formatDate(user.createdAt)}
							</li>
						</ul>
					</div>

					{/* PostHog Properties Card */}
					<div className="bg-gray-800 rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
							Analytics Properties
						</h2>
						{posthog.person ? (
							<ul className="space-y-2 text-sm">
								<li>
									<strong>First Seen:</strong>{" "}
									{formatDate(posthog.person.created_at)}
								</li>
								<li>
									<strong>Last Seen:</strong>{" "}
									{formatDate(
										posthog.person.properties.last_seen
									)}
								</li>
								<li>
									<strong>Location:</strong>{" "}
									{`${
										posthog.person.properties
											.$initial_geoip_city_name || "N/A"
									}, ${
										posthog.person.properties
											.$initial_geoip_country_code || ""
									}`}
								</li>
								<li>
									<strong>Browser:</strong>{" "}
									{posthog.person.properties.$initial_browser}
								</li>
								<li>
									<strong>OS:</strong>{" "}
									{posthog.person.properties.$initial_os}
								</li>
							</ul>
						) : (
							<p className="text-sm text-gray-400">
								{posthog.error ||
									"No analytics properties found."}
							</p>
						)}
					</div>

					{/* --- New Role Management Card --- */}
					<div className="bg-gray-800 rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
							Role Management
						</h2>
						<div className="space-y-4">
							<div>
								<h3 className="text-sm font-medium text-gray-400 mb-2">
									Assigned Role IDs
								</h3>
								<p className="font-mono text-xs bg-gray-900 p-2 rounded break-all">
									{user.assignedRoleIds?.join(", ") || "None"}
								</p>
							</div>
							<div>
								<button
									onClick={handleSyncRoles}
									disabled={actionStatus.loading}
									className="w-full text-sm bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
								>
									{actionStatus.loading &&
									actionStatus.action === "sync"
										? "Syncing..."
										: "Sync All Roles with Stripe"}
								</button>
							</div>
							<div className="border-t border-gray-700 pt-4 space-y-3">
								{/* Data Role */}
								{discordRoleIds.data && (
									<div className="flex justify-between items-center">
										<span className="text-sm">
											Weekly Data Role
										</span>
										<button
											onClick={() =>
												isDataRoleAssigned
													? handleRevokeRole(
															discordRoleIds.data,
															"Weekly Data"
													  )
													: handleAssignRole(
															discordRoleIds.data,
															"Weekly Data"
													  )
											}
											disabled={actionStatus.loading}
											className={`px-3 py-1 text-xs rounded ${
												isDataRoleAssigned
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
											} disabled:opacity-50`}
										>
											{isDataRoleAssigned
												? "Revoke"
												: "Assign"}
										</button>
									</div>
								)}
								{/* Alerts Role */}
								{discordRoleIds.alerts && (
									<div className="flex justify-between items-center">
										<span className="text-sm">
											Weekly Alerts Role
										</span>
										<button
											onClick={() =>
												isAlertsRoleAssigned
													? handleRevokeRole(
															discordRoleIds.alerts,
															"Weekly Alerts"
													  )
													: handleAssignRole(
															discordRoleIds.alerts,
															"Weekly Alerts"
													  )
											}
											disabled={actionStatus.loading}
											className={`px-3 py-1 text-xs rounded ${
												isAlertsRoleAssigned
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
											} disabled:opacity-50`}
										>
											{isAlertsRoleAssigned
												? "Revoke"
												: "Assign"}
										</button>
									</div>
								)}
								{/* Bias Role */}
								{discordRoleIds.bias && (
									<div className="flex justify-between items-center">
										<span className="text-sm">
											Weekly Bias Role
										</span>
										<button
											onClick={() =>
												isBiasRoleAssigned
													? handleRevokeRole(
															discordRoleIds.bias,
															"Weekly Bias"
													  )
													: handleAssignRole(
															discordRoleIds.bias,
															"Weekly Bias"
													  )
											}
											disabled={actionStatus.loading}
											className={`px-3 py-1 text-xs rounded ${
												isBiasRoleAssigned
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
											} disabled:opacity-50`}
										>
											{isBiasRoleAssigned
												? "Revoke"
												: "Assign"}
										</button>
									</div>
								)}
							</div>
							{actionStatus.message && (
								<p
									className={`text-xs mt-3 text-center ${
										actionStatus.type === "success"
											? "text-green-400"
											: "text-red-400"
									}`}
								>
									{actionStatus.message}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* --- Right Column: Notes and Activity Feed --- */}
				<div className="lg:col-span-2 space-y-8">
					{/* --- New Admin Notes Card --- */}
					<div className="bg-gray-800 rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
							Admin Notes
						</h2>

						{/* Form to add a new note */}
						<form onSubmit={handleSaveNote} className="mb-6">
							<textarea
								value={newNoteText}
								onChange={(e) => setNewNoteText(e.target.value)}
								placeholder={`Add a note about ${
									user.globalName || user.username
								}...`}
								className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								rows="3"
								disabled={isSubmittingNote}
							/>
							{noteError && (
								<p className="text-xs text-red-400 mt-1">
									{noteError}
								</p>
							)}
							<button
								type="submit"
								disabled={
									isSubmittingNote || !newNoteText.trim()
								}
								className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmittingNote ? "Saving..." : "Save Note"}
							</button>
						</form>

						{/* List of existing notes */}
						<div className="space-y-4 max-h-[400px] overflow-y-auto">
							{user.adminNotes && user.adminNotes.length > 0 ? (
								user.adminNotes.map((note) => (
									<div
										key={note._id}
										className="flex items-start text-sm border-t border-gray-700 pt-3"
									>
										<div className="flex-shrink-0">
											<p className="font-semibold text-white">
												{note.authorName}
											</p>
											<p className="text-xs text-gray-400">
												{formatDate(note.createdAt)}
											</p>
										</div>
										<p className="ml-4 pl-4 border-l border-gray-600 text-gray-300">
											{note.noteText}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-gray-400">
									No notes have been added for this user.
								</p>
							)}
						</div>
					</div>

					{/* Live Activity Feed Card */}
					<div className="bg-gray-800 rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
							Live Activity Feed
						</h2>
						<div className="space-y-4 max-h-[600px] overflow-y-auto">
							{posthog.events && posthog.events.length > 0 ? (
								posthog.events.map((event) => (
									<div
										key={event.id}
										className="flex items-start text-sm"
									>
										<div className="bg-gray-700 text-gray-300 rounded-full h-8 w-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
											<p>▶</p>
										</div>
										<div>
											<p className="font-semibold text-white">
												{event.event}
											</p>
											<p className="text-xs text-gray-400">
												{formatDate(event.timestamp)}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-gray-400">
									{posthog.error ||
										"No events found for this user."}
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
