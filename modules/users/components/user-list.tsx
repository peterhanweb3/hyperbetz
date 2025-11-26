"use client";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { User } from "../types/user.types";
import { deleteUser } from "../actions/action";

export function UserList({
	users,
	currentUserId,
}: {
	users: Pick<User, "id" | "username" | "role" | "createdAt">[];
	currentUserId: string;
}) {
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showDialog, setShowDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState<{
		id: string;
		username: string;
	} | null>(null);

	const handleDelete = async () => {
		if (!selectedUser) return;

		setDeletingId(selectedUser.id);
		try {
			const result = await deleteUser(selectedUser.id);
			if (result?.error) {
				toast.error(result.error);
				setDeletingId(null);
			} else if (result?.success) {
				toast.success("User deleted successfully");
				window.location.reload();
			}
		} catch {
			toast.error("Failed to delete user");
			setDeletingId(null);
			setShowDialog(false);
		}
	};

	return (
		<div className="rounded-md border bg-background">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Username</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">
								{user.username}
							</TableCell>
							<TableCell>
								<Badge
									variant={
										user.role === "SUPER_ADMIN"
											? "default"
											: "secondary"
									}
								>
									{user.role}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(user.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell className="text-right">
								{user.id !== currentUserId && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => {
											setSelectedUser({
												id: user.id,
												username: user.username,
											});
											setShowDialog(true);
										}}
										disabled={deletingId === user.id}
									>
										<Trash className="h-4 w-4 text-destructive" />
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the user{" "}
							<span className="font-semibold text-[17px] text-primary">
								&quot;{selectedUser?.username}&quot;
							</span>
							. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={!!deletingId}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={!!deletingId}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deletingId ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
