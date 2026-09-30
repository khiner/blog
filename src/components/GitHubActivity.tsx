import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
  type PointerEvent,
} from 'preact/compat'

import '../style/GitHubActivity.css'

type DayTarget = [string | string[], string?, string?]
type Lane = [number, DayTarget?]
type Day = [string, number, (DayTarget | null)?, [Lane, Lane]?]
type Publication = { id: string; date: string }
type Repository = {
  id: number | string
  name: string
  url: string | null
  private: boolean
  fork: boolean
  sourceName: string | null
  createdAt: string
  publications: Publication[]
  days: Day[]
}
type Activity = { version: number; generatedAt: string; username: string; repositories: Repository[] }

const millisecondsPerDay = 86400000
const timelineDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
const timelineDateWithoutYear = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
const timelineLongDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' })
const timelineMonth = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' })

const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / millisecondsPerDay)
const dateAt = (day: number) => new Date(day * millisecondsPerDay)
const dragZoomScale = (fromY: number, toY: number) => {
  const delta = fromY - toY
  return Math.exp(Math.sign(delta) * Math.max(0, Math.abs(delta) - 8) * 0.01)
}
const isoDate = (day: number) => dateAt(day).toISOString().slice(0, 10)
const readableDate = (date: string) => timelineLongDate.format(dateAt(dayNumber(date)))
const repoName = (repo: Repository) => (repo.private ? 'Private' : repo.name)
const commitLabel = (count: number, lane = '') => `${count} ${lane && `${lane} `}commit${count === 1 ? '' : 's'}`

const dayHref = (date: string, count: number, [origin, first, last]: DayTarget) => {
  if (typeof origin === 'string') {
    if (count === 1 && first) return `https://github.com/${origin}/commit/${first}`
    if (first && last) return `https://github.com/${origin}/compare/${first}...${last}`
    if (first) return `https://github.com/${origin}/commits/${first}`
  }
  const repos = (Array.isArray(origin) ? origin : [origin]).map((repo) => `repo:${repo}`).join(' ')
  return `https://github.com/search?${new URLSearchParams({ q: `author-date:${date} ${repos}`, type: 'commits' })}`
}

const strength = (count: number) => (count >= 8 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : 1)
const commitCount = (repo: Repository) => repo.days.reduce((sum, day) => sum + day[1], 0)
const hasUpstreamContributions = (repo: Repository) => repo.days.some(([, , , lanes]) => (lanes?.[0][0] ?? 0) > 0)
const repositoryDetails = (repo: Repository) =>
  [
    repo.sourceName && `fork of ${repo.sourceName}`,
    repo.fork && hasUpstreamContributions(repo) && 'upstream contributions',
  ]
    .filter(Boolean)
    .join(' · ')

const forkPath =
  'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z'
const mergePath =
  'M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z'

const ForkStatusIcon = ({
  upstream,
  className = 'github-activity-repo-icon github-activity-fork-icon',
}: {
  upstream: boolean
  className?: string
}) => (
  <svg className={className} viewBox={upstream ? '1.5 0 14 16' : '1.5 0 13 16'} aria-hidden="true">
    <path d={upstream ? mergePath : forkPath} />
  </svg>
)

const LockIcon = ({ className = 'github-activity-repo-icon' }: { className?: string }) => (
  <svg className={className} viewBox="1.5 0 13 16" aria-hidden="true">
    <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z" />
  </svg>
)

const FitTimelineIcon = () => (
  <svg className="github-activity-toggle-icon" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M1.75 3v10m12.5-10v10M5.5 5.5 3 8l2.5 2.5M10.5 5.5 13 8l-2.5 2.5M3 8h10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const RepoLabel = ({ repo, count = commitCount(repo) }: { repo: Repository; count?: number }) => (
  <>
    {repo.fork && <ForkStatusIcon upstream={hasUpstreamContributions(repo)} />}
    {repo.private && <LockIcon />}
    <span className="github-activity-repo-name">{repoName(repo)}</span>
    {count > 0 && (
      <span className="github-activity-repo-count" aria-hidden="true">
        {count.toLocaleString()}
      </span>
    )}
  </>
)

const activeRange = (repo: Repository, firstDay: number, lastDay: number) => {
  const [start, end] = activeDays(repo, lastDay)
  const totalDays = lastDay - firstDay + 1
  return { left: `${((start - firstDay) / totalDays) * 100}%`, width: `${((end - start + 1) / totalDays) * 100}%` }
}

const activeDays = (repo: Repository, lastDay: number): [number, number] => {
  const firstCommit = repo.days[0]?.[0]
  const latestCommit = repo.days.at(-1)?.[0]
  const start = Math.min(dayNumber(repo.createdAt), firstCommit ? dayNumber(firstCommit) : Infinity)
  const latest = latestCommit ? dayNumber(latestCommit) : start
  const end = latestCommit && lastDay - latest <= 30 ? lastDay : latest
  return [start, end]
}

export default function GitHubActivity() {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [error, setError] = useState(false)
  const [showPrivate, setShowPrivate] = useState(false)
  const [showUpstreamForks, setShowUpstreamForks] = useState(true)
  const [showForkOnlyForks, setShowForkOnlyForks] = useState(true)
  const [showOtherRepos, setShowOtherRepos] = useState(false)
  const [dayWidth, setDayWidth] = useState(1)
  const [axisFontSize, setAxisFontSize] = useState(0)
  const [viewport, setViewport] = useState({ start: 0, end: 1 })
  const plot = useRef<HTMLDivElement>(null)
  const overview = useRef<HTMLDivElement>(null)
  const overviewCanvas = useRef<HTMLCanvasElement>(null)
  const overviewDrag = useRef<{
    id: number
    x: number
    y: number
    barWidth: number
    grabOffset: number
    inside: boolean
    moved: boolean
    zoomed: boolean
    day: number
    width: number
  } | null>(null)
  const stopOverviewDrag = () => {
    overviewDrag.current = null
  }
  const tooltip = useRef<HTMLDivElement>(null)
  const zoomAnchor = useRef<{ day: number; x: number } | null>(null)
  const zoomAtRef = useRef<((width: number, anchor: { day: number; x: number }) => void) | null>(null)
  const renderedDayWidth = useRef(1)
  const previousView = useRef({ width: 0, right: 0 })
  const showTooltip = (
    label: string,
    event: { clientX: number; clientY: number; pointerType?: string; type?: string },
  ) => {
    if (event.pointerType === 'touch' && event.type === 'pointermove') {
      hideTooltip()
      return
    }
    if (!label.trim()) {
      hideTooltip()
      return
    }
    if (!tooltip.current) return
    if (tooltip.current.getAttribute('aria-label') !== label) {
      tooltip.current.setAttribute('aria-label', label)
      tooltip.current.replaceChildren(
        ...label.split('\n').map((text) => {
          const line = document.createElement('div')
          line.className = 'github-activity-tooltip-line'
          line.replaceChildren(
            ...text.split(' · ').map((text) => {
              const part = document.createElement('span')
              part.textContent = text
              return part
            }),
          )
          return line
        }),
      )
    }
    tooltip.current.hidden = false
    const fontSize = parseFloat(getComputedStyle(tooltip.current).fontSize)
    const inset = fontSize * 0.75
    const { width, height } = tooltip.current.getBoundingClientRect()
    tooltip.current.style.left = `${Math.max(inset, Math.min(event.clientX + fontSize, window.innerWidth - width - inset))}px`
    tooltip.current.style.top = `${Math.max(inset, Math.min(event.clientY + fontSize, window.innerHeight - height - inset))}px`
  }
  const hideTooltip = () => {
    if (tooltip.current) tooltip.current.hidden = true
  }
  const tooltipHandlers = (label: string, title?: string) => {
    const hover = (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'touch' && event.type === 'pointermove') {
        hideTooltip()
        return
      }
      const name = title ? event.currentTarget.querySelector<HTMLElement>('.github-activity-repo-name') : null
      showTooltip(name && name.scrollWidth > name.clientWidth ? `${title}\n${label}` : label, event)
    }
    return { onPointerEnter: hover, onPointerMove: hover, onPointerLeave: hideTooltip }
  }
  const filterHandlers = (label: string, shown: boolean, toggle: () => void) => ({
    ...tooltipHandlers(`${shown ? 'Hide' : 'Show'} ${label}`),
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      toggle()
      if (tooltip.current && !tooltip.current.hidden) showTooltip(`${shown ? 'Show' : 'Hide'} ${label}`, event)
    },
  })
  const renderFilter = (label: string, shown: boolean, toggle: () => void, icon: ReactNode) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={shown}
      {...filterHandlers(label.toLowerCase(), shown, toggle)}
    >
      {icon}
    </button>
  )

  useEffect(() => {
    const controller = new AbortController()
    fetch('/github-activity/activity.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Activity request failed: ${response.status}`)
        return response.json()
      })
      .then((result: Activity) => {
        if (result.version !== 1 || !Array.isArray(result.repositories)) throw new Error('Unexpected activity data')
        setActivity(result)
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(true)
      })
    return () => controller.abort()
  }, [])

  const chart = useMemo(() => {
    if (!activity) return null
    const lastDay = Math.floor(Date.now() / millisecondsPerDay)
    const repos = activity.repositories
      .filter(
        (repo) =>
          (showPrivate || !repo.private) &&
          (!repo.fork || (hasUpstreamContributions(repo) ? showUpstreamForks : showForkOnlyForks)),
      )
      .sort(
        (a, b) => (b.days.at(-1)?.[0] ?? '').localeCompare(a.days.at(-1)?.[0] ?? '') || a.name.localeCompare(b.name),
      )
    const firstDay =
      Math.min(lastDay, ...repos.map((repo) => (repo.days.length ? dayNumber(repo.days[0][0]) : lastDay))) - 7
    return {
      firstDay,
      lastDay,
      firstYear: dateAt(firstDay).getUTCFullYear(),
      lastYear: new Date().getUTCFullYear(),
      repos,
    }
  }, [activity, showPrivate, showUpstreamForks, showForkOnlyForks])
  const totalDays = chart ? chart.lastDay - chart.firstDay + 1 : 0
  const firstVisibleDay = Math.floor(viewport.start * totalDays)
  const lastVisibleDay = Math.ceil(viewport.end * totalDays) - 1
  const position = (date: string) => `${((dayNumber(date) - chart.firstDay) / totalDays) * 100}%`

  const grouped = useMemo(() => {
    if (!chart) return null
    const firstVisible = isoDate(chart.firstDay + firstVisibleDay)
    const lastVisible = isoDate(chart.firstDay + lastVisibleDay)
    const inView: { repo: Repository; commits: number; latest: string }[] = []
    const other: Repository[] = []
    const counts = new Map<Repository, number>()
    let totalCommits = 0
    for (const repo of chart.repos) {
      let commits = 0
      let latest = ''
      for (const [date, count] of repo.days) {
        if (date < firstVisible) continue
        if (date > lastVisible) break
        commits += count
        latest = date
      }
      counts.set(repo, commits)
      if (commits) {
        inView.push({ repo, commits, latest })
        totalCommits += commits
      } else other.push(repo)
    }
    inView.sort((a, b) => b.commits - a.commits || b.latest.localeCompare(a.latest))
    return {
      inView: inView.map(({ repo }) => repo),
      other,
      counts,
      totalCommits,
    }
  }, [chart, firstVisibleDay, lastVisibleDay])

  const rowItems = useMemo<(Repository | null)[]>(
    () =>
      grouped
        ? [...grouped.inView, ...(grouped.other.length ? [null] : []), ...(showOtherRepos ? grouped.other : [])]
        : [],
    [grouped, showOtherRepos],
  )

  const otherDays = useMemo(() => {
    const counts = new Map<string, number>()
    for (const repo of grouped?.other ?? [])
      for (const [date, count] of repo.days) counts.set(date, (counts.get(date) ?? 0) + count)
    return counts
  }, [grouped])

  const monthStarts = useMemo(() => {
    if (!chart) return []
    const starts: { day: number; month: number; year: number }[] = []
    for (let year = chart.firstYear; year <= chart.lastYear; year++)
      for (let month = 0; month < 12; month++) {
        const day = Math.floor(Date.UTC(year, month, 1) / millisecondsPerDay)
        if (day > chart.firstDay && day <= chart.lastDay) starts.push({ day, month, year })
      }
    return starts
  }, [chart])

  const months = useMemo(() => {
    if (!chart || !axisFontSize) return []
    const firstDate = dateAt(chart.firstDay)
    const startsInJanuary = firstDate.getUTCMonth() === 0 && firstDate.getUTCDate() === 1
    const monthStep = dayWidth >= axisFontSize * 0.25 ? 1 : dayWidth >= axisFontSize * 0.0625 ? 3 : 12
    const labelSpacing = axisFontSize * 5.5
    const endSpacing = axisFontSize * 3
    const result = monthStarts
      .filter(({ month }) => month % monthStep === 0)
      .map(({ day, month, year }) => ({
        offset: (day - chart.firstDay) * dayWidth,
        label: month === 0 ? String(year) : timelineMonth.format(dateAt(day)),
        year: month === 0,
        day,
      }))
    if (startsInJanuary || (result[0]?.offset ?? Infinity) >= labelSpacing)
      result.unshift({
        offset: 0,
        label: startsInJanuary ? String(chart.firstYear) : timelineMonth.format(firstDate),
        year: startsInJanuary,
        day: chart.firstDay,
      })
    const spaced: typeof result = []
    for (const label of result)
      if (!spaced.length || label.offset - spaced[spaced.length - 1].offset >= labelSpacing) spaced.push(label)
    const trackWidth = totalDays * dayWidth
    return spaced.filter(({ offset }) => offset + endSpacing <= trackWidth)
  }, [chart, dayWidth, monthStarts, axisFontSize])

  const periodLines = useMemo(() => {
    if (!chart || !axisFontSize) return null
    const showMonths = dayWidth * 28 >= axisFontSize * 1.1
    return monthStarts
      .filter(({ month }) => month === 0 || showMonths)
      .map(({ day, month }) => (
        <span
          className={`github-activity-period-line${month === 0 ? ' year' : ''}`}
          key={day}
          style={{ left: `${((day - chart.firstDay) / totalDays) * 100}%` }}
          aria-hidden="true"
        />
      ))
  }, [chart, dayWidth, monthStarts, axisFontSize])

  const updateViewport = () => {
    const element = plot.current
    if (!element || !element.scrollWidth) return
    const width = element.clientWidth
    if (previousView.current.width !== width) element.style.setProperty('--activity-plot-width', `${width}px`)
    if (previousView.current.width && previousView.current.width !== width)
      element.scrollLeft = previousView.current.right - width
    const left = Math.min(Math.max(0, element.scrollLeft), Math.max(0, element.scrollWidth - width))
    const right = left + width
    previousView.current = { width, right }
    const start = left / element.scrollWidth
    const end = Math.min(1, right / element.scrollWidth)
    setViewport((current) => (current.start === start && current.end === end ? current : { start, end }))
  }

  useLayoutEffect(() => {
    if (!chart || !overview.current || !overviewCanvas.current) return
    const container = overview.current
    const canvas = overviewCanvas.current
    const commits = new Float64Array(totalDays + 1)
    for (const repo of chart.repos)
      for (const [date, count] of repo.days) {
        const day = dayNumber(date) - chart.firstDay
        if (day >= 0 && day < totalDays) commits[day + 1] += count
      }
    for (let day = 1; day <= totalDays; day++) commits[day] += commits[day - 1]
    const draw = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      const context = canvas.getContext('2d')
      if (!context) return
      const styles = getComputedStyle(container)
      const color = (name: string) => styles.getPropertyValue(`--activity-${name}`).trim()
      const levels = [1, 2, 3, 4].map((level) => color(`level-${level}`))
      context.fillStyle = color('background')
      context.fillRect(0, 0, canvas.width, canvas.height)
      for (let x = 0; x < canvas.width; x++) {
        const start = Math.floor((x * totalDays) / canvas.width)
        const end = Math.max(start + 1, Math.floor(((x + 1) * totalDays) / canvas.width))
        // Keep the color scale in commits per day when several days share a pixel.
        const count = (commits[end] - commits[start]) / (end - start)
        if (!count) continue
        context.fillStyle = levels[strength(count) - 1]
        context.fillRect(x, 0, 1, canvas.height)
      }
    }
    const observer = new ResizeObserver(draw)
    observer.observe(container)
    draw()
    return () => observer.disconnect()
  }, [chart])

  useLayoutEffect(() => {
    const element = plot.current
    if (!activity || !element) return
    const resize = () => {
      setAxisFontSize(parseFloat(getComputedStyle(element).fontSize))
      updateViewport()
    }
    // Defer layout-changing state updates until ResizeObserver delivery has finished.
    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(resize)
    })
    observer.observe(element)
    resize()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [activity])

  useLayoutEffect(() => {
    const anchor = zoomAnchor.current
    if (anchor && plot.current) plot.current.scrollLeft = anchor.day * dayWidth - anchor.x
    zoomAnchor.current = null
    renderedDayWidth.current = dayWidth
    updateViewport()
  }, [dayWidth])

  useLayoutEffect(() => {
    const element = plot.current
    if (!activity || !chart || !element) return
    const width = element.clientWidth / Math.min(365, totalDays)
    element.scrollLeft = element.scrollWidth
    if (width !== renderedDayWidth.current) {
      zoomAnchor.current = { day: totalDays, x: element.clientWidth }
      setDayWidth(width)
    } else {
      updateViewport()
    }
  }, [activity])

  useEffect(() => {
    const plotElement = plot.current
    const overviewElement = overview.current
    if (!plotElement || !overviewElement || !chart) return
    const clampWidth = (width: number) =>
      Math.min(
        plotElement.clientWidth / Math.min(7, totalDays),
        Math.max(plotElement.clientWidth / totalDays, Math.round(width * 10000) / 10000),
      )
    let zoomFrame = 0
    let pendingZoom: { width: number; anchor: { day: number; x: number } } | null = null
    const zoomAt = (width: number, anchor: { day: number; x: number }) => {
      pendingZoom = { width: clampWidth(width), anchor }
      if (zoomFrame) return
      zoomFrame = requestAnimationFrame(() => {
        zoomFrame = 0
        const change = pendingZoom!
        pendingZoom = null
        if (change.width === renderedDayWidth.current) {
          plotElement.scrollLeft = change.anchor.day * change.width - change.anchor.x
          updateViewport()
        } else {
          zoomAnchor.current = change.anchor
          setDayWidth(change.width)
        }
      })
    }
    zoomAtRef.current = zoomAt
    const plotX = (clientX: number) =>
      Math.max(0, Math.min(clientX - plotElement.getBoundingClientRect().left, plotElement.clientWidth))
    const zoomPlotAt = (scale: number, clientX?: number) => {
      const x = clientX === undefined ? plotElement.clientWidth / 2 : plotX(clientX)
      const width = pendingZoom?.width ?? renderedDayWidth.current
      const left = pendingZoom ? pendingZoom.anchor.day * width - pendingZoom.anchor.x : plotElement.scrollLeft
      zoomAt(width * scale, { day: (left + x) / width, x })
    }
    const zoomOverviewAt = (scale: number) => zoomPlotAt(scale)
    const controller = new AbortController()
    const active = { passive: false, signal: controller.signal }
    let momentum = { x: 0, y: 0, time: 0, frame: 0 }
    const stopMomentum = () => {
      cancelAnimationFrame(momentum.frame)
      momentum = { x: 0, y: 0, time: performance.now(), frame: 0 }
    }
    const panBy = (dx: number, dy: number) => {
      if (pendingZoom) pendingZoom.anchor.x -= dx
      else plotElement.scrollLeft += dx
      if (dy) window.scrollBy({ top: dy, behavior: 'instant' })
    }
    const sampleDragVelocity = (dx: number, dy: number) => {
      const now = performance.now()
      const elapsed = Math.max(1, now - momentum.time)
      momentum.x = (momentum.x + dx / elapsed) / 2
      momentum.y = (momentum.y + dy / elapsed) / 2
      momentum.time = now
    }
    const panDrag = (dx: number, dy: number) => {
      sampleDragVelocity(dx, dy)
      panBy(dx, dy)
    }
    const coast = () => {
      if (Math.hypot(momentum.x, momentum.y) < 0.02) return
      const now = performance.now()
      const decay = Math.exp(-Math.max(1, now - momentum.time) / 250)
      momentum.time = now
      panBy(momentum.x * 250 * (1 - decay), momentum.y * 250 * (1 - decay))
      momentum.x *= decay
      momentum.y *= decay
      momentum.frame = requestAnimationFrame(coast)
    }
    const startMomentum = () => {
      const now = performance.now()
      if (now - momentum.time >= 100 || Math.hypot(momentum.x, momentum.y) < 0.02) return
      momentum.time = now
      momentum.frame = requestAnimationFrame(coast)
    }
    let pinch: {
      onPlot: boolean
      range: { width: number; day: number; x: number; distance: number } | null
      finger: Touch | null
      anchors: { id: number; day: number }[] | null
      controller: AbortController
    } | null = null
    const onTouch = (event: TouchEvent) => {
      if (event.type === 'touchstart') {
        stopMomentum()
        const target = event.target as Node
        const onPlot = plotElement.contains(target)
        if (!pinch && (onPlot || overviewElement.contains(target)))
          pinch = { onPlot, range: null, finger: null, anchors: null, controller: new AbortController() }
        if (!pinch) return
        // Track both fingers, including outside the chart and on rows removed during zoom.
        for (const touch of event.touches)
          for (const type of ['touchmove', 'touchend', 'touchcancel'])
            touch.target.addEventListener(type, onTouch, { passive: false, signal: pinch.controller.signal })
      } else if (event.target !== event.currentTarget) {
        return
      }
      if (!pinch) return
      if (!event.touches.length) {
        if (event.type === 'touchend' && pinch.onPlot && pinch.finger) startMomentum()
        pinch.controller.abort()
        pinch = null
        return
      }
      if (event.touches.length !== 2) {
        pinch.range = null
        pinch.anchors = null
        const finger = event.touches.length === 1 ? event.touches[0] : null
        // Native scrolling cannot hand off to pinch after the first touchmove.
        if (pinch.onPlot && finger && pinch.finger && event.type === 'touchmove') {
          event.preventDefault()
          const dx = pinch.finger.clientX - finger.clientX
          const dy = pinch.finger.clientY - finger.clientY
          panDrag(dx, dy)
          hideTooltip()
        } else stopMomentum()
        pinch.finger = finger
        return
      }
      pinch.finger = null
      event.preventDefault()
      stopOverviewDrag()
      hideTooltip()
      if (pinch.onPlot) {
        const touches = Array.from(event.touches)
        const left = plotElement.getBoundingClientRect().left
        if (!pinch.anchors || pinch.anchors.some(({ id }) => !touches.some((touch) => touch.identifier === id))) {
          const width = pendingZoom?.width ?? renderedDayWidth.current
          const scroll = pendingZoom ? pendingZoom.anchor.day * width - pendingZoom.anchor.x : plotElement.scrollLeft
          pinch.anchors = touches.map((touch) => ({
            id: touch.identifier,
            day: (scroll + touch.clientX - left) / width,
          }))
        }
        const [first, second] = pinch.anchors
        const x1 = touches.find((touch) => touch.identifier === first.id)!.clientX - left
        const x2 = touches.find((touch) => touch.identifier === second.id)!.clientX - left
        const width = (x2 - x1) / (second.day - first.day)
        if (Number.isFinite(width) && width > 0) zoomAt(width, { day: (first.day + second.day) / 2, x: (x1 + x2) / 2 })
      } else {
        const [first, second] = event.touches
        const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
        const x = (first.clientX + second.clientX) / 2
        if (!pinch.range || !pinch.range.distance) {
          const width = pendingZoom?.width ?? renderedDayWidth.current
          const left = pendingZoom ? pendingZoom.anchor.day * width - pendingZoom.anchor.x : plotElement.scrollLeft
          pinch.range = { width, day: (left + plotElement.clientWidth / 2) / width, x, distance }
        }
        if (event.type === 'touchmove' && pinch.range.distance) {
          const range = pinch.range
          zoomAt((range.width * distance) / range.distance, {
            day: range.day + ((x - range.x) / overviewElement.getBoundingClientRect().width) * totalDays,
            x: plotElement.clientWidth / 2,
          })
        }
      }
    }
    document.addEventListener('touchstart', onTouch, active)
    document.addEventListener('pointerdown', stopMomentum, { signal: controller.signal })
    let mouseDrag: {
      id: number
      x: number
      lastX: number
      moved: boolean
      axis: { y: number; width: number; day: number } | null
    } | null = null
    const onMousePointer = (event: globalThis.PointerEvent) => {
      if (event.type === 'pointerdown') {
        if (event.pointerType === 'mouse' && event.button === 0) {
          const axis = event.target instanceof Element && event.target.closest('.github-activity-axis')
          mouseDrag = {
            id: event.pointerId,
            x: event.clientX,
            lastX: event.clientX,
            moved: false,
            axis: axis
              ? {
                  y: event.clientY,
                  width: renderedDayWidth.current,
                  day: (plotElement.scrollLeft + plotX(event.clientX)) / renderedDayWidth.current,
                }
              : null,
          }
        }
      } else if (mouseDrag?.id === event.pointerId && event.type === 'pointermove') {
        if (!(event.buttons & 1)) {
          mouseDrag = null
          return
        }
        const dx = event.clientX - mouseDrag.x
        const axis = mouseDrag.axis
        const dy = axis ? event.clientY - axis.y : 0
        if (!mouseDrag.moved && Math.hypot(dx, dy) < 4) return
        if (!mouseDrag.moved) plotElement.setPointerCapture(event.pointerId)
        mouseDrag.moved = true
        if (axis) {
          sampleDragVelocity(mouseDrag.lastX - event.clientX, 0)
          zoomAt(axis.width * dragZoomScale(axis.y, event.clientY), { day: axis.day, x: plotX(event.clientX) })
        } else panDrag(mouseDrag.lastX - event.clientX, 0)
        mouseDrag.lastX = event.clientX
        hideTooltip()
      } else if (mouseDrag?.id === event.pointerId) {
        if (event.type === 'pointerup' && mouseDrag.moved) startMomentum()
        mouseDrag = null
      }
    }
    plotElement.addEventListener('pointerdown', onMousePointer, { signal: controller.signal })
    for (const type of ['pointermove', 'pointerup', 'pointercancel'] as const)
      document.addEventListener(type, onMousePointer, { signal: controller.signal })
    for (const [element, zoom] of [
      [plotElement, zoomPlotAt],
      [overviewElement, zoomOverviewAt],
    ] as const) {
      const onWheel = (event: WheelEvent) => {
        stopMomentum()
        if (!event.deltaY || (!event.ctrlKey && Math.abs(event.deltaX) > Math.abs(event.deltaY))) return
        event.preventDefault()
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? plotElement.clientWidth : 1
        const scale = Math.exp(-event.deltaY * unit * (event.ctrlKey ? 0.01 : 0.002))
        const width = pendingZoom?.width ?? renderedDayWidth.current
        if (clampWidth(width * scale) !== width) zoom(scale, event.clientX)
      }
      let gestureScale = 1
      const onGestureStart = (event: Event) => {
        stopMomentum()
        event.preventDefault()
        stopOverviewDrag()
        gestureScale = 1
      }
      const onGestureChange = (event: Event) => {
        event.preventDefault()
        // iOS also sends gesture events for the touch sequence handled above.
        if (pinch) return
        const gesture = event as Event & { scale: number; clientX?: number }
        zoom(gesture.scale / gestureScale, gesture.clientX)
        gestureScale = gesture.scale
      }
      element.addEventListener('wheel', onWheel, active)
      element.addEventListener('gesturestart', onGestureStart, active)
      element.addEventListener('gesturechange', onGestureChange, active)
    }
    return () => {
      stopMomentum()
      cancelAnimationFrame(zoomFrame)
      zoomAtRef.current = null
      controller.abort()
      pinch?.controller.abort()
    }
  }, [chart])

  const renderDay = (
    repo: Repository | null,
    date: string,
    count: number,
    target?: DayTarget | null,
    lane?: 'upstream' | 'fork-only',
  ) => {
    if (!count) return null
    const className = `github-activity-day level-${strength(count)}${lane ? ` github-activity-${lane}` : ''}`
    const key = `${date}-${lane ?? 'all'}`
    const props = { className, 'data-date': date, style: { left: position(date) } }
    return repo && !repo.private && target ? (
      <a
        {...props}
        key={key}
        draggable={false}
        href={dayHref(date, count, target)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${repo.name}, ${readableDate(date)}: ${commitLabel(count, lane)}`}
      />
    ) : (
      <span {...props} key={key} />
    )
  }
  const repositoryViews = useMemo(
    () =>
      new Map(
        (chart?.repos ?? []).map((repo) => {
          const title = repoName(repo)
          const details = repositoryDetails(repo)
          const [activeStart, end] = activeDays(repo, chart.lastDay)
          const start = Math.max(activeStart, chart.firstDay)
          const startDate = dateAt(start)
          const endDate = dateAt(end)
          const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear()
          const startLabel = sameYear ? timelineDateWithoutYear.format(startDate) : timelineDate.format(startDate)
          const range =
            sameYear && startDate.getUTCMonth() === endDate.getUTCMonth()
              ? `${timelineMonth.format(startDate)} ${startDate.getUTCDate()}${start === end ? '' : `-${endDate.getUTCDate()}`} ${endDate.getUTCFullYear()}`
              : `${startLabel} - ${timelineDate.format(endDate)}`
          const instruction = `Click to show active timeline (${range})`
          const cells = repo.days.map(([date, count, target, lanes]) => ({
            date,
            content: lanes
              ? [
                  renderDay(repo, date, lanes[0][0], lanes[0][1], 'upstream'),
                  renderDay(repo, date, lanes[1][0], lanes[1][1], 'fork-only'),
                ]
              : renderDay(repo, date, count, target),
          }))
          return [
            repo,
            { title, details, start, end, cells, tooltip: [details, instruction].filter(Boolean).join('\n') },
          ] as const
        }),
      ),
    [chart],
  )

  const rows = useMemo(() => {
    if (!chart) return null
    const overscanDays = 30
    const firstRenderedDate = isoDate(chart.firstDay + firstVisibleDay - overscanDays)
    const lastRenderedDate = isoDate(chart.firstDay + lastVisibleDay + 1 + overscanDays)
    const hoveredDate = (event: PointerEvent<HTMLDivElement>) =>
      (event.target as HTMLElement).closest<HTMLElement>('.github-activity-day')?.dataset.date ??
      isoDate(
        chart.firstDay +
          Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left) / renderedDayWidth.current),
      )
    const showDay = (repo: Repository | null, event: PointerEvent<HTMLDivElement>) => {
      const date = hoveredDate(event)
      const day = repo?.days.find(([day]) => day === date)
      const count = repo ? (day?.[1] ?? 0) : (otherDays.get(date) ?? 0)
      const commits = day?.[3]
        ? day[3].flatMap(([count], index) => (count ? [commitLabel(count, index ? 'fork-only' : 'upstream')] : []))
        : count
          ? [commitLabel(count)]
          : []
      const repos = repo ? [repo] : grouped!.other
      const created = repos.filter((repo) => repo.createdAt === date).length
      const publicEvents = repos.reduce(
        (total, repo) => total + repo.publications.filter((publication) => publication.date === date).length,
        0,
      )
      const events = [
        ...commits,
        created && (repo ? 'created' : `${created} created`),
        publicEvents && (repo ? 'made public' : `${publicEvents} made public`),
      ].filter(Boolean)
      showTooltip(
        [repo ? repoName(repo) : 'Inactive in view', ...(events.length ? [readableDate(date), ...events] : [])].join(
          ' · ',
        ),
        event,
      )
    }
    return rowItems.map((repo) => {
      const repos = repo ? [repo] : showOtherRepos ? [] : grouped!.other
      const cells = repo
        ? repositoryViews.get(repo)!.cells
        : Array.from(otherDays, ([date, count]) => ({ date, content: renderDay(null, date, count) }))
      const hover = (event: PointerEvent<HTMLDivElement>) => showDay(repo, event)
      return (
        <div
          className="github-activity-row"
          key={repo?.id ?? 'other-repos'}
          role="group"
          aria-label={repo ? repoName(repo) : 'Inactive in view'}
          onPointerMove={repo || !showOtherRepos ? hover : undefined}
          onPointerDown={repo ? hover : undefined}
          onPointerLeave={hideTooltip}
        >
          {repo && !repo.private && repo.url && (
            <a
              className="github-activity-row-link"
              draggable={false}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${repo.name} on GitHub`}
            />
          )}
          {repos.map((repo) => (
            <span
              className="github-activity-active"
              key={repo.id}
              style={activeRange(repo, chart.firstDay, chart.lastDay)}
            />
          ))}
          {repos.length > 0 &&
            cells
              .filter(({ date }) => date >= firstRenderedDate && date <= lastRenderedDate)
              .flatMap(({ content }) => content)}
          {repos.flatMap((repo) => [
            <span
              className="github-activity-marker created"
              key={`${repo.id}-created`}
              style={{ left: position(repo.createdAt) }}
            />,
            ...repo.publications.map((event) => (
              <span className="github-activity-marker public" key={event.id} style={{ left: position(event.date) }} />
            )),
          ])}
        </div>
      )
    })
  }, [chart, repositoryViews, grouped, otherDays, rowItems, showOtherRepos, firstVisibleDay, lastVisibleDay])

  if (error)
    return (
      <section className="github-activity github-activity-message">GitHub activity is temporarily unavailable.</section>
    )
  if (!activity || !chart)
    return <section className="github-activity github-activity-message">Loading GitHub activity…</section>

  const fullTimeline = viewport.start === 0 && viewport.end === 1
  const width = totalDays * dayWidth
  const showRange = (start: number, end: number) => {
    const element = plot.current
    if (!element) return
    const nextDayWidth = element.clientWidth / Math.min(totalDays, Math.max(7, end - start))
    if (nextDayWidth === dayWidth) {
      element.scrollLeft = (start - chart.firstDay) * dayWidth
      updateViewport()
    } else {
      zoomAnchor.current = { day: start - chart.firstDay, x: 0 }
      setDayWidth(nextDayWidth)
    }
  }
  const showPeriod = (day: number, year: boolean) => {
    const date = dateAt(day)
    const calendarYear = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const start = Math.max(chart.firstDay, Math.floor(Date.UTC(calendarYear, year ? 0 : month, 1) / millisecondsPerDay))
    const end = Math.min(
      chart.lastDay + 1,
      Math.floor(Date.UTC(calendarYear + Number(year), year ? 0 : month + 1, 1) / millisecondsPerDay),
    )
    showRange(start, end)
  }
  const panOverview = (clientX: number, grabOffset: number) => {
    if (!plot.current || !overview.current) return
    const bounds = overview.current.getBoundingClientRect()
    const fraction = (clientX - bounds.left) / bounds.width - grabOffset
    plot.current.scrollLeft = fraction * plot.current.scrollWidth
    updateViewport()
  }
  const onOverviewPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.type === 'pointerdown') {
      if (event.pointerType === 'touch' && !event.isPrimary) {
        stopOverviewDrag()
        return
      }
      if (event.button !== 0 || !plot.current) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const fraction = (event.clientX - bounds.left) / bounds.width
      overviewDrag.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        barWidth: bounds.width,
        grabOffset: fraction - viewport.start,
        inside: fraction >= viewport.start && fraction <= viewport.end,
        moved: false,
        zoomed: false,
        day: (plot.current.scrollLeft + plot.current.clientWidth / 2) / renderedDayWidth.current,
        width: renderedDayWidth.current,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    const drag = overviewDrag.current
    if (!drag || drag.id !== event.pointerId) return
    drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) >= 4
    if (event.type === 'pointermove') {
      if (drag.moved) {
        const scale = dragZoomScale(drag.y, event.clientY)
        if (!drag.zoomed && scale === 1) panOverview(event.clientX, drag.grabOffset)
        else if (plot.current) {
          drag.zoomed = true
          zoomAtRef.current?.(drag.width * scale, {
            day: drag.day + ((event.clientX - drag.x) / drag.barWidth) * totalDays,
            x: plot.current.clientWidth / 2,
          })
        }
      }
    } else {
      stopOverviewDrag()
      if (!drag.moved && !drag.inside) panOverview(event.clientX, (viewport.end - viewport.start) / 2)
    }
  }
  return (
    <section className="github-activity" aria-label="GitHub activity">
      <div className="github-activity-heading">
        <div className="github-activity-caption">
          <p className="github-activity-intro">
            I rarely write posts, but I'm always working on stuff! This GitHub timeline explorer shows what I'm
            tinkering on. Updated daily.
          </p>
          <div className="github-activity-legend" aria-label="Heatmap legend">
            <div className="github-activity-legend-group">
              <span className="github-activity-legend-key">
                <i className="github-activity-active-swatch" /> Active
              </span>
              <span className="github-activity-legend-key">
                Fewer
                <span className="github-activity-levels">
                  <i className="level-1" />
                  <i className="level-2" />
                  <i className="level-3" />
                  <i className="level-4" />
                </span>
                More
              </span>
            </div>
            <div className="github-activity-legend-group">
              <span className="github-activity-legend-key">
                <i className="github-activity-created-swatch" /> Created
              </span>
              <span className="github-activity-legend-key">
                <i className="github-activity-public-swatch" /> Made public
              </span>
            </div>
            <div className="github-activity-legend-group">
              <span className="github-activity-legend-key">
                <ForkStatusIcon upstream className="github-activity-legend-icon" /> Upstream
              </span>
              <span className="github-activity-legend-key">
                <ForkStatusIcon upstream={false} className="github-activity-legend-icon" /> Fork only
              </span>
            </div>
          </div>
        </div>
        <div
          className="github-activity-overview"
          ref={overview}
          role="slider"
          aria-label="Timeline overview"
          aria-valuemin={chart.firstYear}
          aria-valuemax={chart.lastYear}
          aria-valuenow={Math.round(
            dateAt(chart.firstDay + viewport.start * (chart.lastDay - chart.firstDay)).getUTCFullYear(),
          )}
          tabIndex={0}
          onKeyDown={(event) => {
            if (!plot.current || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
            event.preventDefault()
            plot.current.scrollLeft += (event.key === 'ArrowRight' ? 1 : -1) * plot.current.clientWidth * 0.8
            updateViewport()
          }}
          onPointerDown={onOverviewPointer}
          onPointerMove={onOverviewPointer}
          onPointerUp={onOverviewPointer}
          onPointerCancel={stopOverviewDrag}
          onLostPointerCapture={stopOverviewDrag}
        >
          <canvas ref={overviewCanvas} aria-hidden="true" />
          <svg className="github-activity-overview-overlay" aria-hidden="true">
            <rect className="github-activity-overview-dim" width={`${viewport.start * 100}%`} height="100%" />
            <rect
              className="github-activity-overview-dim"
              x={`${viewport.end * 100}%`}
              width={`${(1 - viewport.end) * 100}%`}
              height="100%"
            />
            <rect
              className="github-activity-overview-window"
              y={-0.5}
              style={{
                x: `calc(${viewport.start * 100}% - 0.5px)`,
                width: `calc(${(viewport.end - viewport.start) * 100}% + 1px)`,
              }}
            />
          </svg>
        </div>
      </div>
      <div className="github-activity-chart">
        <div className="github-activity-labels">
          <div className="github-activity-axis github-activity-controls">
            <div className="github-activity-filters">
              <button
                type="button"
                aria-label="Show full timeline"
                disabled={fullTimeline}
                {...tooltipHandlers('Show full timeline')}
                onClick={() => {
                  hideTooltip()
                  showRange(chart.firstDay, chart.lastDay + 1)
                }}
              >
                <FitTimelineIcon />
              </button>
              {renderFilter(
                'Forks with upstream contributions',
                showUpstreamForks,
                () => setShowUpstreamForks((value) => !value),
                <ForkStatusIcon upstream className="github-activity-toggle-icon" />,
              )}
              {renderFilter(
                'Forks with only fork commits',
                showForkOnlyForks,
                () => setShowForkOnlyForks((value) => !value),
                <ForkStatusIcon upstream={false} className="github-activity-toggle-icon" />,
              )}
              {activity.repositories.some((repo) => repo.private) &&
                renderFilter(
                  'Private repos',
                  showPrivate,
                  () => setShowPrivate((value) => !value),
                  <LockIcon className="github-activity-toggle-icon" />,
                )}
            </div>
            <div className="github-activity-totals">
              Repos: {grouped?.inView.length ?? 0} · Commits: {grouped?.totalCommits.toLocaleString() ?? 0}
            </div>
          </div>
          {rowItems.map((repo) => {
            if (!repo) {
              const title = `Inactive in view (${grouped?.other.length ?? 0})`
              return (
                <button
                  className="github-activity-repo github-activity-other-toggle"
                  key="other-repos"
                  type="button"
                  aria-expanded={showOtherRepos}
                  aria-label={title}
                  onClick={() => {
                    setShowOtherRepos((value) => !value)
                    hideTooltip()
                  }}
                  {...tooltipHandlers('')}
                >
                  <span className="github-activity-other-chevron" aria-hidden="true">
                    {showOtherRepos ? '▾' : '▸'}
                  </span>
                  <span className="github-activity-repo-name">{title}</span>
                </button>
              )
            }
            const count = grouped?.counts.get(repo) ?? 0
            const { title, details, start, end, tooltip: labelTooltip } = repositoryViews.get(repo)!
            return (
              <button
                className={`github-activity-repo${count ? '' : ' github-activity-other-repo'}`}
                key={repo.id}
                type="button"
                aria-label={[title, details].filter(Boolean).join(' · ')}
                onClick={() => {
                  hideTooltip()
                  showRange(start, end + 1)
                }}
                {...tooltipHandlers(labelTooltip, title)}
              >
                <RepoLabel repo={repo} count={count} />
              </button>
            )
          })}
        </div>
        <div
          className="github-activity-plot"
          ref={plot}
          onScroll={updateViewport}
          aria-label="Drag or scroll horizontally to pan. Use the wheel or pinch to zoom."
        >
          <div
            className="github-activity-track"
            style={{ width, '--day-width': `${100 / totalDays}%` } as CSSProperties}
          >
            <div className="github-activity-axis">
              {months.map((month) => (
                <button
                  className={`github-activity-date${month.year ? ' github-activity-year' : ''}`}
                  key={month.day}
                  type="button"
                  aria-label={`Show ${month.year ? month.label : dateAt(month.day).toLocaleString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
                  style={{ left: `${((month.day - chart.firstDay) / totalDays) * 100}%` }}
                  onClick={() => showPeriod(month.day, month.year)}
                >
                  {month.label}
                </button>
              ))}
            </div>
            {rows}
            {periodLines}
          </div>
        </div>
      </div>
      <div className="github-activity-tooltip" ref={tooltip} role="tooltip" hidden />
    </section>
  )
}
