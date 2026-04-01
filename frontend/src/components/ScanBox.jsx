import { useState } from 'react'
import { scanCode, scanGithub } from '../api/scanner'

const CHIPS = ['OWASP Top 10', 'Secrets', 'SQL injection', 'Dependencies', 'Auth flaws']
const STEPS = [
  'Parsing code structure...',
  'Detecting hardcoded secrets...',
  'Checking SQL injection risks...',
  'Running AI analysis...',
  'Generating report...',
]

export default function ScanBox({ onResults, onLoading }) {
  const [tab,      setTab]      = useState('code')
  const [code,     setCode]     = useState('')
  const [url,      setUrl]      = useState('')
  const [chips,    setChips]    = useState(['OWASP Top 10', 'Secrets', 'SQL injection'])
  const [scanning, setScanning] = useState(false)
  const [step,     setStep]     = useState('')
  const [error,    setError]    = useState('')

  const toggleChip = (chip) =>
    setChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip])

  const runScan = async () => {
    if (tab === 'code' && !code.trim()) { setError('Please paste some code first.'); return }
    if (tab === 'url'  && !url.trim())  { setError('Please enter a GitHub URL.');    return }

    setError('')
    setScanning(true)
    onLoading(true)
    onResults(null)

    let i = 0
    setStep(STEPS[0])
    const interval = setInterval(() => {
      i++
      if (i < STEPS.length) setStep(STEPS[i])
    }, 900)

    try {
      const result = tab === 'code'
        ? await scanCode(code, 'pasted_code.py')
        : await scanGithub(url)
      clearInterval(interval)
      onResults(result)
    } catch (err) {
      clearInterval(interval)
      setError(
        err.response?.data?.detail ||
        'Cannot connect to backend. Make sure uvicorn is running on port 8000.'
      )
    } finally {
      setScanning(false)
      onLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex border-b border-gray-100">
        {[['code', 'Paste code'], ['url', 'GitHub URL']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm transition-colors ${
              tab === t
                ? 'text-gray-900 font-medium border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'code' ? (
          <textarea
            className="w-full min-h-40 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-800 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-300 placeholder-gray-300"
            placeholder={"# Paste your code here...\npassword = 'abc123'\nquery = execute('SELECT * FROM users WHERE name = ' + username)\neval(user_input)"}
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        ) : (
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            placeholder="https://github.com/username/repository"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        )}
      </div>

      {error && (
        <div className="mx-4 mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5 border border-red-100">
          {error}
        </div>
      )}

      {scanning && (
        <div className="mx-4 mb-3 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
          <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-indigo-700">{step}</span>
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                chips.includes(chip)
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {scanning ? 'Scanning...' : 'Scan now →'}
        </button>
      </div>
    </div>
  )
}