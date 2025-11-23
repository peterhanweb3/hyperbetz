import { getPostBySlug } from './modules/blog/lib/api'
import prisma from './modules/blog/lib/db'

async function test() {
    try {
        console.log('Testing getPostBySlug...')
        // Try to fetch one of the seeded posts
        const slug = 'master-betting-strategy-advanced-tips'
        const post = await getPostBySlug(slug)
        console.log('Result:', post ? 'Found' : 'Not Found')
        if (post) {
            console.log('Title:', post.title)
            console.log('Author:', post.author?.username)
        }
    } catch (error) {
        console.error('Error fetching post:')
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
