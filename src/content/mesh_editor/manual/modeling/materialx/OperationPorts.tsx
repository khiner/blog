import { Fragment } from 'preact'
import type { ComponentChildren } from 'preact'
import signatures from './signatures.mjs'
import './OperationPorts.css'

type Definitions = Record<string, string>
type TypeCell = string | { sameAs: string }

interface SocketTypes {
  fixedTypes?: Definitions
  columns?: string[]
  rows?: TypeCell[][]
}

interface Props extends SocketTypes {
  children?: ComponentChildren
  identifier: string
  inputs?: Definitions
  properties?: Definitions
  result?: string
  outputs?: Definitions
  signature?: keyof typeof signatures
  contexts?: string
}

function PortDefinitions({ title, items, types = false }: { title?: string; items?: Definitions; types?: boolean }) {
  if (!items) return null
  return (
    <>
      {title && <h4>{title}</h4>}
      <dl className={types ? 'mx-fixed-types' : 'mx-definitions'}>
        {Object.entries(items).map(([name, description]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{types ? <TypeList value={description} /> : description}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function TypeList({ value }: { value: string }) {
  if (value === '—') return <span aria-label="No socket for this type">—</span>
  return value.split(', ').map((part, index) => (
    <Fragment key={part}>
      {index > 0 && ', '}
      <code>{part}</code>
    </Fragment>
  ))
}

export default function OperationPorts(props: Props) {
  const { children, identifier, inputs, properties, result, outputs, contexts } = props
  const { fixedTypes, columns, rows }: SocketTypes = props.signature ? signatures[props.signature] : props
  return (
    <div className="mx-ports">
      <PortDefinitions title="Inputs" items={inputs} />
      <PortDefinitions title="Properties" items={properties} />
      {outputs ? (
        <PortDefinitions title="Outputs" items={outputs} />
      ) : (
        <>
          <h4>Output</h4>
          <p>{result}</p>
        </>
      )}
      {children && (
        <>
          <h4>Examples</h4>
          {children}
        </>
      )}
      <details className="mx-signatures">
        <summary>Supported types</summary>
        <PortDefinitions items={fixedTypes} types />
        {rows && (
          <table aria-label={identifier + ' type combinations'}>
            <thead>
              <tr>
                {columns.map((name) => (
                  <th scope="col" key={name}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, i) => (
                    <td key={i}>{typeof cell === 'string' ? <TypeList value={cell} /> : 'Same as ' + cell.sameAs}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {contexts && <p>Works with {contexts}</p>}
        <p>
          MaterialX identifier · <code>{identifier}</code>
        </p>
      </details>
    </div>
  )
}
