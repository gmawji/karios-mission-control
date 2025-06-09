// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
// This component will wrap our entire application and manage the auth state.
export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true); // Add a loading state

	// On initial app load, try to get the token from localStorage
	useEffect(() => {
		// This code only runs on the client-side
		const storedToken = localStorage.getItem("admin-api-token");
		if (storedToken) {
			setToken(storedToken);
		}
		setLoading(false); // Finished loading token from storage
	}, []);

	// Login function: saves the token to state and localStorage
	const login = (apiToken) => {
		localStorage.setItem("admin-api-token", apiToken);
		setToken(apiToken);
	};

	// Logout function: clears the token from state and localStorage
	const logout = () => {
		localStorage.removeItem("admin-api-token");
		setToken(null);
	};

	// The value that will be available to all children components
	const value = {
		token,
		isLoggedIn: !!token, // A handy boolean flag
		loading, // Expose loading state
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

// 3. Create a custom hook to easily use the context
// This hook is a shortcut so components don't have to import useContext and AuthContext every time.
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
