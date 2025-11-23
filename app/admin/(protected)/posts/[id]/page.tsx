import { getPostById } from '@/modules/blog/lib/api'
import { PostForm } from '@/modules/blog/components/PostForm'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
        notFound()
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
            <PostForm post={post} />
        </div>
    )
}
