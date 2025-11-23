import { getSession } from '@/modules/blog/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordChangeForm } from '@/modules/blog/components/PasswordChangeForm'

export default async function SettingsPage() {
    const session = await getSession()

    if (!session) {
        return null
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Username</p>
                            <p className="text-lg font-semibold">{session.username}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <p className="text-lg font-semibold capitalize">{session.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordChangeForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
