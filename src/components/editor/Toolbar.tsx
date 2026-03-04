import { PixelIcon } from '../icons/PixelIcon'
import { EraserIcon } from '../icons/EraserIcon'
import { PencilIcon } from '../icons/PencilIcon'
import { useTranslation } from 'react-i18next'
import { Toggle, Separator, Tooltip, DropdownMenu } from '../ui'
import type { Tool } from './types'

const SHAPE_TOOLS: Tool[] = ['line', 'rect', 'ellipse']

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomToFit: () => void
  activeColor: string
}

const ICON_SIZE = 16

const TOOL_IDS: Tool[] = [
  'pencil', 'eraser', 'line', 'rect', 'ellipse', 'fill',
  'select', 'marquee', 'move', 'eyedropper', 'hand',
]

const TOOL_ICONS: Record<Tool, React.ReactNode> = {
  pencil:     <PencilIcon width={ICON_SIZE} height={ICON_SIZE} />,
  eraser:     <EraserIcon width={ICON_SIZE} height={ICON_SIZE} />,
  line:       <PixelIcon icon="spline-cursor" width={ICON_SIZE} height={ICON_SIZE} />,
  rect:       <PixelIcon icon="square" width={ICON_SIZE} height={ICON_SIZE} />,
  ellipse:    <PixelIcon icon="circle" width={ICON_SIZE} height={ICON_SIZE} />,
  fill:       <PixelIcon icon="fill" width={ICON_SIZE} height={ICON_SIZE} />,
  select:     <PixelIcon icon="square-dashed-cursor" width={ICON_SIZE} height={ICON_SIZE} />,
  marquee:    <PixelIcon icon="lasso" width={ICON_SIZE} height={ICON_SIZE} />,
  move:       <PixelIcon icon="cursor-minimal" width={ICON_SIZE} height={ICON_SIZE} />,
  eyedropper: <PixelIcon icon="pipette" width={ICON_SIZE} height={ICON_SIZE} />,
  hand:       <PixelIcon icon="hand" width={ICON_SIZE} height={ICON_SIZE} />,
}

export function Toolbar({ activeTool, onToolChange, onZoomIn, onZoomOut, onZoomToFit, activeColor }: ToolbarProps) {
  const { t } = useTranslation()

  return (
    <aside className="flex flex-col items-center py-1.5 gap-0.5 border-r border-(--color-border) bg-(--color-surface) shrink-0">
      {/* Drawing tools */}
      {TOOL_IDS.slice(0, 2).map((id) => (
        <Tooltip key={id} content={t(`editor.tools.${id}`)} side="right">
          <Toggle
            variant="tool"
            size="icon_sm"
            pressed={activeTool === id}
            onPressedChange={() => onToolChange(id)}
          >
            {TOOL_ICONS[id]}
          </Toggle>
        </Tooltip>
      ))}

      {/* Shapes dropdown */}
      <DropdownMenu.Root>
        <Tooltip content={t('editor.tools.shapes')} side="right">
          <DropdownMenu.Trigger
            className={[
              'inline-flex items-center justify-center w-7 h-7 cursor-pointer border select-none',
              'transition-[background-color,border-color,color] duration-75',
              'focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2',
              SHAPE_TOOLS.includes(activeTool)
                ? 'bg-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] border-(--color-accent) text-(--color-accent)'
                : 'bg-transparent border-transparent text-(--color-muted) hover:bg-(--color-surface-alt) hover:text-(--color-text)',
            ].join(' ')}
          >
            {TOOL_ICONS[SHAPE_TOOLS.includes(activeTool) ? activeTool : 'rect']}
          </DropdownMenu.Trigger>
        </Tooltip>
        <DropdownMenu.Content side="right" align="start">
          {SHAPE_TOOLS.map((id) => (
            <DropdownMenu.Item
              key={id}
              icon={TOOL_ICONS[id]}
              onClick={() => onToolChange(id)}
              className={activeTool === id ? 'text-(--color-accent)' : ''}
            >
              {t(`editor.tools.${id}`)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Tooltip content={t('editor.tools.fill')} side="right">
        <Toggle
          variant="tool"
          size="icon_sm"
          pressed={activeTool === 'fill'}
          onPressedChange={() => onToolChange('fill')}
        >
          {TOOL_ICONS.fill}
        </Toggle>
      </Tooltip>

      <Separator orientation="horizontal" className="w-6 my-0.5" />

      {/* Selection tools */}
      {TOOL_IDS.slice(6, 9).map((id) => (
        <Tooltip key={id} content={t(`editor.tools.${id}`)} side="right">
          <Toggle
            variant="tool"
            size="icon_sm"
            pressed={activeTool === id}
            onPressedChange={() => onToolChange(id)}
          >
            {TOOL_ICONS[id]}
          </Toggle>
        </Tooltip>
      ))}

      <Separator orientation="horizontal" className="w-6 my-0.5" />

      {/* Color picker + view tools */}
      {TOOL_IDS.slice(9).map((id) => (
        <Tooltip key={id} content={t(`editor.tools.${id}`)} side="right">
          <Toggle
            variant="tool"
            size="icon_sm"
            pressed={activeTool === id}
            onPressedChange={() => onToolChange(id)}
          >
            {TOOL_ICONS[id]}
          </Toggle>
        </Tooltip>
      ))}

      <Separator orientation="horizontal" className="w-6 my-0.5" />

      {/* Quick zoom */}
      <Tooltip content={t('editor.view.zoomToFit')} side="right">
        <button
          type="button"
          onClick={onZoomToFit}
          className="w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
        >
          <PixelIcon icon="monitor" width={ICON_SIZE} height={ICON_SIZE} />
        </button>
      </Tooltip>
      <Tooltip content="Zoom In (Ctrl++)" side="right">
        <button
          type="button"
          onClick={onZoomIn}
          className="w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
        >
          <PixelIcon icon="zoom-in" width={ICON_SIZE} height={ICON_SIZE} />
        </button>
      </Tooltip>
      <Tooltip content="Zoom Out (Ctrl+-)" side="right">
        <button
          type="button"
          onClick={onZoomOut}
          className="w-7 h-7 flex items-center justify-center text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-alt) cursor-pointer transition-colors duration-75"
        >
          <PixelIcon icon="zoom-out" width={ICON_SIZE} height={ICON_SIZE} />
        </button>
      </Tooltip>

      {/* Active color preview — pinned to bottom */}
      <Tooltip content={activeColor} side="right" wrapperClassName="mt-auto">
        <div
          className="w-7 h-7 shrink-0 border border-(--color-border) rounded-sm"
          style={{ backgroundColor: activeColor }}
        />
      </Tooltip>
    </aside>
  )
}
