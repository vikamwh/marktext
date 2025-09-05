import marked from '../parser/marked'
import Prism from 'prismjs'
import katex from 'katex'
import 'katex/dist/contrib/mhchem.min.js'
// All renderers removed in favor of Kroki Always-On
import githubMarkdownCss from 'github-markdown-css/github-markdown.css'
import exportStyle from '../assets/styles/exportStyle.css'
import highlightCss from 'prismjs/themes/prism.css'
import katexCss from 'katex/dist/katex.css'
import footerHeaderCss from '../assets/styles/headerFooterStyle.css'
import { EXPORT_DOMPURIFY_CONFIG, DIAGRAM_DOMPURIFY_CONFIG } from '../config'
import { sanitize, sanitizeRaw, unescapeHTML } from '../utils'
import { validEmoji } from '../ui/emojis'

export const getSanitizeHtml = (markdown, options) => {
  const html = marked(markdown, options)
  return sanitize(html, EXPORT_DOMPURIFY_CONFIG, false)
}

const DIAGRAM_TYPE = [
  'mermaid',
  'flowchart',
  'sequence',
  'plantuml',
  'vega-lite'
]

class ExportHtml {
  constructor (markdown, muya) {
    this.markdown = markdown
    this.muya = muya
    this.exportContainer = null
    this.mathRendererCalled = false
    this.diagramErrors = []
  }

  async renderMermaid () {
    const codes = this.exportContainer.querySelectorAll('code.language-mermaid')
    // Kroki Always-On: Only use Kroki server for rendering
    let kroki
    try {
      kroki = await import('../parser/render/kroki')
    } catch (err) {
      // If Kroki module cannot be loaded, show error for all diagrams
      for (const code of codes) {
        const preEle = code.parentNode
        const container = document.createElement('div')
        container.innerHTML = `<div class="ag-diagram-error">
          <strong>Mermaid Diagram Error:</strong><br>
          Kroki module could not be loaded: ${err.message}
        </div>`
        preEle.replaceWith(container)
      }
      return
    }

    for (const code of codes) {
      const raw = unescapeHTML(code.innerHTML)
      const preEle = code.parentNode
      const container = document.createElement('div')

      try {
        const serverUrl = (this.muya && this.muya.options && this.muya.options.krokiServerUrl) || 'http://localhost:8000'
        const timeoutMs = (this.muya && this.muya.options && this.muya.options.krokiTimeoutMs) || 5000

        const svg = await kroki.renderKrokiToSvg(serverUrl, 'mermaid', raw, { timeoutMs })
        container.innerHTML = sanitizeRaw(svg, DIAGRAM_DOMPURIFY_CONFIG)
      } catch (err) {
        this.diagramErrors.push(`Mermaid: ${err.message || 'Unknown rendering error'}`)
        container.innerHTML = `<div class="ag-diagram-error">
          <strong>Mermaid Diagram Error:</strong><br>
          ${err.message || 'Unknown rendering error'}
        </div>`
      }
      preEle.replaceWith(container)
    }
  }

  async renderDiagram () {
    const selector = 'code.language-vega-lite, code.language-flowchart, code.language-sequence, code.language-plantuml'
    // Kroki Always-On: Only use Kroki server for rendering
    let kroki
    try {
      kroki = await import('../parser/render/kroki')
    } catch (err) {
      // If Kroki module cannot be loaded, show error for all diagrams
      const codes = this.exportContainer.querySelectorAll(selector)
      for (const code of codes) {
        const functionType = (() => {
          if (/sequence/.test(code.className)) {
            return 'sequence'
          } else if (/plantuml/.test(code.className)) {
            return 'plantuml'
          } else if (/flowchart/.test(code.className)) {
            return 'flowchart'
          } else {
            return 'vega-lite'
          }
        })()

        const diagramName = functionType === 'flowchart'
          ? 'Flowchart'
          : functionType === 'sequence'
            ? 'Sequence Diagram'
            : functionType === 'plantuml'
              ? 'PlantUML'
              : functionType === 'vega-lite'
                ? 'Vega-Lite'
                : functionType.charAt(0).toUpperCase() + functionType.slice(1)

        const preParent = code.parentNode
        const diagramContainer = document.createElement('div')
        this.diagramErrors.push(`${diagramName}: Kroki module could not be loaded: ${err.message}`)
        diagramContainer.innerHTML = `<div class="ag-diagram-error">
          <strong>${diagramName} Error:</strong><br>
          Kroki module could not be loaded: ${err.message}
        </div>`
        preParent.replaceWith(diagramContainer)
      }
      return
    }

    const codes = this.exportContainer.querySelectorAll(selector)
    for (const code of codes) {
      const rawCode = unescapeHTML(code.innerHTML)
      const functionType = (() => {
        if (/sequence/.test(code.className)) {
          return 'sequence'
        } else if (/plantuml/.test(code.className)) {
          return 'plantuml'
        } else if (/flowchart/.test(code.className)) {
          return 'flowchart'
        } else {
          return 'vega-lite'
        }
      })()

      const preParent = code.parentNode
      const diagramContainer = document.createElement('div')
      diagramContainer.classList.add(functionType)
      preParent.replaceWith(diagramContainer)

      try {
        const serverUrl = (this.muya && this.muya.options && this.muya.options.krokiServerUrl) || 'http://localhost:8000'
        const timeoutMs = (this.muya && this.muya.options && this.muya.options.krokiTimeoutMs) || 5000

        if (kroki.isKrokiSupported(functionType)) {
          const svg = await kroki.renderKrokiToSvg(serverUrl, functionType, rawCode, { timeoutMs })
          diagramContainer.innerHTML = sanitizeRaw(svg, DIAGRAM_DOMPURIFY_CONFIG)
        } else {
          throw new Error(`Diagram type "${functionType}" is not supported by Kroki`)
        }
      } catch (err) {
        const diagramName = functionType === 'flowchart'
          ? 'Flowchart'
          : functionType === 'sequence'
            ? 'Sequence Diagram'
            : functionType === 'plantuml'
              ? 'PlantUML'
              : functionType === 'vega-lite'
                ? 'Vega-Lite'
                : functionType.charAt(0).toUpperCase() + functionType.slice(1)

        this.diagramErrors.push(`${diagramName}: ${err.message || 'Unknown rendering error'}`)
        diagramContainer.innerHTML = `<div class="ag-diagram-error">
          <strong>${diagramName} Error:</strong><br>
          ${err.message || 'Unknown rendering error'}
        </div>`
      }
    }
  }

  mathRenderer = (math, displayMode) => {
    this.mathRendererCalled = true

    try {
      return katex.renderToString(math, {
        displayMode
      })
    } catch (err) {
      return displayMode
        ? `<pre class="multiple-math invalid">\n${math}</pre>\n`
        : `<span class="inline-math invalid" title="invalid math">${math}</span>`
    }
  }

  // render pure html by marked
  async renderHtml (toc) {
    this.mathRendererCalled = false
    let html = marked(this.markdown, {
      superSubScript: this.muya ? this.muya.options.superSubScript : false,
      footnote: this.muya ? this.muya.options.footnote : false,
      isGitlabCompatibilityEnabled: this.muya ? this.muya.options.isGitlabCompatibilityEnabled : false,
      highlight (code, lang) {
        // Language may be undefined (GH#591)
        if (!lang) {
          return code
        }

        if (DIAGRAM_TYPE.includes(lang)) {
          return code
        }

        const grammar = Prism.languages[lang]
        if (!grammar) {
          console.warn(`Unable to find grammar for "${lang}".`)
          return code
        }
        return Prism.highlight(code, grammar, lang)
      },
      emojiRenderer (emoji) {
        const validate = validEmoji(emoji)
        if (validate) {
          return validate.emoji
        } else {
          return `:${emoji}:`
        }
      },
      mathRenderer: this.mathRenderer,
      tocRenderer () {
        if (!toc) {
          return ''
        }
        return toc
      }
    })

    html = sanitize(html, EXPORT_DOMPURIFY_CONFIG, false)

    const exportContainer = this.exportContainer = document.createElement('div')
    exportContainer.classList.add('ag-render-container')
    exportContainer.innerHTML = html
    document.body.appendChild(exportContainer)

    // render only render the light theme of mermaid and diragram...
    await this.renderMermaid()
    await this.renderDiagram()
    let result = exportContainer.innerHTML
    exportContainer.remove()

    // hack to add arrow marker to output html
    const pathes = document.querySelectorAll('path[id^=raphael-marker-]')
    const def = '<defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">'
    result = result.replace(def, () => {
      let str = ''
      for (const path of pathes) {
        str += path.outerHTML
      }
      return `${def}${str}`
    })

    this.exportContainer = null
    return result
  }

  /**
   * Get HTML with style
   *
   * @param {*} options Document options
   */
  async generate (options) {
    const { printOptimization } = options

    // WORKAROUND: Hide Prism.js style when exporting or printing. Otherwise the background color is white in the dark theme.
    const highlightCssStyle = printOptimization ? `@media print { ${highlightCss} }` : highlightCss
    const html = this._prepareHtml(await this.renderHtml(options.toc), options)
    const katexCssStyle = this.mathRendererCalled ? katexCss : ''
    this.mathRendererCalled = false

    // `extraCss` may changed in the mean time.
    const { title, extraCss } = options
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${sanitize(title, EXPORT_DOMPURIFY_CONFIG, true)}</title>
  <style>
  ${githubMarkdownCss}
  </style>
  <style>
  ${highlightCssStyle}
  </style>
  <style>
  ${katexCssStyle}
  </style>
  <style>
    .markdown-body {
      font-family: -apple-system,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }

    @media not print {
      .markdown-body {
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
    }

    .hf-container {
      color: #24292e;
      line-height: 1.3;
    }

    .markdown-body .highlight pre,
    .markdown-body pre {
      white-space: pre-wrap;
    }
    .markdown-body table {
      display: table;
    }
    .markdown-body img[data-align="center"] {
      display: block;
      margin: 0 auto;
    }
    .markdown-body img[data-align="right"] {
      display: block;
      margin: 0 0 0 auto;
    }
    .markdown-body li.task-list-item {
      list-style-type: none;
    }
    .markdown-body li > [type=checkbox] {
      margin: 0 0 0 -1.3em;
    }
    .markdown-body input[type="checkbox"] ~ p {
      margin-top: 0;
      display: inline-block;
    }
    .markdown-body ol ol,
    .markdown-body ul ol {
      list-style-type: decimal;
    }
    .markdown-body ol ol ol,
    .markdown-body ol ul ol,
    .markdown-body ul ol ol,
    .markdown-body ul ul ol {
      list-style-type: decimal;
    }
  </style>
  <style>${exportStyle}</style>
  <style>${extraCss}</style>
</head>
<body>
  ${html}
</body>
</html>`
    return {
      html: htmlContent,
      diagramErrors: this.diagramErrors
    }
  }

  /**
   * @private
   *
   * @param {string} html The converted HTML text.
   * @param {*} options The export options.
   */
  _prepareHtml (html, options) {
    const { header, footer } = options
    const appendHeaderFooter = !!header || !!footer
    if (!appendHeaderFooter) {
      return createMarkdownArticle(html)
    }

    if (!options.extraCss) {
      options.extraCss = footerHeaderCss
    } else {
      options.extraCss = footerHeaderCss + options.extraCss
    }

    let output = HF_TABLE_START
    if (header) {
      output += createTableHeader(options)
    }

    if (footer) {
      output += HF_TABLE_FOOTER
      output = createRealFooter(options) + output
    }

    output = output + createTableBody(html) + HF_TABLE_END
    return sanitize(output, EXPORT_DOMPURIFY_CONFIG, false)
  }
}

// Variables and function to generate the header and footer.
const HF_TABLE_START = '<table class="page-container">'
const createTableBody = html => {
  return `<tbody><tr><td>
  <div class="main-container">
    ${createMarkdownArticle(html)}
  </div>
</td></tr></tbody>`
}
const HF_TABLE_END = '</table>'

/// The header at is shown at the top.
const createTableHeader = options => {
  const { header, headerFooterStyled } = options
  const { type, left, center, right } = header
  let headerClass = type === 1 ? 'single' : ''
  headerClass += getHeaderFooterStyledClass(headerFooterStyled)
  return `<thead class="page-header ${headerClass}"><tr><th>
  <div class="hf-container">
    <div class="header-content-left">${left}</div>
    <div class="header-content">${center}</div>
    <div class="header-content-right">${right}</div>
  </div>
</th></tr></thead>`
}

/// Fake footer to reserve space.
const HF_TABLE_FOOTER = `<tfoot class="page-footer-fake"><tr><td>
  <div class="hf-container">
    &nbsp;
  </div>
</td></tr></tfoot>`

/// The real footer at is shown at the bottom.
const createRealFooter = options => {
  const { footer, headerFooterStyled } = options
  const { type, left, center, right } = footer
  let footerClass = type === 1 ? 'single' : ''
  footerClass += getHeaderFooterStyledClass(headerFooterStyled)
  return `<div class="page-footer ${footerClass}">
  <div class="hf-container">
    <div class="footer-content-left">${left}</div>
    <div class="footer-content">${center}</div>
    <div class="footer-content-right">${right}</div>
  </div>
</div>`
}

/// Generate the mardown article HTML.
const createMarkdownArticle = html => {
  return `<article class="markdown-body">${html}</article>`
}

/// Return the class whether a header/footer should be styled.
const getHeaderFooterStyledClass = value => {
  if (value === undefined) {
    // Prefer theme settings.
    return ''
  }
  return !value ? ' simple' : ' styled'
}

export default ExportHtml
