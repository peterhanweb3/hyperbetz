import { io, Socket } from "socket.io-client";
import {
	AutoDepoWdStatusPayload,
	TransactionNotificationData,
} from "@/types/blockchain/transactions.types";
import {
	Callback,
	LiveChatMessagePayload,
	ReceivedChatMessage,
} from "@/types/websockets/websockets.types";
import { Message } from "@/types/features/live-chat.types";
/*
 * WebSocketService.ts
 * This service manages WebSocket connections and subscriptions for transaction notifications.
 * It uses Socket.IO for real-time communication with the backend.
 */
class WebSocketService {
	private static instance: WebSocketService;
	private socket: Socket | null = null;
	private chatSocket: Socket | null = null; // Separate socket for live chat
	private reconnectTimeout: NodeJS.Timeout | null = null;
	private chatReconnectTimeout: NodeJS.Timeout | null = null;
	private reconnectAttempts = 0;
	private chatReconnectAttempts = 0;
	private readonly MAX_RECONNECT_ATTEMPTS = 5;

	// Cache last known identifiers to avoid localStorage usage on reconnect
	private lastUserId: string | null = null;
	private lastChatUsername: string | null = null;

	// Track connection status explicitly (instead of abusing function name checks)
	private status:
		| "idle"
		| "connecting"
		| "connected"
		| "reconnecting"
		| "disconnected"
		| "error" = "idle";
	private chatStatus:
		| "idle"
		| "connecting"
		| "connected"
		| "reconnecting"
		| "disconnected"
		| "error" = "idle";

	// Callbacks sets for the subscription model

	// For deposit notifications
	private depositCallbacks = new Set<Callback<TransactionNotificationData>>();
	// For withdrawal notifications
	private withdrawCallbacks = new Set<
		Callback<TransactionNotificationData>
	>();
	// For auto status updates
	private autoStatusCallbacks = new Set<Callback<AutoDepoWdStatusPayload>>();
	// For live chat messages
	private chatMessageCallbacks = new Set<Callback<ReceivedChatMessage>>();

	// Callback for the service's own status changes
	public onStatusChange: Callback<string> = () => {};
	public onChatStatusChange: Callback<string> = () => {};

	static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	connect(userId: string): void {
		if (
			this.socket?.connected ||
			this.status === "connecting" ||
			this.status === "reconnecting"
		)
			return;

		this.status = "connecting";
		this.onStatusChange("connecting");
		// Remember the last used userId for reconnection attempts
		this.lastUserId = userId;
		const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?wsKey=global&userId=${userId}`;

		// Ensure old connection is fully terminated before creating a new one
		this.socket?.disconnect();

		this.socket = io(wsUrl, {
			transports: ["websocket"],
			autoConnect: true,
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 10000,
		});

		this.socket.on("connect", this.handleConnect);
		this.socket.on("disconnect", this.handleDisconnect);
		this.socket.on("connect_error", this.handleConnectError);
		this.socket.on("message", this.handleMessage);
	}

	// Live chat connection method
	connectToChat(username: string): void {
		// console.log(username);
		if (
			this.chatSocket?.connected ||
			this.chatStatus === "connecting" ||
			this.chatStatus === "reconnecting"
		)
			return;

		this.chatStatus = "connecting";
		this.onChatStatusChange("connecting");
		// Remember the last used chat username for reconnection attempts
		this.lastChatUsername = username;
		const chatWsUrl = `${process.env.NEXT_PUBLIC_CHAT_WS_URL}?wsKey=global`;

		// Ensure old chat connection is fully terminated before creating a new one
		this.chatSocket?.disconnect();

		this.chatSocket = io(chatWsUrl, {
			transports: ["websocket"],
			autoConnect: true,
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 10000,
		});

		this.chatSocket.on("connect", this.handleChatConnect);
		this.chatSocket.on("disconnect", this.handleChatDisconnect);
		this.chatSocket.on("connect_error", this.handleChatConnectError);
		this.chatSocket.on("receive_message", this.handleChatMessage);
	}

	disconnect(): void {
		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
		this.socket?.off("connect", this.handleConnect);
		this.socket?.off("disconnect", this.handleDisconnect);
		this.socket?.off("connect_error", this.handleConnectError);
		this.socket?.off("message", this.handleMessage);
		this.socket?.disconnect();
		this.socket = null;
		this.reconnectAttempts = 0;
		this.status = "disconnected";
		this.onStatusChange("disconnected");
		// console.log("WebSocket: Manually disconnected.");
	}

	// Disconnect from live chat
	disconnectFromChat(): void {
		if (this.chatReconnectTimeout) clearTimeout(this.chatReconnectTimeout);
		this.chatSocket?.off("connect", this.handleChatConnect);
		this.chatSocket?.off("disconnect", this.handleChatDisconnect);
		this.chatSocket?.off("connect_error", this.handleChatConnectError);
		this.chatSocket?.off("receive_message", this.handleChatMessage);
		this.chatSocket?.disconnect();
		this.chatSocket = null;
		this.chatReconnectAttempts = 0;
		this.chatStatus = "disconnected";
		this.onChatStatusChange("disconnected");
		// console.log("Chat WebSocket: Manually disconnected.");
	}

	// ---- Event Handlers ----
	private handleConnect = () => {
		// console.log("WebSocket: Connected successfully.");
		this.status = "connected";
		this.onStatusChange("connected");
		this.reconnectAttempts = 0;
		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
	};

	private handleDisconnect = (reason: string) => {
		this.status = "disconnected";
		this.onStatusChange("disconnected");
		// console.log("WebSocket: Disconnected, reason:", reason);
		if (
			reason !== "io client disconnect" &&
			this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
		) {
			this.status = "reconnecting";
			this.onStatusChange("reconnecting");
			this.reconnectAttempts++;
			this.reconnectTimeout = setTimeout(() => {
				// Reconnect using the last provided dynamic userId
				this.connect(this.lastUserId || "");
			}, 2000 * this.reconnectAttempts);
		}
	};

	private handleConnectError = (error: Error) => {
		console.error("WebSocket Connection Error:", error);
		this.status = "error";
		this.onStatusChange("error");
		this.handleDisconnect("connect_error"); // Trigger reconnect logic
	};

	private handleMessage = (data: Message) => {
		try {
			const message = typeof data === "string" ? JSON.parse(data) : data;
			if (!message || !message.type) return;

			switch (message.type) {
				case "DEPOSITNOTIFICATION":
					this.depositCallbacks.forEach((cb) => cb(message));
					break;
				case "WITHDRAWNOTIFICATION":
					this.withdrawCallbacks.forEach((cb) => cb(message));
					break;
				case "AUTODEPOWDSTATUSNOTIFICATION":
					this.autoStatusCallbacks.forEach((cb) => cb(message));
					break;
			}
		} catch (error) {
			console.error("Error parsing WebSocket message:", error);
		}
	};

	// ---- Chat Event Handlers ----
	private handleChatConnect = () => {
		// console.log("Chat WebSocket: Connected successfully.");
		this.chatStatus = "connected";
		this.onChatStatusChange("connected");
		this.chatReconnectAttempts = 0;
		if (this.chatReconnectTimeout) clearTimeout(this.chatReconnectTimeout);
	};

	private handleChatDisconnect = (reason: string) => {
		this.chatStatus = "disconnected";
		this.onChatStatusChange("disconnected");
		// console.log("Chat WebSocket: Disconnected, reason:", reason);
		if (
			reason !== "io client disconnect" &&
			this.chatReconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
		) {
			this.chatStatus = "reconnecting";
			this.onChatStatusChange("reconnecting");
			this.chatReconnectAttempts++;
			this.chatReconnectTimeout = setTimeout(() => {
				// Reconnect using the last provided dynamic chat username
				this.connectToChat(this.lastChatUsername || "");
			}, 2000 * this.chatReconnectAttempts);
		}
	};

	private handleChatConnectError = (error: Error) => {
		// console.error("Chat WebSocket Connection Error:", error);
		this.chatStatus = "error";
		this.onChatStatusChange("error");
		this.handleChatDisconnect("connect_error"); // Trigger reconnect logic
	};

	private handleChatMessage = (data: Message) => {
		try {
			const message = typeof data === "string" ? JSON.parse(data) : data;
			if (!message) return;

			// Convert to our expected format
			const chatMessage: ReceivedChatMessage = {
				text: message.text || "",
				sender: message.sender || "",
				isAgent: message.isAgent === "true" || message.isAgent === true,
				timestamp: message.timestamp || Date.now(),
				messageId:
					message.messageId || `msg_${Date.now()}_${Math.random()}`,
			};

			this.chatMessageCallbacks.forEach((cb) => cb(chatMessage));
		} catch (error) {
			console.error("Error parsing chat message:", error);
		}
	};

	// --- Subscription Methods ---
	subscribeToDeposits = (callback: Callback<TransactionNotificationData>) =>
		this.subscribe(this.depositCallbacks, callback);
	subscribeToWithdraws = (callback: Callback<TransactionNotificationData>) =>
		this.subscribe(this.withdrawCallbacks, callback);
	subscribeToAutoStatus = (callback: Callback<AutoDepoWdStatusPayload>) =>
		this.subscribe(this.autoStatusCallbacks, callback);
	subscribeToChatMessages = (callback: Callback<ReceivedChatMessage>) =>
		this.subscribe(this.chatMessageCallbacks, callback);

	private subscribe<T>(
		callbackSet: Set<Callback<T>>,
		callback: Callback<T>
	): () => void {
		callbackSet.add(callback);
		return () => callbackSet.delete(callback);
	}

	// --- Chat Methods ---
	sendChatMessage(message: LiveChatMessagePayload): boolean {
		// Only allow sending when chat is fully connected
		if (!this.chatSocket?.connected || this.chatStatus !== "connected") {
			// console.warn(
			// 	"Chat WebSocket is not connected. Cannot send message."
			// );
			return false;
		}

		try {
			this.chatSocket.emit("send_message", {
				text: message.text,
				sender: message.sender,
				isAgent: message.isAgent || "false",
			});
			return true;
		} catch (error) {
			console.error("Error sending chat message:", error);
			return false;
		}
	}

	// Get connection status
	isConnected(): boolean {
		return this.socket?.connected || false;
	}

	isChatConnected(): boolean {
		return this.chatSocket?.connected || false;
	}

	// Expose status for UI to control input state
	getStatus(): typeof this.status {
		return this.status;
	}

	getChatStatus(): typeof this.chatStatus {
		return this.chatStatus;
	}

	// Helper: can UI allow sending messages?
	canSendChatMessage(): boolean {
		return this.chatStatus === "connected" && !!this.chatSocket?.connected;
	}
}

export default WebSocketService.getInstance();
