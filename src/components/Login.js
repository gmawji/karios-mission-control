// karios-mission-control/src/components/Login.js
import React, { useState } from "react";
import Image from "next/image";

/**
 * Renders the login form UI.
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Login component.
 */
const Login = ({ onLogin, isLoggingIn }) => {
	const [tokenInput, setTokenInput] = useState("");
	const handleSubmit = (e) => {
		e.preventDefault();
		if (tokenInput.trim()) {
			onLogin(tokenInput.trim());
		}
	};

	return (
		<div className="w-full max-w-md">
			<div className="text-center mb-8">
				<Image
					src="/logo-header-light.svg"
					alt="Logo"
					width={180}
					height={48}
					className="dark:hidden mx-auto"
				/>
				<Image
					src="/logo-header-dark.svg"
					alt="Logo"
					width={180}
					height={48}
					className="hidden dark:block mx-auto"
				/>
				<h1 className="mt-6 font-heading text-4xl font-bold text-text-primary">
					Mission Control
				</h1>
				<p className="mt-2 text-lg text-text-muted">
					Please enter your Admin API Token to continue.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-content p-8 rounded-xl shadow-2xl border border-border"
			>
				<div className="mb-6">
					<label
						htmlFor="apiToken"
						className="block text-sm font-medium text-text-primary mb-1"
					>
						API Token
					</label>
					<input
						id="apiToken"
						type="password"
						value={tokenInput}
						onChange={(e) => setTokenInput(e.target.value)}
						required
						className="w-full bg-background border border-border rounded-md p-2 focus:ring-2 focus:ring-accent transition"
						placeholder="Paste your token here..."
					/>
				</div>
				<button
					type="submit"
					disabled={!tokenInput.trim() || isLoggingIn}
					className="w-full bg-accent hover:bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-md transition disabled:opacity-50"
				>
					{isLoggingIn ? "Authenticating..." : "Authenticate"}
				</button>
			</form>
		</div>
	);
};

export default Login;
