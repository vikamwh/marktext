// Simple Kroki client to render diagrams to SVG
// API: POST {serverUrl}/{diagramType}/svg with raw text body (diagram source)
// - Content-Type: text/plain
// - Accept: image/svg+xml

const TYPE_MAP = {
  mermaid: 'mermaid',
  plantuml: 'plantuml',
  'vega-lite': 'vegalite'
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
  const base = serverUrl.replace(/\/$/, '')
  const url = `${base}/${diagramType}/svg`
  // Setup abort controller with optional timeout for quick fallback
  const controller = new AbortController()
  const _timer = timeoutMs > 0 ? setTimeout(() => controller.abort(new Error('kroki-timeout')), timeoutMs) : null
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
      throw new Error(`Kroki server timeout (${timeoutMs}ms). Check server availability at: ${serverUrl}`)
    }
    throw new Error(`Cannot reach Kroki server at: ${serverUrl}. Please check server URL and network connection.`)
  } finally {
    if (_timer) clearTimeout(_timer)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let errorMsg = `Kroki render failed (${res.status})`

    if (res.status === 400) {
      errorMsg = `Invalid ${functionType} syntax. Please check your diagram code.`
    } else if (res.status === 404) {
      errorMsg = `Diagram type "${functionType}" is not supported by this Kroki server.`
    } else if (res.status >= 500) {
      errorMsg = `Kroki server error (${res.status}). Server may be overloaded or misconfigured.`
    } else if (text) {
      errorMsg += `: ${text}`
    }

    throw new Error(errorMsg)
  }
  return res.text()
}
