// src/components/Login.js
import React, { useState } from "react";

// The Login component is now only responsible for the form UI and its own state.
// It receives the `onLogin` function as a prop from the page.
const Login = ({ onLogin, isLoggingIn }) => {
	const [tokenInput, setTokenInput] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (tokenInput.trim()) {
			onLogin(tokenInput.trim());
		}
	};

	return (
		<div className="w-full max-w-sm">
			<div className="text-center mb-8">
				<h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-gray-50">
					Mission Control
				</h1>
				<p className="text-gray-600 dark:text-gray-300 mt-2">
					Please enter your Admin API Token to continue.
				</p>
			</div>

			{/* The form card uses the same styling as your main site for consistency */}
			<form
				onSubmit={handleSubmit}
				className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-600"
			>
				<div className="mb-6">
					<label
						htmlFor="apiToken"
						className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
					>
						API Token
					</label>
					<input
						id="apiToken"
						type="password" // Use password type to obscure the token
						value={tokenInput}
						onChange={(e) => setTokenInput(e.target.value)}
						required
						className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-gray-50 border border-gray-300 dark:border-dark-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-darker"
						placeholder="Paste your token here..."
					/>
				</div>
				<button
					type="submit"
					disabled={!tokenInput.trim() || isLoggingIn}
					className="w-full bg-primary hover:bg-primary-darker text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoggingIn ? "Authenticating..." : "Authenticate"}
				</button>
			</form>
		</div>
	);
};

export default Login;
