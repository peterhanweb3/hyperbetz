'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, User } from 'lucide-react'

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, null)

    return (
        <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 z-0" />

            <Card className="w-full max-w-md z-10 border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Admin Access</CardTitle>
                    <CardDescription>Enter your secure credentials to continue</CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="username" name="username" type="text" required className="pl-10" placeholder="Enter username" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-8">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="password" name="password" type="password" required className="pl-10" placeholder="Enter password" />
                            </div>
                        </div>
                        {state?.error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center font-medium">
                                {state.error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full font-semibold text-lg h-11" disabled={isPending}>
                            {isPending ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
