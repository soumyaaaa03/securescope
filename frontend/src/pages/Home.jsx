import { useState } from 'react'
import ScanBox from '../components/ScanBox'
import ResultsPanel from '../components/ResultsPanel'

export default function Home() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-2">
          AI-powered analysis
        </p>
        <h1 className="text-2xl font-medium text-gray-900 leading-snug mb-2">
          Find vulnerabilities before<br />attackers do
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Paste your code or a GitHub URL. Get a prioritized security report in seconds.
        </p>
      </div>

      <ScanBox onResults={setResult} onLoading={setLoading} />

      {loading && !result && (
        <div className="mt-8 text-center text-sm text-gray-400">
          Running analysis...
        </div>
      )}

      {result && <ResultsPanel result={result} />}
    </div>
  )
}