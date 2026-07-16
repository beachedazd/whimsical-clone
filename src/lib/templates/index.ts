import type { FileType } from '../types'
import type { Template } from './template'
import { FLOWCHART_TEMPLATES } from './flowcharts'
import { WIREFRAME_TEMPLATES } from './wireframes'
import { STICKY_TEMPLATES } from './stickies'
import { DOC_TEMPLATES } from './docs'

export type { Template } from './template'

export const TEMPLATES: Template[] = [
  ...FLOWCHART_TEMPLATES,
  ...WIREFRAME_TEMPLATES,
  ...STICKY_TEMPLATES,
  ...DOC_TEMPLATES,
]

export const TEMPLATE_SECTIONS: { type: FileType; title: string }[] = [
  { type: 'flowchart', title: 'Flowcharts' },
  { type: 'wireframe', title: 'Wireframes' },
  { type: 'sticky', title: 'Sticky boards' },
  { type: 'doc', title: 'Docs' },
]
