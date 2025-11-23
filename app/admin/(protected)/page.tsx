import { getDashboardStats } from '@/modules/blog/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, CheckCircle, Tags, Search } from 'lucide-react'
import { Overview } from '@/modules/blog/components/Overview'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    // Mock data for the chart - in a real app, this would come from the DB
    const chartData = [
        { name: 'Jan', total: Math.floor(Math.random() * 50) + 10 },
        { name: 'Feb', total: Math.floor(Math.random() * 50) + 10 },
        { name: 'Mar', total: Math.floor(Math.random() * 50) + 10 },
        { name: 'Apr', total: Math.floor(Math.random() * 50) + 10 },
        { name: 'May', total: Math.floor(Math.random() * 50) + 10 },
        { name: 'Jun', total: Math.floor(Math.random() * 50) + 10 },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your blog and SEO performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/posts/new">
                            <FileText className="mr-2 h-4 w-4" /> New Post
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/seo/new">
                            <Search className="mr-2 h-4 w-4" /> New SEO Page
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPosts}</div>
                        <p className="text-xs text-muted-foreground">Across all categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.publishedPosts}</div>
                        <p className="text-xs text-muted-foreground text-green-500">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SEO Pages</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">13</div>
                        <p className="text-xs text-muted-foreground">Landing pages active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTags}</div>
                        <p className="text-xs text-muted-foreground">Topics covered</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Content Overview</CardTitle>
                        <CardDescription>Post creation activity over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={chartData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-sm text-muted-foreground">Updated SEO Page: /crypto-casino</p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-muted-foreground">Just now</div>
                            </div>
                            <div className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">John Doe</p>
                                    <p className="text-sm text-muted-foreground">Published new blog post</p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-muted-foreground">2h ago</div>
                            </div>
                            <div className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary">SY</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">System</p>
                                    <p className="text-sm text-muted-foreground">Database backup completed</p>
                                </div>
                                <div className="ml-auto font-medium text-sm text-muted-foreground">5h ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
