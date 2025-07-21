// karios-mission-control/src/components/ui/ScrollReveal.js
import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Animates its children into view when they are scrolled to.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to animate.
 * @param {number} [props.delay=0] - An optional delay in seconds.
 * @returns {JSX.Element} The rendered ScrollReveal component.
 */
const ScrollReveal = ({ children, delay = 0 }) => {
	const controls = useAnimation();
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	React.useEffect(() => {
		if (inView) {
			controls.start("visible");
		}
	}, [controls, inView]);

	const variants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: "easeOut", delay },
		},
	};

	return (
		<motion.div
			ref={ref}
			animate={controls}
			initial="hidden"
			variants={variants}
		>
			{children}
		</motion.div>
	);
};

export default ScrollReveal;
