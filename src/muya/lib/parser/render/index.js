import { CLASS_OR_ID, DIAGRAM_DOMPURIFY_CONFIG } from '../../config'
import { conflict, mixins, camelToSnake, sanitizeRaw } from '../../utils'
import { patch, toVNode, toHTML, h } from './snabbdom'
import { beginRules } from '../rules'
import renderInlines from './renderInlines'
import renderBlock from './renderBlock'
import ParallelProcessor from '../../utils/parallelProcessor'

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
    this.parallelProcessor = new ParallelProcessor(5) // Default to 5 concurrent requests
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
      // Update parallel processor settings
      const maxParallel = this.muya.options.krokiParallelRequests || 5
      this.parallelProcessor.setMaxConcurrency(maxParallel)

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

      // Prepare diagram rendering tasks
      const diagramTasks = Array.from(this.mermaidCache.entries()).map(([key, value]) => ({
        key,
        value,
        target: document.querySelector(key)
      })).filter(item => item.target) // Only process diagrams with valid targets

      // Process diagrams in parallel
      const serverUrl = this.muya.options.krokiServerUrl || 'https://kroki.io'
      const timeoutMs = this.muya.options.krokiTimeoutMs || 5000

      const results = await this.parallelProcessor.processAll(
        diagramTasks,
        async ({ key, value, target }, index) => {
          const { code, functionType } = value

          console.log(`📊 Processing ${functionType} ${index}:`, key, code.substring(0, 50))
          // Show loading indicator
          target.innerHTML = `<div class="ag-diagram-loading">Rendering ${functionType} diagram...</div>`

          try {
            const svg = await kroki.renderKrokiToSvg(serverUrl, functionType, code, { timeoutMs })
            console.log(`✅ ${functionType} ${index} success:`, svg.length, 'chars')
            return { key, target, svg, success: true }
          } catch (err) {
            console.log(`❌ ${functionType} ${index} error:`, err.message)
            return { key, target, error: err.message || 'Unknown rendering error', success: false }
          }
        }
      )

      console.log('🏁 Mermaid parallel processing complete:', results.length, 'results')

      // Apply results to DOM
      console.log('🎨 Applying mermaid results to DOM...')
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const task = diagramTasks[i]

        console.log(`🎯 Processing result ${i}:`, {
          success: result.success,
          hasResult: !!result.result,
          resultSuccess: result.result?.success,
          hasTarget: !!result.result?.target || !!task?.target,
          hasSvg: !!result.result?.svg,
          error: result.success ? result.result?.error : result.error
        })

        if (result.success && result.result) {
          // Successful rendering
          const { target, svg } = result.result
          if (target && svg) {
            console.log(`✅ Applying SVG to target ${i}`)
            // Clear any existing content and classes first
            target.className = ''
            target.innerHTML = ''

            // Force a reflow to ensure clean state
            // eslint-disable-next-line no-unused-expressions
            target.offsetHeight

            // Apply new content and styling
            target.classList.add('ag-diagram-exact-size')
            target.innerHTML = sanitizeRaw(svg, DIAGRAM_DOMPURIFY_CONFIG)

            // Ensure SVG is properly sized while preserving original dimensions
            const svgElement = target.querySelector('svg')
            if (svgElement) {
              // Store and preserve original dimensions
              const viewBox = svgElement.getAttribute('viewBox')
              const width = svgElement.getAttribute('width')
              const height = svgElement.getAttribute('height')

              // Calculate original size and preserve it
              let originalWidth = width
              let originalHeight = height

              if (viewBox) {
                const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number)
                if (!width) originalWidth = vbWidth
                if (!height) originalHeight = vbHeight
              }

              // Apply gentle constraints that preserve the original size
              if (originalWidth && originalHeight) {
                svgElement.style.width = `${originalWidth}px`
                svgElement.style.height = `${originalHeight}px`
                svgElement.style.maxWidth = '100%'
                svgElement.style.maxHeight = 'none'
              } else {
                svgElement.style.maxWidth = '100%'
                svgElement.style.height = 'auto'
              }

              // Ensure block display and preserve viewBox
              svgElement.style.display = 'block'

              if (!viewBox && originalWidth && originalHeight) {
                svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`)
              }

              // Mark this SVG as mermaid-protected to avoid interference from other diagram rendering
              svgElement.setAttribute('data-diagram-type', 'mermaid')
              svgElement.setAttribute('data-protected', 'true')

              // Set up observer to detect and prevent unwanted changes from other diagram renderers
              let isProtecting = false
              const observer = new MutationObserver((mutations) => {
                if (isProtecting) return

                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentStyle = svgElement.getAttribute('style') || ''
                    // Detect interference from other rendering processes
                    if (currentStyle.includes('font-size') || currentStyle.includes('font-weight') ||
                        currentStyle.includes('font-family') || currentStyle.includes('transform')) {
                      isProtecting = true
                      console.log('🛡️  Protecting Mermaid SVG from external style changes')

                      // Reapply our size constraints
                      if (originalWidth && originalHeight) {
                        svgElement.style.width = `${originalWidth}px`
                        svgElement.style.height = `${originalHeight}px`
                        svgElement.style.maxWidth = '100%'
                      }
                      svgElement.style.display = 'block'

                      // Reset problematic font properties
                      svgElement.style.fontSize = ''
                      svgElement.style.fontWeight = ''
                      svgElement.style.fontFamily = ''

                      setTimeout(() => { isProtecting = false }, 100)
                    }
                  }
                })
              })
              observer.observe(svgElement, { attributes: true, attributeFilter: ['style'] })

              // Also observe text elements within SVG for font changes
              const textElements = svgElement.querySelectorAll('text, tspan')
              textElements.forEach(textEl => {
                // Mark text elements as protected
                textEl.setAttribute('data-mermaid-text', 'true')

                const textObserver = new MutationObserver(() => {
                  if (isProtecting) return
                  // Reset font styles on text elements if they get modified by external processes
                  if (textEl.style.fontWeight !== '' || textEl.style.fontSize !== '') {
                    console.log('🛡️  Resetting Mermaid text styling')
                    textEl.style.fontWeight = ''
                    textEl.style.fontSize = ''
                  }
                })
                textObserver.observe(textEl, { attributes: true, attributeFilter: ['style'] })
                setTimeout(() => textObserver.disconnect(), 30000) // Longer protection
              })

              // Clean up main observer after 30 seconds (longer protection)
              setTimeout(() => observer.disconnect(), 30000)
            }
          } else {
            console.log(`⚠️  Missing target or SVG for result ${i}`)
          }
        } else {
          // Error rendering
          const error = result.success ? result.result?.error || 'Unknown error' : result.error?.message || result.error || 'Processing failed'
          const target = result.success ? result.result?.target : task?.target

          console.log(`❌ Applying error to target ${i}:`, error)
          if (target) {
            target.innerHTML = `<div class="ag-diagram-error">
              <strong>Mermaid Diagram Error:</strong><br>
              ${error}
            </div>`
            target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
          } else {
            console.log(`❌ No target found for error ${i}`)
          }
        }
      }

      this.mermaidCache.clear()
    }
  }

  async renderDiagram () {
    const cache = this.diagramCache
    if (cache.size) {
      // Update parallel processor settings
      const maxParallel = this.muya.options.krokiParallelRequests || 5
      this.parallelProcessor.setMaxConcurrency(maxParallel)

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
            const diagramName = this.getDiagramDisplayName(functionType)

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

      // Prepare diagram rendering tasks
      const diagramTasks = Array.from(cache.entries()).map(([key, value]) => ({
        key,
        value,
        target: document.querySelector(key)
      })).filter(item => item.target) // Only process diagrams with valid targets

      // Process diagrams in parallel
      const serverUrl = this.muya.options.krokiServerUrl || 'https://kroki.io'
      const timeoutMs = this.muya.options.krokiTimeoutMs || 5000

      const results = await this.parallelProcessor.processAll(
        diagramTasks,
        async ({ key, value, target }) => {
          const { code, functionType } = value

          // Show loading indicator
          target.innerHTML = `<div class="ag-diagram-loading">Rendering ${this.getDiagramDisplayName(functionType)}...</div>`

          try {
            if (kroki.isKrokiSupported(functionType)) {
              const svg = await kroki.renderKrokiToSvg(serverUrl, functionType, code, { timeoutMs })
              return { key, target, svg, functionType, success: true }
            } else {
              throw new Error(`Diagram type "${functionType}" is not supported by Kroki`)
            }
          } catch (err) {
            return { key, target, error: err.message || 'Unknown rendering error', functionType, success: false }
          }
        }
      )

      // Apply results to DOM
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const task = diagramTasks[i]

        if (result.success && result.result && result.result.success) {
          // Successful rendering
          const { target, svg } = result.result
          if (target && svg) {
            // Check if this target contains a protected Mermaid diagram
            const existingSvg = target.querySelector('svg[data-protected="true"]')
            if (existingSvg) {
              console.log('Skipping general diagram rendering - protected Mermaid SVG detected')
              continue
            }

            // Clear any existing content and classes first
            target.className = ''
            target.innerHTML = ''

            // Force a reflow to ensure clean state
            // eslint-disable-next-line no-unused-expressions
            target.offsetHeight

            // Apply new content and styling
            target.classList.add('ag-diagram-exact-size')

            // CRITICAL: Remove any <style> tags from general diagrams that could affect global styling
            let cleanedSvg = svg
            cleanedSvg = cleanedSvg.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            cleanedSvg = cleanedSvg.replace(/style\s*=\s*["'][^"']*font[^"']*["']/gi, '')

            console.log('🚫 CLEANING: Removed global styles from general diagram SVG')
            target.innerHTML = sanitizeRaw(cleanedSvg, DIAGRAM_DOMPURIFY_CONFIG)

            // Ensure SVG is properly sized while preserving original dimensions
            const svgElement = target.querySelector('svg')
            if (svgElement) {
              // Remove ALL font-related styles from all elements to prevent Mermaid interference
              const allElements = svgElement.querySelectorAll('*')
              allElements.forEach(el => {
                if (el.style) {
                  el.style.fontFamily = ''
                  el.style.fontSize = ''
                  el.style.fontWeight = ''
                  el.style.fontStyle = ''
                  el.style.font = ''
                }
                // Remove font-related attributes
                el.removeAttribute('font-family')
                el.removeAttribute('font-size')
                el.removeAttribute('font-weight')
                el.removeAttribute('font-style')
              })

              // Remove all style tags that could affect global CSS
              const styleTags = svgElement.querySelectorAll('style')
              styleTags.forEach(styleTag => styleTag.remove())

              // Ensure proper sizing
              svgElement.style.maxWidth = '100%'
              svgElement.style.height = 'auto'
              svgElement.style.display = 'block'
            }
          }
        } else {
          // Error rendering
          const error = result.success ? result.result?.error || 'Unknown error' : result.error?.message || result.error || 'Processing failed'
          const target = result.success ? result.result?.target : task?.target
          const functionType = result.success ? result.result?.functionType : task?.value?.functionType || 'unknown'

          if (target) {
            const diagramName = this.getDiagramDisplayName(functionType)
            target.innerHTML = `<div class="ag-diagram-error">
              <strong>${diagramName} Error:</strong><br>
              ${error}
            </div>`
            target.classList.add(CLASS_OR_ID.AG_MATH_ERROR)
          }
        }
      }

      this.diagramCache.clear()
    }
  }

  getDiagramDisplayName (functionType) {
    const nameMap = {
      flowchart: 'Flowchart',
      sequence: 'Sequence Diagram',
      plantuml: 'PlantUML',
      'vega-lite': 'Vega-Lite',
      c4plantuml: 'C4 PlantUML',
      structurizr: 'Structurizr',
      blockdiag: 'BlockDiag',
      seqdiag: 'SeqDiag',
      actdiag: 'ActDiag',
      nwdiag: 'NwDiag',
      packetdiag: 'PacketDiag',
      rackdiag: 'RackDiag',
      graphviz: 'Graphviz',
      nomnoml: 'Nomnoml',
      dbml: 'DBML',
      erd: 'ERD',
      bytefield: 'Bytefield',
      ditaa: 'Ditaa',
      pikchr: 'Pikchr',
      svgbob: 'Svgbob',
      wavedrom: 'WaveDrom',
      wireviz: 'WireViz',
      symbolator: 'Symbolator',
      vega: 'Vega',
      excalidraw: 'Excalidraw',
      umlet: 'UMLet',
      tikz: 'TikZ',
      d2: 'D2',
      bpmn: 'BPMN'
    }
    return nameMap[functionType] || functionType.charAt(0).toUpperCase() + functionType.slice(1)
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

    this.renderMermaid().then(() => {
      return this.renderDiagram()
    }).catch(err => {
      console.warn('Diagram rendering error:', err)
    })
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

    this.renderMermaid().then(() => {
      return this.renderDiagram()
    }).catch(err => {
      console.warn('Diagram rendering error:', err)
    })
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
    this.renderMermaid().then(() => {
      return this.renderDiagram()
    }).catch(err => {
      console.warn('Diagram rendering error:', err)
    })
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
