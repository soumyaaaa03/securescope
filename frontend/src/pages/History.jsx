const HISTORY = [
  { name: 'my-flask-app',  source: 'github.com/akumar/my-flask-app', time: '2 hours ago', score: 32  },
  { name: 'auth-service',  source: 'Pasted code',                     time: 'Yesterday',   score: 61  },
  { name: 'payment-api',   source: 'github.com/akumar/payment-api',   time: '3 days ago',  score: 88  },
]

export default function History() {
  const color = s =>
    s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-2">
        Past scans
      </p>
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Scan history</h1>
      <p className="text-sm text-gray-500 mb-6">
        Review previous scans and track your progress over time.
      </p>

      <div className="flex flex-col gap-3">
        {HISTORY.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-colors"
          >
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke="#818cf8" strokeWidth="1.2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {item.source} · {item.time}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-lg font-medium ${color(item.score)}`}>
                {item.score}
              </div>
              <div className="text-xs text-gray-400">/ 100</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}