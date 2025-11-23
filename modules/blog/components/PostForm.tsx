'use client'

import { useState, useTransition } from 'react'
import { createPost, updatePost } from '../actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { RichTextEditor } from './RichTextEditor'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

export function PostForm({ post }: { post?: any }) {
    const [isPending, startTransition] = useTransition()
    const [content, setContent] = useState(post?.content || '')
    const [coverImage, setCoverImage] = useState(post?.coverImage || '')
    const [isUploading, setIsUploading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        formData.set('content', content)
        formData.set('coverImage', coverImage)

        startTransition(async () => {
            if (post) {
                await updatePost(post.id, null, formData)
            } else {
                await createPost(null, formData)
            }
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.url) {
                setCoverImage(data.url)
            }
        } catch (error) {
            console.error('Upload failed', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form action={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={post?.title} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" name="slug" defaultValue={post?.slug} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="published">Published</Label>
                            <Switch id="published" name="published" defaultChecked={post?.published} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input id="tags" name="tags" defaultValue={post?.tags?.map((t: any) => t.name).join(', ')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <div className="flex flex-col gap-4">
                                {coverImage && (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                        <Image src={coverImage} alt="Cover" fill className="object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute right-2 top-2 h-6 w-6"
                                            onClick={() => setCoverImage('')}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <Button type="button" variant="outline" className="w-full" asChild disabled={isUploading}>
                                        <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </label>
                                    </Button>
                                </div>
                                <Input
                                    name="coverImage"
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="Or enter image URL"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold">SEO</h3>
                        <div className="space-y-2">
                            <Label htmlFor="seoTitle">SEO Title</Label>
                            <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seoDescription">SEO Description</Label>
                            <Textarea id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription} />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
                </Button>
            </div>
        </form>
    )
}
