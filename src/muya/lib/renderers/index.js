/**
 * All local diagram renderers have been removed in favor of Kroki server-side rendering.
 * This stub function throws an error to prevent accidental usage of local renderers.
 *
 * @param {string} name the renderer name: katex, sequence, plantuml, flowchart, mermaid, vega-lite
 */
const loadRenderer = async (name) => {
  throw new Error(`Local renderer '${name}' is no longer available. All diagrams are now rendered via Kroki server.`)
}

export default loadRenderer
