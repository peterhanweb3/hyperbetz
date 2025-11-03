"use client";

import * as React from "react";
import { Send, Smile, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiGifPicker } from "./emoji-gif-picker";
import { TagSuggestions } from "./tag-suggestions";
// import { CommandSuggestions } from "./command-suggestions"; // Commented out - command functionality disabled
import { ReplyPreview } from "./reply-preview";
import { ImageUploadDialog } from "./image-upload-dialog";
import { Message } from "@/types/features/live-chat.types";
import { getAllUsernames } from "@/lib/utils/features/live-chat/live-chat.utils";
import { useTranslations } from "@/lib/locale-provider";
import // filterCommands, // Commented out - command functionality disabled
// SlashCommand, // Commented out - command functionality disabled
"@/lib/utils/features/live-chat/slash-commands";

interface ChatInputProps {
	inputValue: string;
	onInputChange: (value: string) => void;
	onSendMessage: () => void;
	onEmojiSelect: (emoji: string) => void;
	onGifSelect?: (gif: { url: string; title: string }) => void;
	onImageUpload?: (file: File, caption: string) => void;
	messages: Message[];
	replyingTo: Message | null;
	onCancelReply: () => void;
	currentUsername?: string;
	disabled?: boolean; // Disable input while chat socket is not ready
	inputRef?: React.RefObject<HTMLInputElement | null>; // external ref for focusing
}

export function ChatInput({
	inputValue,
	onInputChange,
	onSendMessage,
	onEmojiSelect,
	onGifSelect,
	onImageUpload,
	messages,
	replyingTo,
	onCancelReply,
	currentUsername,
	disabled = false,
	inputRef,
}: ChatInputProps) {
	const t = useTranslations("chat");
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const tagSuggestionsRef = React.useRef<HTMLDivElement>(null);

	const featureFlags = React.useMemo(
		() => ({
			imageUpload: process.env.NEXT_PUBLIC_ENABLE_CHAT_IMAGE === "true",
			gifSending: process.env.NEXT_PUBLIC_ENABLE_CHAT_GIFS === "true",
		}),
		[]
	);

	const handleGifSelectSafe = React.useCallback(
		(gif: { url: string; title: string }) => {
			onGifSelect?.(gif);
		},
		[onGifSelect]
	);

	// Tag suggestion states
	const [showTagSuggestions, setShowTagSuggestions] = React.useState(false);
	const [tagSuggestions, setTagSuggestions] = React.useState<string[]>([]);
	const [tagQuery, setTagQuery] = React.useState("");
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
		React.useState(-1);

	// Command suggestion states - COMMENTED OUT
	/*
  const [showCommandSuggestions, setShowCommandSuggestions] =
    React.useState(false);
  const [commandSuggestions, setCommandSuggestions] = React.useState<
    SlashCommand[]
  >([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = React.useState(-1);
  */

	// Image upload states
	const [showImageConfirm, setShowImageConfirm] = React.useState(false);
	const [pendingImage, setPendingImage] = React.useState<{
		file: File;
		url: string;
	} | null>(null);

	// Cleanup pending image blob URL
	React.useEffect(() => {
		return () => {
			if (pendingImage?.url) {
				URL.revokeObjectURL(pendingImage.url);
			}
		};
	}, [pendingImage]);

	// Click outside to close tag suggestions
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				showTagSuggestions &&
				tagSuggestionsRef.current &&
				!tagSuggestionsRef.current.contains(event.target as Node) &&
				inputRef?.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowTagSuggestions(false);
				setSelectedSuggestionIndex(-1);
			}
		};

		if (showTagSuggestions) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showTagSuggestions, inputRef]);

	const handleTagInput = (value: string) => {
		const lastAtIndex = value.lastIndexOf("@");
		if (lastAtIndex !== -1) {
			const query = value.slice(lastAtIndex + 1);
			const allUsernames = getAllUsernames(messages, currentUsername);

			const filtered = allUsernames
				.filter((name) =>
					name.toLowerCase().includes(query.toLowerCase())
				)
				.slice(0, 5);

			setTagSuggestions(filtered);
			setShowTagSuggestions(filtered.length > 0);
			setTagQuery(query);
			// Auto-select first suggestion when suggestions appear
			if (filtered.length > 0) {
				setSelectedSuggestionIndex(0);
			} else {
				setSelectedSuggestionIndex(-1);
			}
		} else {
			setShowTagSuggestions(false);
			setSelectedSuggestionIndex(-1);
		}
	};

	const insertTagSuggestion = (username: string) => {
		const lastAtIndex = inputValue.lastIndexOf("@");
		const newValue = inputValue.slice(0, lastAtIndex + 1) + username + " ";
		onInputChange(newValue);
		setShowTagSuggestions(false);
		setSelectedSuggestionIndex(-1);
	};

	// Command suggestion handling - COMMENTED OUT
	/*
  const handleCommandInput = (value: string) => {
    if (value.startsWith("/")) {
      const filtered = filterCommands(value);
      setCommandSuggestions(filtered);
      setShowCommandSuggestions(filtered.length > 0);
    } else {
      setShowCommandSuggestions(false);
    }
  };

  const insertCommandSuggestion = (command: SlashCommand) => {
    onInputChange(command.template);
    setShowCommandSuggestions(false);
    setSelectedCommandIndex(-1);
  };
  */

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return; // prevent typing while disabled
		const value = e.target.value;
		onInputChange(value);

		// Handle command suggestions - COMMENTED OUT
		// handleCommandInput(value);

		// Handle tag suggestions
		handleTagInput(value);

		// Don't reset selection indices here as handleTagInput now manages them
		// setSelectedSuggestionIndex(-1);
		// setSelectedCommandIndex(-1); // Commented out - command functionality disabled
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (disabled) {
			// Block sending or shortcuts while disabled
			if (e.key === "Enter") e.preventDefault();
			return;
		}
		// Handle command suggestions navigation - COMMENTED OUT
		/*
    if (showCommandSuggestions && commandSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (
        (e.key === "Tab" || e.key === "Enter") &&
        selectedCommandIndex >= 0
      ) {
        e.preventDefault();
        insertCommandSuggestion(commandSuggestions[selectedCommandIndex]);
      } else if (e.key === "Escape") {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(-1);
      }
    }
    // Handle tag suggestions navigation
    else */ if (showTagSuggestions && tagSuggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedSuggestionIndex((prev) =>
					prev < tagSuggestions.length - 1 ? prev + 1 : 0
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedSuggestionIndex((prev) =>
					prev > 0 ? prev - 1 : tagSuggestions.length - 1
				);
			} else if (e.key === "Tab") {
				e.preventDefault();
				// If no item is selected, select the first one
				const indexToUse =
					selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
				insertTagSuggestion(tagSuggestions[indexToUse]);
			} else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
				e.preventDefault();
				insertTagSuggestion(tagSuggestions[selectedSuggestionIndex]);
			} else if (e.key === "Escape") {
				e.preventDefault();
				setShowTagSuggestions(false);
				setSelectedSuggestionIndex(-1);
			}
		} else if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			onSendMessage();
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!featureFlags.imageUpload || !onImageUpload) {
			return;
		}
		const file = e.target.files?.[0];
		if (!file || disabled) return;

		if (file.type.startsWith("image/")) {
			const imageUrl = URL.createObjectURL(file);
			setPendingImage({ file, url: imageUrl });
			setShowImageConfirm(true);
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const confirmImageUpload = () => {
		if (!pendingImage || !onImageUpload) return;
		onImageUpload(pendingImage.file, inputValue);
		onInputChange("");
		setShowImageConfirm(false);
		setPendingImage(null);
	};

	const cancelImageUpload = () => {
		if (pendingImage) {
			URL.revokeObjectURL(pendingImage.url);
		}
		setShowImageConfirm(false);
		setPendingImage(null);
	};

	return (
		<div className="p-4 border-t border-primary/20 bg-card/95 backdrop-blur-xl relative overflow-visible safe-area-bottom">
			{/* Background Animation */}
			<div className="absolute inset-0 bg-gradient-to-t from-primary/8 via-chart-1/5 to-transparent pointer-events-none animate-gradient-x" />
			<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />

			{replyingTo && (
				<div className="relative z-10 mb-3">
					<ReplyPreview
						replyingTo={replyingTo}
						onCancel={onCancelReply}
					/>
				</div>
			)}

			<div className="relative z-10 ">
				{/* Command Suggestions - COMMENTED OUT */}
				{/*
        <div className="relative z-[150]">
          <CommandSuggestions
            suggestions={commandSuggestions}
            isVisible={showCommandSuggestions}
            selectedIndex={selectedCommandIndex}
            onSelect={insertCommandSuggestion}
            onHover={setSelectedCommandIndex}
          />
        </div>
        */}

				{/* Tag Suggestions */}
				<div ref={tagSuggestionsRef} className="relative z-[150]">
					<TagSuggestions
						suggestions={tagSuggestions}
						query={tagQuery}
						selectedIndex={selectedSuggestionIndex}
						onSelect={insertTagSuggestion}
						visible={showTagSuggestions}
					/>
				</div>

				<div className="flex items-center gap-2 relative z-10">
					<div className="flex-1 relative">
						<Input
							value={inputValue}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							disabled={disabled}
							ref={inputRef}
							placeholder={
								disabled
									? "Connecting…"
									: replyingTo
									? t("input.replyPlaceholder", {
											username: replyingTo.username,
									  })
									: t("placeholder")
							}
							className="pr-20 bg-input border-sidebar-border text-sidebar-foreground 
                         placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 
                         focus:border-primary/50 transition-all duration-200 casino-input"
						/>

						<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
							{/* File Upload */}
							{featureFlags.imageUpload && (
								<>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileUpload}
										className="hidden"
									/>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 text-muted-foreground hover:text-primary 
		                           hover:bg-primary/10 rounded-full transition-all duration-200 
		                           casino-input-button"
										onClick={() =>
											!disabled &&
											fileInputRef.current?.click()
										}
										disabled={disabled}
									>
										<Upload className="h-4 w-4" />
									</Button>
								</>
							)}

							{/* Emoji / GIF Picker */}
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 text-muted-foreground hover:text-primary 
                               hover:bg-primary/10 rounded-full transition-all duration-200 
                               casino-input-button"
										disabled={disabled}
									>
										<Smile className="h-4 w-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									side="top"
									align="end"
									className="w-auto p-0 border-sidebar-border bg-card backdrop-blur-xl 
                             shadow-2xl casino-picker z-[90]"
								>
									<EmojiGifPicker
										onEmojiSelect={onEmojiSelect}
										onGifSelect={handleGifSelectSafe}
										enableGifs={featureFlags.gifSending}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<Button
						onClick={onSendMessage}
						disabled={disabled || !inputValue.trim()}
						className="bg-primary hover:bg-primary/90 text-foreground 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-200 hover:scale-105 active:scale-95 
                       shadow-lg hover:shadow-xl casino-send-button"
						aria-label={t("send")}
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>

				{/* Image Upload Dialog */}
				{featureFlags.imageUpload && (
					<ImageUploadDialog
						imageUrl={pendingImage?.url || ""}
						onConfirm={confirmImageUpload}
						onCancel={cancelImageUpload}
						visible={showImageConfirm}
					/>
				)}
			</div>
		</div>
	);
}
