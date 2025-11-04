"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { Message } from "@/types/features/live-chat.types";
import { useTranslations } from "@/lib/locale-provider";

interface MessagesAreaProps {
	messages: Message[];
	onReply: (message: Message) => void;
	onTip?: (message: Message) => void;
	focusedMessageId?: string;
	currentUsername?: string;
	isLoadingHistory?: boolean;
	historyError?: string | null;
}

export function MessagesArea({
	messages,
	onReply,
	onTip,
	focusedMessageId,
	currentUsername,
	isLoadingHistory = false,
	historyError = null,
}: MessagesAreaProps) {
	const t = useTranslations("chat");
	const scrollAreaRef = React.useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	React.useEffect(() => {
		const scrollToBottom = () => {
			if (scrollAreaRef.current) {
				// Try multiple selectors to find the scrollable viewport
				const viewport =
					scrollAreaRef.current.querySelector(
						"[data-radix-scroll-area-viewport]"
					) ||
					scrollAreaRef.current.querySelector(
						"[data-slot='scroll-area-viewport']"
					);

				if (viewport) {
					// Use requestAnimationFrame to ensure DOM is updated
					requestAnimationFrame(() => {
						viewport.scrollTop = viewport.scrollHeight;
					});
				}
			}
		};

		// Scroll immediately
		scrollToBottom();

		// Also scroll after a short delay to handle any dynamic content loading
		const timeoutId = setTimeout(scrollToBottom, 100);

		return () => clearTimeout(timeoutId);
	}, [messages]);

	return (
		<div className="h-full flex flex-col bg-gradient-to-b from-background/50 to-card/30 overflow-hidden">
			<ScrollArea
				ref={scrollAreaRef}
				className="flex-1 h-full messages-scrollable scrollbar-hide overflow-auto"
				style={{ maxHeight: "100%" }}
			>
				<div className="py-2 px-1 min-h-full overflow-hidden">
					{isLoadingHistory ? (
						<div className="text-center text-muted-foreground py-8 relative min-h-[200px] flex flex-col justify-center">
							{/* Background decoration */}
							<div className="absolute inset-0 flex items-center justify-center opacity-5">
								<div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse" />
							</div>
							<div className="relative z-10">
								<div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								<p className="text-lg font-medium mb-2 casino-heading">
									{t("messages.loadingHistory")}
								</p>
								<p className="text-sm opacity-75">
									{t("messages.loadingHistorySubtitle")}
								</p>
							</div>
						</div>
					) : historyError ? (
						<div className="text-center text-muted-foreground py-8 relative min-h-[200px] flex flex-col justify-center">
							{/* Background decoration */}
							<div className="absolute inset-0 flex items-center justify-center opacity-5">
								<div className="w-32 h-32 rounded-full bg-destructive/20 animate-pulse" />
							</div>
							<div className="relative z-10">
								<MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
								<p className="text-lg font-medium mb-2 casino-heading text-destructive">
									{t("messages.historyError")}
								</p>
								<p className="text-sm opacity-75">
									{historyError}
								</p>
							</div>
						</div>
					) : messages.length === 0 ? (
						<div className="text-center text-muted-foreground py-8 relative min-h-[200px] flex flex-col justify-center">
							{/* Background decoration */}
							<div className="absolute inset-0 flex items-center justify-center opacity-5">
								<div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse" />
							</div>
							<div className="relative z-10">
								<MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary animate-float" />
								<p className="text-lg font-medium mb-2 casino-heading">
									{t("messages.emptyTitle")}
								</p>
								<p className="text-sm opacity-75">
									{t("messages.emptySubtitle")}
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-1 overflow-hidden">
							{messages.map((message) => (
								<MessageItem
									key={message.id}
									message={message}
									onReply={onReply}
									onTip={onTip}
									currentUsername={currentUsername}
									isFocused={message.id === focusedMessageId}
								/>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
