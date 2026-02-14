'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { YouTubeEmbed } from './extensions/YouTubeEmbed'
import { InstagramEmbed } from './extensions/InstagramEmbed'
import { useCallback, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
  Youtube,
  Instagram,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

// ── Types ───────────────────────────────────────────────────────

interface RichTextEditorProps {
  /** HTML string content */
  value: string
  /** Called with HTML string on every change */
  onChange: (html: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Minimum height of the editor area */
  minHeight?: string
  /** Additional class names for the wrapper */
  className?: string
}

// ── Toolbar Button ──────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-border mx-0.5 self-center" />
}

// ── Editor Component ────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '400px',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      YouTubeEmbed,
      InstagramEmbed,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose dark:prose-invert max-w-none',
          'focus:outline-none',
          'px-4 py-3',
          '[&_p]:my-2 [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:mt-4 [&_h3]:mb-2',
          '[&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
          '[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto',
          '[&_hr]:my-4 [&_hr]:border-border',
          '[&_a]:text-primary [&_a]:underline',
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
    immediatelyRender: false,
  })

  // Sync external value changes (e.g., loading existing post)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process()
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl || 'https://')

    if (url === null) return // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertYouTube = useCallback(() => {
    if (!editor) return

    const url = window.prompt(
      'Enter YouTube URL:',
      'https://www.youtube.com/watch?v='
    )

    if (url && url !== 'https://www.youtube.com/watch?v=') {
      editor.chain().focus().setYouTubeEmbed({ src: url }).run()
    }
  }, [editor])

  const insertInstagram = useCallback(() => {
    if (!editor) return

    const url = window.prompt('Enter Instagram post URL:', 'https://www.instagram.com/p/')

    if (url && url !== 'https://www.instagram.com/p/') {
      editor.chain().focus().setInstagramEmbed({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b bg-muted/50">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Embeds */}
        <ToolbarButton onClick={insertYouTube} title="Insert YouTube Video">
          <Youtube className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertInstagram} title="Insert Instagram Post">
          <Instagram className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
