// src/pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Login from "@/components/Login"; // Import our new component

export default function LoginPage() {
	const { login, isLoggedIn, loading } = useAuth();
	const router = useRouter();

	// Adding a state here to pass the submitting status to the component
	const [isSubmitting, setIsSubmitting] = useState(false);

	// This effect still handles the redirect if a user is already logged in
	useEffect(() => {
		if (!loading && isLoggedIn) {
			router.push("/dashboard");
		}
	}, [isLoggedIn, loading, router]);

	// The login logic is simplified and passed down to the Login component
	const handleLogin = (token) => {
		setIsSubmitting(true);
		login(token);
		// The redirect will be handled by the useEffect above once isLoggedIn becomes true
	};

	// While checking localStorage for a token, show a simple loader
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
				<p className="text-gray-500 dark:text-gray-400">
					Initializing...
				</p>
			</div>
		);
	}

	// If we're not loading and not logged in, we render the main page layout
	// which now contains our Login component.
	return (
		<div className="min-h-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
			{/* This check prevents the login form from flashing on screen for a moment
        before the redirect effect kicks in for an already logged-in user.
      */}
			{!isLoggedIn && (
				<Login onLogin={handleLogin} isLoggingIn={isSubmitting} />
			)}
		</div>
	);
}
