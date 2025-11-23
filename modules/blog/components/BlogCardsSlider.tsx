'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

export function BlogCardsSlider({ posts }: { posts: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    if (!posts || posts.length === 0) return null

    return (
        <div className="relative group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Latest from the Blog</h2>
                    <p className="text-muted-foreground">Strategies, insights, and updates from the HyperBetz team</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('left')}
                        className="hidden sm:flex"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('right')}
                        className="hidden sm:flex"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button asChild variant="default">
                        <Link href="/blog" className="gap-2">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Slider */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="flex-shrink-0 w-[320px] sm:w-[380px] snap-start group/card"
                    >
                        <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                            {/* Image */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                {post.coverImage ? (
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="text-4xl font-bold text-muted-foreground/20">Blog</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                            </div>

                            {/* Content */}
                            <CardContent className="p-6 space-y-4">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {post.tags?.slice(0, 2).map((tag: any) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold line-clamp-2 leading-tight transition-colors group-hover/card:text-primary">
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                    <span className="flex items-center gap-1">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">H</span>
                                        </div>
                                        HyperBetz
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {/* View All Card */}
                <Link
                    href="/blog"
                    className="flex-shrink-0 w-[320px] sm:w-[380px] snap-start"
                >
                    <Card className="h-full flex items-center justify-center border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all">
                        <CardContent className="text-center py-12">
                            <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <ArrowRight className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">View All Articles</h3>
                            <p className="text-muted-foreground">Discover more insights and strategies</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* CSS to hide scrollbar */}
            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    )
}
