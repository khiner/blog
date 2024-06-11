import { useRef, useState } from 'react'

import { RenderMode, useFluidSimEffect } from './fluid_sim/useFluidSimEffect'
import { useGpuDevice } from './useGpuDevice'

interface ControlPaneProps {
  onPropChange: (key: string, value: any) => void
  reset: () => void
}
const ControlPane: React.FC<ControlPaneProps> = ({ onPropChange, reset }) => {
  const [renderMode, setRenderMode] = useState(RenderMode.Classic)

  return (
    <div className="control-pane" style={{ position: 'absolute' }}>
      <Dropdown
        k="renderMode"
        label="Render Mode"
        options={{
          Classic: RenderMode.Classic,
          'Smoke 2D': RenderMode.Smoke2D,
          'Smoke 3D + Shadows': RenderMode.Smoke3D,
        }}
        onChange={(k, v) => {
          setRenderMode(v)
          onPropChange(k, v)
        }}
      />
      <Dropdown k="gridSize" label="Sim Resolution" options={[32, 64, 128, 256, 512, 1024]} onChange={onPropChange} />
      <Dropdown k="dyeSize" label="Render Resolution" options={[128, 256, 512, 1024, 2048]} onChange={onPropChange} />
      <Toggle k="containFluid" label="Solid boundaries" onChange={onPropChange} />
      <Slider k="velocityForce" label="Velocity Force" min={0} max={0.5} step={0.01} onChange={onPropChange} />
      <Slider k="velocityRadius" label="Velocity Radius" min={0} max={0.001} step={0.0001} onChange={onPropChange} />
      <Slider
        k="velocityDiffusion"
        label="Velocity Diffusion"
        min={0.95}
        max={1}
        step={0.0001}
        onChange={onPropChange}
      />
      <Slider k="dyeIntensity" label="Dye Intensity" min={0} max={10} step={0.1} onChange={onPropChange} />
      <Slider k="dyeRadius" label="Dye Radius" min={0} max={0.01} step={0.001} onChange={onPropChange} />
      <Slider k="dyeDiffusion" label="Dye Diffusion" min={0.95} max={1} step={0.0001} onChange={onPropChange} />
      <Slider k="viscosity" label="Viscosity" min={0} max={1} step={0.01} onChange={onPropChange} />
      <Slider k="vorticity" label="Vorticity" min={0} max={10} step={0.1} onChange={onPropChange} />

      {renderMode === RenderMode.Smoke3D && (
        <div>
          <h4>Smoke Parameters</h4>
          <Slider k="raymarchSteps" label="3D resolution" min={5} max={20} step={1} onChange={onPropChange} />
          <Slider k="lightHeight" label="Light Elevation" min={0.5} max={1} step={0.1} onChange={onPropChange} />
          <Slider k="lightIntensity" label="Light Intensity" min={0} max={1} step={0.1} onChange={onPropChange} />
          <Slider k="lightFalloff" label="Light Falloff" min={0.5} max={10} step={0.1} onChange={onPropChange} />
          <Toggle k="enableShadows" label="Enable Shadows" onChange={onPropChange} />
          <Slider k="shadowIntensity" label="Shadow Intensity" min={0} max={50} step={1} onChange={onPropChange} />
        </div>
      )}
      <input type="button" value="Reset" onClick={reset} />
    </div>
  )
}

interface SliderProps {
  k: string
  label: string
  min: number
  max: number
  step: number
  onChange: (key: string, value: number) => void
}
const Slider: React.FC<SliderProps> = ({ k, label, min, max, step, onChange }) => (
  <div>
    <label>{label}</label>
    <input type="range" min={min} max={max} step={step} onChange={(e) => onChange(k, parseFloat(e.target.value))} />
  </div>
)

interface ToggleProps {
  k: string
  label: string
  onChange: (key: string, value: boolean) => void
}
const Toggle: React.FC<ToggleProps> = ({ k, label, onChange }) => (
  <div>
    <label>{label}</label>
    <input type="checkbox" onChange={(e) => onChange(k, e.target.checked)} />
  </div>
)

interface DropdownProps {
  k: string
  label: string
  options: { [key: string]: number } | number[]
  onChange: (key: string, value: any) => void
}
const Dropdown: React.FC<DropdownProps> = ({ k, label, options, onChange }) => (
  <div>
    <label>{label}</label>
    <select onChange={(e) => onChange(k, parseInt(e.target.value))}>
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

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { device, errorMessage } = useGpuDevice(canvasRef)
  const simulation = useFluidSimEffect(canvasRef, device)

  return (
    <div>
      {!errorMessage && (
        <>
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></canvas>
          {simulation && <ControlPane {...simulation} />}
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
