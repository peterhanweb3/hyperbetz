'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
                Content (HTML supported - you can use tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;img&gt;, etc.)
            </Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="<h2>Your Heading</h2>
<p>Your content here...</p>
<img src='your-image-url.jpg' alt='description' />
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>"
            />
        </div>
    )
}
