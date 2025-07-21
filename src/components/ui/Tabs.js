// karios-mission-control/src/components/ui/Tabs.js
import React from "react";

/**
 * A container for a set of tabs.
 * @param {object} props - Component props.
 * @returns {JSX.Element} The rendered Tabs container.
 */
export const Tabs = ({ children, activeTab, setActiveTab }) => (
	<div className="border-b border-border">
		<nav className="-mb-px flex space-x-6" aria-label="Tabs">
			{React.Children.map(children, (child) =>
				React.cloneElement(child, { activeTab, setActiveTab })
			)}
		</nav>
	</div>
);

/**
 * Represents a single tab button.
 * @param {object} props - Component props.
 * @returns {JSX.Element} The rendered Tab component.
 */
export const Tab = ({ label, name, count, activeTab, setActiveTab }) => (
	<button
		onClick={() => setActiveTab(name)}
		className={`${
			activeTab === name
				? "border-accent text-accent"
				: "border-transparent text-text-muted hover:text-text-primary hover:border-gray-300 dark:hover:border-gray-700"
		} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
	>
		{label}
		{count !== undefined && (
			<span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-text-muted">
				{count}
			</span>
		)}
	</button>
);
