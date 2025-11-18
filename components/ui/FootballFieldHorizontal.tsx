'use client'

export function FootballFieldHorizontal({
  positionsSelected = [],
}: {
  positionsSelected?: string[]
}) {
  const positions: Record<string, { x: number; y: number }> = {
  // Middenvelders en aanvallers verder naar links
  Doelman: { x: 15.5, y: 50 },
  Linksachter: { x: 30, y: 22 },
  'Centrale verdediger links': { x: 28, y: 42 },
  'Centrale verdediger rechts': { x: 28, y: 58 },
  Rechtsachter: { x: 30, y: 78 },
  'Centrale middenvelder links': { x: 42, y: 38 },
  'Centrale middenvelder rechts': { x: 42, y: 62 },
  'Aanvallende middenvelder': { x: 59, y: 50 },
  Linksbuiten: { x: 66, y: 26 },
  Spits: { x: 71, y: 50 },
  Rechtsbuiten: { x: 66, y: 74 },
}

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Stadium container */}
      <div className="relative w-full max-w-4xl aspect-[7/3] rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-2xl overflow-hidden">
        {/* Tribune ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl p-4">
          {/* Grasveld */}
          <div className="relative w-full h-full rounded-xl bg-gradient-to-r from-green-800 via-green-700 to-green-800 shadow-inner overflow-hidden">
            {/* Lijnen - compacter viewBox */}
            <svg viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full opacity-90">
              {/* Veldrand */}
              <rect x="5" y="5" width="90" height="40" fill="none" stroke="white" strokeWidth="0.5" />
              
              {/* Middenlijn */}
              <line x1="50" y1="5" x2="50" y2="45" stroke="white" strokeWidth="0.4" />
              
              {/* Middencirkel */}
              <circle cx="50" cy="25" r="7" stroke="white" fill="none" strokeWidth="0.4" />
              <circle cx="50" cy="25" r="0.6" fill="white" />
              
              {/* Linker 16 meter */}
              <rect x="5" y="12" width="13" height="26" stroke="white" fill="none" strokeWidth="0.4" />
              
              {/* Rechter 16 meter */}
              <rect x="82" y="12" width="13" height="26" stroke="white" fill="none" strokeWidth="0.4" />
              
              {/* Linker 5 meter */}
              <rect x="5" y="17" width="4.5" height="16" stroke="white" fill="none" strokeWidth="0.4" />
              
              {/* Rechter 5 meter */}
              <rect x="90.5" y="17" width="4.5" height="16" stroke="white" fill="none" strokeWidth="0.4" />
              
              {/* Doelen */}
              <rect x="3.5" y="21" width="1.5" height="8" fill="white" />
              <rect x="95" y="21" width="1.5" height="8" fill="white" />
              
              {/* Strafschopstip links */}
              <circle cx="11" cy="25" r="0.5" fill="white" />
              
              {/* Strafschopstip rechts */}
              <circle cx="89" cy="25" r="0.5" fill="white" />
            </svg>

            {/* Spelersposities */}
            {Object.entries(positions).map(([pos, { x, y }]) => {
              const isSelected = positionsSelected.includes(pos)
              return (
                <div
                  key={pos}
                  title={pos}
                  className={`absolute rounded-full transition-all duration-300 ease-in-out z-10 ${
                    isSelected
                      ? 'bg-yellow-400 border-2 border-white w-5 h-5 ring-2 ring-yellow-300/40 shadow-lg animate-pulse'
                      : 'bg-white/80 w-2.5 h-2.5 shadow-sm'
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
    </div>
  )
}