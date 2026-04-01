import { useState } from 'react'
import ScoreCard from './ScoreCard'
import VulnerabilityCard from './VulnerabilityCard'

export default function ResultsPanel({ result }) {
  const [filter, setFilter] = useState('all')

  const vulns = result.vulnerabilities
    || result.file_results?.flatMap(f => f.vulnerabilities)
    || []

  const counts = {
    all:      vulns.length,
    critical: result.summary?.critical || 0,
    high:     result.summary?.high     || 0,
    medium:   result.summary?.medium   || 0,
    low:      result.summary?.low      || 0,
  }

  const filtered = filter === 'all'
    ? vulns
    : vulns.filter(v => v.severity === filter)

  return (
    <div className="mt-6">
      <ScoreCard result={result} />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          Vulnerabilities found
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
          {filter === 'all'
            ? '🎉 No vulnerabilities found — great code!'
            : `No ${filter} issues found`}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((vuln, i) => (
            <VulnerabilityCard key={i} vuln={vuln} />
          ))}
        </div>
      )}
    </div>
  )
}