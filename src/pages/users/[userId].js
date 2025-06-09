// src/pages/users/[userId].js

import { useEffect, useState } from "react";
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

	// --- New state for the notes feature ---
	const [newNoteText, setNewNoteText] = useState("");
	const [isSubmittingNote, setIsSubmittingNote] = useState(false);
	const [noteError, setNoteError] = useState("");

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
