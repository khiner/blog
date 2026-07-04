import { CSSProperties, useEffect, useMemo, useState } from 'react'

import './RenderGallery.scss'

const DATA_BASE = '/MeshEditor/render-data'

interface Item {
  name: string
  src: string
  width?: number // Present when the manifest was published with dimensions.
  height?: number
}
interface Row {
  dir: string
  items: Item[]
}

const mediaUrl = (item: Item) => encodeURI(`${DATA_BASE}/${item.src}`)
const thumbUrl = (item: Item) => encodeURI(`${DATA_BASE}/${item.src}.thumb.jpg`)
const isVideo = (item: Item) => item.src.endsWith('.mp4')

const MEDIA_HEIGHT = 110 // Preview height in px. Each cell's width follows its media's aspect ratio.
const HOVER_INSET = 4 // Background revealed on each side of the media on hover.

// Equal absolute hover insets on a non-square box need per-axis scale factors. The vars
// live on the cell so both the media and the label (which tracks it) can read them.
const cellStyle = (aspect: number) => {
  const width = MEDIA_HEIGHT * aspect
  return {
    '--hover-scale-x': (width - 2 * HOVER_INSET) / width,
    '--hover-scale-y': (MEDIA_HEIGHT - 2 * HOVER_INSET) / MEDIA_HEIGHT,
    '--hover-inset': `${HOVER_INSET}px`,
  } as CSSProperties
}

const Thumbnail = ({ item, onClick }: { item: Item; onClick: () => void }) => {
  // Manifest dimensions when published with them, else 16:10 (the common render size)
  // until the thumb loads and reports its intrinsic size.
  const [aspect, setAspect] = useState(item.width && item.height ? item.width / item.height : 1.6)

  return (
    <button className="renderItem" title={item.name} onClick={onClick} style={cellStyle(aspect)}>
      <div className="preview" style={{ height: MEDIA_HEIGHT, aspectRatio: aspect }}>
        <img
          src={thumbUrl(item)}
          alt={item.name}
          loading="lazy"
          onLoad={(e) =>
            e.currentTarget.naturalHeight > 0 && setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)
          }
        />
        {isVideo(item) && <span className="playBadge">▶</span>}
      </div>
      <div className="itemName">{item.name}</div>
    </button>
  )
}

const Viewer = ({ item, onClose }: { item: Item; onClose: () => void }) => (
  <div className="renderViewer" onClick={onClose}>
    <figure onClick={(event) => event.stopPropagation()}>
      {isVideo(item) ? (
        <video src={mediaUrl(item)} controls autoPlay loop playsInline />
      ) : (
        <img src={mediaUrl(item)} alt={item.name} />
      )}
      <figcaption>{item.name}</figcaption>
    </figure>
    <button className="viewerClose" aria-label="Close" onClick={onClose}>
      ×
    </button>
  </div>
)

export default function RenderGallery() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Item | null>(null)

  useEffect(() => {
    fetch(`${DATA_BASE}/manifest.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((manifest) => setRows(manifest.rows))
      .catch((e) => setError(`Could not load the render manifest: ${e.message}`))
  }, [])

  const allItems = useMemo(() => rows?.flatMap((row) => row.items) ?? [], [rows])

  useEffect(() => {
    if (!selected) return

    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
      const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key]
      if (step) setSelected((item) => (item && allItems[allItems.indexOf(item) + step]) || item)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected !== null, allItems])

  if (error) return <p>{error}</p>
  if (!rows) return <p>Loading renders…</p>

  return (
    <div className="renderGallery">
      {rows.map((row) => (
        <section className="renderRow" key={row.dir}>
          <h2 className="rowHeader">{row.dir || '/'}</h2>
          <div className="rowItems">
            {row.items.map((item) => (
              <Thumbnail key={item.src} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
        </section>
      ))}
      {selected && <Viewer item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
