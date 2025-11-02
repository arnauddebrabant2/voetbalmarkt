'use client'

export function FootballField({
  positionsSelected = [],
}: {
  positionsSelected?: string[]
}) {
  const positions: Record<string, { x: number; y: number }> = {
    'Doelman': { x: 50, y: 95 },
    'Linksachter': { x: 16, y: 78 },
    'Centrale verdediger links': { x: 38, y: 82 },
    'Centrale verdediger rechts': { x: 62, y: 82 },
    'Rechtsachter': { x: 84, y: 78 },
    'Centrale middenvelder links': { x: 30, y: 60 },
    'Centrale middenvelder rechts': { x: 70, y: 60 },
    'Aanvallende middenvelder': { x: 50, y: 38 },
    'Linksbuiten': { x: 20, y: 27 },
    'Spits': { x: 50, y: 20 },
    'Rechtsbuiten': { x: 80, y: 27 },
  }

  return (
    <div className="relative w-[320px] h-[480px] bg-green-700 border-4 border-green-900 rounded-xl shadow-xl overflow-hidden">
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full">
        <rect x="0" y="0" width="100" height="150" fill="none" stroke="white" strokeWidth="1" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="10" stroke="white" fill="none" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="1.8" fill="white" />
        <rect x="25" y="0" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="25" y="134" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="35" y="0" width="30" height="6" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="35" y="144" width="30" height="6" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="42" y="-2" width="16" height="2" fill="white" />
        <rect x="42" y="150" width="16" height="2" fill="white" />
        <circle cx="50" cy="11" r="1.2" fill="white" />
        <circle cx="50" cy="139" r="1.2" fill="white" />
      </svg>

      {/* Posities */}
      {Object.entries(positions).map(([pos, { x, y }]) => {
        const isSelected = positionsSelected.includes(pos)
        return (
          <div
            key={pos}
            title={pos}
            className={`absolute rounded-full transition-transform ${
              isSelected
                ? 'bg-yellow-400 border-2 border-white w-6 h-6 animate-pulse ring-4 ring-yellow-300/40'
                : 'bg-white/80 w-3 h-3'
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>
  )
}
