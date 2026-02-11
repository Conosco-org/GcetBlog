/**
 * Converts Payload CMS Lexical JSON to HTML for loading into Tiptap editor.
 * This is needed when editing existing posts — the stored Lexical JSON must
 * be converted back to HTML so Tiptap can render it.
 */

// ── Format bitmask ──────────────────────────────────────────────

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

// ── Types (minimal, matching what we produce in htmlToLexical) ──

interface LexicalNode {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// ── Inline node → HTML ──────────────────────────────────────────

function inlineNodeToHtml(node: LexicalNode): string {
  if (node.type === 'linebreak') return '<br>'

  if (node.type === 'text') {
    let html = escapeHtml(node.text || '')
    const fmt: number = node.format || 0
    if (fmt & FORMAT_CODE) html = `<code>${html}</code>`
    if (fmt & FORMAT_BOLD) html = `<strong>${html}</strong>`
    if (fmt & FORMAT_ITALIC) html = `<em>${html}</em>`
    if (fmt & FORMAT_UNDERLINE) html = `<u>${html}</u>`
    if (fmt & FORMAT_STRIKETHROUGH) html = `<s>${html}</s>`
    return html
  }

  if (node.type === 'link') {
    const url = node.fields?.url || node.url || '#'
    const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
    const childrenHtml = (node.children || []).map(inlineNodeToHtml).join('')
    return `<a href="${escapeAttr(url)}"${newTab}>${childrenHtml}</a>`
  }

  // Fallback: try to render children or text
  if (node.children) {
    return (node.children as LexicalNode[]).map(inlineNodeToHtml).join('')
  }
  return escapeHtml(node.text || '')
}

// ── Block node → HTML ───────────────────────────────────────────

function blockNodeToHtml(node: LexicalNode): string {
  const childrenHtml = (node.children || []).map((child: LexicalNode) => {
    // If child is a block-level node, recurse as block
    if (['paragraph', 'heading', 'list', 'listitem', 'quote', 'horizontalrule'].includes(child.type)) {
      return blockNodeToHtml(child)
    }
    return inlineNodeToHtml(child)
  }).join('')

  switch (node.type) {
    case 'paragraph':
      return `<p>${childrenHtml || ''}</p>`

    case 'heading': {
      const tag = node.tag || 'h2'
      return `<${tag}>${childrenHtml}</${tag}>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      const items = (node.children || []).map(blockNodeToHtml).join('')
      return `<${tag}>${items}</${tag}>`
    }

    case 'listitem':
      return `<li>${childrenHtml}</li>`

    case 'quote':
      return `<blockquote><p>${childrenHtml}</p></blockquote>`

    case 'horizontalrule':
      return '<hr>'

    default:
      // Unknown block type – render as paragraph
      return childrenHtml ? `<p>${childrenHtml}</p>` : ''
  }
}

// ── Main export ─────────────────────────────────────────────────

export function lexicalToHtml(lexicalState: unknown): string {
  if (!lexicalState || typeof lexicalState !== 'object') return ''

  const state = lexicalState as { root?: { children?: LexicalNode[] } }
  if (!state.root?.children) return ''

  return state.root.children.map(blockNodeToHtml).join('')
}

// ── Utility ─────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
