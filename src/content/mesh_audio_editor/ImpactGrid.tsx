import type { CSSProperties } from 'preact/compat'

interface ImpactGridItemProps {
  name: string
  meshSrc: string
  realAudio?: string
  modalAudio: string
}

interface ImpactGridProps {
  rows: ImpactGridItemProps[]
}

const ImpactGrid = ({ rows }: ImpactGridProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
      padding: '20px',
    }}
  >
    {rows.map((row) => (
      <ImpactGridItem key={row.name} {...row} />
    ))}
  </div>
)

const audioStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '4px',
}

const ImpactGridItem = ({ name, meshSrc, realAudio, modalAudio }: ImpactGridItemProps) => (
  <div
    style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      backgroundColor: '#fff',
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: 18,
        textAlign: 'center',
      }}
    >
      {name}
    </h2>
    <img
      src={meshSrc}
      alt={`${name} Mesh`}
      style={{ maxWidth: 400, width: '100%', height: 'auto', margin: '0 auto', borderRadius: 8 }}
    />
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {realAudio && (
        <div>
          <div style={{ fontSize: 15 }}>Real audio:</div>
          <audio controls src={realAudio} style={audioStyle} aria-label="Real impact audio" />
        </div>
      )}
      <div>
        {realAudio && <div style={{ fontSize: 15 }}>Synthesized audio:</div>}
        <audio controls src={modalAudio} style={audioStyle} aria-label="Synthesized impact audio" />
      </div>
    </div>
  </div>
)

export default ImpactGrid
