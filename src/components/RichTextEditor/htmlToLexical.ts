/**
 * Converts Tiptap HTML output to Payload CMS Lexical JSON format.
 *
 * Supported mappings:
 *   <p>         → paragraph
 *   <h1>-<h4>   → heading (tag h1-h4)
 *   <strong>     → format bit 1 (bold)
 *   <em>         → format bit 2 (italic)
 *   <u>          → format bit 8 (underline)
 *   <s>          → format bit 4 (strikethrough)
 *   <code>       → format bit 16 (inline code)
 *   <ul>/<ol>    → list (bullet / number)
 *   <li>         → listitem
 *   <blockquote> → quote
 *   <pre><code>  → paragraph (code-formatted)
 *   <a>          → link node wrapping text children
 *   <hr>         → horizontalrule
 *   <br>         → linebreak
 */

// ── Lexical node types ──────────────────────────────────────────

interface LexicalTextNode {
  type: 'text'
  text: string
  detail: number
  format: number
  mode: 'normal'
  style: string
  version: 1
}

interface LexicalLinebreakNode {
  type: 'linebreak'
  version: 1
}

interface LexicalLinkNode {
  type: 'link'
  children: LexicalInlineNode[]
  direction: 'ltr'
  format: ''
  indent: number
  version: 3
  fields: {
    linkType: 'custom'
    newTab: boolean
    url: string
  }
}

type LexicalInlineNode = LexicalTextNode | LexicalLinebreakNode | LexicalLinkNode

interface LexicalParagraphNode {
  type: 'paragraph'
  children: LexicalInlineNode[]
  direction: 'ltr'
  format: ''
  indent: number
  textFormat: number
  textStyle: string
  version: 1
}

interface LexicalHeadingNode {
  type: 'heading'
  children: LexicalInlineNode[]
  direction: 'ltr'
  format: ''
  indent: number
  tag: 'h1' | 'h2' | 'h3' | 'h4'
  version: 1
}

interface LexicalListItemNode {
  type: 'listitem'
  children: LexicalInlineNode[]
  direction: 'ltr'
  format: ''
  indent: number
  value: number
  version: 1
}

interface LexicalListNode {
  type: 'list'
  children: LexicalListItemNode[]
  direction: 'ltr'
  format: ''
  indent: number
  listType: 'bullet' | 'number'
  start: number
  tag: 'ul' | 'ol'
  version: 1
}

interface LexicalQuoteNode {
  type: 'quote'
  children: LexicalInlineNode[]
  direction: 'ltr'
  format: ''
  indent: number
  version: 1
}

interface LexicalHorizontalRuleNode {
  type: 'horizontalrule'
  version: 1
}

type LexicalBlockNode =
  | LexicalParagraphNode
  | LexicalHeadingNode
  | LexicalListNode
  | LexicalQuoteNode
  | LexicalHorizontalRuleNode

interface LexicalRootNode {
  type: 'root'
  children: LexicalBlockNode[]
  direction: 'ltr'
  format: ''
  indent: number
  version: 1
}

export interface LexicalEditorState {
  root: LexicalRootNode
}

// ── Format bitmask helpers ──────────────────────────────────────

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

// ── DOM parser ──────────────────────────────────────────────────

function parseHTML(html: string): Document {
  if (typeof window !== 'undefined') {
    const parser = new DOMParser()
    return parser.parseFromString(html, 'text/html')
  }
  // SSR fallback – shouldn't be called server-side but just in case
  throw new Error('htmlToLexical must be called on the client')
}

// ── Inline node extraction ──────────────────────────────────────

function getFormatFromElement(el: Element, inheritedFormat: number): number {
  let fmt = inheritedFormat
  const tag = el.tagName.toLowerCase()
  if (tag === 'strong' || tag === 'b') fmt |= FORMAT_BOLD
  if (tag === 'em' || tag === 'i') fmt |= FORMAT_ITALIC
  if (tag === 'u') fmt |= FORMAT_UNDERLINE
  if (tag === 's' || tag === 'del' || tag === 'strike') fmt |= FORMAT_STRIKETHROUGH
  if (tag === 'code') fmt |= FORMAT_CODE
  return fmt
}

function extractInlineNodes(node: Node, format: number = 0): LexicalInlineNode[] {
  const nodes: LexicalInlineNode[] = []

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (text) {
      nodes.push({
        type: 'text',
        text,
        detail: 0,
        format,
        mode: 'normal',
        style: '',
        version: 1,
      })
    }
    return nodes
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return nodes

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  // Line break
  if (tag === 'br') {
    nodes.push({ type: 'linebreak', version: 1 })
    return nodes
  }

  // Link
  if (tag === 'a') {
    const href = el.getAttribute('href') || ''
    const target = el.getAttribute('target') || ''
    const children: LexicalInlineNode[] = []
    el.childNodes.forEach((child) => {
      children.push(...extractInlineNodes(child, format))
    })
    if (children.length === 0) {
      children.push({
        type: 'text',
        text: el.textContent || href,
        detail: 0,
        format,
        mode: 'normal',
        style: '',
        version: 1,
      })
    }
    nodes.push({
      type: 'link',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 3,
      fields: {
        linkType: 'custom',
        newTab: target === '_blank',
        url: href,
      },
    })
    return nodes
  }

  // Inline formatting elements
  const newFormat = getFormatFromElement(el, format)
  el.childNodes.forEach((child) => {
    nodes.push(...extractInlineNodes(child, newFormat))
  })

  return nodes
}

// ── Block node conversion ───────────────────────────────────────

function convertElement(el: Element): LexicalBlockNode[] {
  const tag = el.tagName.toLowerCase()
  const blocks: LexicalBlockNode[] = []

  // Headings
  if (/^h[1-4]$/.test(tag)) {
    const children = extractInlineNodes(el)
    blocks.push({
      type: 'heading',
      children: children.length ? children : [emptyText()],
      direction: 'ltr',
      format: '',
      indent: 0,
      tag: tag as 'h1' | 'h2' | 'h3' | 'h4',
      version: 1,
    })
    return blocks
  }

  // Paragraph
  if (tag === 'p') {
    const children = extractInlineNodes(el)
    blocks.push(makeParagraph(children.length ? children : [emptyText()]))
    return blocks
  }

  // Lists
  if (tag === 'ul' || tag === 'ol') {
    const items: LexicalListItemNode[] = []
    let idx = 1
    el.querySelectorAll(':scope > li').forEach((li) => {
      const children = extractInlineNodes(li)
      items.push({
        type: 'listitem',
        children: children.length ? children : [emptyText()],
        direction: 'ltr',
        format: '',
        indent: 0,
        value: idx++,
        version: 1,
      })
    })
    if (items.length) {
      blocks.push({
        type: 'list',
        children: items,
        direction: 'ltr',
        format: '',
        indent: 0,
        listType: tag === 'ul' ? 'bullet' : 'number',
        start: 1,
        tag,
        version: 1,
      })
    }
    return blocks
  }

  // Blockquote
  if (tag === 'blockquote') {
    // Collect inline content from all child paragraphs
    const children: LexicalInlineNode[] = []
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === 'p') {
        if (children.length > 0) {
          children.push({ type: 'linebreak', version: 1 })
        }
        children.push(...extractInlineNodes(child as Element))
      } else {
        children.push(...extractInlineNodes(child))
      }
    })
    blocks.push({
      type: 'quote',
      children: children.length ? children : [emptyText()],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })
    return blocks
  }

  // Code block (pre > code)
  if (tag === 'pre') {
    const codeEl = el.querySelector('code')
    const text = codeEl ? codeEl.textContent || '' : el.textContent || ''
    blocks.push(
      makeParagraph([
        {
          type: 'text',
          text,
          detail: 0,
          format: FORMAT_CODE,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ])
    )
    return blocks
  }

  // Horizontal rule
  if (tag === 'hr') {
    blocks.push({ type: 'horizontalrule', version: 1 })
    return blocks
  }

  // Div or other wrapper – recurse into children
  if (tag === 'div' || tag === 'section' || tag === 'article') {
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        blocks.push(...convertElement(child as Element))
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        blocks.push(makeParagraph(extractInlineNodes(child)))
      }
    })
    return blocks
  }

  // Fallback – treat as paragraph
  const children = extractInlineNodes(el)
  if (children.length) {
    blocks.push(makeParagraph(children))
  }

  return blocks
}

// ── Helpers ─────────────────────────────────────────────────────

function emptyText(): LexicalTextNode {
  return {
    type: 'text',
    text: '',
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function makeParagraph(children: LexicalInlineNode[]): LexicalParagraphNode {
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  }
}

// ── Main export ─────────────────────────────────────────────────

export function htmlToLexical(html: string): LexicalEditorState {
  if (!html || html === '<p></p>') {
    return {
      root: {
        type: 'root',
        children: [makeParagraph([emptyText()])],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  const doc = parseHTML(html)
  const body = doc.body
  const blocks: LexicalBlockNode[] = []

  body.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      blocks.push(...convertElement(child as Element))
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      blocks.push(makeParagraph(extractInlineNodes(child)))
    }
  })

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push(makeParagraph([emptyText()]))
  }

  return {
    root: {
      type: 'root',
      children: blocks,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Extracts plain text from HTML (for word count, meta descriptions, etc.)
 */
export function htmlToPlainText(html: string): string {
  if (!html) return ''
  if (typeof window !== 'undefined') {
    const doc = parseHTML(html)
    return doc.body.textContent || ''
  }
  // Simple fallback for SSR
  return html.replace(/<[^>]*>/g, '')
}
