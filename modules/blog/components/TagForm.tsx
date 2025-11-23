'use client'

import { useActionState } from 'react'
import { createTag } from '../actions/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export function TagForm() {
    const [state, formAction, isPending] = useActionState(createTag, null)

    return (
        <Card>
            <CardContent className="p-6">
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tag Name</Label>
                        <Input id="name" name="name" required />
                    </div>
                    {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create Tag'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
