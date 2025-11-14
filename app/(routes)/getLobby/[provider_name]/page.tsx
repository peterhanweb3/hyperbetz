"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { GetLobbyRequestBody } from "@/types/games/getLobby.types";
import { useT } from "@/hooks/useI18n";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

type LoaderProps = { title: string; subtitle?: string };
const LobbyLaunchLoader = ({ title, subtitle }: LoaderProps) => (
	<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
		<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
		<h1 className="text-2xl font-semibold">{title}</h1>
		{subtitle ? (
			<p className="text-muted-foreground mt-2">{subtitle}</p>
		) : null}
	</div>
);

export default function GetLobbyPage() {
	const t = useT();
	const params = useParams();
	const provider_name = decodeURIComponent(
		String(params.provider_name || "")
	);

	const [error, setError] = useState<string | null>(null);
	const launchAttempted = useRef(false);

	useEffect(() => {
		if (launchAttempted.current) return;
		launchAttempted.current = true;

		const launchLobby = async () => {
			const storage = LocalStorageService.getInstance();
			const userData = storage.getUserData();
			const authToken = getAuthToken();

			if (!authToken || !userData?.username || !provider_name) {
				console.error("Missing authToken, userData, or provider_name");
				setError(t("getLobby.invalidSession"));
				return;
			}

			try {
				const api = ApiService.getInstance();
				const requestBody: GetLobbyRequestBody = {
					api_key: "",
					username: userData.username,
					provider_name: provider_name,
					password: process.env
						.NEXT_PUBLIC_GAME_URL_API_PASSWORD as string,
				};

				const response = await api.getLobby(requestBody);

				if (response.error === false) {
					// console.log(Object.keys(response.data.url));
					// window.location.replace(response.data.url);
					window.open(response.data.url, "_blank");
					window.location.href = `/`;
				} else {
					console.error("Error entering lobby:", response.message);
					setError(
						t("getLobby.failedPrefix", {
							message: response.message,
						})
					);
				}
			} catch (err) {
				console.error("Lobby launch failed:", err);
				setError("error");
			}
		};

		launchLobby();
	}, [provider_name, t]);

	if (error) {
		console.error("Error launching lobby:", error);
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
				<h1 className="text-3xl font-semibold">
					{t("getLobby.launchFailedTitle")}
				</h1>
				<p className="mt-4 max-w-md text-center">{error}</p>
				<Button asChild variant="outline" className="mt-6">
					<Link href="/">{t("getLobby.returnHome")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<LobbyLaunchLoader
			title={t("getLobby.enteringLobby")}
			subtitle={t("getLobby.connectingWait")}
		/>
	);
}
