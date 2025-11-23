'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash } from 'lucide-react'
import { deleteTag } from '../actions/tags'

export function TagList({ tags }: { tags: any[] }) {
    return (
        <div className="rounded-md border bg-background">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tags.map((tag) => (
                        <TableRow key={tag.id}>
                            <TableCell className="font-medium">{tag.name}</TableCell>
                            <TableCell>{tag.slug}</TableCell>
                            <TableCell>{tag._count.posts}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm('Are you sure?')) deleteTag(tag.id)
                                    }}
                                >
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {tags.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No tags found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
