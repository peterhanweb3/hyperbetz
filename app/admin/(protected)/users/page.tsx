import prisma from "@/modules/admin/lib/db";
import { getSession } from "@/modules/auth/lib/auth";
import { UserForm } from "@/modules/users/components/user-form";
import { UserList } from "@/modules/users/components/user-list";

export default async function UsersPage() {
	const session = await getSession();
	if (!session || session.role !== "SUPER_ADMIN") {
		return (
			<div className="p-6 text-center text-muted-foreground">
				You do not have permission to view this page.
			</div>
		);
	}

	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		select: { id: true, username: true, role: true, createdAt: true },
	});

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<div className="lg:col-span-2">
				<h1 className="text-2xl font-bold mb-6">Users</h1>
				<UserList users={users} currentUserId={session.id} />
			</div>
			<div>
				<UserForm />
			</div>
		</div>
	);
}
