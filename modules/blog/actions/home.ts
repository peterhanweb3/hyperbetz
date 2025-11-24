'use server'

import { getPosts } from '@/modules/blog/lib/api'

export async function getLatestPostsAction() {
    try {
        const { posts } = await getPosts(1, 8, '', 'published')
        // Convert dates to strings to ensure serializability if needed, though Next.js usually handles it.
        // But to be safe with Client Components:
        return posts.map(post => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            // Ensure other Date fields are handled if any
        }))
    } catch (error) {
        console.error("Failed to fetch latest posts:", error);
        return [];
    }
}
