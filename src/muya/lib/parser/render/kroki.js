// Simple Kroki client to render diagrams to SVG
// API: POST {serverUrl}/{diagramType}/svg with raw text body (diagram source)
// - Content-Type: text/plain
// - Accept: image/svg+xml
// Supported diagram types reference: https://kroki.io/#diagram-types
// Keys are the functionType (language identifier) used internally, values are Kroki endpoint names.

const TYPE_MAP = {
  // Existing
  mermaid: 'mermaid',
  plantuml: 'plantuml',
  'vega-lite': 'vegalite',
  // Map legacy/local names to Kroki equivalents
  sequence: 'seqdiag', // Local "sequence" code fence now rendered via seqdiag
  // Additional Kroki diagram types enabled
  graphviz: 'graphviz',
  dot: 'graphviz', // alias
  d2: 'd2',
  svgbob: 'svgbob',
  wavedrom: 'wavedrom',
  nomnoml: 'nomnoml',
  pikchr: 'pikchr',
  erd: 'erd',
  c4plantuml: 'c4plantuml',
  blockdiag: 'blockdiag',
  actdiag: 'actdiag',
  seqdiag: 'seqdiag',
  nwdiag: 'nwdiag',
  packetdiag: 'packetdiag',
  rackdiag: 'rackdiag',
  bytefield: 'bytefield',
  bpmn: 'bpmn',
  wireviz: 'wireviz'
}

export const isKrokiSupported = (functionType) => {
  return Object.prototype.hasOwnProperty.call(TYPE_MAP, functionType)
}

export async function renderKrokiToSvg (serverUrl, functionType, code, opts = {}) {
  const { signal, timeoutMs = 5000 } = opts || {}
  const diagramType = TYPE_MAP[functionType]
  if (!diagramType) {
    throw new Error(`Unsupported diagram type: ${functionType}`)
  }

  const base = serverUrl.replace(/\/$/, '')
  const url = `${base}/${diagramType}/svg`

  // Setup abort controller with timeout
  const controller = new AbortController()
  const timeoutId = timeoutMs > 0
    ? setTimeout(() => {
      controller.abort(new Error(`Timeout after ${timeoutMs}ms`))
    }, timeoutMs)
    : null

  if (signal && typeof signal.addEventListener === 'function') {
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Accept: 'image/svg+xml'
      },
      body: code,
      signal: controller.signal
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (!res.ok) {
      let errorMessage = `Kroki server error (${res.status})`

      try {
        // Try to get detailed error message from server
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const errorData = await res.json()
          errorMessage += `: ${errorData.error || errorData.message || 'Unknown error'}`
        } else {
          const errorText = await res.text()
          if (errorText && errorText.length > 0 && errorText.length < 500) {
            errorMessage += `: ${errorText}`
          }
        }
      } catch (parseError) {
        // Ignore parsing errors, use default message
      }

      if (res.status === 400) {
        errorMessage = `Diagram syntax error: ${errorMessage.substring(errorMessage.indexOf(':') + 1).trim()}`
      } else if (res.status === 404) {
        errorMessage = `Diagram type '${functionType}' not supported by Kroki server`
      } else if (res.status >= 500) {
        errorMessage = `Kroki server internal error (${res.status})`
      }

      throw new Error(errorMessage)
    }

    return res.text()
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)

    if (error.name === 'AbortError' || error.message.includes('Timeout')) {
      throw new Error(`Kroki server timeout (${timeoutMs}ms) - Server may be unreachable`)
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot reach Kroki server at ${serverUrl} - Check server URL and network connection`)
    }

    throw error
  }
}
