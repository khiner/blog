import { useRef } from 'react'
import FluidSim from './FluidSim'

export default () => {
  const boundaryRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <FluidSim boundaryRef={boundaryRef} />
      <div
        ref={boundaryRef}
        style={{
          width: '25%',
          height: '50%',
          top: '25%',
          left: '25%',
          position: 'absolute',
          textAlign: 'center',
          background: 'blue',
        }}
      >
        Boundary
      </div>
    </>
  )
}
