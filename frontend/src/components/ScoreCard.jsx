export default function ScoreCard({ result }) {
  const score = result.score ?? result.overall_score ?? 0

  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' :
    score >= 40 ? '#ea580c' : '#dc2626'

  const riskBg =
    score >= 80 ? 'bg-green-50 text-green-700' :
    score >= 60 ? 'bg-amber-50 text-amber-700' :
    score >= 40 ? 'bg-orange-50 text-orange-700' :
    'bg-red-50 text-red-700'

  const circumference = 163
  const filled = circumference - (circumference * score) / 100

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">
      <div className="flex items-center gap-5">

        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke={color}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={filled}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium"
            style={{ color }}>
            {score}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              Security score — {score}/100
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskBg}`}>
              {result.risk_level}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {result.total_issues} issue{result.total_issues !== 1 ? 's' : ''} found
            {result.files_scanned ? ` across ${result.files_scanned} files` : ''}.
            {score < 60 ? ' Immediate action recommended.' : ' Review findings below.'}
          </p>
          <div className="mt-2.5">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Risk level</span>
              <span style={{ color }}>{result.risk_level}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${100 - score}%`, background: color }}
              />
            </div>
          </div>
        </div>
      </div>

      {result.ai_summary && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#6366f1" strokeWidth="1.2"/>
                <path d="M5 3v2.5L6.5 7" stroke="#6366f1" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-indigo-700">AI analysis by CodeLlama</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{result.ai_summary}</p>
        </div>
      )}
    </div>
  )
}