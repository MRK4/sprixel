export type Tool =
  | 'pencil'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'fill'
  | 'select'
  | 'marquee'
  | 'move'
  | 'eyedropper'
  | 'hand'

export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  locked: boolean
}
