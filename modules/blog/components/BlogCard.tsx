'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowRight, Calendar, User } from 'lucide-react'
import Image from 'next/image'

export function BlogCard({ post, index }: { post: any; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Link href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="relative aspect-[16/9] overflow-hidden">
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-4xl font-bold text-muted-foreground/20">Blog</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <CardContent className="p-6">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {post.tags.map((tag: any) => (
                                <Badge key={tag.id} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
                            {post.title}
                        </h3>
                        <p className="line-clamp-3 text-muted-foreground">
                            {post.excerpt || 'Read more about this topic...'}
                        </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-border/50 p-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(post.createdAt), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author.username}
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary" />
                    </CardFooter>
                </Card>
            </Link>
        </motion.div>
    )
}
