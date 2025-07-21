// karios-mission-control/src/components/ui/PageHeader.js
import React from "react";

/**
 * Renders a standardized page header.
 * @param {object} props - Component props.
 * @returns {JSX.Element} The rendered PageHeader component.
 */
const PageHeader = ({ title, description }) => (
	<header className="mb-8">
		<h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
			{title}
		</h1>
		{description && (
			<p className="mt-2 text-lg text-text-muted max-w-2xl">
				{description}
			</p>
		)}
	</header>
);

export default PageHeader;
