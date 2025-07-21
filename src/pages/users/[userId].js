// src/pages/users/[userId].js
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

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
	let className =
		"px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
	switch (status) {
		case "active":
		case "trialing":
			className +=
				" bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
			break;
		case "past_due":
		case "payment_failed":
		case "unpaid":
			className +=
				" bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
			break;
		case "incomplete":
		case "incomplete_expired":
			className +=
				" bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-amber-300";
			break;
		default:
			className +=
				" bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
			text = status === "none" ? "No Subscription" : text;
			break;
	}
	return <span className={className}>{text}</span>;
};

export default function UserProfilePage() {
	const { isLoggedIn, loading: authLoading, token, isOwner } = useAuth();
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
		owner: process.env.NEXT_PUBLIC_OWNER_ROLE_ID,
		ownerInvites: process.env.NEXT_PUBLIC_OWNER_INVITES_ROLE_ID,
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
	const isOwnerRoleAssigned = user.assignedRoleIds?.includes(
		discordRoleIds.owner
	);
	const isOwnerInvitesRoleAssigned = user.assignedRoleIds?.includes(
		discordRoleIds.ownerInvites
	);

	// Animation variants for staggered lists
	const listContainerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
	};
	const listItemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
	};

	const labelClasses = "block text-sm font-medium text-text-primary mb-1";
	const inputClasses =
		"w-full bg-background border border-border rounded-md p-2 focus:ring-2 focus:ring-accent transition";

	// --- Main Render with new styling ---
	return (
		<>
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
			>
				&larr; Back to Dashboard
			</Link>

			<header className="flex items-center gap-4 mb-8">
				<Image
					src={
						user.avatar
							? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
							: "/default-avatar.svg"
					}
					alt="User avatar"
					width={64}
					height={64}
					className="rounded-full bg-content"
				/>
				<div>
					<h1 className="text-3xl font-bold font-heading text-text-primary">
						{user.globalName || user.username}
					</h1>
					<p className="text-base text-text-muted">
						{user.discordEmail}
					</p>
				</div>
			</header>

			<main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				{/* Left Column */}
				<div className="lg:col-span-1 space-y-6">
					<div className="bg-content rounded-xl border border-border p-6">
						<h2 className="text-lg font-bold font-heading text-text-primary mb-4">
							User Information
						</h2>
						<ul className="space-y-3 text-sm">
							<li className="flex justify-between items-center">
								<span className="text-text-muted">Status</span>
								{getSubscriptionStatusDisplay(
									user.subscriptionStatus
								)}
							</li>
							<li className="flex justify-between items-center">
								<span className="text-text-muted">
									Stripe ID
								</span>
								<span className="font-mono text-xs bg-background border border-border p-1 rounded">
									{user.stripeCustomerId || "N/A"}
								</span>
							</li>
							<li className="flex justify-between items-center">
								<span className="text-text-muted">Joined</span>
								<span className="text-text-primary font-medium">
									{formatDate(user.createdAt)}
								</span>
							</li>
						</ul>
					</div>

					<div className="bg-content rounded-xl border border-border p-6">
						<h2 className="text-lg font-bold font-heading text-text-primary mb-4">
							Role Management
						</h2>
						<div className="space-y-3">
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={handleSyncRoles}
								disabled={actionStatus.loading}
								className="w-full text-sm flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-primary font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
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
									: "Sync Roles"}
							</motion.button>
							<div className="border-t border-border pt-3 space-y-2">
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
													className={`text-text-primary ${
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
															? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
															: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
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
							{isOwner && (
								<div className="border-t-2 border-dashed border-accent/30 pt-4 mt-4 space-y-3">
									<h3 className="text-sm font-bold text-accent flex items-center">
										<FontAwesomeIcon
											icon={faUserShield}
											className="w-4 h-4 mr-2"
										/>
										Owner-Level Actions
									</h3>
									{discordRoleIds.owner && (
										<div className="flex justify-between items-center text-sm">
											<span
												className={`flex items-center text-text-primary ${
													isOwnerRoleAssigned
														? "font-semibold text-accent"
														: ""
												}`}
											>
												Owner
											</span>
											<button
												onClick={() =>
													isOwnerRoleAssigned
														? handleRevokeRole(
																discordRoleIds.owner,
																"Owner"
														  )
														: handleAssignRole(
																discordRoleIds.owner,
																"Owner"
														  )
												}
												disabled={actionStatus.loading}
												className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${
													isOwnerRoleAssigned
														? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
														: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
												} disabled:opacity-50`}
											>
												{isOwnerRoleAssigned
													? "Revoke"
													: "Assign"}
											</button>
										</div>
									)}
									{discordRoleIds.ownerInvites && (
										<div className="flex justify-between items-center text-sm">
											<span
												className={`text-text-primary ${
													isOwnerInvitesRoleAssigned
														? "font-semibold"
														: ""
												}`}
											>
												Owner Invites
											</span>
											<button
												onClick={() =>
													isOwnerInvitesRoleAssigned
														? handleRevokeRole(
																discordRoleIds.ownerInvites,
																"Owner Invites"
														  )
														: handleAssignRole(
																discordRoleIds.ownerInvites,
																"Owner Invites"
														  )
												}
												disabled={actionStatus.loading}
												className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${
													isOwnerInvitesRoleAssigned
														? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
														: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
												} disabled:opacity-50`}
											>
												{isOwnerInvitesRoleAssigned
													? "Revoke"
													: "Assign"}
											</button>
										</div>
									)}
								</div>
							)}
							{actionStatus.message && (
								<p
									className={`text-xs mt-2 text-center ${
										actionStatus.type === "success"
											? "text-green-600"
											: "text-destructive"
									}`}
								>
									{actionStatus.message}
								</p>
							)}
						</div>
					</div>

					<div className="bg-content rounded-xl border border-border p-6">
						<h2 className="text-lg font-bold font-heading text-text-primary mb-4">
							Analytics Properties
						</h2>
						{posthog.person ? (
							<ul className="space-y-3 text-sm">
								<li className="flex justify-between">
									<span className="text-text-muted">
										First Seen
									</span>
									<span className="text-text-primary font-medium">
										{formatDate(posthog.person.created_at)}
									</span>
								</li>
								<li className="flex justify-between">
									<span className="text-text-muted">
										Last Seen
									</span>
									<span className="text-text-primary font-medium">
										{formatDate(
											posthog.person.properties.last_seen
										)}
									</span>
								</li>
								<li className="flex justify-between">
									<span className="text-text-muted">
										Location
									</span>
									<span className="text-text-primary font-medium">{`${
										posthog.person.properties
											.$initial_geoip_city_name || "N/A"
									}, ${
										posthog.person.properties
											.$initial_geoip_country_code || ""
									}`}</span>
								</li>
							</ul>
						) : (
							<p className="text-sm text-text-muted">
								{posthog.error || "No analytics properties."}
							</p>
						)}
					</div>
				</div>

				{/* Right Column */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-content rounded-xl border border-border p-6">
						<h2 className="text-lg font-bold font-heading text-text-primary mb-4">
							Admin Notes
						</h2>
						<form onSubmit={handleSaveNote} className="mb-6">
							<textarea
								value={newNoteText}
								onChange={(e) => setNewNoteText(e.target.value)}
								placeholder={`Add a note...`}
								className={`${inputClasses} min-h-[80px]`}
								disabled={isSubmittingNote}
							/>
							{noteError && (
								<p className="text-xs text-destructive mt-1">
									{noteError}
								</p>
							)}
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								type="submit"
								disabled={
									isSubmittingNote || !newNoteText.trim()
								}
								className="mt-3 bg-accent hover:bg-amber-500 text-gray-900 font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
							>
								{isSubmittingNote ? "Saving..." : "Save Note"}
							</motion.button>
						</form>
						<motion.div
							variants={listContainerVariants}
							initial="hidden"
							animate="visible"
							className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
						>
							{user.adminNotes && user.adminNotes.length > 0 ? (
								[...user.adminNotes].reverse().map((note) => (
									<motion.div
										key={note._id}
										className="flex items-start text-sm border-t border-border pt-4"
									>
										<div className="flex-shrink-0 w-24 text-right">
											<p className="font-semibold text-text-primary">
												{note.authorName}
											</p>
											<p className="text-xs text-text-muted">
												{formatDate(note.createdAt)}
											</p>
										</div>
										<p className="ml-4 pl-4 border-l border-border text-text-primary">
											{note.noteText}
										</p>
									</motion.div>
								))
							) : (
								<p className="text-sm text-center text-text-muted py-4">
									No notes have been added for this user.
								</p>
							)}
						</motion.div>
					</div>

					<div className="bg-content rounded-xl border border-border p-6">
						<h2 className="text-lg font-bold font-heading text-text-primary mb-4">
							Live Activity Feed
						</h2>
						<motion.div
							variants={listContainerVariants}
							initial="hidden"
							animate="visible"
							className="space-y-1 max-h-[600px] overflow-y-auto pr-2"
						>
							{posthog.events && posthog.events.length > 0 ? (
								posthog.events.map((event) => (
									<motion.div
										key={event.id}
										variants={listItemVariants}
										className="flex items-center text-sm p-2 rounded-md hover:bg-background"
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
											<p className="font-medium text-text-primary">
												{event.event}
											</p>
											{event.event === "$pageview" && (
												<p className="font-mono text-xs text-text-muted break-all">
													{
														event.properties
															.$current_url
													}
												</p>
											)}
										</div>
										<div className="flex-shrink-0 text-right">
											<p className="text-xs text-text-muted">
												{formatDate(event.timestamp)}
											</p>
										</div>
									</motion.div>
								))
							) : (
								<p className="text-sm text-center text-text-muted py-4">
									{posthog.error || "No events found."}
								</p>
							)}
						</motion.div>
					</div>
				</div>
			</main>
		</>
	);
}
