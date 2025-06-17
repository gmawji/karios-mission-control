// src/components/UserTable.js
import React from "react";
import Link from "next/link";
import Image from "next/image";

// We'll move the status display helper here so the table is self-contained.
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
		default:
			className +=
				" bg-gray-200 text-gray-800 dark:bg-dark-600 dark:text-gray-200";
			text = status === "none" ? "No Subscription" : text;
			break;
	}
	return <span className={className}>{text}</span>;
};

/**
 * A reusable table for displaying different types of users.
 * @param {Array} users - The array of user/member objects to display.
 * @param {('full'|'basic'|'bot')} type - The type of table to render. 'full' for registered users, 'basic' for others.
 */
const UserTable = ({ users, type = "full" }) => {
	if (!users || users.length === 0) {
		return (
			<p className="text-center text-gray-500 dark:text-gray-400 py-8">
				No users in this category.
			</p>
		);
	}

	const isClickable = type === "full"; // Only registered users have profile pages to link to

	// Normalize user data since it comes from two different sources (Discord API vs our DB)
	const normalizedUsers = users.map((user) => ({
		// The Mongo _id is the canonical ID for our links
		id: user._id,
		// Discord API puts user data under a `user` object
		discordId: user.discordId || user.user?.id,
		avatar: user.avatar || user.user?.avatar,
		username: user.username || user.user?.username,
		globalName: user.globalName || user.user?.global_name,
		// Data only available for registered users
		discordEmail: user.discordEmail,
		subscriptionStatus: user.subscriptionStatus,
		stripeCustomerId: user.stripeCustomerId,
	}));

	return (
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
						{type === "full" && (
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								Email
							</th>
						)}
						{type === "full" && (
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								Status
							</th>
						)}
						{type === "bot" && (
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								Bot Tag
							</th>
						)}
						<th
							scope="col"
							className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Discord ID
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 dark:divide-dark-600">
					{normalizedUsers.map((user) => {
						const rowContent = (
							<tr
								key={user.discordId}
								className={`${
									isClickable
										? "hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer"
										: ""
								} transition-colors`}
							>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<div className="flex-shrink-0 h-10 w-10">
											<Image
												src={
													user.avatar
														? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
														: "/default-avatar.svg"
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
										</div>
									</div>
								</td>
								{type === "full" && (
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
										{user.discordEmail}
									</td>
								)}
								{type === "full" && (
									<td className="px-6 py-4 whitespace-nowrap">
										{getSubscriptionStatusDisplay(
											user.subscriptionStatus
										)}
									</td>
								)}
								{type === "bot" && (
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300">
											BOT
										</span>
									</td>
								)}
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
									{user.discordId}
								</td>
							</tr>
						);

						return isClickable ? (
							<Link
								key={user.id}
								href={`/users/${user.id}`}
								legacyBehavior
							>
								{rowContent}
							</Link>
						) : (
							rowContent
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default UserTable;
