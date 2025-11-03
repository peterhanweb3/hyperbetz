"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chatRooms } from "@/constants/features/live-chat/live-chat.constants";
import { ChatRoom } from "@/types/features/live-chat.types";

interface ChatHeaderProps {
	currentChatRoom: ChatRoom;
	onChatRoomChange: (chatRoom: ChatRoom) => void;
	onClose: () => void;
}

export function ChatHeader({
	currentChatRoom,
	onChatRoomChange,
	onClose,
}: ChatHeaderProps) {
	return (
		<div
			className="flex items-center justify-between p-4 border-b border-sidebar-border
               bg-card backdrop-blur-sm relative overflow-hidden"
		>
			{/* Background gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />

			<div className="flex items-center gap-3 relative z-10">
				<div className="flex items-center gap-2">
					{/* Animated status indicator */}
					<div className="relative">
						<div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse" />
						<div className="absolute inset-0 w-3 h-3 bg-chart-2 rounded-full animate-ping opacity-75" />
					</div>

					{/* Chat Room Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="font-semibold text-foreground text-lg drop-shadow-sm hover:bg-muted/50 
                         transition-all duration-200 gap-2"
							>
								<span className="text-base">
									{currentChatRoom.flag}
								</span>
								<span>{currentChatRoom.name}</span>
								<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-180 duration-200" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="start"
							className="w-56 bg-card border-sidebar-border shadow-2xl backdrop-blur-xl
                       rounded-lg overflow-hidden casino-dropdown"
						>
							{chatRooms.map((room) => (
								<DropdownMenuItem
									key={room.code}
									onClick={() => onChatRoomChange(room)}
									className={`flex items-center gap-3 text-sidebar-foreground 
                           hover:bg-muted/50 hover:text-primary
                           transition-all duration-200 cursor-pointer
                           border-b border-border/20 last:border-none
                           ${
								currentChatRoom.code === room.code
									? "bg-primary/10 text-primary"
									: ""
							}`}
								>
									<span className="text-base">
										{room.flag}
									</span>
									<div className="flex flex-col">
										<span className="font-medium">
											{room.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{room.code}
										</span>
									</div>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="flex items-center gap-2 relative z-10">
				{/* <Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 text-muted-foreground hover:text-primary
                   hover:bg-primary/10 rounded-full transition-all duration-200
                   casino-icon-button"
				>
					<Info className="h-4 w-4" />
				</Button> */}

				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive
                   hover:bg-destructive/10 rounded-full transition-all duration-200
                   casino-close-button"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
