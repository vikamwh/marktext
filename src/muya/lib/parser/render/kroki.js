// Simple Kroki client to render diagrams to SVG
// API: POST { serverUrl }/render with JSON body
// { diagram_source: string, diagram_type: string, output_format: 'svg' }

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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: code,
    signal: controller.signal
  })
    .finally(() => { if (_timer) clearTimeout(_timer) })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Kroki render failed (${res.status}): ${text}`)
  }
  return res.text()
}
