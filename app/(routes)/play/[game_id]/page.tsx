"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameType } from "@/types/games/gameList.types";
import { GetGameUrlRequestBody } from "@/types/games/gameUrl.types";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { useT } from "@/hooks/useI18n";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

const GameLaunchLoader = ({ message }: { message: string }) => (
	<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
		<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
		<h1 className="text-2xl font-semibold">{message}</h1>
		<p className="text-muted-foreground mt-2">{message}</p>
	</div>
);

export default function PlayGamePage() {
	const t = useT();
	const params = useParams();
	const searchParams = useSearchParams();

	const [error, setError] = useState<string | null>(null);

	// A ref to ensure the launch logic only ever runs once per page load.
	const launchAttempted = useRef(false);

	useEffect(() => {
		// We only want this to run once.
		if (launchAttempted.current) {
			return;
		}
		launchAttempted.current = true;

		const launchGame = async () => {
			// --- THE NEW, FASTER DATA RETRIEVAL STRATEGY ---
			// 1. Instantiate the service.
			const storage = LocalStorageService.getInstance();

			// 2. Get user data and auth token DIRECTLY and SYNCHRONOUSLY from localStorage.
			const userData = storage.getUserData();
			const authToken = getAuthToken();

			// 3. Get game-specific data from the URL.
			const game_id = String(params.game_id || "");
			const vendor_name = searchParams.get("vendor");
			const game_type = searchParams.get("gameType");
			const gp_id = searchParams.get("gpId");

			// --- ROBUST VALIDATION OF THE CACHED DATA ---
			// This check is now the single point of failure. If the required data isn't in localStorage, it fails.
			if (
				!authToken ||
				!userData?.username ||
				!game_id ||
				!vendor_name ||
				!game_type
			) {
				setError(t("play.invalidSession"));
				return;
			}

			try {
				const api = ApiService.getInstance();
				const requestBody: GetGameUrlRequestBody = {
					api_key: "",
					username: userData.username, // Use the username from our own cached data
					password: process.env
						.NEXT_PUBLIC_GAME_URL_API_PASSWORD as string,
					vendor_name: vendor_name as string,
					game_type: game_type as GameType,
					gp_id: gp_id || "-",
					game_id: game_id,
				};

				const response = await api.getGameUrl(requestBody, authToken);

				if (response.error === false) {
					window.location.replace(response.data.url);
				} else {
					setError(
						`${t("errors.general")} ${
							response.message ?? ""
						}`.trim()
					);
				}
			} catch (err) {
				console.error("Game launch failed:", err);
				setError(t("errors.general"));
			}
		};

		launchGame();

		// The dependency array is empty because this effect should only run once on mount.
	}, [params.game_id, searchParams, t]);

	// --- Render UI ---
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
				<h1 className="text-3xl font-semibold">
					{t("play.launchFailedTitle")}
				</h1>
				<p className="mt-4 max-w-md text-center">{error}</p>
				<Button asChild variant="outline" className="mt-6">
					<Link href="/">{t("play.returnHome")}</Link>
				</Button>
			</div>
		);
	}

	// Since data retrieval from localStorage is nearly instant, we can show a consistent message.
	return <GameLaunchLoader message={t("play.connecting")} />;
}
