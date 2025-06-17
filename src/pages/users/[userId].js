// src/pages/users/[userId].js
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

// Helper function to format dates nicely
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

// Recreated Status Badge Component for subscription status
const getSubscriptionStatusDisplay = (status) => {
	status = status ? status.toLowerCase() : "none";
	let text =
		status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
	let className = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
	switch (status) {
		case "active":
		case "trialing":
			className +=
				" bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300";
			break;
		case "past_due":
		case "payment_failed":
		case "unpaid":
			className +=
				" bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300";
			break;
		case "incomplete":
		case "incomplete_expired":
			className +=
				" bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300";
			break;
		case "canceled":
		case "none":
		default:
			className +=
				" bg-gray-200 text-gray-800 dark:bg-dark-600 dark:text-gray-200";
			text = status === "none" ? "No Subscription" : text;
			break;
	}
	return <span className={className}>{text}</span>;
};

export default function UserProfilePage() {
	const { isLoggedIn, loading: authLoading, token } = useAuth();
	const router = useRouter();
	const { userId } = router.query;

	const [profileData, setProfileData] = useState(null);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);
	const [newNoteText, setNewNoteText] = useState("");
	const [isSubmittingNote, setIsSubmittingNote] = useState(false);
	const [noteError, setNoteError] = useState("");
	const [actionStatus, setActionStatus] = useState({
		loading: false,
		message: "",
		type: "",
		action: null,
	});

	const fetchUserProfile = useCallback(async () => {
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
				setFetchError(error.message);
			} finally {
				setFetchLoading(false);
			}
		}
	}, [token, userId]);

	useEffect(() => {
		if (!authLoading) {
			if (isLoggedIn) {
				fetchUserProfile();
			} else {
				router.push("/");
			}
		}
	}, [isLoggedIn, authLoading, router, fetchUserProfile]);

	// All handlers (performRoleAction, handleSaveNote, etc.) are unchanged
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
			<div className="min-h-screen flex items-center justify-center">
				Loading User Profile...
			</div>
		);
	}

	// Error state
	if (fetchError) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Error: {fetchError}
			</div>
		);
	}

	// No data state
	if (!profileData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
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

	// --- Main Render with new styling ---
	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<header className="mb-8">
				<Link
					href="/dashboard"
					className="text-sm font-medium text-primary dark:text-indigo-400 hover:underline"
				>
					&larr; Back to Dashboard
				</Link>
				<div className="flex items-center mt-4">
					<Image
						src={
							user.avatar
								? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
								: "/default-avatar.svg"
						}
						alt="User avatar"
						width={64}
						height={64}
						className="rounded-full mr-4"
					/>
					<div>
						<h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-50">
							{user.globalName || user.username}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{user.discordEmail}
						</p>
					</div>
				</div>
			</header>

			<main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				{/* Left Column */}
				<div className="lg:col-span-1 space-y-6">
					{/* User Information Card */}
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 p-6">
						<h2 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-50 mb-4">
							User Information
						</h2>
						<ul className="space-y-3 text-sm">
							<li className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Status
								</span>
								{getSubscriptionStatusDisplay(
									user.subscriptionStatus
								)}
							</li>
							<li className="flex justify-between items-center">
								<span className="text-gray-600 dark:text-gray-400">
									Stripe ID
								</span>
								<span className="font-mono text-xs bg-gray-100 dark:bg-dark-700 p-1 rounded">
									{user.stripeCustomerId || "N/A"}
								</span>
							</li>
							<li className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Joined
								</span>
								<span className="text-gray-800 dark:text-gray-200">
									{formatDate(user.createdAt)}
								</span>
							</li>
						</ul>
					</div>

					{/* Role Management Card */}
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 p-6">
						<h2 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-50 mb-4">
							Role Management
						</h2>
						<div className="space-y-3">
							<button
								onClick={handleSyncRoles}
								disabled={actionStatus.loading}
								className="w-full text-sm flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
							>
								<FontAwesomeIcon
									icon={faSyncAlt}
									className={`w-3.5 h-3.5 mr-2 ${
										actionStatus.loading &&
										actionStatus.action === "sync"
											? "animate-spin"
											: ""
									}`}
								/>
								{actionStatus.loading &&
								actionStatus.action === "sync"
									? "Syncing..."
									: "Sync Roles with Stripe"}
							</button>
							<div className="border-t border-gray-200 dark:border-dark-600 pt-3 space-y-2">
								{/* Role Toggles */}
								{Object.entries({
									Data: isDataRoleAssigned,
									Alerts: isAlertsRoleAssigned,
									Bias: isBiasRoleAssigned,
								}).map(
									([roleKey, isAssigned]) =>
										discordRoleIds[
											roleKey.toLowerCase()
										] && (
											<div
												key={roleKey}
												className="flex justify-between items-center text-sm"
											>
												<span
													className={`text-gray-800 dark:text-gray-200 ${
														isAssigned
															? "font-semibold"
															: ""
													}`}
												>{`Weekly ${roleKey}`}</span>
												<button
													onClick={() =>
														isAssigned
															? handleRevokeRole(
																	discordRoleIds[
																		roleKey.toLowerCase()
																	],
																	`Weekly ${roleKey}`
															  )
															: handleAssignRole(
																	discordRoleIds[
																		roleKey.toLowerCase()
																	],
																	`Weekly ${roleKey}`
															  )
													}
													disabled={
														actionStatus.loading
													}
													className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${
														isAssigned
															? "bg-red-500/20 text-red-300 hover:bg-red-500/40"
															: "bg-green-500/20 text-green-300 hover:bg-green-500/40"
													} disabled:opacity-50`}
												>
													{isAssigned
														? "Revoke"
														: "Assign"}
												</button>
											</div>
										)
								)}
							</div>
							{actionStatus.message && (
								<p
									className={`text-xs mt-2 text-center ${
										actionStatus.type === "success"
											? "text-green-500"
											: "text-red-500"
									}`}
								>
									{actionStatus.message}
								</p>
							)}
						</div>
					</div>
					{/* Analytics Properties Card */}
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 p-6">
						<h2 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-50 mb-4">
							Analytics Properties
						</h2>
						{posthog.person ? (
							<ul className="space-y-3 text-sm">
								<li className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										First Seen
									</span>{" "}
									<span className="text-gray-800 dark:text-gray-200">
										{formatDate(posthog.person.created_at)}
									</span>
								</li>
								<li className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Last Seen
									</span>{" "}
									<span className="text-gray-800 dark:text-gray-200">
										{formatDate(
											posthog.person.properties.last_seen
										)}
									</span>
								</li>
								<li className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Location
									</span>{" "}
									<span className="text-gray-800 dark:text-gray-200">{`${
										posthog.person.properties
											.$initial_geoip_city_name || "N/A"
									}, ${
										posthog.person.properties
											.$initial_geoip_country_code || ""
									}`}</span>
								</li>
							</ul>
						) : (
							<p className="text-sm text-gray-400">
								{posthog.error || "No analytics properties."}
							</p>
						)}
					</div>
				</div>

				{/* Right Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Admin Notes Card */}
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 p-6">
						<h2 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-50 mb-4">
							Admin Notes
						</h2>
						<form onSubmit={handleSaveNote} className="mb-6">
							<textarea
								value={newNoteText}
								onChange={(e) => setNewNoteText(e.target.value)}
								placeholder={`Add a note about ${
									user.globalName || user.username
								}...`}
								className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-gray-50 border border-gray-300 dark:border-dark-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
								rows="3"
								disabled={isSubmittingNote}
							/>
							{noteError && (
								<p className="text-xs text-red-500 mt-1">
									{noteError}
								</p>
							)}
							<button
								type="submit"
								disabled={
									isSubmittingNote || !newNoteText.trim()
								}
								className="mt-3 bg-primary hover:bg-primary-darker text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
							>
								{isSubmittingNote ? "Saving..." : "Save Note"}
							</button>
						</form>
						<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
							{user.adminNotes && user.adminNotes.length > 0 ? (
								[...user.adminNotes].reverse().map((note) => (
									<div
										key={note._id}
										className="flex items-start text-sm border-t border-gray-200 dark:border-dark-600 pt-4"
									>
										<div className="flex-shrink-0 w-24 text-right">
											<p className="font-semibold text-gray-800 dark:text-gray-200">
												{note.authorName}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{formatDate(note.createdAt)}
											</p>
										</div>
										<p className="ml-4 pl-4 border-l border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300">
											{note.noteText}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
									No notes have been added for this user.
								</p>
							)}
						</div>
					</div>
					{/* Activity Feed Card */}
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 p-6">
						<h2 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-50 mb-4">
							Live Activity Feed
						</h2>
						<div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
							{posthog.events && posthog.events.length > 0 ? (
								posthog.events.map((event) => (
									<div
										key={event.id}
										className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-dark-700/50"
									>
										<div className="flex-shrink-0 w-8 mr-4 text-center">
											<span
												className="text-lg"
												title={
													event.event === "$pageview"
														? "Page View"
														: "Custom Event"
												}
											>
												{event.event === "$pageview"
													? "📄"
													: "✨"}
											</span>
										</div>
										<div className="flex-grow">
											<p className="font-medium text-gray-800 dark:text-gray-200">
												{event.event}
											</p>
											{event.event === "$pageview" && (
												<p className="font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
													{
														event.properties
															.$current_url
													}
												</p>
											)}
										</div>
										<div className="flex-shrink-0 text-right">
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{formatDate(event.timestamp)}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
									{posthog.error || "No events found."}
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
