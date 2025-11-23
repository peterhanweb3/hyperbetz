'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function BlogSlider({ posts }: { posts: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    }

    const swipeConfidenceThreshold = 10000
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity
    }

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + posts.length) % posts.length)
    }

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1)
        }, 5000)
        return () => clearInterval(timer)
    }, [currentIndex])

    if (!posts || posts.length === 0) return null

    const currentPost = posts[currentIndex]

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-primary/5 to-background border">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x)
                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1)
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1)
                        }
                    }}
                    className="w-full"
                >
                    <Link href={`/blog/${currentPost.slug}`} className="block">
                        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                            {/* Content */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {currentPost.tags?.map((tag: any) => (
                                        <Badge key={tag.id} className="bg-primary/10 text-primary hover:bg-primary/20">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>

                                <h3 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight hover:text-primary transition-colors">
                                    {currentPost.title}
                                </h3>

                                <p className="text-lg text-muted-foreground line-clamp-3">
                                    {currentPost.excerpt}
                                </p>

                                <div className="flex items-center gap-4">
                                    <Button size="lg" className="group">
                                        Read Full Article
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(currentPost.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Image */}
                            {currentPost.coverImage && (
                                <div className="relative aspect-video md:aspect-square rounded-xl overflow-hidden shadow-2xl order-first md:order-last">
                                    <Image
                                        src={currentPost.coverImage}
                                        alt={currentPost.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:hidden" />
                                </div>
                            )}
                        </div>
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={() => paginate(-1)}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex gap-2">
                    {posts.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                                }`}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1)
                                setCurrentIndex(index)
                            }}
                        />
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={() => paginate(1)}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
