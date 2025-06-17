// src/context/AuthContext.js

import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from "react";
import { useRouter } from "next/router";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(null);
	const [adminUser, setAdminUser] = useState(null); // New state for the admin's own profile
	const [loading, setLoading] = useState(true);
	const router = useRouter(); // Using router for logout redirect

	// --- function to fetch the admin's profile ---
	const fetchAdminProfile = useCallback(async (currentToken) => {
		if (!currentToken) return; // Don't fetch if there's no token
		try {
			const apiUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/auth/me`;
			console.log("Attempting to fetch from URL:", apiUrl);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_MAIN_APP_API_URL}/auth/me`,
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				}
			);
			if (response.ok) {
				const data = await response.json();
				setAdminUser(data); // Store the admin's profile
			} else {
				// This can happen if the token is invalid/expired
				console.error(
					"Failed to fetch admin profile, token may be invalid."
				);
				logout(); // Log out if the token doesn't work
			}
		} catch (error) {
			console.error("Error fetching admin profile:", error);
			logout(); // Log out on network error
		}
	}, []); // useCallback depends on logout, but logout is stable. Let's refine this.

	// On initial app load, try to get the token and then the profile
	useEffect(() => {
		const initializeAuth = async () => {
			const storedToken = localStorage.getItem("admin-api-token");
			if (storedToken) {
				setToken(storedToken);
				await fetchAdminProfile(storedToken); // Fetch profile using the stored token
			}
			setLoading(false);
		};
		initializeAuth();
	}, [fetchAdminProfile]); // Run once on mount

	// Login function: now also fetches the profile
	const login = async (apiToken) => {
		localStorage.setItem("admin-api-token", apiToken);
		setToken(apiToken);
		await fetchAdminProfile(apiToken); // Fetch profile immediately after login
	};

	// Logout function: now also clears the admin user profile
	const logout = () => {
		localStorage.removeItem("admin-api-token");
		setToken(null);
		setAdminUser(null); // Clear the user profile
		router.push("/"); // Redirect to login page on logout
	};

	// The value that will be available to all children components
	const value = {
		token,
		adminUser, // The logged-in admin's profile { id, discordId, name, avatar, isOwner }
		isOwner: !!adminUser?.isOwner, // A convenient boolean for checking owner status
		isLoggedIn: !!token && !!adminUser, // User is only truly logged in if we have a token AND their profile
		loading,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
