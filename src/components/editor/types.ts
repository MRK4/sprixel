export type Tool =
  | 'pencil'
  | 'eraser'
  | 'fill'
  | 'eyedropper'
  | 'select'
  | 'move'
  | 'line'
  | 'rect'

export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  locked: boolean
}
