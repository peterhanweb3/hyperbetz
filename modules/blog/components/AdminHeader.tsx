'use client'

import Link from 'next/link'
import { Home, PanelLeft, Search, User, FileText, Tags, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '../actions'

export function AdminHeader({ user }: { user: any }) {
    return (
        <header className="flex h-16 items-center justify-between px-6">
            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="md:hidden">
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                    <nav className="grid gap-4 py-6">
                        <Link href="/admin" className="flex items-center gap-4 px-2 text-sm font-medium">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="/admin/posts" className="flex items-center gap-4 px-2 text-sm font-medium">
                            <FileText className="h-4 w-4" />
                            Posts
                        </Link>
                        <Link href="/admin/seo" className="flex items-center gap-4 px-2 text-sm font-medium">
                            <Search className="h-4 w-4" />
                            SEO Pages
                        </Link>
                        <Link href="/admin/tags" className="flex items-center gap-4 px-2 text-sm font-medium">
                            <Tags className="h-4 w-4" />
                            Tags
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-4 px-2 text-sm font-medium">
                            <Users className="h-4 w-4" />
                            Users
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-9 w-full"
                    />
                </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutAction()}>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
