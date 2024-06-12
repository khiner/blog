import { useRef, useState } from 'react'

import { RenderMode, FluidSimProps, useFluidSimEffect, SmokeProps } from './fluid_sim/useFluidSimEffect'
import { useGpuDevice } from './useGpuDevice'

interface SliderProps {
  k: string
  l: string
  v: number
  cb: (key: string, value: number) => void
  min: number
  max: number
}
const Slider: React.FC<SliderProps> = ({ k, l, min, max, v, cb }) => (
  <div>
    <label>{l}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={0.0001}
      value={v}
      onChange={(e) => cb(k, parseFloat(e.target.value))}
    />
  </div>
)

interface ToggleProps {
  k: string
  l: string
  v: boolean
  cb: (key: string, value: boolean) => void
}
const Toggle: React.FC<ToggleProps> = ({ k, l, v, cb }) => (
  <div>
    <label>{l}</label>
    <input type="checkbox" checked={v} onChange={(e) => cb(k, e.target.checked)} />
  </div>
)

interface DropdownProps {
  k: string
  l: string
  v: number
  cb: (key: string, value: any) => void
  options: { [key: string]: number } | number[]
}
const Dropdown: React.FC<DropdownProps> = ({ k, l, options, v, cb }) => (
  <div>
    <label>{l}</label>
    <select value={v} onChange={(e) => cb(k, parseInt(e.target.value))}>
      {Array.isArray(options)
        ? options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))
        : Object.entries(options).map(([name, value]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
    </select>
  </div>
)

interface SmokeControlPaneProps {
  props: SmokeProps
  onChange: (key: string, value: any) => void
}
const SmokeControlPane: React.FC<SmokeControlPaneProps> = ({
  props: { raymarchSteps, lightHeight, lightIntensity, lightFalloff, enableShadows, shadowIntensity },
  onChange,
}) => (
  <div>
    <h4>Smoke Parameters</h4>
    <Slider k="raymarchSteps" l="3D resolution" v={raymarchSteps} min={5} max={20} cb={onChange} />
    <Slider k="lightHeight" l="Light Elevation" v={lightHeight} min={0.5} max={1} cb={onChange} />
    <Slider k="lightIntensity" l="Light Intensity" v={lightIntensity} min={0} max={1} cb={onChange} />
    <Slider k="lightFalloff" l="Light Falloff" v={lightFalloff} min={0.5} max={10} cb={onChange} />
    <Toggle k="enableShadows" l="Enable Shadows" v={enableShadows} cb={onChange} />
    <Slider k="shadowIntensity" l="Shadow Intensity" v={shadowIntensity} min={0} max={50} cb={onChange} />
  </div>
)

interface ControlPaneProps {
  props: FluidSimProps
  onChange: (key: string, value: any) => void
  reset: () => void
}
const ControlPane: React.FC<ControlPaneProps> = ({ props, onChange, reset }) => {
  const {
    renderMode,
    containFluid,
    simSpeed,
    gridSize,
    dyeSize,
    velocityForce,
    velocityRadius,
    velocityDiffusion,
    dyeIntensity,
    dyeRadius,
    dyeDiffusion,
    viscosity,
    vorticity,
    smoke,
  } = props

  return (
    <div className="control-pane" style={{ position: 'absolute' }}>
      <Dropdown
        k="renderMode"
        l="Render Mode"
        v={renderMode}
        options={{
          Classic: RenderMode.Classic,
          'Smoke 2D': RenderMode.Smoke2D,
          'Smoke 3D + Shadows': RenderMode.Smoke3D,
        }}
        cb={onChange}
      />
      <Dropdown k="gridSize" l="Sim Resolution" v={gridSize} options={[32, 64, 128, 256, 512, 1024]} cb={onChange} />
      <Dropdown k="dyeSize" l="Render Resolution" v={dyeSize} options={[128, 256, 512, 1024, 2048]} cb={onChange} />
      <Toggle k="containFluid" l="Solid boundaries" v={containFluid} cb={onChange} />
      <Slider k="simSpeed" l="Sim speed" v={simSpeed} min={0.1} max={20} cb={onChange} />
      <Slider k="velocityForce" l="Velocity Force" v={velocityForce} min={0} max={0.5} cb={onChange} />
      <Slider k="velocityRadius" l="Velocity Radius" v={velocityRadius} min={0} max={0.001} cb={onChange} />
      <Slider k="velocityDiffusion" l="Velocity Diffusion" v={velocityDiffusion} min={0.95} max={1} cb={onChange} />
      <Slider k="dyeIntensity" l="Dye Intensity" v={dyeIntensity} min={0} max={10} cb={onChange} />
      <Slider k="dyeRadius" l="Dye Radius" v={dyeRadius} min={0} max={0.01} cb={onChange} />
      <Slider k="dyeDiffusion" l="Dye Diffusion" v={dyeDiffusion} min={0.95} max={1} cb={onChange} />
      <Slider k="viscosity" l="Viscosity" v={viscosity} min={0} max={1} cb={onChange} />
      <Slider k="vorticity" l="Vorticity" v={vorticity} min={0} max={10} cb={onChange} />
      {renderMode === RenderMode.Smoke3D && <SmokeControlPane props={smoke} onChange={onChange} />}
      <input type="button" value="Reset" onClick={reset} />
    </div>
  )
}

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { device, errorMessage } = useGpuDevice(canvasRef)
  const [props, setProps] = useState<FluidSimProps>({
    gridSize: 128,
    dyeSize: 1024,
    renderMode: RenderMode.Classic,
    containFluid: true,
    simSpeed: 5,
    velocityForce: 0.2,
    velocityRadius: 0.0002,
    velocityDiffusion: 0.9999,
    dyeIntensity: 1,
    dyeRadius: 0.001,
    dyeDiffusion: 0.98,
    viscosity: 0.8,
    vorticity: 2,
    smoke: {
      raymarchSteps: 12,
      smokeDensity: 40,
      enableShadows: true,
      shadowIntensity: 25,
      smokeHeight: 0.2,
      lightHeight: 1,
      lightIntensity: 1,
      lightFalloff: 1,
    },
  })
  const simulation = useFluidSimEffect(props, canvasRef, device)
  const handlePropChange = (key: string, value: any) => {
    setProps((prevProps) => {
      if (key in props.smoke) return { ...prevProps, smoke: { ...prevProps.smoke, [key]: value } }
      return { ...prevProps, [key]: value }
    })
    simulation?.onPropChange(key, value)
  }

  return (
    <div>
      {!errorMessage && (
        <>
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></canvas>
          {simulation && <ControlPane props={props} onChange={handlePropChange} reset={simulation.reset} />}
        </>
      )}
      {errorMessage && (
        <div style={{ padding: 10 }}>
          <p>
            WebGPU is not supported on this browser. <i>Error: {errorMessage}</i>
          </p>
        </div>
      )}
    </div>
  )
}
