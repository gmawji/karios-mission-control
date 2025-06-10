// src/pages/dashboard.js

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// --- Recreated Status Badge Component ---
// This helper function provides colored status badges for better readability.
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

export default function DashboardPage() {
	const { isLoggedIn, loading: authLoading, logout, token } = useAuth();
	const router = useRouter();

	// --- State for data, loading, and errors ---
	const [users, setUsers] = useState([]);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	// --- New state for pagination ---
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);

	// Route protection
	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
	}, [isLoggedIn, authLoading, router]);

	// Data fetching logic, now including pagination
	const fetchUsers = useCallback(
		async (pageToFetch) => {
			if (token) {
				setFetchLoading(true);
				setFetchError(null);
				try {
					const queryParams = new URLSearchParams({
						page: pageToFetch.toString(),
						limit: "10",
					});
					const response = await fetch(
						`${
							process.env.NEXT_PUBLIC_MAIN_APP_API_URL
						}/admin/users?${queryParams.toString()}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.message || "Failed to fetch users."
						);
					}
					const data = await response.json();
					setUsers(data.users || []);
					setCurrentPage(data.currentPage);
					setTotalPages(data.totalPages);
					setTotalUsers(data.totalUsers);
				} catch (error) {
					setFetchError(error.message);
				} finally {
					setFetchLoading(false);
				}
			}
		},
		[token]
	);

	// Effect to fetch users when the page changes
	useEffect(() => {
		fetchUsers(currentPage);
	}, [currentPage, fetchUsers]);

	// While auth state is loading
	if (authLoading || !isLoggedIn) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	// Main component render
	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<header className="mb-8">
				<h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-gray-50">
					Mission Control Dashboard
				</h1>
				<p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
					Viewing {users.length} of {totalUsers} total users.
				</p>
			</header>

			<main>
				{fetchLoading && !users.length ? (
					<p className="text-gray-500 dark:text-gray-400">
						Loading users...
					</p>
				) : fetchError ? (
					<p className="text-red-500">Error: {fetchError}</p>
				) : (
					<div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50 dark:bg-dark-700/50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											User
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Email
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Stripe Customer ID
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-dark-600">
									{users.map((user) => (
										<Link
											key={user._id}
											href={`/users/${user._id}`}
											legacyBehavior
										>
											<tr className="hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors">
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
															<div className="text-sm font-medium text-gray-900 dark:text-gray-50">
																{user.globalName ||
																	user.username}
															</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																ID:{" "}
																{user.discordId}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
													{user.discordEmail}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{getSubscriptionStatusDisplay(
														user.subscriptionStatus
													)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
													{user.stripeCustomerId ||
														"N/A"}
												</td>
											</tr>
										</Link>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* --- Pagination Controls --- */}
				{totalPages > 1 && (
					<div className="mt-6 flex items-center justify-between">
						<button
							onClick={() => setCurrentPage((p) => p - 1)}
							disabled={currentPage <= 1 || fetchLoading}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-dark-600 dark:text-gray-200 border border-gray-300 dark:border-dark-500 rounded-md hover:bg-gray-50 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() => setCurrentPage((p) => p + 1)}
							disabled={currentPage >= totalPages || fetchLoading}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-dark-600 dark:text-gray-200 border border-gray-300 dark:border-dark-500 rounded-md hover:bg-gray-50 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
