// src/pages/_app.js

import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Import our new AuthProvider

// We are not using PostHog in this file yet, but we can set it up now for consistency.
// Note: This would be a separate PostHog project or have different logic if needed.
// For now, we'll omit the detailed PostHog setup here to focus on the auth flow.

function MyApp({ Component, pageProps }) {
	return (
		// Wrap the entire application with the AuthProvider.
		// Now, any page or component can access the auth state using the useAuth() hook.
		<AuthProvider>
			<Component {...pageProps} />
		</AuthProvider>
	);
}

export default MyApp;
