// src/pages/dashboard.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import Image from "next/image"; // Import Image for avatars
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
	const { isLoggedIn, loading: authLoading, logout, token } = useAuth();
	const router = useRouter();

	// --- New state for fetching and storing user data ---
	const [users, setUsers] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	// This effect handles the route protection.
	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
	}, [isLoggedIn, authLoading, router]);

	// --- New effect for fetching user data ---
	useEffect(() => {
		// Only fetch data if we have a token
		if (token) {
			const fetchUsers = async () => {
				setFetchLoading(true);
				setFetchError(null);
				try {
					// Fetch from the main application's API endpoint
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users`,
						{
							headers: {
								// Add the Authorization header with our token
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.message || "Failed to fetch users."
						);
					}

					const data = await response.json();
					setUsers(data.users || []); // Set the user data in state
				} catch (error) {
					console.error("Fetch users error:", error);
					setFetchError(error.message);
				} finally {
					setFetchLoading(false);
				}
			};

			fetchUsers();
		}
	}, [token]); // This effect re-runs if the token changes

	// While auth state is loading, show a generic loading screen
	if (authLoading || !isLoggedIn) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				Loading...
			</div>
		);
	}

	// Main component render
	return (
		<div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
			<header className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">User Dashboard</h1>
				<button
					onClick={logout}
					className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
				>
					Logout
				</button>
			</header>

			<main>
				{/* Conditional rendering based on fetch state */}
				{fetchLoading ? (
					<p className="text-gray-400">Loading users...</p>
				) : fetchError ? (
					<p className="text-red-400">Error: {fetchError}</p>
				) : (
					<div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
						<table className="min-w-full">
							<thead className="bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
										Stripe Customer
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-700">
								{users.map((user) => (
									// Each row is a link to the future user detail page
									<Link
										key={user._id}
										href={`/users/${user._id}`}
										legacyBehavior
									>
										<tr className="hover:bg-gray-700/50 cursor-pointer transition-colors">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														<Image
															src={
																user.avatar
																	? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
																	: "/default-avatar.png"
															}
															alt="User avatar"
															width={40}
															height={40}
															className="rounded-full"
														/>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-white">
															{user.globalName ||
																user.username}
														</div>
														<div className="text-sm text-gray-400">
															ID: {user.discordId}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
												{user.discordEmail}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
														user.subscriptionStatus ===
														"active"
															? "bg-green-900 text-green-200"
															: "bg-gray-700 text-gray-300"
													}`}
												>
													{user.subscriptionStatus}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
												{user.stripeCustomerId || "N/A"}
											</td>
										</tr>
									</Link>
								))}
							</tbody>
						</table>
					</div>
				)}
			</main>
		</div>
	);
}
