"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deletePost } from "@/modules/blog/actions/posts";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeletePostButtonProps {
	postId: string;
	postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deletePost(postId);
			if (result?.error) {
				toast.error(result.error);
				setIsDeleting(false);
			} else if (result?.success) {
				toast.success("Post deleted successfully");
				window.location.reload();
			}
		} catch {
			toast.error("Failed to delete post");
			setIsDeleting(false);
			setShowDialog(false);
		}
	};

	return (
		<>
			<DropdownMenuItem
				onSelect={(e) => {
					e.preventDefault();
					setShowDialog(true);
				}}
				className="text-destructive focus:text-destructive"
			>
				Delete
			</DropdownMenuItem>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the post{" "}
							<span className="font-semibold text-[17px] text-primary">
								&quot;{postTitle}&quot;
							</span>
							. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
