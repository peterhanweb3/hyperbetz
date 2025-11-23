import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getSession } from '@/modules/blog/lib/auth'

export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '-' + file.name.replace(/\s/g, '-')
    const uploadDir = path.join(process.cwd(), 'public/uploads')

    try {
        await writeFile(path.join(uploadDir, filename), buffer)
        return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
        console.error('Upload failed:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
