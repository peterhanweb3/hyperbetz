"use client";

import { useEffect, useState } from "react";

type IdleCallback = (deadline: {
	didTimeout: boolean;
	timeRemaining: () => number;
}) => void;
type IdleRequestOptions = { timeout?: number };

type UseDeferredRenderOptions = {
	delay?: number;
	timeout?: number;
};

/**
 * Defers rendering work until the browser is idle (or a fallback timeout).
 * Useful for lazy-mounting heavy client components without blocking FCP/TBT.
 */
export function useDeferredRender(options: UseDeferredRenderOptions = {}) {
	const { delay = 0, timeout = 1200 } = options;
	const [ready, setReady] = useState(false);

	useEffect(() => {
		let cancelled = false;
		let timerId: ReturnType<typeof setTimeout> | null = null;
		let idleId: number | null = null;

		const run = () => {
			if (!cancelled) {
				setReady(true);
			}
		};

		const schedule = () => {
			const win = window as typeof window & {
				requestIdleCallback?: (
					callback: IdleCallback,
					options?: IdleRequestOptions
				) => number;
				cancelIdleCallback?: (handle: number) => void;
			};

			const invoke = () => {
				if (win.requestIdleCallback) {
					idleId = win.requestIdleCallback(run, { timeout });
				} else {
					timerId = setTimeout(run, timeout);
				}
			};

			if (delay > 0) {
				timerId = setTimeout(() => {
					invoke();
				}, delay);
			} else {
				invoke();
			}
		};

		schedule();

		return () => {
			cancelled = true;
			if (timerId) {
				clearTimeout(timerId);
			}
			if (
				idleId &&
				typeof window !== "undefined" &&
				window.cancelIdleCallback
			) {
				window.cancelIdleCallback(idleId);
			}
		};
	}, [delay, timeout]);

	return ready;
}

export default useDeferredRender;
