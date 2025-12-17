"use client";

import { useReportWebVitals } from "next/web-vitals";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logWebVitals = (metric: any) => {
	console.dir(metric);
};

export default function WebVitals() {
	useReportWebVitals(logWebVitals);

	return null;
}
