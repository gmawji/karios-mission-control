// karios-mission-control/src/components/UserTable.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "./ui/StatusBadge";

/**
 * A reusable table for displaying different types of users.
 * @param {object} props - The component props.
 * @param {Array} props.users - The array of user/member objects to display.
 * @param {('full'|'basic'|'bot')} props.type - The type of table to render.
 * @returns {JSX.Element} The rendered UserTable component.
 */
const UserTable = ({ users, type = "full" }) => {
	if (!users || users.length === 0) {
		return (
			<p className="py-8 text-center text-text-muted">
				No users in this category.
			</p>
		);
	}

	const normalizedUsers = users.map((user) => ({
		id: user._id,
		discordId: user.discordId || user.user?.id,
		avatar: user.avatar || user.user?.avatar,
		username: user.username || user.user?.username,
		globalName: user.globalName || user.user?.global_name,
		discordEmail: user.discordEmail,
		subscriptionStatus: user.subscriptionStatus,
	}));

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-sm">
				<thead className="bg-content">
					<tr>
						<th className="px-6 py-3 text-left font-semibold text-text-muted uppercase tracking-wider">
							User
						</th>
						{type === "full" && (
							<th className="px-6 py-3 text-left font-semibold text-text-muted uppercase tracking-wider">
								Email
							</th>
						)}
						{type === "full" && (
							<th className="px-6 py-3 text-left font-semibold text-text-muted uppercase tracking-wider">
								Status
							</th>
						)}
						{type === "bot" && (
							<th className="px-6 py-3 text-left font-semibold text-text-muted uppercase tracking-wider">
								Tag
							</th>
						)}
						<th className="px-6 py-3 text-left font-semibold text-text-muted uppercase tracking-wider">
							Discord ID
						</th>
					</tr>
				</thead>
				<tbody className="bg-content divide-y divide-border">
					{normalizedUsers.map((user) => {
						// --- RESTORED LOGIC ---
						const isClickable = type === "full" || type === "basic";
						let href = "";
						if (type === "full") {
							href = `/users/${user.id}`;
						} else if (type === "basic") {
							href = `/users/initiate/${user.discordId}`;
						}

						const rowContent = (
							<tr
								className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
									isClickable ? "cursor-pointer" : ""
								}`}
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
											<div className="font-medium text-text-primary">
												{user.globalName ||
													user.username}
											</div>
										</div>
									</div>
								</td>
								{type === "full" && (
									<td className="px-6 py-4 whitespace-nowrap text-text-muted">
										{user.discordEmail || "N/A"}
									</td>
								)}
								{type === "full" && (
									<td className="px-6 py-4 whitespace-nowrap">
										<StatusBadge
											status={user.subscriptionStatus}
										/>
									</td>
								)}
								{type === "bot" && (
									<td className="px-6 py-4 whitespace-nowrap">
										<StatusBadge status="bot" />
									</td>
								)}
								<td className="px-6 py-4 whitespace-nowrap text-text-muted font-mono">
									{user.discordId}
								</td>
							</tr>
						);

						// --- RESTORED LOGIC ---
						return isClickable ? (
							<Link
								key={user.discordId}
								href={href}
								legacyBehavior
							>
								{/* Using legacyBehavior to allow the <tr> to be the child of Link */}
								{rowContent}
							</Link>
						) : (
							// Use a React Fragment for the key when the row isn't a link
							<React.Fragment key={user.discordId}>
								{rowContent}
							</React.Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default UserTable;
