// src/pages/dashboard.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext"; // Import our custom auth hook

export default function DashboardPage() {
	const { isLoggedIn, loading, logout, token } = useAuth();
	const router = useRouter();

	// This effect handles the route protection.
	useEffect(() => {
		// We wait for the loading to be false, then check if the user is logged in.
		if (!loading && !isLoggedIn) {
			router.push("/"); // If not logged in, redirect to the login page.
		}
	}, [isLoggedIn, loading, router]);

	// While the auth state is loading, we show a generic loading screen.
	// This prevents a "flicker" of the protected content before the redirect happens.
	if (loading || !isLoggedIn) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				Loading...
			</div>
		);
	}

	// If we get here, the user is authenticated.
	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<header className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<button
					onClick={logout}
					className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
				>
					Logout
				</button>
			</header>

			<main>
				<p className="text-gray-300">
					Welcome to Karios Mission Control.
				</p>
				<p className="text-gray-400 text-xs mt-4">
					Your API token is active.
				</p>
				{/* We will build the user list table here in the next step. */}
			</main>
		</div>
	);
}
