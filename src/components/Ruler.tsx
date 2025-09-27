import * as React from 'react'

type Props = {
  pageWidthPx?: number
}

export default function Ruler({ pageWidthPx = 816 }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = React.useState<number>(0)

  React.useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.floor(entry.contentRect.width))
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const center = width / 2
  const leftX = Math.max(0, Math.round(center - pageWidthPx / 2))
  const rightX = Math.min(width, Math.round(center + pageWidthPx / 2))
  const scaleInches = 7.5
  const pxPerInch = pageWidthPx / scaleInches
  const tickStepPx = pxPerInch / 10 // 0.1 inch per minor tick
  const ticks = React.useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i <= Math.floor(scaleInches * 10); i++) arr.push(Math.round(i * tickStepPx))
    return arr
  }, [tickStepPx])

  const marker1X = leftX + 1 * pxPerInch
  const marker2X = leftX + 6.5 * pxPerInch

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: 28, background: '#f9fbfd', overflow: 'hidden' }}>
      {/* baseline at bottom: thin everywhere, thick only between markers */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: '#eaeced' }} />
      <div style={{ position: 'absolute', left: Math.min(marker1X, marker2X), width: Math.abs(marker2X - marker1X), bottom: 0, height: 1, background: '#8c8f90' }} />
      {/* ticks only over paper area, drawn from baseline upwards (upper half visible) */}
      {ticks.map((dx, i) => {
        const x = leftX + dx
        if (x < leftX || x > rightX) return null
        const tenth = i % 10
        const h = tenth === 0 ? 14 : tenth === 5 ? 10 : (tenth === 2 || tenth === 8) ? 8 : 6
        return <div key={dx} style={{ position: 'absolute', left: x, bottom: 2, width: 1, height: h, background: '#6b7280' }} />
      })}
      {/* numbers 1..7 */}
      {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
        <div key={'n'+n} style={{ position: 'absolute', left: leftX + n * pxPerInch - 3, top: 2, fontSize: 12, color: '#5f6368' }}>{n}</div>
      ))}
      {/* markers at 1in and 6.5in */}
      <div style={{ position: 'absolute', left: marker1X - 7, bottom: 2, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #1a73e8' }} />
      <div style={{ position: 'absolute', left: marker2X - 7, bottom: 2, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #1a73e8' }} />
    </div>
  )
}