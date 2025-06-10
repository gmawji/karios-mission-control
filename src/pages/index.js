// src/pages/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext"; // Import our custom auth hook

export default function LoginPage() {
	const [tokenInput, setTokenInput] = useState("");
	const { login, isLoggedIn, loading } = useAuth(); // Get what we need from the auth context
	const router = useRouter();

	// This effect checks if the user is already logged in.
	// If they are, it redirects them away from the login page to the dashboard.
	useEffect(() => {
		// We wait until the loading is false to ensure we have checked localStorage
		if (!loading && isLoggedIn) {
			router.push("/dashboard");
		}
	}, [isLoggedIn, loading, router]);

	// This function is called when the login form is submitted.
	const handleLogin = (e) => {
		e.preventDefault();
		if (tokenInput.trim()) {
			login(tokenInput.trim()); // Call the login function from our context
		}
	};

	// While we check for a stored token, we can show a loading indicator.
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				Loading...
			</div>
		);
	}

	// If the user is not logged in, show the login form.
	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold dark:text-gray-100">
					Karios Mission Control
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-2">
					Please enter your Admin API Token to continue.
				</p>
			</div>
			<form
				onSubmit={handleLogin}
				className="mt-8 bg-white dark:bg-dark-700 p-8 border border-gray-300 dark:border-dark-450 rounded-xl shadow-xl w-full max-w-sm"
			>
				<div className="mb-4">
					<label
						htmlFor="apiToken"
						className="block text-sm font-medium text-gray-300 mb-2"
					>
						API Token
					</label>
					<input
						id="apiToken"
						type="password" // Use password type to obscure the token
						value={tokenInput}
						onChange={(e) => setTokenInput(e.target.value)}
						required
						className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Paste your token here..."
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
				>
					Authenticate
				</button>
			</form>
		</div>
	);
}
