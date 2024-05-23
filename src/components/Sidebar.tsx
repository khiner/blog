import { TimesIcon } from '../icons'
import EntryNavItems from './EntryNavItems'

export default ({ isOpen, setOpen }) => (
  <div className={`sidebar${isOpen ? ' show' : ''}`}>
    <div className="sidebarHeader">
      <TimesIcon className="clickable" style={{ float: 'right' }} onClick={() => setOpen(!isOpen)} />
      <h3>Posts</h3>
    </div>
    <EntryNavItems onItemClick={() => setOpen(false)} />
  </div>
)
