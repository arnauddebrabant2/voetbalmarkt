'use client'

export function FootballField({
  positionsSelected = [],
  size = 'md',
}: {
  positionsSelected?: string[]
  size?: 'sm' | 'md' | 'lg'
}) {
  const positions: Record<string, { x: number; y: number }> = {
    Doelman: { x: 50, y: 95 },
    Linksachter: { x: 16, y: 78 },
    'Centrale verdediger links': { x: 38, y: 82 },
    'Centrale verdediger rechts': { x: 62, y: 82 },
    Rechtsachter: { x: 84, y: 78 },
    'Centrale middenvelder links': { x: 30, y: 60 },
    'Centrale middenvelder rechts': { x: 70, y: 60 },
    'Aanvallende middenvelder': { x: 50, y: 38 },
    Linksbuiten: { x: 20, y: 27 },
    Spits: { x: 50, y: 20 },
    Rechtsbuiten: { x: 80, y: 27 },
  }

  const sizes = {
    sm: 'w-[240px] h-[360px]',
    md: 'w-[320px] h-[480px]',
    lg: 'w-[400px] h-[600px]',
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* 🏟️ Buitenrand (stadionmuur) */}
      <div
        className={`relative ${sizes[size]} rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden`}
      >
        {/* 💺 Tribune ring */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-3xl p-3">
          {/* ⚽ Grasveld */}
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-green-800 to-green-700 border-4 border-green-900 shadow-inner overflow-hidden">
            {/* Lijnen */}
            <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full opacity-90">
              <rect x="0" y="0" width="100" height="150" fill="none" stroke="white" strokeWidth="1.2" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.8" />
              <circle cx="50" cy="75" r="10" stroke="white" fill="none" strokeWidth="0.8" />
              <circle cx="50" cy="75" r="1.5" fill="white" />
              <rect x="25" y="0" width="50" height="16" stroke="white" fill="none" strokeWidth="0.8" />
              <rect x="25" y="134" width="50" height="16" stroke="white" fill="none" strokeWidth="0.8" />
              <rect x="35" y="0" width="30" height="6" stroke="white" fill="none" strokeWidth="0.8" />
              <rect x="35" y="144" width="30" height="6" stroke="white" fill="none" strokeWidth="0.8" />
              <rect x="42" y="-2" width="16" height="2" fill="white" />
              <rect x="42" y="150" width="16" height="2" fill="white" />
              <circle cx="50" cy="11" r="1.2" fill="white" />
              <circle cx="50" cy="139" r="1.2" fill="white" />
            </svg>

            {/* Spelersposities */}
            {Object.entries(positions).map(([pos, { x, y }]) => {
              const isSelected = positionsSelected.includes(pos)
              return (
                <div
                  key={pos}
                  title={pos}
                  className={`absolute rounded-full transition-all duration-300 ease-in-out ${
                    isSelected
                      ? 'bg-yellow-400 border-2 border-white w-6 h-6 ring-4 ring-yellow-300/40 shadow-lg animate-pulse'
                      : 'bg-white/80 w-3 h-3 shadow-sm'
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
        </div>
      </div>

      {/* 💡 Lichtgloed bovenaan (stadionlichten) */}
      <div className="absolute -top-10 w-[120%] h-20 bg-gradient-to-b from-white/10 to-transparent blur-3xl rounded-full pointer-events-none" />
    </div>
  )
}
