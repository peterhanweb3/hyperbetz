'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { createSeoPage, updateSeoPage } from '@/modules/seo/actions'
import { RichTextEditor } from '@/modules/blog/components/RichTextEditor'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SeoPageFormProps {
    initialData?: {
        id: string
        slug: string
        title: string
        description: string
        content: string
        keywords: string | null
        structuredData: string | null
        published: boolean
    }
}

export function SeoPageForm({ initialData }: SeoPageFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [content, setContent] = useState(initialData?.content || '')

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const data = {
            slug: formData.get('slug') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            content: content,
            keywords: formData.get('keywords') as string,
            structuredData: formData.get('structuredData') as string,
            published: formData.get('published') === 'on',
        }

        try {
            if (initialData) {
                await updateSeoPage(initialData.id, data)
            } else {
                await createSeoPage(data)
            }
            router.refresh()
        } catch (error) {
            console.error('Failed to save SEO page:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/seo">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {initialData ? 'Edit SEO Page' : 'Create SEO Page'}
                        </h1>
                        <p className="text-muted-foreground">
                            {initialData ? `Editing /${initialData.slug}` : 'Create a new landing page for SEO'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="published"
                            name="published"
                            defaultChecked={initialData?.published}
                        />
                        <Label htmlFor="published">Published</Label>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Page
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Page Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Best Crypto Casino 2025"
                                    defaultValue={initialData?.title}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Content</Label>
                                <RichTextEditor value={content} onChange={setContent} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="structuredData">Structured Data (JSON-LD)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Paste your JSON-LD schema here. It will be injected into the page head.
                                </p>
                                <Textarea
                                    id="structuredData"
                                    name="structuredData"
                                    className="font-mono text-sm min-h-[200px]"
                                    placeholder='{ "@context": "https://schema.org", "@type": "FAQPage", ... }'
                                    defaultValue={initialData?.structuredData || ''}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">/</span>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        placeholder="crypto-casino"
                                        defaultValue={initialData?.slug}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Meta Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Brief description for search engines..."
                                    defaultValue={initialData?.description}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords</Label>
                                <Input
                                    id="keywords"
                                    name="keywords"
                                    placeholder="crypto, casino, bitcoin..."
                                    defaultValue={initialData?.keywords || ''}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
