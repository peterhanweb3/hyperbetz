import { SeoPageForm } from '@/modules/seo/components/SeoPageForm'
import { getSeoPageById } from '@/modules/seo/actions'
import { notFound } from 'next/navigation'

export default async function SeoPageEdit({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    let initialData
    if (id !== 'new') {
        initialData = await getSeoPageById(id)
        if (!initialData) {
            notFound()
        }
    }

    return (
        <div className="max-w-5xl mx-auto">
            <SeoPageForm initialData={initialData || undefined} />
        </div>
    )
}
