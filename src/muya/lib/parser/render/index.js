import { CLASS_OR_ID, DIAGRAM_DOMPURIFY_CONFIG } from '../../config'
import { conflict, mixins, camelToSnake, sanitizeRaw } from '../../utils'
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
      // Kroki Always-On: Only use Kroki server for rendering
      let kroki
      try {
        kroki = await import('./kroki')
      } catch (err) {
        // If Kroki module cannot be loaded, show error for all diagrams
        for (const [key] of this.mermaidCache.entries()) {
          const target = document.querySelector(key)
          if (target) {
            target.innerHTML = `<div class="ag-diagram-error">
              <strong>Mermaid Diagram Error:</strong><br>
              Kroki module could not be loaded: ${err.message}
            </div>`
            target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
          }
        }
        this.mermaidCache.clear()
        return
      }

      for (const [key, value] of this.mermaidCache.entries()) {
        const { code } = value
        const target = document.querySelector(key)
        if (!target) {
          continue
        }

        try {
          const serverUrl = this.muya.options.krokiServerUrl || 'http://localhost:8000'
          const timeoutMs = this.muya.options.krokiTimeoutMs || 5000

          const svg = await kroki.renderKrokiToSvg(serverUrl, 'mermaid', code, { timeoutMs })
          target.classList.add('ag-diagram-exact-size')
          target.innerHTML = sanitizeRaw(svg, DIAGRAM_DOMPURIFY_CONFIG)
        } catch (err) {
          target.innerHTML = `<div class="ag-diagram-error">
            <strong>Mermaid Diagram Error:</strong><br>
            ${err.message || 'Unknown rendering error'}
          </div>`
          target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
        }
      }

      this.mermaidCache.clear()
    }
  }

  async renderDiagram () {
    const cache = this.diagramCache
    if (cache.size) {
      // Kroki Always-On: Only use Kroki server for rendering
      let kroki
      try {
        kroki = await import('./kroki')
      } catch (err) {
        // If Kroki module cannot be loaded, show error for all diagrams
        for (const [key, value] of cache.entries()) {
          const target = document.querySelector(key)
          if (target) {
            const { functionType } = value
            const diagramName = functionType === 'flowchart'
              ? 'Flowchart'
              : functionType === 'sequence'
                ? 'Sequence Diagram'
                : functionType === 'plantuml'
                  ? 'PlantUML'
                  : functionType === 'vega-lite'
                    ? 'Vega-Lite'
                    : functionType.charAt(0).toUpperCase() + functionType.slice(1)

            target.innerHTML = `<div class="ag-diagram-error">
              <strong>${diagramName} Error:</strong><br>
              Kroki module could not be loaded: ${err.message}
            </div>`
            target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
          }
        }
        this.diagramCache.clear()
        return
      }

      for (const [key, value] of cache.entries()) {
        const target = document.querySelector(key)
        if (!target) {
          continue
        }
        const { code, functionType } = value

        try {
          const serverUrl = this.muya.options.krokiServerUrl || 'http://localhost:8000'
          const timeoutMs = this.muya.options.krokiTimeoutMs || 5000

          if (kroki.isKrokiSupported(functionType)) {
            target.innerHTML = 'Loading...'
            const svg = await kroki.renderKrokiToSvg(serverUrl, functionType, code, { timeoutMs })
            target.classList.add('ag-diagram-exact-size')
            target.innerHTML = sanitizeRaw(svg, DIAGRAM_DOMPURIFY_CONFIG)
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

          target.innerHTML = `<div class="ag-diagram-error">
            <strong>${diagramName} Error:</strong><br>
            ${err.message || 'Unknown rendering error'}
          </div>`
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
