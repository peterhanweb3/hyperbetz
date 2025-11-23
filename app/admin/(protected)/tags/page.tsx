import prisma from '@/modules/blog/lib/db'
import { TagForm } from '@/modules/blog/components/TagForm'
import { TagList } from '@/modules/blog/components/TagList'

export default async function TagsPage() {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } })

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                <h1 className="text-2xl font-bold mb-6">Tags</h1>
                <TagList tags={tags} />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Create Tag</h2>
                <TagForm />
            </div>
        </div>
    )
}
