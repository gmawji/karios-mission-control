// src/pages/users/initiate/[discordId].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function InitiateProfilePage() {
	const { token, isLoggedIn, loading: authLoading } = useAuth();
	const router = useRouter();
	const { discordId } = router.query;

	const [error, setError] = useState("");

	// This effect orchestrates the entire process
	useEffect(() => {
		// Only proceed if we have the token and discordId
		if (token && discordId) {
			const findOrCreateUser = async () => {
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/admin/users/find-or-create`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({ discordId: discordId }),
						}
					);

					const data = await response.json();
					if (!response.ok) {
						throw new Error(
							data.message || "Failed to initialize profile."
						);
					}

					// On success, we get the permanent MongoDB user ID and redirect
					const { userId } = data;
					if (userId) {
						// Use replace instead of push so the user can't click "back" to this page
						router.replace(`/users/${userId}`);
					} else {
						throw new Error("API did not return a valid user ID.");
					}
				} catch (err) {
					console.error("Initiate profile error:", err);
					setError(err.message);
				}
			};

			findOrCreateUser();
		}

		// If auth is done loading and user is not logged in, send them to login page.
		if (!authLoading && !isLoggedIn) {
			router.push("/");
		}
	}, [token, discordId, router, isLoggedIn, authLoading]);

	// Display a loading or error state to the admin
	return (
		<div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
			{error ? (
				<>
					<h1 className="text-2xl font-bold text-red-500 mb-4">
						Error
					</h1>
					<p className="text-gray-600 dark:text-gray-300 max-w-md">
						{error}
					</p>
					<Link
						href="/dashboard"
						className="mt-6 text-sm text-indigo-500 hover:underline"
					>
						&larr; Return to Dashboard
					</Link>
				</>
			) : (
				<>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
						Initializing User Profile...
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Please wait, we&apos;re getting things ready.
					</p>
				</>
			)}
		</div>
	);
}
