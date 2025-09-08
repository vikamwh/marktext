// Enhanced Kroki client with caching and parallel processing
// API: POST {serverUrl}/{diagramType}/svg with raw text body (diagram source)
// - Content-Type: text/plain
// - Accept: image/svg+xml

import krokiCache from '../../utils/krokiCache'

const TYPE_MAP = {
  // Existing supported types
  mermaid: 'mermaid',
  plantuml: 'plantuml',
  'vega-lite': 'vegalite',

  // Previously local-only diagrams now via Kroki
  flowchart: 'graphviz', // Flowchart.js -> GraphViz
  sequence: 'seqdiag', // js-sequence-diagrams -> SeqDiag

  // BlockDiag family
  blockdiag: 'blockdiag',
  seqdiag: 'seqdiag',
  actdiag: 'actdiag',
  nwdiag: 'nwdiag',
  packetdiag: 'packetdiag',
  rackdiag: 'rackdiag',

  // Architecture and modeling
  bpmn: 'bpmn',
  c4plantuml: 'c4plantuml',
  structurizr: 'structurizr',

  // Graphs and networks
  graphviz: 'graphviz',
  nomnoml: 'nomnoml',

  // Data and documentation
  dbml: 'dbml',
  erd: 'erd',
  bytefield: 'bytefield',

  // Technical diagrams
  ditaa: 'ditaa',
  pikchr: 'pikchr',
  svgbob: 'svgbob',
  wavedrom: 'wavedrom',
  wireviz: 'wireviz',
  symbolator: 'symbolator',

  // Charts and visualization
  vega: 'vega',

  // Sketch and presentation
  excalidraw: 'excalidraw',

  // Specialized tools
  umlet: 'umlet',
  tikz: 'tikz',

  // Experimental
  d2: 'd2'
}

export const isKrokiSupported = (functionType) => {
  return Object.prototype.hasOwnProperty.call(TYPE_MAP, functionType)
}

export async function renderKrokiToSvg (serverUrl, functionType, code, opts = {}) {
  const { signal, timeoutMs = 1500 } = opts || {}
  const diagramType = TYPE_MAP[functionType]
  if (!diagramType) {
    throw new Error(`Unsupported Kroki diagram type: ${functionType}`)
  }

  // Check cache first
  try {
    const cachedSvg = await krokiCache.get(functionType, code)
    if (cachedSvg) {
      return cachedSvg
    }
  } catch (error) {
    console.warn('Cache read error:', error)
  }

  const base = serverUrl.replace(/\/$/, '')
  const url = `${base}/${diagramType}/svg`
  // Setup abort controller with timeout for all requests
  const controller = new AbortController()
  const effectiveTimeout = timeoutMs || 10000 // Default 10 seconds if not specified
  const _timer = setTimeout(() => {
    controller.abort(new Error('kroki-timeout'))
  }, effectiveTimeout)

  if (signal && typeof signal.addEventListener === 'function') {
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: code,
      signal: controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError' || err.message === 'kroki-timeout') {
      throw new Error(`Kroki server timeout (${effectiveTimeout}ms). Check server availability at: ${serverUrl}`)
    }
    throw new Error(`Cannot reach Kroki server at: ${serverUrl}. Please check server URL and network connection.`)
  } finally {
    clearTimeout(_timer)
  }

  if (!res.ok) {
    let text = ''
    try {
      // Add timeout for reading error response to prevent hanging
      const textPromise = res.text()
      const timeoutPromise = new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('Response read timeout')), 3000)
      )
      text = await Promise.race([textPromise, timeoutPromise])
      if (text.length > 1024) { text = text.slice(0, 1024) }
    } catch (error) {
      text = 'Unable to read error details'
    }

    let errorMsg = `Kroki render failed (${res.status})`

    if (res.status === 400) {
      errorMsg = `Invalid ${functionType} syntax. Please check your diagram code.\n${text}`
    } else if (res.status === 404) {
      errorMsg = `Diagram type "${functionType}" is not supported by this Kroki server.\n${text}`
    } else if (res.status >= 500) {
      errorMsg = `Kroki server error (${res.status}). Server may be overloaded or misconfigured.\n${text}`
    } else if (text && text !== 'Unable to read error details') {
      errorMsg += `: ${text}`
    }

    throw new Error(errorMsg)
  }

  // Read successful response with timeout protection
  let svg
  try {
    const textPromise = res.text()
    const timeoutPromise = new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error('Response read timeout')), 5000)
    )
    svg = await Promise.race([textPromise, timeoutPromise])
  } catch (error) {
    throw new Error(`Failed to read SVG response: ${error.message}`)
  }

  // Cache the result for future use
  try {
    await krokiCache.set(functionType, code, svg)
  } catch (error) {
    console.warn('Cache write error:', error)
  }

  return svg
}
