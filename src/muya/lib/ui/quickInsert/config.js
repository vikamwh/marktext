import paragraphIcon from '../../assets/pngicon/paragraph/2.png'
import htmlIcon from '../../assets/pngicon/html/2.png'
import hrIcon from '../../assets/pngicon/horizontal_line/2.png'
import frontMatterIcon from '../../assets/pngicon/front_matter/2.png'
import header1Icon from '../../assets/pngicon/heading_1/2.png'
import header2Icon from '../../assets/pngicon/heading_2/2.png'
import header3Icon from '../../assets/pngicon/heading_3/2.png'
import header4Icon from '../../assets/pngicon/heading_4/2.png'
import header5Icon from '../../assets/pngicon/heading_5/2.png'
import header6Icon from '../../assets/pngicon/heading_6/2.png'
import newTableIcon from '../../assets/pngicon/new_table/2.png'
import bulletListIcon from '../../assets/pngicon/bullet_list/2.png'
import codeIcon from '../../assets/pngicon/code/2.png'
import quoteIcon from '../../assets/pngicon/quote_block/2.png'
import todoListIcon from '../../assets/pngicon/todolist/2.png'
import mathblockIcon from '../../assets/pngicon/math/2.png'
import orderListIcon from '../../assets/pngicon/order_list/2.png'
import flowchartIcon from '../../assets/pngicon/flowchart/2.png'
import sequenceIcon from '../../assets/pngicon/sequence/2.png'
import plantumlIcon from '../../assets/pngicon/plantuml/2.png'
import mermaidIcon from '../../assets/pngicon/mermaid/2.png'
import vegaIcon from '../../assets/pngicon/chart/2.png'
import { isOsx } from '../../config'

const COMMAND_KEY = isOsx ? '⌘' : 'Ctrl'
const OPTION_KEY = isOsx ? '⌥' : 'Alt'
const SHIFT_KEY = isOsx ? '⇧' : 'Shift'

// Command (or Cmd) ⌘
// Shift ⇧
// Option (or Alt) ⌥
// Control (or Ctrl) ⌃
// Caps Lock ⇪
// Fn

export const quickInsertObj = {
  'basic block': [{
    title: 'Paragraph',
    subTitle: 'Lorem Ipsum is simply dummy text',
    label: 'paragraph',
    shortCut: `${COMMAND_KEY}+0`,
    icon: paragraphIcon
  }, {
    title: 'Horizontal Line',
    subTitle: '---',
    label: 'hr',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+-`,
    icon: hrIcon
  }, {
    title: 'Front Matter',
    subTitle: '--- Lorem Ipsum ---',
    label: 'front-matter',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+Y`,
    icon: frontMatterIcon
  }],
  header: [{
    title: 'Header 1',
    subTitle: '# Lorem Ipsum is simply ...',
    label: 'heading 1',
    shortCut: `${COMMAND_KEY}+1`,
    icon: header1Icon
  }, {
    title: 'Header 2',
    subTitle: '## Lorem Ipsum is simply ...',
    label: 'heading 2',
    shortCut: `${COMMAND_KEY}+2`,
    icon: header2Icon
  }, {
    title: 'Header 3',
    subTitle: '### Lorem Ipsum is simply ...',
    label: 'heading 3',
    shortCut: `${COMMAND_KEY}+3`,
    icon: header3Icon
  }, {
    title: 'Header 4',
    subTitle: '#### Lorem Ipsum is simply ...',
    label: 'heading 4',
    shortCut: `${COMMAND_KEY}+4`,
    icon: header4Icon
  }, {
    title: 'Header 5',
    subTitle: '##### Lorem Ipsum is simply ...',
    label: 'heading 5',
    shortCut: `${COMMAND_KEY}+5`,
    icon: header5Icon
  }, {
    title: 'Header 6',
    subTitle: '###### Lorem Ipsum is simply ...',
    label: 'heading 6',
    shortCut: `${COMMAND_KEY}+6`,
    icon: header6Icon
  }],
  'advanced block': [{
    title: 'Table Block',
    subTitle: '|Lorem | Ipsum is simply |',
    label: 'table',
    shortCut: `${SHIFT_KEY}+${COMMAND_KEY}+T`,
    icon: newTableIcon
  }, {
    title: 'Display Math',
    subTitle: '$$ Lorem Ipsum is simply $$',
    label: 'mathblock',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+M`,
    icon: mathblockIcon
  }, {
    title: 'HTML Block',
    subTitle: '<div> Lorem Ipsum is simply </div>',
    label: 'html',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+J`,
    icon: htmlIcon
  }, {
    title: 'Code Block',
    subTitle: '```java Lorem Ipsum is simply ```',
    label: 'pre',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+C`,
    icon: codeIcon
  }, {
    title: 'Quote Block',
    subTitle: '>Lorem Ipsum is simply ...',
    label: 'blockquote',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+Q`,
    icon: quoteIcon
  }],
  'list block': [{
    title: 'Order List',
    subTitle: '1. Lorem Ipsum is simply ...',
    label: 'ol-order',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+O`,
    icon: orderListIcon
  }, {
    title: 'Bullet List',
    subTitle: '- Lorem Ipsum is simply ...',
    label: 'ul-bullet',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+U`,
    icon: bulletListIcon
  }, {
    title: 'To-do List',
    subTitle: '- [x] Lorem Ipsum is simply ...',
    label: 'ul-task',
    shortCut: `${OPTION_KEY}+${COMMAND_KEY}+X`,
    icon: todoListIcon
  }],
  diagram: [{
    title: 'Vega Chart',
    subTitle: 'Render chart by Vega-Lite via Kroki.',
    label: 'vega-lite',
    icon: vegaIcon
  }, {
    title: 'Flow Chart',
    subTitle: 'Render flow chart by GraphViz via Kroki.',
    label: 'flowchart',
    icon: flowchartIcon
  }, {
    title: 'Sequence Diagram',
    subTitle: 'Render sequence diagram by SeqDiag via Kroki.',
    label: 'sequence',
    icon: sequenceIcon
  }, {
    title: 'PlantUML Diagram',
    subTitle: 'Render PlantUML diagrams via Kroki.',
    label: 'plantuml',
    icon: plantumlIcon
  }, {
    title: 'Mermaid',
    subTitle: 'Render diagram by Mermaid via Kroki.',
    label: 'mermaid',
    icon: mermaidIcon
  }, {
    title: 'GraphViz',
    subTitle: 'Render graph by GraphViz via Kroki.',
    label: 'graphviz',
    icon: flowchartIcon
  }, {
    title: 'BlockDiag',
    subTitle: 'Render block diagram by BlockDiag via Kroki.',
    label: 'blockdiag',
    icon: codeIcon
  }, {
    title: 'SeqDiag',
    subTitle: 'Render sequence diagram by SeqDiag via Kroki.',
    label: 'seqdiag',
    icon: sequenceIcon
  }, {
    title: 'ActDiag',
    subTitle: 'Render activity diagram by ActDiag via Kroki.',
    label: 'actdiag',
    icon: codeIcon
  }, {
    title: 'NwDiag',
    subTitle: 'Render network diagram by NwDiag via Kroki.',
    label: 'nwdiag',
    icon: codeIcon
  }, {
    title: 'BPMN',
    subTitle: 'Render business process diagram via Kroki.',
    label: 'bpmn',
    icon: codeIcon
  }, {
    title: 'C4 PlantUML',
    subTitle: 'Render C4 architecture diagram via Kroki.',
    label: 'c4plantuml',
    icon: plantumlIcon
  }, {
    title: 'Ditaa',
    subTitle: 'Render ASCII art diagram by Ditaa via Kroki.',
    label: 'ditaa',
    icon: codeIcon
  }, {
    title: 'Entity Relationship',
    subTitle: 'Render ER diagram via Kroki.',
    label: 'erd',
    icon: codeIcon
  }, {
    title: 'Excalidraw',
    subTitle: 'Render hand-drawn style diagram via Kroki.',
    label: 'excalidraw',
    icon: codeIcon
  }, {
    title: 'Nomnoml',
    subTitle: 'Render UML diagram by Nomnoml via Kroki.',
    label: 'nomnoml',
    icon: codeIcon
  }, {
    title: 'Vega',
    subTitle: 'Render visualization by Vega via Kroki.',
    label: 'vega',
    icon: vegaIcon
  }, {
    title: 'WaveDrom',
    subTitle: 'Render digital timing diagram via Kroki.',
    label: 'wavedrom',
    icon: codeIcon
  }, {
    title: 'D2',
    subTitle: 'Render declarative diagram by D2 via Kroki.',
    label: 'd2',
    icon: codeIcon
  }]
}
