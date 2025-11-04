"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./chat-header";
import { MessagesArea } from "./messages-area";
import { ChatInput } from "./chat-input";
import { chatRooms } from "@/constants/features/live-chat/live-chat.constants";
import {
	GifMessage,
	ImageMessage,
	ChatRoom,
	Message,
	ReplyMessage,
	TextMessage,
} from "@/types/features/live-chat.types";
import { useAppStore } from "@/store/store";
import { RainAnimation } from "./rain-animation";
import { createErrorSystemMessage } from "@/lib/utils/features/live-chat/slash-commands";
import {
	sanitizeMessageContent,
	validateMessageContent,
	validateImageUpload,
	messageRateLimiter,
} from "@/lib/utils/features/live-chat/input-validation";
import { processImageForChat } from "@/lib/utils/features/live-chat/image-persistence";
import { useLiveChatWebSocket } from "@/hooks/useLiveChatWebSocket";
import { useChatHistory } from "@/hooks/useChatHistory";
import {
	convertWebSocketMessageToMessage,
	validateChatMessage,
} from "@/lib/utils/features/live-chat/websocket-message-converter";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslations } from "@/lib/locale-provider";
import LocalStorageService from "@/services/localStorageService";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { toast } from "sonner";

export function LiveChatSidebar() {
	const tChat = useTranslations("chat");
	const tCommon = useTranslations("commonExtra");
	const { isOpen, closeChat, resetUnreadCount } = useAppStore(
		(state) => state.uiDefinition.chat
	);

	const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom>(
		chatRooms[0] // Default to "Global"
	);
	// Initialize messages with empty array - no localStorage persistence
	const initializeMessages = (): Message[] => {
		// Always return empty array - no message persistence
		return [];
	};
	const [messages, setMessages] = useState<Message[]>(initializeMessages);
	const [inputValue, setInputValue] = useState("");
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);
	const [focusedMessageId, setFocusedMessageId] = useState<
		string | undefined
	>();
	const [historyLoaded, setHistoryLoaded] = useState(false);
	const { isLoggedIn, login } = useDynamicAuth();

	// Rain animation state
	const [isRainActive, setIsRainActive] = useState(false);
	const [rainData, setRainData] = useState<{
		amount: number;
		currency: string;
	} | null>(null);

	// WebSocket connection state
	const [connectionStatus, setConnectionStatus] =
		useState<string>("disconnected");

	// Get localStorage service instance
	const localStorageService = useMemo(
		() => LocalStorageService.getInstance(),
		[]
	);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [isHovering, setIsHovering] = useState(false);
	const lastTouchYRef = useRef<number | null>(null);
	const [currentUsername] = useState<string>(() => {
		// Try to get username from stored user data first
		if (typeof window !== "undefined") {
			const userData = localStorageService.getUserData();
			if (userData?.username) {
				return userData.username;
			}

			// Fallback to stored chat username
			const stored = localStorage.getItem("chatUsername");
			if (stored) return stored;

			// Generate a more friendly username as last resort
			const adjectives = [
				"Cool",
				"Smart",
				"Lucky",
				"Happy",
				"Quick",
				"Brave",
				"Swift",
				"Bold",
			];
			const nouns = [
				"Player",
				"Gamer",
				"User",
				"Winner",
				"Star",
				"Hero",
				"Pro",
				"Champion",
			];
			const randomAdj =
				adjectives[Math.floor(Math.random() * adjectives.length)];
			const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
			const randomNum = Math.floor(Math.random() * 1000);
			return `${randomAdj}${randomNoun}${randomNum}`;
		}
		return `User_${Math.floor(Math.random() * 10000)}`;
	});

	// Chat history hook
	const {
		isLoading: isLoadingHistory,
		error: historyError,
		loadChatHistory,
		clearError: clearHistoryError,
	} = useChatHistory(currentUsername);

	// WebSocket integration
	const {
		// connect,
		// disconnect,
		sendMessage: sendWebSocketMessage,
		isConnected,
	} = useLiveChatWebSocket({
		username: currentUsername,
		autoConnect: true,
		onMessageReceived: (wsMessage) => {
			// console.log("📨 Received WebSocket message:", wsMessage);

			try {
				// Convert WebSocket message to internal format
				const message = convertWebSocketMessageToMessage(
					wsMessage,
					currentUsername
				);

				// Add to messages list (avoid duplicates by checking if message already exists)
				setMessages((prev) => {
					const exists = prev.some((m) => m.id === message.id);
					if (exists) {
						console.log(
							"Duplicate message received, ignoring:",
							message.id
						);
						return prev;
					}
					// console.log("Adding new message from WebSocket:", message);
					return [...prev, message];
				});
			} catch (error) {
				console.error(
					"Error processing received WebSocket message:",
					error
				);
			}
		},
		onConnectionStatusChange: (status) => {
			// console.log("🔌 WebSocket status changed:", status);
			setConnectionStatus(status);
		},
	});

	// Track the message count when sidebar was last opened
	const [lastOpenMessageCount, setLastOpenMessageCount] = useState(0);

	// Effect to reset message count when sidebar opens and track current message count
	useEffect(() => {
		if (isOpen) {
			resetUnreadCount();
			setLastOpenMessageCount(messages.length);
		}
	}, [isOpen, resetUnreadCount, messages.length]);

	// Effect to calculate unread messages when sidebar is closed
	useEffect(() => {
		if (!isOpen) {
			const unreadCount = Math.max(
				0,
				messages.length - lastOpenMessageCount
			);
			// Use timeout to prevent infinite loops and ensure stable updates
			const timeoutId = setTimeout(() => {
				useAppStore.setState((state) => {
					if (state.uiDefinition.chat.messageCount !== unreadCount) {
						state.uiDefinition.chat.messageCount = unreadCount;
					}
				});
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isOpen, messages.length, lastOpenMessageCount]);

	// Store username in localStorage
	// useEffect(() => {
	// 	if (typeof window !== "undefined") {
	// 		localStorage.setItem("chatUsername", currentUsername);
	// 	}
	// }, [currentUsername]);
	useEffect(() => {
		// Find nearest scrollable ancestor within the sidebar
		const findScrollableAncestor = (
			elem: Element | null,
			sidebar: HTMLElement | null
		): HTMLElement | null => {
			if (!elem || !sidebar) return null;
			let current: Element | null = elem as Element;
			while (current && current !== sidebar) {
				const el = current as HTMLElement;
				const style = window.getComputedStyle(el);
				const canScrollY =
					(style.overflowY === "auto" ||
						style.overflowY === "scroll") &&
					el.scrollHeight > el.clientHeight;
				if (canScrollY) return el;
				current = el.parentElement;
			}
			return null;
		};

		const handleWheelScroll = (e: WheelEvent) => {
			if (!isHovering || !isOpen) return;
			const target = e.target as Element;
			const sidebar = sidebarRef.current;
			if (!(sidebar && sidebar.contains(target))) return;

			// If inside sidebar, block backdrop scroll unless the inner element can scroll further
			const scrollable = findScrollableAncestor(target, sidebar);
			if (!scrollable) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			const atTop = scrollable.scrollTop <= 0;
			const atBottom =
				scrollable.scrollTop + scrollable.clientHeight >=
				scrollable.scrollHeight - 1; // allow for float rounding
			const scrollingUp = e.deltaY < 0;
			const scrollingDown = e.deltaY > 0;

			if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
				// Prevent scroll chaining to body when at boundaries
				e.preventDefault();
				e.stopPropagation();
			}
		};

		const handleKeydown = (e: KeyboardEvent) => {
			if (!isHovering || !isOpen) return;
			const target = e.target as Element | null;
			const sidebar = sidebarRef.current;
			if (!(sidebar && target && sidebar.contains(target))) return;

			// Don't block typing/navigating inside inputs, textareas, or contenteditable elements
			const tag = (target as HTMLElement).tagName;
			const isEditable =
				tag === "INPUT" ||
				tag === "TEXTAREA" ||
				(target as HTMLElement).isContentEditable;
			if (isEditable) return;

			const keysToBlock = new Set([
				" ", // Space
				"PageUp",
				"PageDown",
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End",
			]);
			if (keysToBlock.has(e.key)) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		const handleTouchStart = (e: TouchEvent) => {
			if (!isHovering || !isOpen) return;
			const target = e.target as Element;
			const sidebar = sidebarRef.current;
			if (!(sidebar && sidebar.contains(target))) return;
			lastTouchYRef.current = e.touches[0]?.clientY ?? null;
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!isHovering || !isOpen) return;
			const target = e.target as Element;
			const sidebar = sidebarRef.current;
			if (!(sidebar && sidebar.contains(target))) return;

			const scrollable = findScrollableAncestor(target, sidebar);
			if (!scrollable) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			const currentY = e.touches[0]?.clientY ?? null;
			if (currentY == null || lastTouchYRef.current == null) return;
			const dy = currentY - lastTouchYRef.current; // positive means moving down (scroll up)
			lastTouchYRef.current = currentY;

			const atTop = scrollable.scrollTop <= 0;
			const atBottom =
				scrollable.scrollTop + scrollable.clientHeight >=
				scrollable.scrollHeight - 1;
			const scrollingUp = dy > 0;
			const scrollingDown = dy < 0;

			if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		if (isHovering && isOpen) {
			document.addEventListener("wheel", handleWheelScroll, {
				passive: false,
			});
			document.addEventListener("touchstart", handleTouchStart, {
				passive: true,
			});
			document.addEventListener("touchmove", handleTouchMove, {
				passive: false,
			});
			document.addEventListener("keydown", handleKeydown, true);
		}

		return () => {
			document.removeEventListener("wheel", handleWheelScroll);
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("keydown", handleKeydown, true);
		};
	}, [isHovering, isOpen]);

	// Load chat history when chat opens or component mounts
	useEffect(() => {
		if (isOpen && !historyLoaded && messages.length === 0) {
			loadChatHistory()
				.then((historyMessages) => {
					if (historyMessages.length > 0) {
						setMessages(historyMessages);
					}
					setHistoryLoaded(true);
				})
				.catch((error) => {
					console.error("Failed to load chat history:", error);
					setHistoryLoaded(true); // Mark as loaded even on error to prevent retries
				});
		}
	}, [
		currentUsername,
		historyLoaded,
		isOpen,
		loadChatHistory,
		messages.length,
	]);

	// Clear history error when it exists
	useEffect(() => {
		if (historyError) {
			const timer = setTimeout(() => {
				clearHistoryError();
			}, 5000); // Clear error after 5 seconds

			return () => clearTimeout(timer);
		}
	}, [historyError, clearHistoryError]);

	const extractTaggedUsers = (content: string): string[] => {
		const tagRegex = /@(\w+)/g;
		const matches = content.match(tagRegex);
		return matches ? matches.map((match) => match.substring(1)) : [];
	};
	const handleTip = (message: Message) => {
		if (!isLoggedIn) {
			login();
			return;
		}
		toast.success(`Tip sent to ${message.username}! 💰`, {
			description: "Feature coming soon - this is a preview",
		});
		setFocusedMessageId(message.id);
		setTimeout(() => setFocusedMessageId(undefined), 3000);
	};
	const handleReply = (message: Message) => {
		if (!isLoggedIn) {
			login();
			return;
		}
		setReplyingTo(message);
		setFocusedMessageId(message.id);
		// Focus the input when replying
		requestAnimationFrame(() => inputRef.current?.focus());
	};
	const generateTextAvatar = (username: string): string => {
		const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "");
		return cleanUsername.length >= 2
			? cleanUsername.substring(0, 2).toUpperCase()
			: cleanUsername.length === 1
			? cleanUsername.toUpperCase() + "X"
			: "XX";
	};
	const handleSendMessage = () => {
		// Block sending while connecting or disconnected
		if (connectionStatus !== "connected") {
			console.warn("Chat is not connected; blocking send.");
			return;
		}
		if (!inputValue.trim()) return;
		if (!isLoggedIn) {
			login();
			return;
		}
		if (!messageRateLimiter.canSendMessage()) {
			const timeUntil = messageRateLimiter.getTimeUntilNextMessage();
			const errorMessage = createErrorSystemMessage(
				`Rate limit exceeded. Please wait ${Math.ceil(
					timeUntil / 1000
				)} seconds before sending another message.`
			);
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}
		if (inputValue.startsWith("/")) {
			// [FEATURE COMMENTED OUT] Slash commands (tip/rain functionality temporarily disabled)
			/*
      const validation = validateSlashCommand(inputValue);
      if (!validation.isValid) {
        const errorMessage = createErrorSystemMessage(
          validation.error!
        );
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const sanitizedInput = validation.sanitized!;
      const availableUsers = getAllUsernames(messages);

      if (sanitizedInput.startsWith("/rain")) {
        const result = parseRainCommand(
          sanitizedInput,
          "You",
          availableUsers
        );

        if (result.success && result.message) {
          if (result.message.type === "rain") {
            // Add the rain message
            setMessages((prev) => [...prev, result.message!]);

            // Add system announcement
            const systemMessage = createRainSystemMessage(
              result.message
            );
            setMessages((prev) => [...prev, systemMessage]);

            // Trigger rain animation
            setRainData({
              amount: result.message.amount,
              currency: result.message.currency,
            });
            setIsRainActive(true);

            // Record message for rate limiting
            messageRateLimiter.recordMessage();
          }
        } else if (result.error) {
          // Add error message
          const errorMessage = createErrorSystemMessage(result.error);
          setMessages((prev) => [...prev, errorMessage]);
        }
      } else if (sanitizedInput.startsWith("/tip")) {
        const result = parseTipCommand(
          sanitizedInput,
          "You",
          availableUsers
        );

        if (result.success && result.message) {
          // Add tip system message
          setMessages((prev) => [...prev, result.message!]);

          // Record message for rate limiting
          messageRateLimiter.recordMessage();
        } else if (result.error) {
          // Add error message
          const errorMessage = createErrorSystemMessage(result.error);
          setMessages((prev) => [...prev, errorMessage]);
        }
      } else {
        // Unknown slash command
        const errorMessage = createErrorSystemMessage(
          "Unknown command. Available commands: /rain <amount> <target>, /tip <amount> <username>"
        );
        setMessages((prev) => [...prev, errorMessage]);
      }
      */

			// For now, treat slash commands as regular messages
			const errorMessage = createErrorSystemMessage(
				tChat("system.slashDisabled")
			);
			setMessages((prev) => [...prev, errorMessage]);

			setInputValue("");
			return;
		}
		const contentValidation = validateMessageContent(inputValue);
		if (!contentValidation.isValid) {
			const errorMessage = createErrorSystemMessage(
				contentValidation.error!
			);
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}

		// Sanitize message content
		const sanitizedContent = sanitizeMessageContent(inputValue);

		// Check for self-tagging and prevent it
		const taggedUsers = extractTaggedUsers(sanitizedContent);
		if (taggedUsers.includes(currentUsername)) {
			const errorMessage = createErrorSystemMessage(
				tChat("system.cannotTagSelf")
			);
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}

		// Handle regular messages and replies (existing logic)
		if (replyingTo) {
			// Create reply message
			const replyMessage: ReplyMessage = {
				id: Date.now().toString(),
				type: "reply",
				userId: "current",
				username: currentUsername,
				avatar: generateTextAvatar(currentUsername),
				timestamp: new Date(),
				content: sanitizedContent,
				country: "",
				ringColor: "ring-blue-500",
				isCurrentUser: true,
				threadId: replyingTo.threadId || `thread-${Date.now()}`,
				referencedMessage: {
					id: replyingTo.id,
					username: replyingTo.username,
					content:
						replyingTo.type === "text"
							? replyingTo.content
							: replyingTo.type === "win"
							? `Won ${replyingTo.amount} ${replyingTo.currency}`
							: replyingTo.type === "emoji"
							? replyingTo.emoji
							: replyingTo.type === "gif"
							? replyingTo.caption || "GIF message"
							: replyingTo.type === "image"
							? replyingTo.caption || "Image"
							: replyingTo.type === "share"
							? replyingTo.content
							: replyingTo.type === "rain"
							? `Rain: ${replyingTo.amount} ${replyingTo.currency}`
							: replyingTo.type === "system"
							? replyingTo.content
							: "",
					type: replyingTo.type,
					avatar: generateTextAvatar(replyingTo.username),
					country: "",
					...(replyingTo.type === "win" && {
						game: replyingTo.game,
						amount: replyingTo.amount,
						currency: replyingTo.currency,
					}),
					...(replyingTo.type === "emoji" && {
						emoji: replyingTo.emoji,
					}),
					...(replyingTo.type === "gif" && {
						gifUrl: replyingTo.gifUrl,
					}),
					...(replyingTo.type === "image" && {
						imageUrl: replyingTo.imageUrl,
					}),
					...(replyingTo.type === "rain" && {
						amount: replyingTo.amount,
						currency: replyingTo.currency,
					}),
				},
			};
			setMessages((prev) => [...prev, replyMessage]);
			setReplyingTo(null);
			setFocusedMessageId(undefined);
			// Send reply via WebSocket if connected
			if (isConnected()) {
				const replyText = `@${replyingTo.username} ${sanitizedContent}`;
				// console.log("📤 Sending reply via WebSocket:", {
				// 	text: replyText,
				// 	sender: currentUsername,
				// });

				if (validateChatMessage(replyText, currentUsername)) {
					const success = sendWebSocketMessage(
						replyText,
						currentUsername
					);
					if (success) {
						// console.log("✅ Reply sent successfully via WebSocket");
					} else {
						console.warn("❌ Failed to send reply via WebSocket");
					}
				} else {
					console.warn(
						"❌ Reply validation failed, not sending via WebSocket"
					);
				}
			} else {
				console.warn(
					"⚠️ WebSocket not connected, reply only stored locally"
				);
			}
		} else {
			// Create regular message
			const newMessage: TextMessage = {
				id: Date.now().toString(),
				type: "text",
				userId: "current",
				username: currentUsername,
				avatar: generateTextAvatar(currentUsername),
				timestamp: new Date(),
				content: sanitizedContent,
				country: "",
				ringColor: "ring-blue-500",
				isCurrentUser: true,
			};

			// Add message locally first (optimistic update)
			setMessages((prev) => [...prev, newMessage]);

			// Send via WebSocket if connected
			if (isConnected()) {
				// console.log("📤 Sending message via WebSocket:", {
				// 	text: sanitizedContent,
				// 	sender: currentUsername,
				// });

				// Validate before sending
				if (validateChatMessage(sanitizedContent, currentUsername)) {
					const success = sendWebSocketMessage(
						sanitizedContent,
						currentUsername
					);
					if (success) {
						// console.log(
						// 	"✅ Message sent successfully via WebSocket"
						// );
					} else {
						console.warn("❌ Failed to send message via WebSocket");
						// Optionally, you could add a retry mechanism or error indicator here
					}
				} else {
					console.warn(
						"❌ Message validation failed, not sending via WebSocket"
					);
				}
			} else {
				console.warn(
					"⚠️ WebSocket not connected, message only stored locally"
				);
			}
		}

		// Record message for rate limiting
		messageRateLimiter.recordMessage();
		setInputValue("");
	};

	// Handle rain animation completion
	const handleRainComplete = () => {
		setIsRainActive(false);
		setRainData(null);
	};

	// Helper function to get all unique usernames from messages (for rain command validation)
	// const getAllUsernames = (messages: Message[]): string[] => {
	// 	const usernames = new Set<string>();
	// 	messages.forEach((msg) => {
	// 		if (
	// 			msg.username &&
	// 			msg.username !== "You" &&
	// 			msg.username !== "System"
	// 		) {
	// 			usernames.add(msg.username);
	// 		}
	// 	});
	// 	return Array.from(usernames);
	// };

	const handleEmojiSelect = (emoji: string) => {
		setInputValue((prev) => prev + emoji);
	};

	const handleGifSelect = (gif: { url: string; title: string }) => {
		const newMessage: GifMessage = {
			id: Date.now().toString(),
			type: "gif",
			userId: "current",
			username: currentUsername,
			avatar: generateTextAvatar(currentUsername),
			timestamp: new Date(),
			gifUrl: gif.url,
			caption: gif.title,
			country: "",
			ringColor: "ring-blue-500",
			isCurrentUser: true,
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const handleImageUpload = async (file: File, caption: string) => {
		// Validate file upload
		const validation = validateImageUpload(file);
		if (!validation.isValid) {
			const errorMessage = createErrorSystemMessage(validation.error!);
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}

		// Rate limiting check
		if (!messageRateLimiter.canSendMessage()) {
			const timeUntil = messageRateLimiter.getTimeUntilNextMessage();
			const errorMessage = createErrorSystemMessage(
				`Rate limit exceeded. Please wait ${Math.ceil(
					timeUntil / 1000
				)} seconds before uploading.`
			);
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}

		// Show processing message
		const processingMessage = createErrorSystemMessage(
			tChat("system.processingImage")
		);
		setMessages((prev) => [...prev, processingMessage]);

		try {
			// Process image for persistence (convert to base64)
			const persistentImageUrl = await processImageForChat(file);

			// Sanitize caption if provided
			const sanitizedCaption = caption
				? sanitizeMessageContent(caption)
				: undefined;

			const messageId = Date.now().toString();

			// Note: Images are now session-only, not persisted to localStorage

			const newMessage: ImageMessage = {
				id: messageId,
				type: "image",
				userId: "current",
				username: currentUsername,
				avatar: generateTextAvatar(currentUsername),
				timestamp: new Date(),
				imageUrl: persistentImageUrl, // Session-only image URL
				caption: sanitizedCaption,
				country: "",
				ringColor: "ring-blue-500",
				isCurrentUser: true,
			};

			// Remove processing message and add the actual image message
			setMessages((prev) => {
				const withoutProcessing = prev.filter(
					(msg) => msg.id !== processingMessage.id
				);
				return [...withoutProcessing, newMessage];
			});

			// Record message for rate limiting
			messageRateLimiter.recordMessage();
		} catch (error) {
			console.error("Error uploading image:", error);

			// Remove processing message and show error
			setMessages((prev) => {
				const withoutProcessing = prev.filter(
					(msg) => msg.id !== processingMessage.id
				);
				const errorMessage = createErrorSystemMessage(
					tChat("system.failedUploadPrefix", {
						message:
							error instanceof Error
								? error.message
								: tChat("system.unknownError"),
					})
				);
				return [...withoutProcessing, errorMessage];
			});
		}
	};

	if (!isOpen) {
		return null; // Don't render anything when closed, header button handles toggle
	}

	return (
		<div
			ref={sidebarRef}
			className="fixed right-0 top-16 bottom-0 w-full sm:w-fit z-50 shadow-2xl flex flex-col bg-sidebar border-l border-sidebar-border backdrop-blur-xl overflow-hidden ios-chat-sidebar"
			style={{
				background: `linear-gradient(to bottom, 
					oklch(from var(--sidebar) l c h / 0.95), 
					oklch(from var(--sidebar) l c h / 0.98))`,
				borderColor: "var(--sidebar-border)",
				// boxShadow: `0 -4px 20px oklch(from var(--ring) l c h / 0.15),
				// 			0 0 40px oklch(from var(--sidebar-ring) l c h / 0.1)`,
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			onTouchStart={() => setIsHovering(true)}
			onTouchEnd={() => setIsHovering(false)}
		>
			<ChatHeader
				currentChatRoom={currentChatRoom}
				onChatRoomChange={setCurrentChatRoom}
				onClose={closeChat}
			/>
			<div className="flex-1 flex flex-col min-h-0 overflow-hidden ">
				<MessagesArea
					messages={messages}
					onReply={handleReply}
					onTip={handleTip}
					currentUsername={currentUsername}
					focusedMessageId={focusedMessageId}
					isLoadingHistory={isLoadingHistory}
					historyError={historyError}
				/>
			</div>
			<div className="flex-shrink-0 relative z-20 overflow-visible">
				{isLoggedIn ? (
					<ChatInput
						inputValue={inputValue}
						onInputChange={setInputValue}
						onSendMessage={handleSendMessage}
						onEmojiSelect={handleEmojiSelect}
						onGifSelect={handleGifSelect}
						onImageUpload={handleImageUpload}
						messages={messages}
						replyingTo={replyingTo}
						onCancelReply={() => {
							setReplyingTo(null);
							setFocusedMessageId(undefined);
						}}
						currentUsername={currentUsername}
						disabled={connectionStatus !== "connected"}
						inputRef={inputRef}
					/>
				) : (
					<div
						className="p-4 border-t bg-card/50"
						style={{
							borderColor: "var(--sidebar-border)",
							background: `linear-gradient(135deg, 
								oklch(from var(--sidebar) l c h / 0.8), 
								oklch(from var(--card) l c h / 0.6))`,
						}}
					>
						<div className="text-center space-y-3">
							<p
								className="text-sm"
								style={{ color: "var(--muted-foreground)" }}
							>
								Join the conversation with other players!
							</p>
							<Button
								onClick={login}
								className="w-full font-medium"
								style={{
									background: `linear-gradient(135deg, var(--primary), oklch(from var(--primary) l c h / 0.8))`,
									color: "var(--primary-foreground)",
									boxShadow: `0 4px 15px oklch(from var(--primary) l c h / 0.3)`,
								}}
								size="lg"
							>
								🔐 Please Log In to Chat
							</Button>
							<p
								className="text-xs"
								style={{ color: "var(--muted-foreground)" }}
							>
								Connect your wallet to start chatting
							</p>
						</div>
					</div>
				)}
				<div
					className="flex items-center justify-between px-3 py-1 text-xs border-t"
					style={{
						borderColor: "var(--sidebar-border)",
						background: `linear-gradient(to right, 
							oklch(from var(--sidebar) l c h / 0.8), 
							oklch(from var(--card) l c h / 0.6))`,
					}}
				>
					<div className="flex items-center gap-2">
						<div
							className="w-2 h-2 rounded-full"
							style={{
								backgroundColor:
									connectionStatus === "connected"
										? "oklch(0.6 0.2 120)" // Green
										: connectionStatus === "connecting" ||
										  connectionStatus === "reconnecting"
										? "oklch(0.6 0.2 60)" // Yellow
										: "oklch(0.55 0.22 25)", // Red
								boxShadow:
									connectionStatus === "connected"
										? "0 0 10px oklch(0.6 0.2 120 / 0.5)"
										: connectionStatus === "connecting" ||
										  connectionStatus === "reconnecting"
										? "0 0 10px oklch(0.6 0.2 60 / 0.5)"
										: "0 0 10px oklch(0.55 0.22 25 / 0.5)",
							}}
						/>
						<span style={{ color: "var(--muted-foreground)" }}>
							{" "}
							{connectionStatus === "connected"
								? tChat("title")
								: connectionStatus === "connecting" ||
								  connectionStatus === "reconnecting"
								? tCommon("connecting")
								: tCommon("offline")}
						</span>
					</div>
					<span style={{ color: "var(--muted-foreground)" }}>
						{currentUsername}
					</span>
				</div>
			</div>

			{/* Rain Animation Overlay */}
			{isRainActive && rainData && (
				<RainAnimation
					isActive={isRainActive}
					amount={rainData.amount}
					currency={rainData.currency}
					onComplete={handleRainComplete}
				/>
			)}
		</div>
	);
}
