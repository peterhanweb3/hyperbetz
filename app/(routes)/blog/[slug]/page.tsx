import { getPostBySlug, getPosts } from '@/modules/blog/lib/api'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Metadata } from 'next'
import Image from 'next/image'
import { ScrollProgress } from '@/modules/blog/components/ScrollProgress'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BlogCard } from '@/modules/blog/components/BlogCard'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    if (!post) return {}

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt || undefined,
            images: post.coverImage ? [post.coverImage] : [],
        },
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post || !post.published) {
        notFound()
    }

    // Get related posts
    const { posts: relatedPosts } = await getPosts(1, 3, '', 'published')
    const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 3)

    // Calculate reading time
    const wordsPerMinute = 200
    const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)

    return (
        <>
            <ScrollProgress />
            <article className="min-h-screen bg-background">
                {/* Back Button */}
                <div className="container mx-auto px-4 pt-8">
                    <Button variant="ghost" asChild className="gap-2">
                        <Link href="/blog">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>
                </div>

                {/* Hero Header */}
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <div className="mb-6 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag.id} className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-3 py-1">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                        {post.title}
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y py-4">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-primary">H</span>
                            </div>
                            <div>
                                <div className="font-semibold text-foreground">HyperBetz Team</div>
                                <div className="text-xs">Official Blog</div>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-10 hidden sm:block" />
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                        </div>
                        <Separator orientation="vertical" className="h-10 hidden sm:block" />
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {readingTime} min read
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="container mx-auto px-4 mb-12 max-w-5xl">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border shadow-2xl">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="container mx-auto px-4 pb-20 max-w-4xl">
                    <div
                        className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary prose-img:rounded-xl prose-img:shadow-lg prose-li:my-2 max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Post Footer */}
                    <div className="mt-16 pt-8 border-t">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Published by</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-xl font-bold text-primary">H</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">HyperBetz</div>
                                        <div className="text-sm text-muted-foreground">Your trusted betting platform</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <p className="text-sm text-muted-foreground w-full">Share this article:</p>
                                <Button variant="outline" size="sm">Twitter</Button>
                                <Button variant="outline" size="sm">Facebook</Button>
                                <Button variant="outline" size="sm">LinkedIn</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {filteredRelated.length > 0 && (
                    <div className="border-t bg-muted/20 py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold mb-8 text-center">Continue Reading</h2>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                                {filteredRelated.map((relatedPost, index) => (
                                    <BlogCard key={relatedPost.id} post={relatedPost} index={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="border-t py-16">
                    <div className="container mx-auto px-4 text-center max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Ready to Start Winning?</h2>
                        <p className="text-muted-foreground mb-8">
                            Join thousands of players who trust HyperBetz for their betting needs.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/">Get Started</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/blog">More Articles</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </article>
        </>
    )
}
