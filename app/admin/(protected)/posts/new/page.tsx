import { PostForm } from '@/modules/blog/components/PostForm'

export default function NewPostPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
            <PostForm />
        </div>
    )
}
