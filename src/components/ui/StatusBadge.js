// karios-mission-control/src/components/ui/StatusBadge.js
import React from "react";

/**
 * A reusable, themed status badge.
 * @param {object} props - Component props.
 * @returns {JSX.Element} The rendered StatusBadge component.
 */
const StatusBadge = ({ status }) => {
	status = status ? status.toLowerCase() : "none";
	let text =
		status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
	let className =
		"px-2.5 py-1 text-xs font-semibold rounded-full inline-block";

	switch (status) {
		case "active":
		case "trialing":
			className +=
				" bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
			break;
		case "past_due":
		case "payment_failed":
		case "unpaid":
			className +=
				" bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
			break;
		case "bot":
			className +=
				" bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
			text = "Bot";
			break;
		default:
			className +=
				" bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
			text = status === "none" ? "No Subscription" : text;
			break;
	}
	return <span className={className}>{text}</span>;
};

export default StatusBadge;
