import loadRenderer from '../../renderers'
import { CLASS_OR_ID, DIAGRAM_DOMPURIFY_CONFIG } from '../../config'
import { conflict, mixins, camelToSnake, sanitizeRaw, makeSvgResponsive, escapeHtmlTags } from '../../utils'
import { patch, toVNode, toHTML, h } from './snabbdom'
import { beginRules } from '../rules'
import renderInlines from './renderInlines'
import renderBlock from './renderBlock'

class StateRender {
  constructor (muya) {
    this.muya = muya
    this.eventCenter = muya.eventCenter
    this.codeCache = new Map()
    this.loadImageMap = new Map()
    this.loadMathMap = new Map()
    this.mermaidCache = new Map()
    this.diagramCache = new Map()
    this.tokenCache = new Map()
    this.labels = new Map()
    this.urlMap = new Map()
    this.renderingTable = null
    this.renderingRowContainer = null
    this.container = null
  }

  setContainer (container) {
    this.container = container
  }

  // collect link reference definition
  collectLabels (blocks) {
    this.labels.clear()

    const travel = block => {
      const { text, children } = block
      if (children && children.length) {
        children.forEach(c => travel(c))
      } else if (text) {
        const tokens = beginRules.reference_definition.exec(text)
        if (tokens) {
          const key = (tokens[2] + tokens[3]).toLowerCase()
          if (!this.labels.has(key)) {
            this.labels.set(key, {
              href: tokens[6],
              title: tokens[10] || ''
            })
          }
        }
      }
    }

    blocks.forEach(b => travel(b))
  }

  checkConflicted (block, token, cursor) {
    const { start, end } = cursor
    const key = block.key
    const { start: tokenStart, end: tokenEnd } = token.range

    if (key !== start.key && key !== end.key) {
      return false
    } else if (key === start.key && key !== end.key) {
      return conflict([tokenStart, tokenEnd], [start.offset, start.offset])
    } else if (key !== start.key && key === end.key) {
      return conflict([tokenStart, tokenEnd], [end.offset, end.offset])
    } else {
      return conflict([tokenStart, tokenEnd], [start.offset, start.offset]) ||
        conflict([tokenStart, tokenEnd], [end.offset, end.offset])
    }
  }

  getClassName (outerClass, block, token, cursor) {
    return outerClass || (this.checkConflicted(block, token, cursor) ? CLASS_OR_ID.AG_GRAY : CLASS_OR_ID.AG_HIDE)
  }

  getHighlightClassName (active) {
    return active ? CLASS_OR_ID.AG_HIGHLIGHT : CLASS_OR_ID.AG_SELECTION
  }

  getSelector (block, activeBlocks) {
    const { cursor, selectedBlock } = this.muya.contentState
    const type = block.type === 'hr' ? 'p' : block.type
    const isActive = activeBlocks.some(b => b.key === block.key) || block.key === cursor.start.key

    let selector = `${type}#${block.key}.${CLASS_OR_ID.AG_PARAGRAPH}`
    if (isActive) {
      selector += `.${CLASS_OR_ID.AG_ACTIVE}`
    }
    if (type === 'span') {
      selector += `.ag-${camelToSnake(block.functionType)}`
    }
    if (!block.parent && selectedBlock && block.key === selectedBlock.key) {
      selector += `.${CLASS_OR_ID.AG_SELECTED}`
    }
    return selector
  }

  async renderMermaid () {
    if (this.mermaidCache.size) {
      // Try Kroki first if enabled and load Mermaid only when needed.
      let kroki
      const useKroki = !!(this.muya.options && this.muya.options.enableKroki && this.muya.options.krokiServerUrl)
      if (useKroki) {
        try { kroki = await import('./kroki') } catch (_) {}
      }
      let mermaid
      if (!useKroki || !kroki || !kroki.isKrokiSupported('mermaid')) {
        mermaid = await loadRenderer('mermaid')
        mermaid.initialize({
          securityLevel: 'strict',
          theme: this.muya.options.mermaidTheme
        })
      }
      for (const [key, value] of this.mermaidCache.entries()) {
        const { code } = value
        const target = document.querySelector(key)
        if (!target) {
          continue
        }
        try {
          if (useKroki && kroki && kroki.isKrokiSupported('mermaid')) {
            const svg = await kroki.renderKrokiToSvg(this.muya.options.krokiServerUrl, 'mermaid', code, { timeoutMs: this.muya.options.krokiTimeoutMs })
            const processed = this.muya.options.diagramExactSize ? svg : makeSvgResponsive(svg)
            // Exact-size setting applies only to Kroki diagrams
            if (this.muya.options.diagramExactSize) {
              target.classList.add('ag-diagram-exact-size')
            } else {
              target.classList.remove('ag-diagram-exact-size')
            }
            target.innerHTML = sanitizeRaw(processed, DIAGRAM_DOMPURIFY_CONFIG)
          } else {
            // Local Mermaid rendering
            // Ensure mermaid is loaded if not already
            if (!mermaid) {
              mermaid = await loadRenderer('mermaid')
              mermaid.initialize({
                securityLevel: 'strict',
                theme: this.muya.options.mermaidTheme
              })
            }
            // Do not apply exact-size class to local renders
            target.classList.remove('ag-diagram-exact-size')
            // Render via a mermaid container so Mermaid transforms it into SVG
            const containerHtml = `<div class="mermaid">${escapeHtmlTags(code)}</div>`
            target.innerHTML = sanitizeRaw(containerHtml, DIAGRAM_DOMPURIFY_CONFIG)
            // Initialize mermaid on this target only
            mermaid.init(undefined, target.querySelectorAll('.mermaid'))
          }
        } catch (err) {
          // Do not fallback to local if Kroki is enabled; show error
          target.innerHTML = '< Invalid Mermaid Codes or Kroki error >'
          target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
        }
      }

      this.mermaidCache.clear()
    }
  }

  async renderDiagram () {
    const cache = this.diagramCache
    if (cache.size) {
      // Try to use Kroki if enabled and supported.
      let useKroki = false
      let krokiServer = ''
      let kroki
      try {
        useKroki = !!this.muya.options.enableKroki
        krokiServer = this.muya.options.krokiServerUrl || ''
        if (useKroki && krokiServer) {
          kroki = await import('./kroki')
        }
      } catch (_) {
        // Ignore Kroki import errors and fallback to local renderers
        useKroki = false
      }

      for (const [key, value] of cache.entries()) {
        const target = document.querySelector(key)
        if (!target) {
          continue
        }
        const { code, functionType } = value
        const options = {}
        if (functionType === 'sequence') {
          Object.assign(options, { theme: this.muya.options.sequenceTheme })
        } else if (functionType === 'vega-lite') {
          Object.assign(options, {
            actions: false,
            tooltip: false,
            renderer: 'svg',
            theme: this.muya.options.vegaTheme
          })
        }
        try {
          if (useKroki && kroki && kroki.isKrokiSupported(functionType)) {
            target.innerHTML = 'Loading...'
            const svg = await kroki.renderKrokiToSvg(krokiServer, functionType, code, { timeoutMs: this.muya.options.krokiTimeoutMs })
            const processed = this.muya.options.diagramExactSize ? svg : makeSvgResponsive(svg)
            if (this.muya.options.diagramExactSize) {
              target.classList.add('ag-diagram-exact-size')
            } else {
              target.classList.remove('ag-diagram-exact-size')
            }
            target.innerHTML = sanitizeRaw(processed, DIAGRAM_DOMPURIFY_CONFIG)
          } else if (functionType === 'flowchart' || functionType === 'sequence') {
            const render = await loadRenderer(functionType)
            // Exact-size toggle is Kroki-only
            target.classList.remove('ag-diagram-exact-size')
            const diagram = render.parse(code)
            target.innerHTML = ''
            diagram.drawSVG(target, options)
          } else if (functionType === 'plantuml') {
            const render = await loadRenderer('plantuml')
            // Exact-size toggle is Kroki-only
            target.classList.remove('ag-diagram-exact-size')
            const diagram = render.parse(code)
            target.innerHTML = ''
            diagram.insertImgElement(target)
          } else if (functionType === 'vega-lite') {
            const render = await loadRenderer('vega-lite')
            // Exact-size toggle is Kroki-only
            target.classList.remove('ag-diagram-exact-size')
            await render(key, JSON.parse(code), options)
          }
        } catch (err) {
          // Do not fallback to local if Kroki is enabled; show error
          const msg = functionType === 'flowchart' ? 'Flow Chart' : (functionType === 'sequence' ? 'Sequence' : functionType)
          target.innerHTML = `<! Invalid ${msg} Codes or Kroki error >`
          target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
        }
      }
      this.diagramCache.clear()
    }
  }

  render (blocks, activeBlocks, matches) {
    const selector = `div#${CLASS_OR_ID.AG_EDITOR_ID}`
    const children = blocks.map(block => {
      return this.renderBlock(null, block, activeBlocks, matches, true)
    })
    const newVdom = h(selector, children)
    const rootDom = document.querySelector(selector) || this.container
    const oldVdom = toVNode(rootDom)

    patch(oldVdom, newVdom)
    this.renderMermaid()
    this.renderDiagram()
    this.codeCache.clear()
  }

  // Only render the blocks which you updated
  partialRender (blocks, activeBlocks, matches, startKey, endKey) {
    const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1]
    // If cursor is not in render blocks, need to render cursor block independently
    const needRenderCursorBlock = blocks.indexOf(cursorOutMostBlock) === -1
    const newVnode = h('section', blocks.map(block => this.renderBlock(null, block, activeBlocks, matches)))
    const html = toHTML(newVnode).replace(/^<section>([\s\S]+?)<\/section>$/, '$1')

    const needToRemoved = []
    const firstOldDom = startKey
      ? document.querySelector(`#${startKey}`)
      : document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`).firstElementChild
    if (!firstOldDom) {
      // TODO@Jocs Just for fix #541, Because I'll rewrite block and render method, it will nolonger have this issue.
      return
    }
    needToRemoved.push(firstOldDom)
    let nextSibling = firstOldDom.nextElementSibling
    while (nextSibling && nextSibling.id !== endKey) {
      needToRemoved.push(nextSibling)
      nextSibling = nextSibling.nextElementSibling
    }
    nextSibling && needToRemoved.push(nextSibling)

    firstOldDom.insertAdjacentHTML('beforebegin', html)

    Array.from(needToRemoved).forEach(dom => dom.remove())

    // Render cursor block independently
    if (needRenderCursorBlock) {
      const { key } = cursorOutMostBlock
      const cursorDom = document.querySelector(`#${key}`)
      if (cursorDom) {
        const oldCursorVnode = toVNode(cursorDom)
        const newCursorVnode = this.renderBlock(null, cursorOutMostBlock, activeBlocks, matches)
        patch(oldCursorVnode, newCursorVnode)
      }
    }

    this.renderMermaid()
    this.renderDiagram()
    this.codeCache.clear()
  }

  /**
   * Only render one block.
   *
   * @param {object} block
   * @param {array} activeBlocks
   * @param {array} matches
   */
  singleRender (block, activeBlocks, matches) {
    const selector = `#${block.key}`
    const newVdom = this.renderBlock(null, block, activeBlocks, matches, true)
    const rootDom = document.querySelector(selector)
    const oldVdom = toVNode(rootDom)
    patch(oldVdom, newVdom)
    this.renderMermaid()
    this.renderDiagram()
    this.codeCache.clear()
  }

  invalidateImageCache () {
    this.loadImageMap.forEach((imageInfo, key) => {
      imageInfo.touchMsec = Date.now()
      this.loadImageMap.set(key, imageInfo)
    })
  }
}

mixins(StateRender, renderInlines, renderBlock)

export default StateRender
