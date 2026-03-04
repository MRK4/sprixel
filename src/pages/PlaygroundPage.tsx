import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  PenSquare,
  Delete,
  ColorsSwatch,
  Grid3x3,
  Eye,
  EyeOff,
  Lock,
  Undo,
  Redo,
  Download,
  Plus,
} from 'pixelarticons/react'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import {
  Button,
  IconButton,
  Toggle,
  Panel,
  Separator,
  Slider,
  Input,
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
    { id: 'pencil', icon: <PenSquare width={20} height={20} />, label: t('toolbar.pencil') },
    { id: 'eraser', icon: <Delete width={20} height={20} />, label: t('toolbar.eraser') },
    { id: 'fill',   icon: <ColorsSwatch width={20} height={20} />, label: 'Fill' },
    { id: 'grid',   icon: <Grid3x3 width={20} height={20} />, label: 'Grid' },
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
              <Toggle
                key={tool.id}
                variant="tool"
                size="icon_md"
                pressed={selectedTool === tool.id}
                onPressedChange={() => setSelectedTool(tool.id)}
                title={tool.label}
              >
                {tool.icon}
              </Toggle>
            ))}
            <Separator orientation="vertical" />
            <IconButton title="Undo"><Undo width={20} height={20} /></IconButton>
            <IconButton title="Redo"><Redo width={20} height={20} /></IconButton>
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
              <Download width={16} height={16} />
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
            <IconButton variant="default" title="Default"><Undo width={20} height={20} /></IconButton>
            <IconButton variant="ghost" title="Ghost"><Redo width={20} height={20} /></IconButton>
            <IconButton variant="active" title="Active"><Lock width={20} height={20} /></IconButton>
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
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  className={`w-7 h-7 rounded-sm border-2 transition-transform hover:scale-110 ${
                    selectedColor === color ? 'border-white shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </Panel>
        </Section>

        {/* Layers */}
        <Section title="Layers panel (demo)">
          <Panel direction="vertical" className="w-60">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-1 px-1 py-0.5 rounded-sm hover:bg-(--color-surface-alt)">
                <IconButton
                  size="sm"
                  variant={layer.visible ? 'default' : 'ghost'}
                  onClick={() => toggleLayerVisibility(layer.id)}
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? <Eye width={16} height={16} /> : <EyeOff width={16} height={16} />}
                </IconButton>
                <span className="flex-1 text-sm truncate">{layer.name}</span>
                <IconButton
                  size="sm"
                  variant={layer.locked ? 'active' : 'ghost'}
                  onClick={() => toggleLayerLock(layer.id)}
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  <Lock width={16} height={16} />
                </IconButton>
                <IconButton size="sm" variant="ghost" title="Delete">
                  <Delete width={16} height={16} />
                </IconButton>
              </div>
            ))}
            <Separator />
            <Button variant="ghost" size="sm" className="w-full justify-center">
              <Plus width={16} height={16} />
              {t('layers.newLayer')}
            </Button>
          </Panel>
        </Section>

        {/* Canvas placeholder */}
        <Section title="Canvas area (placeholder)">
          <div className="flex flex-col items-center justify-center gap-4 min-h-48 border-2 border-dashed border-(--color-border) rounded-lg bg-(--color-surface)">
            <Grid3x3 width={48} height={48} className="opacity-20" />
            <span className="text-sm text-(--color-muted)">Canvas will render here</span>
          </div>
        </Section>

      </main>
    </div>
  )
}
