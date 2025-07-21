// karios-mission-control/src/hooks/useBodyScrollLock.js
import { useEffect } from "react";

/**
 * A custom React hook to lock and unlock body scrolling.
 * @param {boolean} isLocked - A boolean indicating whether the scroll should be locked.
 */
function useBodyScrollLock(isLocked) {
	useEffect(() => {
		const originalStyle = window.getComputedStyle(document.body).overflow;
		if (isLocked) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = originalStyle;
		};
	}, [isLocked]);
}

export default useBodyScrollLock;
