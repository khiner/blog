import { TimesIcon } from 'icons'
import EntryNavItems from './EntryNavItems'

export default ({ isOpen, setOpen }) => (
  <div className={`sidebar${isOpen ? ' show' : ''}`}>
    <div className="sidebarHeader">
      <h3>Posts</h3>
      <TimesIcon className="clickable" onClick={() => setOpen(!isOpen)} />
    </div>
    <EntryNavItems onItemClick={() => setOpen(false)} />
  </div>
)
