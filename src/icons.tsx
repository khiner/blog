const Icon = ({ path, viewBox, style, ...props }) => (
  <svg
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    style={{ width: '1em', height: '1em', ...style }}
    {...props}
  >
    <path d={path} />
  </svg>
)

// Whole-pixel edges at the default 18px size.
const listIconPath = 'M0 1h4v4H0zM6 2h12v2H6zM0 7h4v4H0zM6 8h12v2H6zM0 13h4v4H0zM6 14h12v2H6z'
// Path copied from react-icons/fa.
const timesIconPath =
  'M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z'

const ListIcon = (props) => <Icon {...props} path={listIconPath} viewBox="0 0 18 18" />
const TimesIcon = (props) => <Icon {...props} path={timesIconPath} viewBox="0 0 352 512" />

export { ListIcon, TimesIcon }
