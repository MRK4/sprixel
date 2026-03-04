import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EraserIcon } from '../components/icons/EraserIcon'
import { PencilIcon } from '../components/icons/PencilIcon'
import { PixelIcon } from '../components/icons/PixelIcon'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import {
  Button,
  IconButton,
  Toggle,
  Panel,
  Separator,
  Slider,
  Input,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Dialog,
  Badge,
  Checkbox,
  Switch,
  Label,
  toast,
} from '../components/ui'

const SAMPLE_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#808080', '#c0c0c0',
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-(--color-muted)">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PlaygroundPage() {
  const { t } = useTranslation()

  const [selectedTool, setSelectedTool] = useState('pencil')
  const [selectedColor, setSelectedColor] = useState('#ff0000')
  const [opacity, setOpacity] = useState(100)
  const [layerName, setLayerName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [switchChecked, setSwitchChecked] = useState(false)
  const [layers, setLayers] = useState([
    { id: '1', name: 'Layer 1', visible: true, locked: false },
    { id: '2', name: 'Layer 2', visible: true, locked: false },
  ])

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)))
  }

  const toggleLayerLock = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)))
  }

  const tools = [
    { id: 'pencil', icon: <PencilIcon width={20} height={20} />, label: t('editor.tools.pencil') },
    { id: 'eraser', icon: <EraserIcon width={20} height={20} />, label: t('editor.tools.eraser') },
    { id: 'fill',   icon: <PixelIcon icon="colors-swatch" width={20} height={20} />, label: t('editor.tools.fill') },
    { id: 'grid',   icon: <PixelIcon icon="grid-3x3" width={20} height={20} />, label: 'Grid' },
  ]

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <header className="relative flex items-center justify-center gap-4 px-8 py-4 border-b border-(--color-border)">
        <Link to="/" className="absolute left-4 text-(--color-accent) hover:underline text-sm">
          ← Back
        </Link>
        <h1 className="text-lg font-semibold m-0">Sprixel UI Playground</h1>
        <LanguageSwitcher />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Toolbar */}
        <Section title="Toolbar">
          <Panel direction="horizontal" className="w-fit">
            {tools.map((tool) => (
              <Tooltip key={tool.id} content={tool.label}>
                <Toggle
                  variant="tool"
                  size="icon_md"
                  pressed={selectedTool === tool.id}
                  onPressedChange={() => setSelectedTool(tool.id)}
                >
                  {tool.icon}
                </Toggle>
              </Tooltip>
            ))}
            <Separator orientation="vertical" />
            <Tooltip content="Undo">
              <IconButton><PixelIcon icon="undo" width={20} height={20} /></IconButton>
            </Tooltip>
            <Tooltip content="Redo">
              <IconButton><PixelIcon icon="redo" width={20} height={20} /></IconButton>
            </Tooltip>
          </Panel>
        </Section>

        {/* Buttons */}
        <Section title="Button variants">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md">{t('common.save')}</Button>
            <Button variant="secondary" size="md">{t('common.cancel')}</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="danger" size="md">Delete</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" disabled>Disabled</Button>
            <Button variant="primary" size="md">
              <PixelIcon icon="download" width={16} height={16} />
              Export PNG
            </Button>
          </div>
        </Section>

        {/* Toggle */}
        <Section title="Toggle">
          <div className="flex gap-2">
            {['A', 'B', 'C'].map((label) => (
              <Toggle
                key={label}
                pressed={selectedTool === label}
                onPressedChange={() => setSelectedTool(label)}
                size="md"
              >
                Option {label}
              </Toggle>
            ))}
          </div>
        </Section>

        {/* IconButton */}
        <Section title="IconButton variants">
          <Panel direction="horizontal" className="w-fit">
            <Tooltip content="Default">
              <IconButton variant="default"><PixelIcon icon="undo" width={20} height={20} /></IconButton>
            </Tooltip>
            <Tooltip content="Ghost">
              <IconButton variant="ghost"><PixelIcon icon="redo" width={20} height={20} /></IconButton>
            </Tooltip>
            <Tooltip content="Active">
              <IconButton variant="active"><PixelIcon icon="lock" width={20} height={20} /></IconButton>
            </Tooltip>
          </Panel>
        </Section>

        {/* Panel */}
        <Section title="Panel variants">
          <div className="flex gap-4 flex-wrap">
            <Panel direction="horizontal" variant="default" className="w-fit">
              <span className="text-sm px-2 text-(--color-muted)">Default horizontal</span>
            </Panel>
            <Panel direction="vertical" variant="floating" className="w-fit">
              <span className="text-sm px-2 py-1 text-(--color-muted)">Floating</span>
              <span className="text-sm px-2 py-1 text-(--color-muted)">vertical</span>
            </Panel>
          </div>
        </Section>

        {/* Separator */}
        <Section title="Separator">
          <div className="flex flex-col gap-2 p-4 bg-(--color-surface) rounded-lg w-48">
            <span className="text-sm">Item A</span>
            <Separator />
            <span className="text-sm">Item B</span>
            <Separator />
            <span className="text-sm">Item C</span>
          </div>
          <Panel direction="horizontal" className="w-fit">
            <span className="text-sm text-(--color-muted) px-2">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-(--color-muted) px-2">Right</span>
          </Panel>
        </Section>

        {/* Slider */}
        <Section title="Slider">
          <div className="w-64 flex flex-col gap-4">
            <Slider label="Opacity" min={0} max={100} step={1} value={opacity} onChange={setOpacity} />
            <Slider label="Size" min={1} max={32} step={1} value={8} showValue={false} />
            <Slider min={0} max={100} value={50} showValue />
          </div>
        </Section>

        {/* Label */}
        <Section title="Label">
          <div className="flex flex-col gap-2 w-64">
            <Label htmlFor="playground-label">Standard label</Label>
            <Label htmlFor="playground-required" required>Required field</Label>
          </div>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge size="sm">Small</Badge>
          </div>
        </Section>

        {/* Card */}
        <Section title="Card">
          <div className="flex gap-4 flex-wrap">
            <Card className="w-64">
              <CardHeader>Card title</CardHeader>
              <CardContent>Card content goes here.</CardContent>
              <CardFooter>Footer</CardFooter>
            </Card>
            <Card variant="outline" className="w-64">
              <CardHeader>Outline variant</CardHeader>
              <CardContent>Transparent background with border.</CardContent>
            </Card>
          </div>
        </Section>

        {/* Checkbox */}
        <Section title="Checkbox">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked} />
              <span className="text-sm">Checkbox</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox indeterminate />
              <span className="text-sm">Indeterminate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox disabled />
              <span className="text-sm opacity-60">Disabled</span>
            </label>
          </div>
        </Section>

        {/* Switch */}
        <Section title="Switch">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
              <span className="text-sm">Toggle option</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch disabled />
              <span className="text-sm opacity-60">Disabled</span>
            </label>
          </div>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger className="inline-flex items-center justify-center gap-2 h-9 px-3.5 text-sm font-medium bg-(--color-accent) border-(--color-accent) text-white hover:bg-(--color-accent-hover) cursor-pointer border transition-colors duration-75">
              Open dialog
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Dialog title</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body>
                <p className="text-sm text-(--color-muted) m-0">
                  This is a sample dialog. Close it with the X button or by clicking outside.
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setDialogOpen(false)}>
                  Confirm
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </Section>

        {/* Toast (Sonner) */}
        <Section title="Toast (Sonner)">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast('Default toast')}>
              Default toast
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Success!')}>
              Success
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.error('Error message')}>
              Error
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.info('Info message')}>
              Info
            </Button>
          </div>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div className="w-64 flex flex-col gap-4">
            <Input label="Layer name" placeholder="My layer..." value={layerName} onChange={(e) => setLayerName(e.target.value)} />
            <Input variant="ghost" placeholder="Ghost input..." />
            <Input label="With error" placeholder="Type here..." error="This field is required" />
            <Input size="sm" placeholder="Small input" />
          </div>
        </Section>

        {/* Palette */}
        <Section title="Palette (demo)">
          <Panel direction="vertical" className="w-fit">
            <div
              className="w-12 h-12 rounded-md border-2 border-(--color-border)"
              style={{ backgroundColor: selectedColor }}
            />
            <Separator />
            <div className="flex flex-wrap gap-2 p-1">
              {SAMPLE_COLORS.map((color) => (
                <Tooltip key={color} content={color}>
                  <button
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 border-2 transition-transform hover:scale-110 cursor-pointer ${
                      selectedColor === color ? 'border-white shadow-sm' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                </Tooltip>
              ))}
            </div>
          </Panel>
        </Section>

        {/* Layers */}
        <Section title="Layers panel (demo)">
          <Panel direction="vertical" className="w-60">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-1 px-1 py-0.5 hover:bg-(--color-surface-alt)">
                <Tooltip content={layer.visible ? 'Hide' : 'Show'}>
                  <IconButton
                    size="sm"
                    variant={layer.visible ? 'default' : 'ghost'}
                    onClick={() => toggleLayerVisibility(layer.id)}
                  >
                    {layer.visible ? <PixelIcon icon="eye" width={16} height={16} /> : <PixelIcon icon="eye-off" width={16} height={16} />}
                  </IconButton>
                </Tooltip>
                <span className="flex-1 text-sm truncate">{layer.name}</span>
                <Tooltip content={layer.locked ? 'Unlock' : 'Lock'}>
                  <IconButton
                    size="sm"
                    variant={layer.locked ? 'active' : 'ghost'}
                    onClick={() => toggleLayerLock(layer.id)}
                  >
                    <PixelIcon icon="lock" width={16} height={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t('common.delete')}>
                  <IconButton size="sm" variant="ghost">
                    <PixelIcon icon="delete" width={16} height={16} />
                  </IconButton>
                </Tooltip>
              </div>
            ))}
            <Separator />
            <Button variant="ghost" size="sm" className="w-full justify-center">
              <PixelIcon icon="plus" width={16} height={16} />
              {t('editor.layers.add')}
            </Button>
          </Panel>
        </Section>

        {/* Canvas placeholder */}
        <Section title="Canvas area (placeholder)">
          <div className="flex flex-col items-center justify-center gap-4 min-h-48 border-2 border-dashed border-(--color-border) rounded-lg bg-(--color-surface)">
            <PixelIcon icon="grid-3x3" width={48} height={48} className="opacity-20" />
            <span className="text-sm text-(--color-muted)">Canvas will render here</span>
          </div>
        </Section>

      </main>
    </div>
  )
}
