import { getSession } from '@/modules/blog/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/modules/blog/components/AdminSidebar'
import { AdminHeader } from '@/modules/blog/components/AdminHeader'

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session) {
        redirect('/admin/login')
    }

    return (
        <div className="grid min-h-screen" style={{ gridTemplateColumns: '256px 1fr' }}>
            {/* Sidebar - Fixed */}
            <div className="fixed h-screen w-64 border-r bg-background">
                <AdminSidebar />
            </div>

            {/* Main Content Area - Takes remaining space */}
            <div className="col-start-2">
                <div className="sticky top-0 z-30 border-b bg-background">
                    <AdminHeader user={session} />
                </div>
                <main className="p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
